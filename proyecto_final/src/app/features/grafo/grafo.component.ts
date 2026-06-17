import {
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';

import { PensumService } from '../../core/services/pensum.service';
import { Prerequisito, Materia, HistorialEstudiante } from '../../core/db/dexie-db';

/**
 * GrafoComponent
 * --------------
 * Visualiza el pensum como un grafo dirigido acíclico (DAG):
 *   - Cada materia = un nodo
 *   - Cada prerrequisito = una arista (flecha) desde el prerrequisito
 *     hacia la materia que lo requiere.
 *
 * Tres funcionalidades principales:
 *
 *   1. Renderizado del grafo completo con layout automático (breadthfirst).
 *   2. Al hacer clic en una materia: BFS hacia adelante para resaltar
 *      todas las materias que se desbloquean (directa o indirectamente)
 *      al aprobarla.
 *   3. Encoding visual del out-degree: las materias que son prerrequisito
 *      de MÁS materias se dibujan más grandes (cuellos de botella visibles
 *      a simple vista). Ej: MAT255 tiene out-degree 5, así que se verá
 *      claramente más grande que el resto.
 *
 * Los colores de los nodos reflejan el estado actual de cada materia:
 *   - Verde = aprobada
 *   - Azul  = cursando
 *   - Gris  = pendiente
 * Esto se actualiza automáticamente cuando el usuario marca/desmarca
 * materias en el módulo Perfil, gracias a las signals de PensumService.
 */
@Component({
  selector: 'app-grafo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafo.component.html',
  styleUrl: './grafo.component.css',
})
export class GrafoComponent implements OnDestroy {

  // Referencia al <div> donde Cytoscape va a renderizar el grafo.
  // El '!' le promete a TypeScript que estará definido antes de usarse
  // (Angular lo asigna después de que el view se monta).
  @ViewChild('cyContainer', { static: true })
  cyContainer!: ElementRef<HTMLDivElement>;

  // Servicio global con todos los datos del pensum.
  pensumService = inject(PensumService);

  // Necesario para crear effect() fuera del constructor.
  private injector = inject(Injector);

  // Instancia de Cytoscape. Se crea cuando los datos están listos
  // y se destruye en ngOnDestroy para evitar fugas de memoria.
  private cy: Core | null = null;

  // Código de la materia actualmente seleccionada (para mostrarlo en la UI)
  // o null si no hay ninguna.
  materiaSeleccionada: Materia | null = null;

  // Lista de materias resaltadas por el último BFS (lo mostramos en la UI).
  cadenaDesbloqueada: string[] = [];

  constructor() {
    // Effect #1: Cuando los datos terminen de cargar de IndexedDB,
    // inicializa Cytoscape UNA SOLA VEZ.
    // El effect se vuelve a ejecutar si cualquier signal que lea cambia,
    // pero el chequeo `if (this.cy) return` evita reconstruir el grafo.
    effect(() => {
      if (this.pensumService.cargando()) return;
      if (this.pensumService.materias().length === 0) return;
      if (this.cy) return; // Ya está inicializado

      this.inicializarGrafo();
    });

    // Effect #2: Cuando el historial del estudiante cambia (porque marcó
    // una materia como aprobada, o presionó un botón de demo), actualiza
    // los colores de los nodos SIN reconstruir el grafo completo.
    effect(() => {
      // Leemos la signal para que el effect "se suscriba" a sus cambios.
      const historial = this.pensumService.historial();
      if (!this.cy) return;
      this.actualizarColoresPorHistorial(historial);
    });
  }

  // ngOnDestroy se ejecuta cuando el usuario navega fuera de la pantalla
  // del grafo (ej. va a /matriz). Libera la memoria de Cytoscape.
  ngOnDestroy(): void {
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }
  }

  // ===========================================================
  //  INICIALIZACIÓN DEL GRAFO
  // ===========================================================

  /**
   * Construye los nodos y aristas a partir de los datos del servicio
   * y monta Cytoscape en el contenedor del DOM.
   */
  private inicializarGrafo(): void {
    const materias = this.pensumService.materias();
    const prerequisitos = this.pensumService.prerequisitos();

    // Calculamos cuántas materias depende de cada una (out-degree).
    // Esto nos sirve para hacer más grandes los nodos "cuellos de botella".
    const outDegree = this.calcularOutDegree(prerequisitos);

    // Construimos los nodos en el formato que espera Cytoscape.
    // Cada nodo tiene un 'data' con propiedades que luego usamos en CSS.
    const nodos: ElementDefinition[] = materias.map((m) => ({
      data: {
        id: m.codigo,
        label: `${m.codigo}\n${m.nombre}`,
        ciclo: m.ciclo,
        uv: m.uv,
        tipo: m.tipo,
        // tamaño = 30px base + 10px por cada materia que desbloquea
        tamano: 30 + (outDegree.get(m.codigo) ?? 0) * 10,
        // estado actual leído del historial
        estado: this.pensumService.estadoDe(m.codigo),
      },
    }));

    // Construimos las aristas. En un grafo de prerrequisitos:
    //   source = la materia que es prerrequisito (debe aprobarse primero)
    //   target = la materia que requiere ese prerrequisito
    // Así la flecha apunta en el sentido del progreso académico.
    const aristas: ElementDefinition[] = prerequisitos.map((p) => ({
      data: {
        id: `${p.codigoPrerequisito}->${p.codigoMateria}`,
        source: p.codigoPrerequisito,
        target: p.codigoMateria,
      },
    }));

    // Inicializamos Cytoscape con todos los nodos, aristas y estilos.
    this.cy = cytoscape({
      container: this.cyContainer.nativeElement,
      elements: [...nodos, ...aristas],
      style: this.estilosCytoscape(),
      layout: {
        // breadthfirst es un layout incluido en Cytoscape (no necesita
        // librerías extra) que organiza nodos por niveles. Para un DAG
        // de prerrequisitos es ideal porque cada nivel queda alineado.
        name: 'breadthfirst',
        directed: true,
        padding: 30,
        spacingFactor: 1.5,
      } as any,
      // Configuración de zoom/pan: permitir interacción libre
      minZoom: 0.3,
      maxZoom: 2.5,
      wheelSensitivity: 0.9,
    });

    // Registramos el manejador de clic en nodos: ejecuta BFS al hacer clic.
    this.cy.on('tap', 'node', (evento) => {
      const codigo = evento.target.id();
      this.alHacerClicEnMateria(codigo);
    });

    // Si el usuario hace clic en el fondo (no en un nodo), limpiamos el BFS.
    this.cy.on('tap', (evento) => {
      if (evento.target === this.cy) {
        this.limpiarSeleccion();
      }
    });
  }

  // ===========================================================
  //  CÁLCULO DEL OUT-DEGREE
  // ===========================================================

  /**
   * Cuenta, para cada materia, cuántas OTRAS materias la tienen como
   * prerrequisito. Una materia con out-degree alto es un "cuello de
   * botella": no aprobarla bloquea a muchas otras.
   *
   * Ejemplo con el pensum real:
   *   MAT255 (Matemática II) -> out-degree 5 (la requieren FIS155,
   *   FIS255, PES155, FDE155, MAT355).
   */
  private calcularOutDegree(prerequisitos: Prerequisito[]): Map<string, number> {
    const grados = new Map<string, number>();
    for (const p of prerequisitos) {
      const previo = grados.get(p.codigoPrerequisito) ?? 0;
      grados.set(p.codigoPrerequisito, previo + 1);
    }
    return grados;
  }

  // ===========================================================
  //  BFS: RECORRIDO HACIA ADELANTE
  // ===========================================================

  /**
   * Dado el código de una materia, devuelve TODOS los códigos de las
   * materias que se desbloquean al aprobarla (directa e indirectamente).
   *
   * Es un BFS (Breadth-First Search, búsqueda en anchura):
   *   - Usa una COLA FIFO (`shift()` saca el primero que entró).
   *   - Visita primero los vecinos directos, luego los vecinos de
   *     esos vecinos, etc.
   *   - El Set 'visitados' evita procesar el mismo nodo dos veces
   *     (en un DAG sin ciclos esto en teoría no pasa, pero es buena
   *     práctica para que el algoritmo termine siempre).
   *
   * Comparación con DFS:
   *   - DFS usaría `pop()` en vez de `shift()` (stack en vez de cola).
   *   - DFS bajaría hasta el fondo de una rama antes de explorar otras.
   *   - Para "qué desbloquea esta materia" ambos llegan al mismo
   *     resultado final, pero BFS es más natural cuando uno quiere
   *     pensar en "niveles" (materias de ciclo+1, luego ciclo+2, etc.).
   */
  private materiasQueDesbloquea(
    codigoInicial: string,
    prerequisitos: Prerequisito[],
  ): string[] {
    const visitadas = new Set<string>();
    const cola: string[] = [codigoInicial];

    while (cola.length > 0) {
      // shift() saca el primer elemento de la cola: FIFO = BFS.
      const actual = cola.shift()!;

      // Buscamos las aristas que SALEN de 'actual'
      // (es decir, materias para las cuales 'actual' es prerrequisito).
      const sucesoras = prerequisitos
        .filter((p) => p.codigoPrerequisito === actual)
        .map((p) => p.codigoMateria);

      for (const codigo of sucesoras) {
        if (!visitadas.has(codigo)) {
          visitadas.add(codigo);
          cola.push(codigo);
        }
      }
    }

    return Array.from(visitadas);
  }

  // ===========================================================
  //  MANEJO DE CLIC EN UNA MATERIA
  // ===========================================================

  /**
   * Cuando el usuario hace clic en un nodo:
   *   1. Calculamos qué materias se desbloquean (BFS).
   *   2. Resaltamos visualmente esos nodos y las aristas correspondientes.
   *   3. Guardamos el resultado en variables para mostrarlo en el HTML.
   */
  private alHacerClicEnMateria(codigo: string): void {
    if (!this.cy) return;

    const materia = this.pensumService.materias().find((m) => m.codigo === codigo);
    if (!materia) return;

    this.materiaSeleccionada = materia;
    this.cadenaDesbloqueada = this.materiasQueDesbloquea(
      codigo,
      this.pensumService.prerequisitos(),
    );

    // Reseteamos resaltados previos
    this.cy.elements().removeClass('resaltada origen');

    // Marcamos el nodo origen
    this.cy.getElementById(codigo).addClass('origen');

    // Marcamos los nodos desbloqueados
    for (const codigoDesbloqueado of this.cadenaDesbloqueada) {
      this.cy.getElementById(codigoDesbloqueado).addClass('resaltada');
    }

    // Marcamos las aristas que conectan toda la cadena
    // (las que tienen como source el origen o cualquier desbloqueada).
    const codigosEnCadena = new Set([codigo, ...this.cadenaDesbloqueada]);
    this.cy.edges().forEach((arista) => {
      const source = arista.data('source');
      const target = arista.data('target');
      if (codigosEnCadena.has(source) && codigosEnCadena.has(target)) {
        arista.addClass('resaltada');
      }
    });
  }

  /**
   * Quita todo el resaltado y devuelve el grafo a su estado normal.
   */
  limpiarSeleccion(): void {
    if (!this.cy) return;
    this.cy.elements().removeClass('resaltada origen');
    this.materiaSeleccionada = null;
    this.cadenaDesbloqueada = [];
  }

  // ===========================================================
  //  ACTUALIZACIÓN DE COLORES POR ESTADO ACADÉMICO
  // ===========================================================

  /**
   * Recorre cada nodo y actualiza su atributo 'estado' (aprobada/cursando/
   * pendiente) leyendo del historial. Cytoscape usa este atributo en sus
   * selectores CSS para pintar el color correcto (verde/azul/gris).
   */
  private actualizarColoresPorHistorial(historial: HistorialEstudiante[]): void {
    if (!this.cy) return;

    // Construimos un Map para buscar O(1) en vez de O(n) en cada nodo.
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

  // ===========================================================
  //  ESTILOS DE CYTOSCAPE
  // ===========================================================

  /**
   * Devuelve el array de estilos que Cytoscape aplica al grafo.
   * Es similar a CSS pero con sintaxis propia:
   *   - selector: a qué elementos aplica (ej. 'node[estado = "aprobada"]')
   *   - style: propiedades visuales
   *
   * Usamos atributos del 'data' del nodo (estado, tamano) para variar
   * la apariencia sin tener que recrear los nodos.
   */
  private estilosCytoscape(): cytoscape.StylesheetJson {
    return [
      // Estilo base para todos los nodos
      {
        selector: 'node',
        style: {
          'background-color': '#9ca3af', // gris = pendiente por defecto
          'label': 'data(label)',
          'text-wrap': 'wrap',
          'text-max-width': '80px',
          'font-size': '9px',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': '#fff',
          'text-outline-width': 1,
          'text-outline-color': '#333',
          'width': 'data(tamano)',  // ← tamaño según out-degree
          'height': 'data(tamano)', // ← tamaño según out-degree
          'border-width': 2,
          'border-color': '#374151',
        },
      },
      // Materias aprobadas: verdes
      {
        selector: 'node[estado = "aprobada"]',
        style: {
          'background-color': '#10b981',
          'border-color': '#047857',
        },
      },
      // Materias cursando: azules
      {
        selector: 'node[estado = "cursando"]',
        style: {
          'background-color': '#3b82f6',
          'border-color': '#1e40af',
        },
      },
      // Estilo base para todas las aristas (flechas)
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#cbd5e1',
          'target-arrow-color': '#cbd5e1',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
        },
      },
      // Nodo seleccionado (al hacer clic): borde naranja grueso
      {
        selector: 'node.origen',
        style: {
          'border-color': '#f97316',
          'border-width': 5,
        },
      },
      // Nodos resaltados por el BFS: borde naranja punteado
      {
        selector: 'node.resaltada',
        style: {
          'border-color': '#f97316',
          'border-width': 4,
          'border-style': 'dashed',
        },
      },
      // Aristas resaltadas por el BFS: naranjas y gruesas
      {
        selector: 'edge.resaltada',
        style: {
          'line-color': '#f97316',
          'target-arrow-color': '#f97316',
          'width': 4,
        },
      },
    ];
  }
}