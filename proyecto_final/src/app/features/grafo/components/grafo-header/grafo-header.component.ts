import { Component } from '@angular/core';

/**
 * GrafoHeaderComponent
 * --------------------
 * Barra superior del grafo: título, subtítulo y leyenda de colores/tamaños.
 *
 * Componente puramente de presentación: no recibe inputs ni emite outputs,
 * ya que su contenido es estático. Si en el futuro la leyenda necesitara
 * reflejar el estado del pensum, se añadirían @Input() aquí.
 */
@Component({
  selector: 'app-grafo-header',
  standalone: true,
  templateUrl: './grafo-header.component.html',
  styleUrl: './grafo-header.component.css',
})
export class GrafoHeaderComponent {}
