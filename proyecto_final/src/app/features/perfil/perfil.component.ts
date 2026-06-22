import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PensumService } from '../../core/services/pensum.service';
import { Materia, HistorialEstudiante } from '../../core/db/dexie-db';

/**
 * PerfilComponent
 * ----------------
 * Pantalla inicial del estudiante. Tiene dos modos:
 *
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent {
  pensumService = inject(PensumService);

  // ── Estado local del formulario ───────────────────────────────
  nombre = '';
  carnet = '';
  cicloSeleccionado = signal<number>(1);

  // Paso del formulario: 1 = datos básicos, 2 = marcar reprobadas
  paso = signal<1 | 2>(1);

  // Códigos de materias que el estudiante marcó como reprobadas (Set reactivo)
  reprobadas = signal<Set<string>>(new Set());

  // Bug 2: modo edición. Cuando es true mostramos el formulario (precargado)
  // aunque YA exista un perfil, para poder cambiar nombre/carné/ciclo.
  modoEdicion = signal<boolean>(false);

  // ── ¿Mostrar formulario o resumen? ────────────────────────────
  // Sin perfil → formulario de creación. Con perfil + modoEdicion → edición.
  mostrarFormulario = computed(
    () => this.pensumService.perfil() === null || this.modoEdicion()
  );

  // Ciclos disponibles para elegir (1 al máximo del pensum)
  ciclosDisponibles = computed(() => {
    const maxCiclo = Math.max(...this.pensumService.materias().map(m => m.ciclo), 1);
    return Array.from({ length: maxCiclo }, (_, i) => i + 1);
  });

  /**
   * Materias de ciclos ANTERIORES al seleccionado, agrupadas por ciclo.
   * Son las que el estudiante puede marcar como reprobadas en el paso 2.
   * Si elige ciclo 1, no hay materias anteriores (lista vacía).
   */
  materiasAnteriores = computed(() => {
    const ciclo = this.cicloSeleccionado();
    const grupos = new Map<number, Materia[]>();

    for (const m of this.pensumService.materias()) {
      if (m.ciclo < ciclo) {
        const lista = grupos.get(m.ciclo) ?? [];
        lista.push(m);
        grupos.set(m.ciclo, lista);
      }
    }

    return Array.from(grupos.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([ciclo, materias]) => ({ ciclo, materias }));
  });

  // ════════════════════════════════════════════════════════════
  // RESUMEN (cuando ya hay perfil)
  // ════════════════════════════════════════════════════════════

  private cargaEstandarDelCiclo(ciclo: number): number {
    return ciclo === 1 ? 4 : 5;
  }

  materiasPorCiclo = computed(() => {
    const grupos = new Map<number, Materia[]>();
    for (const materia of this.pensumService.materias()) {
      const lista = grupos.get(materia.ciclo) ?? [];
      lista.push(materia);
      grupos.set(materia.ciclo, lista);
    }

    return Array.from(grupos.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([ciclo, materias]) => {
        const obligatorias = materias.filter((m) => m.tipo === 'Obligatoria');
        const electivas = materias.filter((m) => m.tipo === 'Electiva');
        const carga = this.cargaEstandarDelCiclo(ciclo);
        const electivasNecesarias = Math.min(
          electivas.length, Math.max(0, carga - obligatorias.length)
        );
        const aCursar = obligatorias.length + electivasNecesarias;
        const obligAprobadas = obligatorias.filter(
          (m) => this.pensumService.estadoDe(m.codigo) === 'aprobada'
        ).length;
        const electAprobadas = electivas.filter(
          (m) => this.pensumService.estadoDe(m.codigo) === 'aprobada'
        ).length;
        const aprobadas = obligAprobadas + Math.min(electAprobadas, electivasNecesarias);
        return { ciclo, materias, aCursar, aprobadas };
      });
  });

  progreso = computed(() => {
    let aprobadas = 0;
    let total = 0;
    for (const grupo of this.materiasPorCiclo()) {
      aprobadas += grupo.aprobadas;
      total += grupo.aCursar;
    }
    const restantes = total - aprobadas;
    const porcentaje = total === 0 ? 0 : Math.round((aprobadas / total) * 100);
    return { aprobadas, total, restantes, porcentaje };
  });

  // ════════════════════════════════════════════════════════════
  // ACCIONES DEL FORMULARIO
  // ════════════════════════════════════════════════════════════

  /** Pasa del paso 1 (datos) al paso 2 (reprobadas). Valida datos básicos. */
  irAPaso2(): void {
    if (!this.nombre.trim() || !this.carnet.trim()) {
      alert('Por favor, completa tu nombre y tu carné.');
      return;
    }
    // Si eligió ciclo 1, no hay materias anteriores: guardamos directo.
    if (this.cicloSeleccionado() === 1) {
      this.guardarPerfil();
      return;
    }
    this.paso.set(2);
  }

  /** Regresa del paso 2 al paso 1. */
  volverAPaso1(): void {
    this.paso.set(1);
  }

  /** Marca o desmarca una materia como reprobada en el paso 2. */
  toggleReprobada(codigo: string): void {
    this.reprobadas.update(set => {
      const nuevo = new Set(set);
      if (nuevo.has(codigo)) {
        nuevo.delete(codigo);
      } else {
        nuevo.add(codigo);
      }
      return nuevo;
    });
  }

  /** ¿Está marcada como reprobada? (para el checkbox del paso 2). */
  esReprobada(codigo: string): boolean {
    return this.reprobadas().has(codigo);
  }

  /** Guarda el perfil con ciclo + reprobadas. El servicio calcula el historial. */
  async guardarPerfil(): Promise<void> {
    if (!this.nombre.trim() || !this.carnet.trim()) {
      alert('Por favor, completa tu nombre y tu carné.');
      return;
    }
    await this.pensumService.guardarPerfil(
      this.nombre.trim(),
      this.carnet.trim(),
      this.cicloSeleccionado(),
      Array.from(this.reprobadas())
    );
    // Tras guardar (creación o edición) volvemos al resumen.
    this.modoEdicion.set(false);
    this.paso.set(1);
  }

  // ════════════════════════════════════════════════════════════
  // ACCIONES DEL RESUMEN
  // ════════════════════════════════════════════════════════════
  editarPerfil(): void {
    const perfil = this.pensumService.perfil();
    if (!perfil) return;
    this.nombre = perfil.nombre;
    this.carnet = perfil.carnet;
    this.cicloSeleccionado.set(perfil.cicloActual);
    this.reprobadas.set(new Set());
    this.paso.set(1);
    this.modoEdicion.set(true);
  }

  /** Cancela la edición y vuelve al resumen sin cambiar nada. */
  cancelarEdicion(): void {
    this.modoEdicion.set(false);
    this.paso.set(1);
    this.reprobadas.set(new Set());
  }

  async borrarPerfil(): Promise<void> {
    const confirmar = confirm(
      '¿Seguro que quieres borrar tu perfil y todo tu historial académico?'
    );
    if (!confirmar) return;

    await this.pensumService.borrarPerfil();
    this.nombre = '';
    this.carnet = '';
    this.cicloSeleccionado.set(1);
    this.reprobadas.set(new Set());
    this.paso.set(1);
  }

  async marcarMateria(codigoMateria: string, evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const quiereAprobar = input.checked;


    if (quiereAprobar && !this.pensumService.prerequisitosAprobados(codigoMateria)) {
      const faltan = this.pensumService.prerequisitosFaltantes(codigoMateria);
      input.checked = false; // revertir el check visual de inmediato
      alert(
        `No puedes aprobar ${codigoMateria} todavía: ` +
        `te faltan prerrequisitos (${faltan.join(', ')}).`
      );
      return;
    }

    const estado: HistorialEstudiante['estado'] = quiereAprobar ? 'aprobada' : 'pendiente';
    await this.pensumService.actualizarEstadoMateria(codigoMateria, estado);
  }

  async cargarEscenarioDemo(cicloMaximo: number): Promise<void> {
    const confirmar = confirm('Esto reemplazará tu historial actual de materias. ¿Continuar?');
    if (!confirmar) return;
    await this.pensumService.cargarEscenarioHastaCiclo(cicloMaximo);
  }

  estaAprobada(codigoMateria: string): boolean {
    return this.pensumService.estadoDe(codigoMateria) === 'aprobada';
  }


  puedeAprobar(codigoMateria: string): boolean {
    return (
      this.estaAprobada(codigoMateria) ||
      this.pensumService.prerequisitosAprobados(codigoMateria)
    );
  }

  /** Prerrequisitos que faltan, para el aviso "🔒 Falta aprobar: ..." */
  prereqsFaltantes(codigoMateria: string): string[] {
    return this.pensumService.prerequisitosFaltantes(codigoMateria);
  }
}