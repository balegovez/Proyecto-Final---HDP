import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PensumService } from '../../core/services/pensum.service';
import { Materia, HistorialEstudiante } from '../../core/db/dexie-db';

/**
 * PerfilComponent
 * ----------------
 * Pantalla inicial del estudiante. Tiene dos "modos":
 *
 *   1. Si NO hay perfil guardado  -> muestra el FORMULARIO (nombre + carné).
 *   2. Si SÍ hay perfil guardado  -> muestra la LISTA de materias por ciclo,
 *      los botones de demostración y el botón de borrar perfil.
 *
 * Toda la data vive en PensumService (signals). Este componente NO toca
 * IndexedDB directamente: solo LEE signals y LLAMA métodos del servicio.
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  // Solo necesitamos FormsModule (para [(ngModel)]).
  // @for/@if y [class.x] son control-flow nativo de Angular 18: no requieren CommonModule.
  imports: [FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent {
  // Inyección del servicio central. Lo dejamos público para usarlo en el template.
  pensumService = inject(PensumService);

  // Estado LOCAL del formulario: solo existe mientras el usuario escribe.
  nombre = '';
  carnet = '';

  /**
   * ¿Mostrar el formulario o la lista de materias?
   *
   * Es un computed que DERIVA de perfil(): si no hay perfil, mostramos el
   * formulario; si lo hay, la lista. Al ser derivado, no tenemos que cambiar
   * un booleano a mano en guardarPerfil()/borrarPerfil(): Angular lo recalcula
   * solo cuando perfil() cambia.
   */
  mostrarFormulario = computed(() => this.pensumService.perfil() === null);

  /**
   * Carga estándar de materias por ciclo, según el plan de estudios:
   * el primer ciclo lleva 4 materias; del segundo en adelante, 5.
   * (Si tu plan usa otra carga, ESTE es el único lugar que hay que tocar.)
   */
  private cargaEstandarDelCiclo(ciclo: number): number {
    return ciclo === 1 ? 4 : 5;
  }

  /**
   * Materias agrupadas por ciclo, con cuántas hay que CURSAR y cuántas van
   * aprobadas. Deriva de materias() y de historial() (por usar estadoDe()),
   * así que se recalcula al cambiar el catálogo o al marcar una materia.
   *
   * Idea central: NO se cursan todas las electivas. Por ciclo se cursan
   * todas las obligatorias + solo las electivas que falten para llegar a la
   * carga estándar. Por eso el total no es "todas las materias del catálogo".
   *
   * Devuelve: [{ ciclo, materias[], aCursar, aprobadas }, ...]
   */
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

        // Electivas que el alumno realmente cursa: las que falten para llegar
        // a la carga estándar, sin pedir más de las que ofrece el ciclo.
        const carga = this.cargaEstandarDelCiclo(ciclo);
        const electivasNecesarias = Math.min(
          electivas.length,
          Math.max(0, carga - obligatorias.length)
        );

        // Materias a cursar este ciclo = todas las obligatorias + esas electivas.
        const aCursar = obligatorias.length + electivasNecesarias;

        // Aprobadas que CUENTAN: todas las obligatorias aprobadas + las electivas
        // aprobadas, pero sin pasar de las necesarias (las de más no suman, para
        // no superar el 100%).
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

  /**
   * Progreso académico global. Reutiliza el cálculo por ciclo y suma:
   * total = suma de las materias a cursar de cada ciclo (NO las 62 del catálogo),
   * aprobadas = suma de las aprobadas que cuentan en cada ciclo.
   */
  progreso = computed(() => {
    let aprobadas = 0;
    let total = 0;

    for (const grupo of this.materiasPorCiclo()) {
      aprobadas += grupo.aprobadas;
      total += grupo.aCursar;
    }

    const restantes = total - aprobadas;
    // Si aún no cargan las materias, total = 0: evitamos dividir entre cero.
    const porcentaje = total === 0 ? 0 : Math.round((aprobadas / total) * 100);

    return { aprobadas, total, restantes, porcentaje };
  });

  /**
   * Crea (o actualiza) el perfil en IndexedDB a través del servicio.
   * No tocamos mostrarFormulario: al guardar, perfil() deja de ser null
   * y el computed cambia solo a la vista de lista.
   */
  async guardarPerfil(): Promise<void> {
    if (!this.nombre.trim() || !this.carnet.trim()) {
      alert('Por favor, completa tu nombre y tu carné.');
      return;
    }
    await this.pensumService.guardarPerfil(this.nombre.trim(), this.carnet.trim());
  }

  /**
   * Borra el perfil y su historial; deja el formulario vacío para crear uno nuevo.
   */
  async borrarPerfil(): Promise<void> {
    const confirmar = confirm(
      '¿Seguro que quieres borrar tu perfil y todo tu historial académico?'
    );
    if (!confirmar) return;

    await this.pensumService.borrarPerfil();
    this.nombre = '';
    this.carnet = '';
  }

  /**
   * Marca o desmarca una materia como aprobada según el checkbox.
   * evento.target es el propio <input>, de ahí leemos .checked.
   */
  async marcarMateria(codigoMateria: string, evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const estado: HistorialEstudiante['estado'] = input.checked ? 'aprobada' : 'pendiente';
    await this.pensumService.actualizarEstadoMateria(codigoMateria, estado);
  }

  /**
   * Carga un escenario de demostración (reemplaza el historial completo).
   * Lo usan los 3 botones de demo durante la defensa.
   */
  async cargarEscenarioDemo(escenario: HistorialEstudiante[]): Promise<void> {
    const confirmar = confirm('Esto reemplazará tu historial actual de materias. ¿Continuar?');
    if (!confirmar) return;

    await this.pensumService.cargarEscenario(escenario);
  }

  /**
   * ¿Esta materia está aprobada? El checkbox la usa para marcarse o no.
   * Lee estadoDe() (síncrono, desde la signal en memoria).
   */
  estaAprobada(codigoMateria: string): boolean {
    return this.pensumService.estadoDe(codigoMateria) === 'aprobada';
  }
}