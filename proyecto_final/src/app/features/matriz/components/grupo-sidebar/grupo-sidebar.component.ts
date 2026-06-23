import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { GrupoSeleccionable } from '../../matriz.types';

/**
 * Tira horizontal de grupos teóricos disponibles para inscribir.
 * Componente de presentación pura: no conoce PensumService ni hace
 * validación — solo muestra datos y emite la intención del usuario.
 */
@Component({
  selector: 'app-grupo-sidebar',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './grupo-sidebar.component.html',
  styleUrl: './grupo-sidebar.component.css',
})
export class GrupoSidebarComponent {
  /** Grupos disponibles a mostrar en la tira. */
  @Input({ required: true }) grupos: GrupoSeleccionable[] = [];

  /** Id del cdkDropList de esta lista (debe coincidir con el connectedTo de la matriz). */
  @Input({ required: true }) dropListId!: string;

  /** Id del cdkDropList de la matriz, para conectar el drag entre ambas listas. */
  @Input({ required: true }) dropListIdMatriz!: string;

  /** Si estamos en viewport móvil: cambia drag por tap-tap. */
  @Input() esMovil = false;

  /** Key del grupo actualmente "tomado" en modo táctil (o null). */
  @Input() grupoTomado: string | null = null;

  /** El usuario quiere inscribir este grupo (vía botón, en móvil). */
  @Output() inscribir = new EventEmitter<GrupoSeleccionable>();

  /** El usuario "tomó" o "soltó" un grupo en modo táctil. */
  @Output() tomar = new EventEmitter<GrupoSeleccionable>();

  /** Para iconografía / clases CSS según materia. Hash determinístico → tonos HSL. */
  obtenerColorPorMateria(codigo: string): string {
    let h = 0;
    for (let i = 0; i < codigo.length; i++) {
      h = (h * 31 + codigo.charCodeAt(i)) >>> 0;
    }
    const tono = h % 360;
    return `hsl(${tono} 55% 42%)`;
  }
}
