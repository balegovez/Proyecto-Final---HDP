import {
  Component,
  computed,
  inject,
  signal,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

import {
  PensumService,
  FranjaHoraria,
} from '../../core/services/pensum.service';

// ════════════════════════════════════════════════════════════════════
// TIPOS LOCALES — Vista de la matriz
// ════════════════════════════════════════════════════════════════════

/**
 * Un grupo teórico "aplanado" para mostrarlo como tarjeta independiente
 * en la barra lateral. Une la materia con uno de sus grupos.
 */
interface GrupoSeleccionable {
  /** Clave única "CODIGO-NUMGRUPO" — sirve de identificador en CDK. */
  key: string;
  codigoMateria: string;
  nombreMateria: string;
  cicloAcademico: number;
  uv: number;
  numeroGrupo: string;
  tipo: string;
  docente: string;
  horario: readonly FranjaHoraria[];
}

/** Fila de la matriz: un rango horario único (ej. "07:00 - 08:40"). */
interface FilaHorario {
  /** Etiqueta para mostrar (ej. "07:00:00 - 08:40:00"). */
  etiqueta: string;
  horaInicio: string;
  horaFin: string;
}

/** Lo que se renderiza dentro de una celda ocupada. */
interface CeldaOcupada {
  codigoMateria: string;
  nombreMateria: string;
  numeroGrupo: string;
  tipo: string;
  aula: string;
  /** Texto plano concatenado pedido: "SYP155 Teorico 1 Cómputo B". */
  contenido: string;
}

/** Detalle por grupo inscrito que se muestra en la modal de confirmación. */
interface GrupoConfirmable {
  key: string;
  codigoMateria: string;
  nombreMateria: string;
  numeroGrupo: string;
  tipo: string;
  uv: number;
  franjas: readonly FranjaHoraria[];
}

// ════════════════════════════════════════════════════════════════════
// UTILIDADES PURAS
// ════════════════════════════════════════════════════════════════════

const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;
type DiaSemana = (typeof DIAS_SEMANA)[number];

/** Convierte "HH:MM" o "HH:MM:SS" en minutos desde medianoche. */
function aMinutos(hhmm: string): number {
  const partes = hhmm.split(':').map(Number);
  return (partes[0] ?? 0) * 60 + (partes[1] ?? 0);
}

/** Formatea "HH:MM" a "HH:MM:SS" (estilo de la imagen de referencia). */
function aHoraLarga(hhmm: string): string {
  if (hhmm.length === 5) return `${hhmm}:00`;
  return hhmm;
}

/** ¿Se solapan dos franjas? (mismo día, intervalos abiertos). */
function franjasChocan(a: FranjaHoraria, b: FranjaHoraria): boolean {
  if (a.dia !== b.dia) return false;
  const ai = aMinutos(a.horaInicio);
  const af = aMinutos(a.horaFin);
  const bi = aMinutos(b.horaInicio);
  const bf = aMinutos(b.horaFin);
  return ai < bf && bi < af;
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
  return texto.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

// ════════════════════════════════════════════════════════════════════
// COMPONENTE
// ════════════════════════════════════════════════════════════════════

@Component({
  selector: 'app-matriz',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './matriz.component.html',
  styleUrl: './matriz.component.css',
})
export class MatrizComponent {

  // ── Servicios ──────────────────────────────────────────────────
  pensumService = inject(PensumService);

  // ── Referencia al elemento de la tabla (para exportar a PDF) ──
  @ViewChild('areaImpresion', { static: false })
  areaImpresion?: ElementRef<HTMLElement>;

  // ── Constantes ─────────────────────────────────────────────────
  readonly LIMITE_UV = 20;
  readonly DIAS = DIAS_SEMANA;
  readonly DROP_LIST_ID_SIDEBAR = 'lista-grupos-disponibles';
  readonly DROP_LIST_ID_MATRIZ = 'matriz-horario';

  // ── Estado local (signals) ─────────────────────────────────────

  /** Filtro: 'todos' | 'impar' | 'par'. */
  readonly paridadCiclo = signal<'todos' | 'impar' | 'par'>('todos');

  /** Conjunto de keys (codigo-grupo) confirmadas tras revisión. */
  readonly confirmadas = signal<Set<string>>(new Set());

  /** Mensaje de error transitorio. */
  readonly mensajeError = signal<string | null>(null);

  /** Mensaje de éxito transitorio. */
  readonly mensajeExito = signal<string | null>(null);

  /** Modal de confirmación abierta. */
  readonly modalAbierta = signal<boolean>(false);

  /** Detección de viewport móvil. Se actualiza en resize. */
  readonly esMovil = signal<boolean>(false);

  /** Modo táctil: grupo "tomado" en móvil (clic-clic en vez de drag). */
  readonly grupoTomado = signal<string | null>(null);

  constructor() {
    this.actualizarViewport();
  }

  @HostListener('window:resize')
  actualizarViewport(): void {
    this.esMovil.set(window.innerWidth < 768);
  }

  // ── Helpers de mensajería ──
  private mostrarError(msg: string): void {
    this.mensajeError.set(msg);
    setTimeout(() => {
      if (this.mensajeError() === msg) this.mensajeError.set(null);
    }, 4500);
  }
  private mostrarExito(msg: string): void {
    this.mensajeExito.set(msg);
    setTimeout(() => {
      if (this.mensajeExito() === msg) this.mensajeExito.set(null);
    }, 3000);
  }


  /** Lista plana de TODOS los grupos teóricos del catálogo. */
  private readonly catalogoGrupos = computed<GrupoSeleccionable[]>(() => {
    const horarios = this.pensumService.horarios();
    const materias = this.pensumService.materias();
    const lookupUv = new Map(materias.map(m => [m.codigo, m.uv]));

    const lista: GrupoSeleccionable[] = [];
    for (const mat of horarios) {
      for (const grp of mat.grupos) {
        lista.push({
          key: `${mat.codigoMateria}-${grp.numeroGrupo}`,
          codigoMateria: mat.codigoMateria,
          nombreMateria: mat.nombreMateria,
          cicloAcademico: mat.cicloAcademico,
          uv: lookupUv.get(mat.codigoMateria) ?? 0,
          numeroGrupo: grp.numeroGrupo,
          tipo: grp.tipo,
          docente: grp.docente,
          horario: grp.horario,
        });
      }
    }
    return lista;
  });

  /** Grupos efectivamente inscritos (uniendo inscripciones × catálogo). */
  readonly gruposInscritos = computed<GrupoSeleccionable[]>(() => {
    const inscripciones = this.pensumService.inscripciones();
    const indice = new Map(this.catalogoGrupos().map(g => [g.key, g]));
    const result: GrupoSeleccionable[] = [];
    for (const ins of inscripciones) {
      const k = `${ins.codigoMateria}-${ins.numeroGrupo}`;
      const g = indice.get(k);
      if (g) result.push(g);
    }
    return result;
  });

  /**
   * Grupos disponibles en la barra lateral:
   *   - La materia debe ser inscribible (prereqs cumplidos)
   *   - La paridad del cicloAcademico debe coincidir con el filtro
   *   - El grupo aún no debe estar inscrito (ni otro grupo de la misma materia)
   */
  readonly gruposDisponibles = computed<GrupoSeleccionable[]>(() => {
    const inscribibles = new Set(
      this.pensumService.materiasInscribibles().map(m => m.codigo)
    );
    const codigosInscritos = new Set(
      this.gruposInscritos().map(g => g.codigoMateria)
    );
    const paridad = this.paridadCiclo();

    return this.catalogoGrupos().filter(g => {
      if (!inscribibles.has(g.codigoMateria)) return false;
      if (codigosInscritos.has(g.codigoMateria)) return false;
      if (paridad === 'impar' && g.cicloAcademico % 2 !== 1) return false;
      if (paridad === 'par' && g.cicloAcademico % 2 !== 0) return false;
      return true;
    });
  });

  /** Filas (rangos horarios) que aparecen en la matriz. */
  readonly filasHorario = computed<FilaHorario[]>(() => {
    const vistos = new Map<string, FilaHorario>();
    for (const g of this.gruposInscritos()) {
      for (const f of g.horario) {
        const k = `${f.horaInicio}-${f.horaFin}`;
        if (!vistos.has(k)) {
          vistos.set(k, {
            etiqueta: `${aHoraLarga(f.horaInicio)} - ${aHoraLarga(f.horaFin)}`,
            horaInicio: f.horaInicio,
            horaFin: f.horaFin,
          });
        }
      }
    }
    return Array.from(vistos.values()).sort(
      (a, b) => aMinutos(a.horaInicio) - aMinutos(b.horaInicio) ||
                aMinutos(a.horaFin) - aMinutos(b.horaFin)
    );
  });

  /**
   * Índice (fila + día → celda ocupada). Eficiente para render: la plantilla
   * llama una sola vez `celdaEn(fila, dia)`.
   */
  private readonly indiceCeldas = computed<Map<string, CeldaOcupada>>(() => {
    const mapa = new Map<string, CeldaOcupada>();
    for (const g of this.gruposInscritos()) {
      // Número del grupo "01" → 1 para la presentación
      const numLimpio = String(parseInt(g.numeroGrupo, 10) || g.numeroGrupo);
      for (const f of g.horario) {
        const k = this.claveCelda(f.dia, f.horaInicio, f.horaFin);
        mapa.set(k, {
          codigoMateria: g.codigoMateria,
          nombreMateria: g.nombreMateria,
          numeroGrupo: g.numeroGrupo,
          tipo: g.tipo,
          aula: f.aula,
          contenido: `${g.codigoMateria} ${g.tipo} ${numLimpio} ${f.aula}`,
        });
      }
    }
    return mapa;
  });

  /** Total de UV ya inscritas. */
  readonly uvInscritas = computed(() => {
    return this.gruposInscritos().reduce((sum, g) => sum + g.uv, 0);
  });

  /** Cantidad de materias inscritas (no de celdas). */
  readonly materiasUbicadas = computed(() => this.gruposInscritos().length);

  /** Para la modal de confirmación. */
  readonly gruposParaConfirmar = computed<GrupoConfirmable[]>(() =>
    this.gruposInscritos().map(g => ({
      key: g.key,
      codigoMateria: g.codigoMateria,
      nombreMateria: g.nombreMateria,
      numeroGrupo: g.numeroGrupo,
      tipo: g.tipo,
      uv: g.uv,
      franjas: g.horario,
    }))
  );

  /** ¿Todo confirmado? Habilita exportación final. */
  readonly todoConfirmado = computed(() => {
    const inscritos = this.gruposInscritos();
    if (inscritos.length === 0) return false;
    const confirm = this.confirmadas();
    return inscritos.every(g => confirm.has(g.key));
  });

  // ────────────────────────────────────────────────────────────────
  // VISTA AGRUPADA POR DÍA (móvil)
  // ────────────────────────────────────────────────────────────────

  readonly vistaPorDia = computed(() => {
    return this.DIAS.map(dia => {
      const items: Array<{
        codigoMateria: string;
        nombreMateria: string;
        numeroGrupo: string;
        tipo: string;
        aula: string;
        horaInicio: string;
        horaFin: string;
        rangoEtq: string;
      }> = [];
      for (const g of this.gruposInscritos()) {
        for (const f of g.horario) {
          if (f.dia === dia) {
            items.push({
              codigoMateria: g.codigoMateria,
              nombreMateria: g.nombreMateria,
              numeroGrupo: g.numeroGrupo,
              tipo: g.tipo,
              aula: f.aula,
              horaInicio: f.horaInicio,
              horaFin: f.horaFin,
              rangoEtq: `${aHoraLarga(f.horaInicio)} - ${aHoraLarga(f.horaFin)}`,
            });
          }
        }
      }
      items.sort((a, b) => aMinutos(a.horaInicio) - aMinutos(b.horaInicio));
      return { dia, items };
    }).filter(b => b.items.length > 0);
  });

  // ────────────────────────────────────────────────────────────────
  // HELPERS DE PLANTILLA
  // ────────────────────────────────────────────────────────────────

  private claveCelda(dia: string, horaInicio: string, horaFin: string): string {
    return `${dia}|${horaInicio}|${horaFin}`;
  }

  celdaEn(fila: FilaHorario, dia: string): CeldaOcupada | undefined {
    return this.indiceCeldas().get(
      this.claveCelda(dia, fila.horaInicio, fila.horaFin)
    );
  }

  /** Para iconografía / clases CSS según tipo. */
  obtenerColorPorMateria(codigo: string): string {
    // Hash determinístico → tonos HSL bonitos.
    let h = 0;
    for (let i = 0; i < codigo.length; i++) {
      h = (h * 31 + codigo.charCodeAt(i)) >>> 0;
    }
    const tono = h % 360;
    return `hsl(${tono} 55% 42%)`;
  }

  // ────────────────────────────────────────────────────────────────
  // ACCIONES — CREATE / UPDATE
  // ────────────────────────────────────────────────────────────────

  /**
   * Validación pura (sin efectos): ¿se puede inscribir este grupo?
   * Devuelve `null` si todo OK o un mensaje de error.
   */
  private validarInscripcion(grupo: GrupoSeleccionable): string | null {
    if (!this.pensumService.esInscribible(grupo.codigoMateria)) {
      return `${grupo.codigoMateria} no es inscribible (revisa prerrequisitos).`;
    }
    // Misma materia ya inscrita → cambio de grupo (UPDATE).
    // No bloquea, pero limpiamos abajo. Aquí solo validamos UV y choques
    // calculando el delta.
    const yaInscrito = this.gruposInscritos().find(
      g => g.codigoMateria === grupo.codigoMateria
    );

    // UV: si es cambio de grupo, no se suma; si es nuevo, sí.
    const uvFuturas = yaInscrito
      ? this.uvInscritas()
      : this.uvInscritas() + grupo.uv;
    if (uvFuturas > this.LIMITE_UV) {
      return `Límite alcanzado: ${this.LIMITE_UV} UV por ciclo.`;
    }

    // Choque de horarios: revisamos contra todas las franjas inscritas
    // EXCEPTO las del grupo viejo de la misma materia (que va a salir).
    const codigoExcluir = yaInscrito?.codigoMateria;
    for (const f of grupo.horario) {
      for (const otro of this.gruposInscritos()) {
        if (otro.codigoMateria === codigoExcluir) continue;
        for (const f2 of otro.horario) {
          if (franjasChocan(f, f2)) {
            return `Choque de horarios: ${grupo.codigoMateria} G${grupo.numeroGrupo} colisiona con ${otro.codigoMateria} G${otro.numeroGrupo} (${f.dia} ${f.horaInicio}-${f.horaFin}).`;
          }
        }
      }
    }
    return null;
  }

  /**
   * Acción central de inscripción. Es llamada tanto por drag&drop
   * como por click/touch. Aplica la regla y persiste.
   */
  async inscribirGrupo(grupo: GrupoSeleccionable): Promise<void> {
    const error = this.validarInscripcion(grupo);
    if (error) {
      this.mostrarError(error);
      return;
    }
    await this.pensumService.inscribirAGrupo(grupo.codigoMateria, grupo.numeroGrupo);
    // Si se cambió de grupo, la confirmación previa queda invalidada para esa key
    this.confirmadas.update(s => {
      const copia = new Set(s);
      // todas las keys de esa materia (puede ser sólo la actual ahora)
      for (const k of Array.from(copia)) {
        if (k.startsWith(`${grupo.codigoMateria}-`)) copia.delete(k);
      }
      return copia;
    });
    this.grupoTomado.set(null);
    this.mostrarExito(`${grupo.codigoMateria} G${grupo.numeroGrupo} asignado correctamente.`);
  }

  // ── Drag & drop: punto de entrada ──
  async alSoltarEnMatriz(event: CdkDragDrop<any>): Promise<void> {
    const grupo = event.item.data as GrupoSeleccionable | undefined;
    if (!grupo) return;
    await this.inscribirGrupo(grupo);
  }

  // ── Modo táctil (móvil) ──
  tomarGrupo(grupo: GrupoSeleccionable): void {
    if (this.grupoTomado() === grupo.key) {
      // segundo tap = soltar
      this.grupoTomado.set(null);
      return;
    }
    this.grupoTomado.set(grupo.key);
  }

  async confirmarTomadoEnMatriz(): Promise<void> {
    const key = this.grupoTomado();
    if (!key) return;
    const grupo = this.catalogoGrupos().find(g => g.key === key);
    if (!grupo) return;
    await this.inscribirGrupo(grupo);
  }

  // ────────────────────────────────────────────────────────────────
  // ACCIONES — DELETE
  // ────────────────────────────────────────────────────────────────

  async eliminarMateria(codigoMateria: string): Promise<void> {
    await this.pensumService.desinscribirDeGrupo(codigoMateria);
    this.confirmadas.update(s => {
      const copia = new Set(s);
      for (const k of Array.from(copia)) {
        if (k.startsWith(`${codigoMateria}-`)) copia.delete(k);
      }
      return copia;
    });
    this.mostrarExito(`${codigoMateria} eliminada del horario.`);
  }

  async limpiarTodo(): Promise<void> {
    const inscripciones = this.pensumService.inscripciones();
    for (const ins of inscripciones) {
      await this.pensumService.desinscribirDeGrupo(ins.codigoMateria);
    }
    this.confirmadas.set(new Set());
  }

  // ────────────────────────────────────────────────────────────────
  // ACCIONES — Confirmación
  // ────────────────────────────────────────────────────────────────

  abrirConfirmacion(): void {
    if (this.gruposInscritos().length === 0) {
      this.mostrarError('No hay materias para confirmar.');
      return;
    }
    this.modalAbierta.set(true);
  }

  cerrarConfirmacion(): void {
    this.modalAbierta.set(false);
  }

  confirmarTodo(): void {
    const todas = new Set(this.gruposInscritos().map(g => g.key));
    this.confirmadas.set(todas);
    this.modalAbierta.set(false);
    this.mostrarExito('Materias confirmadas. Ya puedes exportar tu horario.');
  }

  // ────────────────────────────────────────────────────────────────
  // EXPORTACIÓN .ics  (Google Calendar)
  // ────────────────────────────────────────────────────────────────

  private generarIcs(): string {
    const lineas: string[] = [];
    const ahora = new Date();
    const dtstamp =
      ahora.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    lineas.push('BEGIN:VCALENDAR');
    lineas.push('VERSION:2.0');
    lineas.push('PRODID:-//PensumNavigator//UES-FMO//ES');
    lineas.push('CALSCALE:GREGORIAN');
    lineas.push('METHOD:PUBLISH');

    for (const g of this.gruposInscritos()) {
      for (const [idx, f] of g.horario.entries()) {
        const diaIso = DIA_A_ISO[f.dia as DiaSemana];
        if (!diaIso) continue;
        const fechaInicio = proximaFecha(diaIso, ahora);
        const horaIni = aHoraIcs(f.horaInicio);
        const horaFin = aHoraIcs(f.horaFin);
        const uid = `${g.codigoMateria}-${g.numeroGrupo}-${idx}-${fechaInicio}@pensumnavigator`;
        const byDayMap: Record<number, string> = {
          1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA', 7: 'SU',
        };

        lineas.push('BEGIN:VEVENT');
        lineas.push(`UID:${uid}`);
        lineas.push(`DTSTAMP:${dtstamp}`);
        lineas.push(`DTSTART:${fechaInicio}T${horaIni}`);
        lineas.push(`DTEND:${fechaInicio}T${horaFin}`);
        lineas.push(
          `RRULE:FREQ=WEEKLY;BYDAY=${byDayMap[diaIso]};COUNT=16`
        );
        lineas.push(
          `SUMMARY:${escIcs(g.codigoMateria + ' — ' + g.nombreMateria + ' (G' + g.numeroGrupo + ')')}`
        );
        lineas.push(`LOCATION:${escIcs(f.aula)}`);
        lineas.push(
          `DESCRIPTION:${escIcs(`Docente: ${g.docente}\nTipo: ${g.tipo}\nGrupo: ${g.numeroGrupo}`)}`
        );
        lineas.push('END:VEVENT');
      }
    }

    lineas.push('END:VCALENDAR');
    // RFC 5545 exige CRLF
    return lineas.join('\r\n');
  }

  descargarIcs(): void {
    if (this.gruposInscritos().length === 0) {
      this.mostrarError('No hay materias inscritas para exportar.');
      return;
    }
    const contenido = this.generarIcs();
    const blob = new Blob([contenido], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'horario-ues.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
    this.mostrarExito('Archivo .ics descargado. Impórtalo en Google Calendar.');
  }

  // ────────────────────────────────────────────────────────────────
  // EXPORTACIÓN PDF (html2pdf.js cargado on-demand)
  // ────────────────────────────────────────────────────────────────

  private cargarLibreriaPdf(): Promise<any> {
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

  async descargarPdf(): Promise<void> {
    if (this.gruposInscritos().length === 0) {
      this.mostrarError('No hay materias inscritas para exportar.');
      return;
    }
    if (!this.areaImpresion) {
      this.mostrarError('No se pudo localizar el área a imprimir.');
      return;
    }
    try {
      const html2pdf = await this.cargarLibreriaPdf();
      // Forzamos el render desktop (la tabla) aunque estemos en móvil:
      // clonamos el nodo y le quitamos el display:none que aplica el CSS.
      const clon = this.areaImpresion.nativeElement.cloneNode(true) as HTMLElement;
      clon.classList.add('mz-print-force');
      const contenedor = document.createElement('div');
      contenedor.style.position = 'fixed';
      contenedor.style.left = '-10000px';
      contenedor.style.top = '0';
      contenedor.style.width = '1100px';
      contenedor.style.background = '#ffffff';
      contenedor.appendChild(clon);
      document.body.appendChild(contenedor);

      await html2pdf()
        .from(clon)
        .set({
          margin: 8,
          filename: 'horario-ues.pdf',
          html2canvas: { scale: 2, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        })
        .save();

      document.body.removeChild(contenedor);
      this.mostrarExito('PDF generado correctamente.');
    } catch (err) {
      console.error(err);
      this.mostrarError('No se pudo generar el PDF.');
    }
  }
}