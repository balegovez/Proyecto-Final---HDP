import {
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

import { PensumService } from '../../core/services/pensum.service';

@Component({
  selector: 'app-matriz',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './matriz.component.html',
  styleUrl: './matriz.component.css',
})
export class MatrizComponent {

  // ── Servicios ────────────────────────────────────────────────────
  pensumService = inject(PensumService);

  // ── Constantes ───────────────────────────────────────────────────
  readonly LIMITE_UV = 20;

  readonly dias = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
  ] as const;

  readonly horas = [
    '07:00',
    '09:00',
    '11:00',
    '13:00',
    '15:00',
  ] as const;

  /**
   * Array tipado vacío que se pasa como [cdkDropListData] en cada celda.
   * Evita que TypeScript infiera never[] desde un literal [].
   */
  readonly celdaVacia: string[] = [];

  // ── IDs de celdas (calculado una sola vez, no en getter) ─────────
  /**
   * Se declara como propiedad en vez de getter para que Angular no lo
   * recalcule en cada ciclo de detección de cambios.
   */
  readonly dropIds: string[] = this.dias.flatMap(dia =>
    this.horas.map(hora => `drop-${dia}-${hora}`)
  );

  // ── Las tres colecciones (fuente de verdad) ───────────────────────

  /** Horario armado: clave = "Dia-HH:MM", valor = código de materia */
  readonly horario = signal<Record<string, string>>({});

  /** Materias elegidas por el estudiante, pendientes de ubicar */
  readonly materiasSeleccionadas = signal<string[]>([]);

  /**
   * Materias que aún no están en ninguna de las otras dos colecciones.
   * computed() garantiza que se recalcule cuando cambien los signals.
   */
  readonly materiasDisponibles = computed(() => {
    const enSeleccionadas = new Set(this.materiasSeleccionadas());
    const enHorario       = new Set(Object.values(this.horario()));
    return this.pensumService
      .materias()
      .filter(m => !enSeleccionadas.has(m.codigo) && !enHorario.has(m.codigo));
  });

  /**
   * Total de UV en el horario como computed para que la vista
   * no repita cálculos en cada interpolación {{ totalUV() }}.
   */
  readonly uvInscritas = computed(() => {
    const enHorario = new Set(Object.values(this.horario()));
    return this.pensumService
      .materias()
      .filter(m => enHorario.has(m.codigo))
      .reduce((sum, m) => sum + m.uv, 0);
  });

  /** Materias efectivamente colocadas en el horario. */
  readonly materiasUbicadas = computed(() =>
    Object.keys(this.horario()).length
  );

  // ── Helpers ───────────────────────────────────────────────────────

  /**
   * Devuelve la materia completa a partir de su código.
   * Centraliza la búsqueda para no repetirla en el template.
   */
  obtenerMateria(codigo: string) {
    return this.pensumService.materias().find(m => m.codigo === codigo);
  }

  /**
   * Verifica si todos los prerrequisitos de una materia están aprobados.
   */
  puedeInscribir(codigoMateria: string): boolean {
    const prerequisitos = this.pensumService
      .prerequisitos()
      .filter(p => p.codigoMateria === codigoMateria);

    if (prerequisitos.length === 0) return true;

    return prerequisitos.every(
      pr => this.pensumService.estadoDe(pr.codigoPrerequisito) === 'aprobada'
    );
  }

  // ── Acciones ──────────────────────────────────────────────────────

  /**
   * DISPONIBLES → SELECCIONADAS
   * Mueve una materia al panel de seleccionadas.
   * No hace nada si tiene prerrequisitos pendientes.
   */
  agregarASeleccionadas(codigo: string): void {
    if (!this.puedeInscribir(codigo)) return;
    this.materiasSeleccionadas.update(lista => [...lista, codigo]);
  }

  /**
   * SELECCIONADAS → DISPONIBLES
   * Devuelve una materia al listado de disponibles.
   */
  quitarDeSeleccionadas(codigo: string): void {
    this.materiasSeleccionadas.update(lista => lista.filter(c => c !== codigo));
  }

  /**
   * SELECCIONADAS → HORARIO  (evento drop)
   *
   * Solo se invoca cuando el elemento cae dentro de un cdkDropList válido.
   * Si el usuario suelta fuera de cualquier celda, CDK cancela el drag
   * y esta función nunca se ejecuta — la materia queda en seleccionadas.
   */
  soltarEnCelda(
    event: CdkDragDrop<string[]>,
    dia: string,
    hora: string
  ): void {
    const codigo: string = event.item.data;
    if (!codigo) return;
    if (!this.puedeInscribir(codigo)) return;

    const llave = `${dia}-${hora}`;

    // Celda ya ocupada — no sobreescribir
    if (this.horario()[llave]) return;

    const materia = this.obtenerMateria(codigo);
    if (!materia) return;

    // Validar límite de UV
    if (this.uvInscritas() + materia.uv > this.LIMITE_UV) {
      // No se usa alert() nativo; se expone un mensaje reactivo
      this.mensajeError.set(
        `Límite alcanzado: no puedes superar ${this.LIMITE_UV} UV por ciclo.`
      );
      setTimeout(() => this.mensajeError.set(null), 4000);
      return;
    }

    // Mover de seleccionadas → horario de forma atómica
    this.materiasSeleccionadas.update(lista => lista.filter(c => c !== codigo));
    this.horario.update(h => ({ ...h, [llave]: codigo }));
  }

  /**
   * HORARIO → SELECCIONADAS  (clic en celda ocupada)
   * Elimina la materia del horario y la devuelve a seleccionadas.
   */
  devolverASeleccionadas(dia: string, hora: string): void {
    const llave  = `${dia}-${hora}`;
    const codigo = this.horario()[llave];
    if (!codigo) return;

    this.horario.update(h => {
      const copia = { ...h };
      delete copia[llave];
      return copia;
    });

    this.materiasSeleccionadas.update(lista => [...lista, codigo]);
  }

  // ── Feedback de errores (reemplaza alert nativo) ──────────────────
  readonly mensajeError = signal<string | null>(null);
}