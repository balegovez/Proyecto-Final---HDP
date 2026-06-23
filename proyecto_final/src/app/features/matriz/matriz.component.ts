import { Component, computed, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { PensumService } from '../../core/services/pensum.service';

import {
  BloqueDiaMovil,
  CeldaOcupada,
  DIAS_SEMANA,
  DiaSemana,
  FilaHorario,
  GrupoConfirmable,
  GrupoSeleccionable,
} from './matriz.types';

import { aHoraLarga, aMinutos, validarInscripcion } from './utils/horario-validador';
import { descargarIcs as descargarIcsArchivo, descargarPdf as descargarPdfArchivo } from './utils/horario-exportador';

import { GrupoSidebarComponent } from './components/grupo-sidebar/grupo-sidebar.component';
import { TablaHorarioComponent } from './components/tabla-horario/tabla-horario.component';
import { ConfirmacionModalComponent } from './components/confirmacion-modal/confirmacion-modal.component';

// COMPONENTE PADRE — Orquesta estado y delega presentación a los hijos.
//
// Responsabilidades:
//   - Inyectar PensumService y derivar datos (computed signals).
//   - Mantener estado de interacción de UI (móvil, modal, mensajes).
//   - Coordinar acciones (inscribir, eliminar, exportar) llamando a
//     las utilidades puras de ./utils.

@Component({
  selector: 'app-matriz',
  standalone: true,
  imports: [
    CommonModule,
    GrupoSidebarComponent,
    TablaHorarioComponent,
    ConfirmacionModalComponent,
  ],
  templateUrl: './matriz.component.html',
  styleUrl: './matriz.component.css',
})
export class MatrizComponent {

  // Servicios
  pensumService = inject(PensumService);

  // Constantes 
  readonly DIAS = DIAS_SEMANA;
  readonly DROP_LIST_ID_SIDEBAR = 'lista-grupos-disponibles';
  readonly DROP_LIST_ID_MATRIZ = 'matriz-horario';

  // Estado local (signals) 

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

  // FUENTES DERIVADAS (computed)

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
   *   - El grupo aún no debe estar inscrito (ni otro grupo de la misma materia)
   */
  readonly gruposDisponibles = computed<GrupoSeleccionable[]>(() => {
    const inscribibles = new Set(
      this.pensumService.materiasInscribibles().map(m => m.codigo)
    );
    const codigosInscritos = new Set(
      this.gruposInscritos().map(g => g.codigoMateria)
    );

    return this.catalogoGrupos().filter(g => {
      if (!inscribibles.has(g.codigoMateria)) return false;
      if (codigosInscritos.has(g.codigoMateria)) return false;
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

  // VISTA AGRUPADA POR DÍA (móvil)

  readonly vistaPorDia = computed<BloqueDiaMovil[]>(() => {
    return this.DIAS.map(dia => {
      const items: BloqueDiaMovil['items'] = [];
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

  // HELPERS DE PLANTILLA

  private claveCelda(dia: string, horaInicio: string, horaFin: string): string {
    return `${dia}|${horaInicio}|${horaFin}`;
  }

  celdaEn = (fila: FilaHorario, dia: string): CeldaOcupada | undefined => {
    return this.indiceCeldas().get(
      this.claveCelda(dia, fila.horaInicio, fila.horaFin)
    );
  };

  /** Para iconografía / clases CSS según tipo. */
  obtenerColorPorMateria = (codigo: string): string => {
    let h = 0;
    for (let i = 0; i < codigo.length; i++) {
      h = (h * 31 + codigo.charCodeAt(i)) >>> 0;
    }
    const tono = h % 360;
    return `hsl(${tono} 55% 42%)`;
  };

  // ACCIONES — CREATE / UPDATE

  /**
   * Acción central de inscripción. Es llamada tanto por drag&drop
   * como por click/touch. Valida con la utilidad pura y persiste.
   */
  async inscribirGrupo(grupo: GrupoSeleccionable): Promise<void> {
    const error = validarInscripcion(
      grupo,
      this.gruposInscritos(),
      (codigo) => this.pensumService.esInscribible(codigo)
    );
    if (error) {
      this.mostrarError(error);
      return;
    }
    await this.pensumService.inscribirAGrupo(grupo.codigoMateria, grupo.numeroGrupo);
    // Si se cambió de grupo, la confirmación previa queda invalidada para esa key.
    this.confirmadas.update(s => {
      const copia = new Set(s);
      for (const k of Array.from(copia)) {
        if (k.startsWith(`${grupo.codigoMateria}-`)) copia.delete(k);
      }
      return copia;
    });
    this.grupoTomado.set(null);
    this.mostrarExito(`${grupo.codigoMateria} G${grupo.numeroGrupo} asignado correctamente.`);
  }

  // ── Drag & drop: punto de entrada (emitido por TablaHorarioComponent) ──
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

  // ACCIONES — DELETE
  
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

  // ACCIONES — Confirmación
  
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

  // EXPORTACIÓN — delega a utils/horario-exportador.ts
  
  descargarIcs(): void {
    if (this.gruposInscritos().length === 0) {
      this.mostrarError('No hay materias inscritas para exportar.');
      return;
    }
    try {
      descargarIcsArchivo(this.gruposInscritos());
      this.mostrarExito('Archivo .ics descargado. Impórtalo en Google Calendar.');
    } catch (err) {
      console.error('Error generando .ics:', err);
      this.mostrarError(
        'No se pudo generar el .ics: ' +
        (err instanceof Error ? err.message : 'error desconocido')
      );
    }
  }

  async descargarPdf(): Promise<void> {
    if (this.gruposInscritos().length === 0) {
      this.mostrarError('No hay materias inscritas para exportar.');
      return;
    }
    try {
      this.mostrarExito('Generando PDF, por favor espera...');
      await descargarPdfArchivo(
        this.filasHorario(),
        this.celdaEn,
        this.materiasUbicadas()
      );
      this.mostrarExito('PDF generado correctamente.');
    } catch (err) {
      console.error('Error generando PDF:', err);
      this.mostrarError(
        'No se pudo generar el PDF: ' +
        (err instanceof Error ? err.message : 'error desconocido')
      );
    }
  }
}
