import { Component, computed, inject, signal } from '@angular/core';

import { PensumService } from '../../core/services/pensum.service';
import { CommonModule } from '@angular/common';

/**
 * PensumComponent
 * ----------------
 * Muestra el pensum agrupado por ciclo en una cuadrícula de tarjetas.
 *
 * FUNCIONALIDADES:
 *
 * 1. Cuadrícula de materias por ciclo con estado visual (aprobada/cursando/pendiente).
 *
 * 2. HOVER: Al pasar el mouse sobre una tarjeta, se resaltan:
 *      - En VERDE  → las materias que esa materia DESBLOQUEA directamente
 *      - En ROJO   → las materias que son PREREQUISITO de esa materia
 *      - En OPACO  → todas las demás (sin relación con la hovereada)
 *    Esto permite al estudiante ver visualmente el flujo del pensum sin abrir
 *    ningún modal, exactamente como describió el Ing. Diego Herrera en clase.
 *
 * 3. CLIC: Abre un modal con el flujo de prerrequisitos (comportamiento original).
 *
 * ¿Cómo funciona el hover?
 * -------------------------
 * `codigoHover` es un signal que guarda el código de la materia sobre la que
 * está el mouse. Cuando vale null, no hay hover activo y todas las tarjetas
 * se ven normal.
 *
 * `estadoHover(codigo)` es el método que lee ese signal y decide qué clase CSS
 * ponerle a cada tarjeta: 'hover-desbloquea', 'hover-requisito', 'hover-opaco'
 * o '' (sin clase extra = normal).
 *
 * Como `estadoHover()` lee la signal `codigoHover()` internamente, Angular
 * detecta el cambio y vuelve a evaluar los [class.x] de TODAS las tarjetas
 * cada vez que el hover cambia — sin necesidad de recorrer el DOM manualmente.
 */
@Component({
  selector: 'app-pensum',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pensum.component.html',
  styleUrl: './pensum.component.css'
})
export class PensumComponent {

  pensumService = inject(PensumService);

  // ── Materia seleccionada para el MODAL (clic) ───────────────────────────
  materiaSeleccionada = signal<any | null>(null);

  // ── Código de la materia sobre la que está el mouse (HOVER) ────────────
  // null = no hay hover activo
  codigoHover = signal<string | null>(null);

  // ── Computed: datos del modal de prerrequisitos ─────────────────────────
  grafoMateria = computed(() => {
    const seleccionada = this.materiaSeleccionada();
    if (!seleccionada) return null;

    const todasMaterias = this.pensumService.materias();
    const todosPrerequisitos = this.pensumService.prerequisitos();

    const reqCodigos = todosPrerequisitos
      .filter(p => p.codigoMateria === seleccionada.codigo)
      .map(p => p.codigoPrerequisito);

    const prerequisitos = todasMaterias.filter(m => reqCodigos.includes(m.codigo));

    const desbCodigos = todosPrerequisitos
      .filter(p => p.codigoPrerequisito === seleccionada.codigo)
      .map(p => p.codigoMateria);

    const desbloquea = todasMaterias.filter(m => desbCodigos.includes(m.codigo));

    return { actual: seleccionada, prerequisitos, desbloquea };
  });

  // ── Acciones del MODAL (clic) ───────────────────────────────────────────
  seleccionarMaterias(materia: any): void {
    this.materiaSeleccionada.set(materia);
  }

  cerrarGrafo(): void {
    this.materiaSeleccionada.set(null);
  }

  // ── Acciones del HOVER ─────────────────────────────────────────────────

  /** Activa el hover sobre una materia. */
  activarHover(codigo: string): void {
    this.codigoHover.set(codigo);
  }

  /** Desactiva el hover al salir de la tarjeta. */
  desactivarHover(): void {
    this.codigoHover.set(null);
  }

  /**
   * Devuelve el estado de resaltado de una tarjeta durante el hover.
   *
   * Posibles valores:
   *   'hover-seleccionada' → es la materia que está hovered (azul/blanco)
   *   'hover-desbloquea'   → esta materia se DESBLOQUEA al aprobar la hovered (verde)
   *   'hover-requisito'    → esta materia es REQUISITO de la hovered (rojo/naranja)
   *   'hover-opaco'        → no tiene relación con la hovered (se atenúa)
   *   ''                   → no hay hover activo, sin clase extra
   *
   * Se llama una vez por tarjeta en cada cambio de codigoHover().
   * Como lee la signal, Angular detecta el cambio automáticamente.
   */
  estadoHover(codigoTarjeta: string): string {
    const hovered = this.codigoHover();

    // Sin hover activo: todas las tarjetas se ven normal
    if (!hovered) return '';

    // La tarjeta que tiene el mouse
    if (codigoTarjeta === hovered) return 'hover-seleccionada';

    const prerequisitos = this.pensumService.prerequisitos();

    // ¿Esta tarjeta DESBLOQUEA al hovered?
    // Es decir, ¿'hovered' tiene a 'codigoTarjeta' como prerrequisito?
    const esPrerequisitoDelHovered = prerequisitos.some(
      p => p.codigoMateria === hovered && p.codigoPrerequisito === codigoTarjeta
    );
    if (esPrerequisitoDelHovered) return 'hover-requisito';

    // ¿Esta tarjeta se DESBLOQUEA gracias al hovered?
    // Es decir, ¿'codigoTarjeta' tiene a 'hovered' como prerrequisito?
    const seDesbloqueaConHovered = prerequisitos.some(
      p => p.codigoMateria === codigoTarjeta && p.codigoPrerequisito === hovered
    );
    if (seDesbloqueaConHovered) return 'hover-desbloquea';

    // No tiene relación directa: se atenúa
    return 'hover-opaco';
  }

  // ── Computed: ciclos agrupados ──────────────────────────────────────────
  ciclos = computed(() => {
    const prerequisitos = this.pensumService.prerequisitos();
    const materias = this.pensumService.materias();

    const mapaCiclos = new Map<number, any[]>();

    materias.forEach(materia => {
      if (!mapaCiclos.has(materia.ciclo)) {
        mapaCiclos.set(materia.ciclo, []);
      }

      const materiasPrerequisitos = prerequisitos
        .filter(req => req.codigoMateria === materia.codigo)
        .map(req => req.codigoPrerequisito);

      const materiaConPrerequisitos = {
        ...materia, listaPrerequisitos: materiasPrerequisitos
      };

      mapaCiclos.get(materia.ciclo)!.push(materiaConPrerequisitos);
    });

    return Array.from(mapaCiclos.entries())
      .map(([ciclo, listaMaterias]) => ({ ciclo, listaMaterias }))
      .sort((a, b) => a.ciclo - b.ciclo);
  });

  /** Lee el estado académico de la materia (para el color de la tarjeta). */
  estadoMateria(codigo: string): string {
    return this.pensumService.estadoDe(codigo);
  }
}