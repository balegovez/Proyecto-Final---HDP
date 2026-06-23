import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GrupoConfirmable } from '../../matriz.types';

/**
 * Modal que lista los grupos inscritos para que el usuario los revise
 * antes de confirmarlos. Componente de presentación pura.
 */
@Component({
  selector: 'app-confirmacion-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmacion-modal.component.html',
  styleUrl: './confirmacion-modal.component.css',
})
export class ConfirmacionModalComponent {
  /** Grupos a listar en la tabla de revisión. */
  @Input({ required: true }) grupos: GrupoConfirmable[] = [];

  /** Total de UV de los grupos listados. */
  @Input({ required: true }) uvTotales = 0;

  /** El usuario cerró el modal sin confirmar (backdrop, X, o botón Cancelar). */
  @Output() cerrar = new EventEmitter<void>();

  /** El usuario confirmó todas las materias listadas. */
  @Output() confirmarTodo = new EventEmitter<void>();
}
