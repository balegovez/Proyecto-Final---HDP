import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';

import { Materia, Prerequisito, HistorialEstudiante } from '../../../../core/db/dexie-db';
import { calcularOutDegree } from '../../utils/grafo-dominio';
import { estilosCytoscape } from '../../utils/cytoscape-estilos';

/**
 * GrafoCanvasComponent
 * --------------------
 * Responsabilidad: montar y gestionar la instancia de Cytoscape.
 *
 * Recibe los datos ya resueltos del padre (materias, prerequisitos, historial)
 * y emite el código de la materia que el usuario selecciona/deselecciona.
 *
 * El ciclo de vida de Cytoscape queda encapsulado aquí:
 *   - ngOnInit        → crea la instancia cuando los datos ya llegaron.
 *   - ngOnChanges     → actualiza colores si cambia el historial, sin
 *                        reconstruir el grafo completo.
 *   - ngOnDestroy     → destruye la instancia para evitar fugas de memoria.
 *
 * @Input  materias      Lista de materias del pensum.
 * @Input  prerequisitos Lista de relaciones prerrequisito→materia.
 * @Input  historial     Historial de estados del estudiante (aprobada/cursando).
 * @Input  seleccionActiva Código de la materia actualmente seleccionada (para
 *                          resaltar en el grafo). null = sin selección.
 * @Output materiaSeleccionada Emite el código de la materia al hacer clic en un nodo.
 * @Output seleccionLimpiada   Emite cuando el usuario hace clic en el fondo.
 */
@Component({
  selector: 'app-grafo-canvas',
  standalone: true,
  templateUrl: './grafo-canvas.component.html',
  styleUrl: './grafo-canvas.component.css',
})
export class GrafoCanvasComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('cyContainer', { static: true })
  cyContainer!: ElementRef<HTMLDivElement>;

  @Input({ required: true }) materias!: Materia[];
  @Input({ required: true }) prerequisitos!: Prerequisito[];
  @Input({ required: true }) historial!: HistorialEstudiante[];
  @Input() seleccionActiva: string | null = null;

  @Output() materiaSeleccionada = new EventEmitter<string>();
  @Output() seleccionLimpiada = new EventEmitter<void>();

  private cy: Core | null = null;

  ngOnInit(): void {
    if (this.materias.length > 0) {
      this.inicializarGrafo();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Actualiza colores cuando llega un nuevo historial sin reconstruir el grafo.
    if (changes['historial'] && this.cy) {
      this.actualizarColoresPorHistorial(this.historial);
    }
  }

  ngOnDestroy(): void {
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }
  }

  //  INICIALIZACIÓN
  
  private inicializarGrafo(): void {
    const outDegree = calcularOutDegree(this.prerequisitos);

    const nodos: ElementDefinition[] = this.materias.map((m) => ({
      data: {
        id: m.codigo,
        label: `${m.codigo}\n${m.nombre}`,
        ciclo: m.ciclo,
        uv: m.uv,
        tipo: m.tipo,
        // 30px base + 10px por cada materia que desbloquea (out-degree)
        tamano: 30 + (outDegree.get(m.codigo) ?? 0) * 10,
        estado: this.estadoDe(m.codigo),
      },
    }));

    const aristas: ElementDefinition[] = this.prerequisitos.map((p) => ({
      data: {
        id: `${p.codigoPrerequisito}->${p.codigoMateria}`,
        source: p.codigoPrerequisito,
        target: p.codigoMateria,
      },
    }));

    this.cy = cytoscape({
      container: this.cyContainer.nativeElement,
      elements: [...nodos, ...aristas],
      style: estilosCytoscape(),
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 30,
        spacingFactor: 1.5,
      } as any,
      minZoom: 0.3,
      maxZoom: 2.5,
      wheelSensitivity: 0.9,
    });

    // Clic en nodo → emite el código al padre
    this.cy.on('tap', 'node', (evento) => {
      const codigo = evento.target.id();
      this.materiaSeleccionada.emit(codigo);
    });

    // Clic en fondo → limpia selección
    this.cy.on('tap', (evento) => {
      if (evento.target === this.cy) {
        this.seleccionLimpiada.emit();
      }
    });
  }

  //  API PÚBLICA PARA EL PADRE
  
  /**
   * Resalta visualmente la cadena de desbloqueo en el grafo.
   * Llamado por el padre cuando el usuario selecciona una materia.
   */
  resaltarCadena(codigoOrigen: string, cadena: string[]): void {
    if (!this.cy) return;

    this.cy.elements().removeClass('resaltada origen');
    this.cy.getElementById(codigoOrigen).addClass('origen');

    for (const codigo of cadena) {
      this.cy.getElementById(codigo).addClass('resaltada');
    }

    const codigosEnCadena = new Set([codigoOrigen, ...cadena]);
    this.cy.edges().forEach((arista) => {
      const source = arista.data('source');
      const target = arista.data('target');
      if (codigosEnCadena.has(source) && codigosEnCadena.has(target)) {
        arista.addClass('resaltada');
      }
    });
  }

  /**
   * Elimina todo el resaltado del grafo.
   */
  limpiarResaltado(): void {
    if (!this.cy) return;
    this.cy.elements().removeClass('resaltada origen');
  }

  //  PRIVADOS

  private estadoDe(codigo: string): HistorialEstudiante['estado'] {
    return this.historial.find((h) => h.codigoMateria === codigo)?.estado ?? 'pendiente';
  }

  private actualizarColoresPorHistorial(historial: HistorialEstudiante[]): void {
    if (!this.cy) return;

    const estadoPorCodigo = new Map<string, HistorialEstudiante['estado']>();
    for (const h of historial) {
      estadoPorCodigo.set(h.codigoMateria, h.estado);
    }

    this.cy.nodes().forEach((nodo) => {
      const codigo = nodo.id();
      const estado = estadoPorCodigo.get(codigo) ?? 'pendiente';
      nodo.data('estado', estado);
    });
  }
}
