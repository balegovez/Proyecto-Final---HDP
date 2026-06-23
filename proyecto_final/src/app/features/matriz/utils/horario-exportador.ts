import { DIAS_SEMANA, DiaSemana, FilaHorario, GrupoSeleccionable } from '../matriz.types';
import { aHoraLarga } from './horario-validador';

// EXPORTADOR DE HORARIO — .ics (Google Calendar) y PDF.
// Exclusivo de la feature matriz. Cada función recibe los datos ya
// resueltos (gruposInscritos, filasHorario, etc.) como parámetros, en
// vez de leer signals o servicios — así no se acopla al componente y
// se puede invocar igual desde un test como desde la UI.

/** Necesario para pintar una celda al construir el HTML del PDF. */
export interface BuscadorCelda {
  (fila: FilaHorario, dia: string): {
    codigoMateria: string;
    tipo: string;
    numeroGrupo: string;
    aula: string;
  } | undefined;
}

/** Mapa día → índice ISO (Lunes=1, ..., Domingo=7). */
const DIA_A_ISO: Record<DiaSemana, number> = {
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
  Domingo: 7,
};

/** Próxima ocurrencia (>= hoy) del día semanal indicado. Devuelve YYYYMMDD. */
function proximaFecha(diaIso: number, hoy: Date = new Date()): string {
  const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const isoHoy = ((fecha.getDay() + 6) % 7) + 1; // JS Sunday=0 → ISO Mon=1
  const diff = (diaIso - isoHoy + 7) % 7;
  fecha.setDate(fecha.getDate() + diff);
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/** Formatea "HH:MM" a "HHMMSS" para .ics. */
function aHoraIcs(hhmm: string): string {
  const [h, m] = hhmm.split(':');
  return `${h.padStart(2, '0')}${(m ?? '00').padStart(2, '0')}00`;
}

/** Escapa texto para campo de iCalendar (RFC 5545). */
function escIcs(texto: string): string {
  return texto
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

/** Escapa texto para insertar como contenido HTML. */
function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// .ICS

/**
 * Genera el contenido de un archivo .ics a partir de los grupos inscritos.
 * Lanza si no hay ningún evento que emitir.
 */
export function generarIcs(gruposInscritos: readonly GrupoSeleccionable[]): string {
  const lineas: string[] = [];
  const ahora = new Date();
  const dtstamp = ahora.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

  const byDayMap: Record<number, string> = {
    1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA', 7: 'SU',
  };

  lineas.push('BEGIN:VCALENDAR');
  lineas.push('VERSION:2.0');
  lineas.push('PRODID:-//PensumNavigator//UES-FMO//ES');
  lineas.push('CALSCALE:GREGORIAN');
  lineas.push('METHOD:PUBLISH');

  let eventosEmitidos = 0;

  for (const g of gruposInscritos) {
    const franjas = g.horario ?? [];
    for (let idx = 0; idx < franjas.length; idx++) {
      const f = franjas[idx];
      const diaIso = DIA_A_ISO[f.dia as DiaSemana];
      if (!diaIso) continue;

      const fechaInicio = proximaFecha(diaIso, ahora);
      const horaIni = aHoraIcs(f.horaInicio);
      const horaFin = aHoraIcs(f.horaFin);
      const uid = `${g.codigoMateria}-${g.numeroGrupo}-${idx}-${fechaInicio}@pensumnavigator`;

      const titulo = `${g.codigoMateria} - ${g.nombreMateria} (G${g.numeroGrupo})`;
      const descripcion = `Docente: ${g.docente}. Tipo: ${g.tipo}. Grupo: ${g.numeroGrupo}.`;

      lineas.push('BEGIN:VEVENT');
      lineas.push(`UID:${uid}`);
      lineas.push(`DTSTAMP:${dtstamp}`);
      lineas.push(`DTSTART:${fechaInicio}T${horaIni}`);
      lineas.push(`DTEND:${fechaInicio}T${horaFin}`);
      lineas.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDayMap[diaIso]};COUNT=16`);
      lineas.push(`SUMMARY:${escIcs(titulo)}`);
      lineas.push(`LOCATION:${escIcs(f.aula)}`);
      lineas.push(`DESCRIPTION:${escIcs(descripcion)}`);
      lineas.push('END:VEVENT');
      eventosEmitidos++;
    }
  }

  lineas.push('END:VCALENDAR');

  if (eventosEmitidos === 0) {
    throw new Error('No se generó ningún evento (revisa los días de tus grupos).');
  }
  // RFC 5545: CRLF entre líneas y al final.
  return lineas.join('\r\n') + '\r\n';
}

/** Dispara la descarga del .ics generado. Lanza si la generación falla. */
export function descargarIcs(gruposInscritos: readonly GrupoSeleccionable[]): void {
  const contenido = generarIcs(gruposInscritos);
  const blob = new Blob([contenido], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'horario-ues.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

// ────────────────────────────────────────────────────────────────────
// PDF (html2pdf.js cargado on-demand)
//
// En vez de clonar el DOM (que sufre con la encapsulación de Angular
// y el `.d-none !important` de Bootstrap), generamos un fragmento HTML
// auto-contenido con estilos en línea. Es 100% portable y siempre rinde.
// ────────────────────────────────────────────────────────────────────

function cargarLibreriaPdf(): Promise<any> {
  const w = window as any;
  if (w.html2pdf) return Promise.resolve(w.html2pdf);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    script.onload = () => resolve((window as any).html2pdf);
    script.onerror = () =>
      reject(new Error('No se pudo cargar la librería html2pdf.js'));
    document.head.appendChild(script);
  });
}

function construirHtmlPdf(
  filas: readonly FilaHorario[],
  celdaEn: BuscadorCelda,
  materiasUbicadas: number
): string {
  const dias = DIAS_SEMANA;

  const sThHora = 'width:12%;border:1px solid #94a3b8;padding:12px 8px;font-size:12px;text-transform:uppercase;color:#475569;font-weight:bold;background:#e2e8f0;text-align:center;';
  const sThDias = 'width:12.5%;border:1px solid #94a3b8;padding:12px 8px;font-size:12px;text-transform:uppercase;color:#475569;font-weight:bold;background:#f1f5f9;text-align:center;';
  const sHoraTh = 'border:1px solid #94a3b8;padding:12px 8px;font-size:12px;font-family:Consolas,Menlo,monospace;color:#475569;font-weight:600;background:#f8fafc;text-align:center;white-space:nowrap;';
  const sTdVacia = 'border:1px solid #cbd5e1;padding:12px 8px;background:#ffffff;height:50px;';
  const sTdLlena = 'border:1px solid #cbd5e1;padding:12px 8px;font-size:12px;color:#1f2937;background:#ffffff;vertical-align:middle;text-align:center;white-space:normal;line-height:1.5;';

  const cabeceras = dias
    .map(d => `<th style="${sThDias}">${escHtml(d)}</th>`)
    .join('');

  let cuerpo = '';
  if (filas.length === 0) {
    cuerpo = `<tr><td colspan="${dias.length + 1}" style="border:1px solid #cbd5e1;padding:24px;text-align:center;color:#94a3b8;font-size:12px;">Sin materias inscritas.</td></tr>`;
  } else {
    cuerpo = filas
      .map(fila => {
        const celdas = dias
          .map(dia => {
            const ocupada = celdaEn(fila, dia);
            if (ocupada) {
              return `<td style="${sTdLlena}"><strong>${escHtml(ocupada.codigoMateria)}</strong><br>${escHtml(ocupada.tipo)} ${escHtml(ocupada.numeroGrupo)}<br>${escHtml(ocupada.aula)}</td>`;
            }
            return `<td style="${sTdVacia}"></td>`;
          })
          .join('');
        return `<tr>
          <th style="${sHoraTh}">${escHtml(aHoraLarga(fila.horaInicio))} - ${escHtml(aHoraLarga(fila.horaFin))}</th>
          ${celdas}
        </tr>`;
      })
      .join('');
  }

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;padding:24px;background:#ffffff;color:#1f2937;">
      <h1 style="font-size:22px;margin:0 0 6px 0;color:#0f172a;text-align:center;">Horario Semanal — UES-FMO</h1>
      <p style="font-size:12px;color:#64748b;margin:0 0 20px 0;text-align:center;">
        Materias: <strong>${materiasUbicadas}</strong>
        &nbsp;·&nbsp; Generado: ${escHtml(new Date().toLocaleString())}
      </p>
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;font-family:Arial,Helvetica,sans-serif;">
        <thead>
          <tr>
            <th style="${sThHora}">Hora</th>
            ${cabeceras}
          </tr>
        </thead>
        <tbody>
          ${cuerpo}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Genera y descarga el PDF del horario.
 *
 * @param filas             Filas horarias a renderizar.
 * @param celdaEn           Función que, dada una fila y un día, devuelve la celda ocupada.
 * @param materiasUbicadas  Cantidad de materias inscritas (para el encabezado).
 */
export async function descargarPdf(
  filas: readonly FilaHorario[],
  celdaEn: BuscadorCelda,
  materiasUbicadas: number
): Promise<void> {
  const html2pdf = await cargarLibreriaPdf();

  const contenedor = document.createElement('div');
  contenedor.innerHTML = construirHtmlPdf(filas, celdaEn, materiasUbicadas);

  // ─────────────────────────────────────────────────────────────
  // TRUCO PARA MÓVILES: no lo mandes fuera de la pantalla.
  // Ponlo arriba a la izquierda, pero detrás de toda la app y
  // fuera del árbol de accesibilidad mientras dura la captura.
  // ─────────────────────────────────────────────────────────────
  contenedor.style.position = 'absolute';
  contenedor.style.top = '0';
  contenedor.style.left = '0';
  contenedor.style.width = '1400px';
  contenedor.style.background = '#ffffff';
  contenedor.style.zIndex = '-9999';
  contenedor.style.pointerEvents = 'none';
  contenedor.setAttribute('aria-hidden', 'true');
  (contenedor as any).inert = true;

  document.body.appendChild(contenedor);

  try {
    await html2pdf()
      .from(contenedor.firstElementChild as HTMLElement)
      .set({
        margin: 10,
        filename: 'horario-ues.pdf',
        image: { type: 'jpeg', quality: 0.8 },
        html2canvas: {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          windowWidth: 1440,
          scrollY: 0, // crucial para móvil: ignora si el usuario bajó la pantalla
          scrollX: 0,
          logging: false,
          ignoreElements: (node: Element) => node.tagName === 'LINK',
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      })
      .save();
  } finally {
    document.body.removeChild(contenedor);
  }
}
