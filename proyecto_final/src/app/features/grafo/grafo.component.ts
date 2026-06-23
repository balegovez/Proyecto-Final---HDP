import {
  Component,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { PensumService } from '../../core/services/pensum.service';
import { SeleccionGrafo } from './grafo.types';
import { materiasQueDesbloquea } from './utils/grafo-dominio';

import { GrafoHeaderComponent } from './components/grafo-header/grafo-header.component';
import { PanelSeleccionComponent } from './components/panel-seleccion/panel-seleccion.component';
import { GrafoCanvasComponent } from './components/grafo-canvas/grafo-canvas.component';

/**
 * GrafoComponent  (padre orquestador)
 * ------------------------------------
 * Responsabilidades exclusivas:
 *   1. Leer signals del PensumService y pasarlas hacia abajo como @Input.
 *   2. Mantener el estado de interacción UI: qué materia está seleccionada.
 *   3. Coordinar acciones entre hijos:
 *      - GrafoCanvas emite el código clicado → padre calcula BFS →
 *        pasa la cadena de vuelta al canvas para resaltar.
 *      - PanelSeleccion emite "cerrar" → padre limpia selección.
 *
 * Todo el código de Cytoscape vive en GrafoCanvasComponent.
 * Todo el dominio (BFS, out-degree, descripciones) vive en utils/.
 */
@Component({
  selector: 'app-grafo',
  standalone: true,
  imports: [
    CommonModule,
    GrafoHeaderComponent,
    PanelSeleccionComponent,
    GrafoCanvasComponent,
  ],
  templateUrl: './grafo.component.html',
  styleUrl: './grafo.component.css',
})
export class GrafoComponent {
  pensumService = inject(PensumService);

  /** Referencia al hijo de canvas para llamar su API imperativa de resaltado. */
  @ViewChild(GrafoCanvasComponent)
  private grafoCanvas?: GrafoCanvasComponent;

  /** Materia seleccionada + cadena BFS; null = sin selección. */
  seleccion: SeleccionGrafo | null = null;

  constructor() {
    // Cuando el historial cambia desde otro módulo (ej. Perfil), el efecto
    // obliga al canvas a actualizar colores vía ngOnChanges automáticamente
    // porque le pasamos la signal como @Input. No se necesita effect extra aquí.

    // Si el grafo aún no está montado cuando los datos cargan, Angular lo
    // inicializa vía ngOnInit del canvas con los datos que el padre le pasa.
    // Este effect solo es necesario si quisiéramos hacer algo adicional al
    // terminar de cargar; en este caso está documentado para claridad.
    effect(() => {
      const cargando = this.pensumService.cargando();
      if (!cargando && this.seleccion) {
        // Si el pensum recargó mientras había una selección activa, limpiarla
        // para evitar inconsistencias de datos.
        this.seleccion = null;
      }
    });
  }

  // ===========================================================
  //  MANEJADORES DE EVENTOS DE HIJOS
  // ===========================================================

  /** El canvas emitió un clic en un nodo → calculamos BFS y resaltamos. */
  alSeleccionarMateria(codigo: string): void {
    const materia = this.pensumService.materias().find((m) => m.codigo === codigo);
    if (!materia) return;

    const cadena = materiasQueDesbloquea(codigo, this.pensumService.prerequisitos());

    this.seleccion = { materia, cadenaDesbloqueada: cadena };

    // Pedimos al canvas que resalte visualmente la cadena.
    this.grafoCanvas?.resaltarCadena(codigo, cadena);
  }

  /** El canvas emitió clic en fondo, o el panel emitió "cerrar". */
  limpiarSeleccion(): void {
    this.seleccion = null;
    this.grafoCanvas?.limpiarResaltado();
  }
}
