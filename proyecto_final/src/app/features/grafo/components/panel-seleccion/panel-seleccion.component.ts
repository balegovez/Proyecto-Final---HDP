import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeleccionGrafo } from '../../grafo.types';
import { describirMateria } from '../../utils/grafo-dominio';
import { Materia } from '../../../../core/db/dexie-db';

/**
 * PanelSeleccionComponent
 * -----------------------
 * Panel lateral flotante que aparece cuando el usuario hace clic en un
 * nodo del grafo. Muestra:
 *   - Nombre, tipo, código, ciclo y UV de la materia seleccionada.
 *   - Lista de materias que se desbloquean al aprobarla (resultado del BFS).
 *   - Botón para cerrar el panel (emite `cerrar`).
 *
 * @Input  seleccion   Materia seleccionada + cadena de desbloqueo.
 * @Input  todasMaterias  Lista completa para resolver descripción de códigos.
 * @Output cerrar      El usuario hizo clic en × o en el fondo del grafo.
 */
@Component({
  selector: 'app-panel-seleccion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-seleccion.component.html',
  styleUrl: './panel-seleccion.component.css',
})
export class PanelSeleccionComponent {
  @Input({ required: true }) seleccion!: SeleccionGrafo;
  @Input({ required: true }) todasMaterias!: Materia[];

  @Output() cerrar = new EventEmitter<void>();

  /** Delega en la utilidad pura para obtener la descripción del código. */
  describirMateria(codigo: string): string {
    return describirMateria(codigo, this.todasMaterias);
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}
