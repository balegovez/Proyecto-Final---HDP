import cytoscape from 'cytoscape';

/**
 * Devuelve la hoja de estilos que Cytoscape aplica al grafo.
 *
 * Es una función pura: no lee signals ni servicios, solo retorna
 * la configuración estática de apariencia.
 *
 * Selectores clave:
 *  - `node[estado = "aprobada"]`  → verde
 *  - `node[estado = "cursando"]`  → azul
 *  - `node`                       → gris (pendiente por defecto)
 *  - `node.origen`                → borde naranja grueso (nodo clicado)
 *  - `node.resaltada`             → borde naranja punteado (BFS)
 *  - `edge.resaltada`             → arista naranja y gruesa (BFS)
 */
export function estilosCytoscape(): cytoscape.StylesheetJson {
  return [
    {
      selector: 'node',
      style: {
        'background-color': '#9ca3af',
        'label': 'data(label)',
        'text-wrap': 'wrap',
        'text-max-width': '80px',
        'font-size': '9px',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#fff',
        'text-outline-width': 1,
        'text-outline-color': '#333',
        'width': 'data(tamano)',
        'height': 'data(tamano)',
        'border-width': 2,
        'border-color': '#374151',
      },
    },
    {
      selector: 'node[estado = "aprobada"]',
      style: {
        'background-color': '#10b981',
        'border-color': '#047857',
      },
    },
    {
      selector: 'node[estado = "cursando"]',
      style: {
        'background-color': '#3b82f6',
        'border-color': '#1e40af',
      },
    },
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
    {
      selector: 'node.origen',
      style: {
        'border-color': '#f97316',
        'border-width': 5,
      },
    },
    {
      selector: 'node.resaltada',
      style: {
        'border-color': '#f97316',
        'border-width': 4,
        'border-style': 'dashed',
      },
    },
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
