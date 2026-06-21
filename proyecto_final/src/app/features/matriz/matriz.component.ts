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

  readonly dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as const;
  readonly horas = ['07:00', '09:00', '11:00', '13:00', '15:00'] as const;

  readonly celdaVacia: string[] = [];

  readonly dropIds: string[] = this.dias.flatMap(dia =>
    this.horas.map(hora => `drop-${dia}-${hora}`)
  );

  // ── Colecciones (fuente de verdad) ────────────────────────────────
  readonly horario = signal<Record<string, string>>({});
  readonly materiasSeleccionadas = signal<string[]>([]);

  /**
   * MODO TÁCTIL (móvil): código de la materia "tomada" con un toque.
   * Cuando vale null, no hay materia tomada. Cuando tiene un código, el
   * siguiente toque en una celda vacía la coloca ahí.
   *
   * Esto resuelve el problema del drag & drop en móvil: arrastrar a una
   * tabla pequeña con el dedo es impreciso, así que ofrecemos "tocar para
   * tomar, tocar para soltar" como alternativa accesible.
   */
  readonly materiaTomada = signal<string | null>(null);

  /**
   * Materias DISPONIBLES = inscribibles (prereqs cumplidos, no aprobadas)
   * que aún no están ni en seleccionadas ni en el horario.
   *
   * CAMBIO CLAVE: ahora parte de materiasInscribibles() del servicio en vez
   * de todas las materias. Así la Matriz solo muestra lo que el estudiante
   * REALMENTE puede inscribir según su ciclo y prerrequisitos.
   */
  readonly materiasDisponibles = computed(() => {
    const enSeleccionadas = new Set(this.materiasSeleccionadas());
    const enHorario = new Set(Object.values(this.horario()));
    return this.pensumService
      .materiasInscribibles()
      .filter(m => !enSeleccionadas.has(m.codigo) && !enHorario.has(m.codigo));
  });

  readonly uvInscritas = computed(() => {
    const enHorario = new Set(Object.values(this.horario()));
    return this.pensumService
      .materias()
      .filter(m => enHorario.has(m.codigo))
      .reduce((sum, m) => sum + m.uv, 0);
  });

  readonly materiasUbicadas = computed(() => Object.keys(this.horario()).length);

  // ── Helpers ───────────────────────────────────────────────────────

  obtenerMateria(codigo: string) {
    return this.pensumService.materias().find(m => m.codigo === codigo);
  }

  /**
   * ¿Se puede inscribir? Ahora delega en el servicio, que centraliza la
   * regla (no aprobada + todos los prereqs aprobados).
   */
  puedeInscribir(codigoMateria: string): boolean {
    return this.pensumService.esInscribible(codigoMateria);
  }

  // ── Acciones DISPONIBLES ↔ SELECCIONADAS ──────────────────────────

  agregarASeleccionadas(codigo: string): void {
    if (!this.puedeInscribir(codigo)) return;
    this.materiasSeleccionadas.update(lista => [...lista, codigo]);
  }

  quitarDeSeleccionadas(codigo: string): void {
    this.materiasSeleccionadas.update(lista => lista.filter(c => c !== codigo));
    // Si esta materia estaba "tomada" en modo táctil, la soltamos.
    if (this.materiaTomada() === codigo) {
      this.materiaTomada.set(null);
    }
  }

  // ── DRAG & DROP (escritorio) ──────────────────────────────────────

  soltarEnCelda(event: CdkDragDrop<string[]>, dia: string, hora: string): void {
    const codigo: string = event.item.data;
    this.colocarEnCelda(codigo, dia, hora);
  }

  // ── MODO TÁCTIL (móvil): tomar / soltar con toques ────────────────

  /**
   * Primer toque: "toma" la materia. Segundo toque en la misma: la suelta.
   * Se usa en móvil donde arrastrar es impreciso.
   */
  tomarMateria(codigo: string): void {
    if (this.materiaTomada() === codigo) {
      this.materiaTomada.set(null); // toque de nuevo = soltar
    } else {
      this.materiaTomada.set(codigo);
    }
  }

  /**
   * Toque en una celda: si hay una materia tomada, la coloca ahí.
   */
  tocarCelda(dia: string, hora: string): void {
    const codigo = this.materiaTomada();
    if (!codigo) return;
    this.colocarEnCelda(codigo, dia, hora);
    this.materiaTomada.set(null);
  }

  /**
   * Lógica COMPARTIDA entre drag&drop y modo táctil: valida y coloca la
   * materia en la celda. Centraliza las reglas para no duplicarlas.
   */
  private colocarEnCelda(codigo: string, dia: string, hora: string): void {
    if (!codigo) return;
    if (!this.puedeInscribir(codigo)) return;

    const llave = `${dia}-${hora}`;
    if (this.horario()[llave]) return; // celda ocupada

    const materia = this.obtenerMateria(codigo);
    if (!materia) return;

    if (this.uvInscritas() + materia.uv > this.LIMITE_UV) {
      this.mensajeError.set(
        `Límite alcanzado: no puedes superar ${this.LIMITE_UV} UV por ciclo.`
      );
      setTimeout(() => this.mensajeError.set(null), 4000);
      return;
    }

    this.materiasSeleccionadas.update(lista => lista.filter(c => c !== codigo));
    this.horario.update(h => ({ ...h, [llave]: codigo }));
  }

  devolverASeleccionadas(dia: string, hora: string): void {
    const llave = `${dia}-${hora}`;
    const codigo = this.horario()[llave];
    if (!codigo) return;

    this.horario.update(h => {
      const copia = { ...h };
      delete copia[llave];
      return copia;
    });

    this.materiasSeleccionadas.update(lista => [...lista, codigo]);
  }

  // ── Feedback de errores ───────────────────────────────────────────
  readonly mensajeError = signal<string | null>(null);
}