import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import {
  BloqueDiaMovil,
  CeldaOcupada,
  DIAS_SEMANA,
  FilaHorario,
  GrupoSeleccionable,
} from '../../matriz.types';

/**
 * Tabla de la matriz semanal (vista desktop) + acordeón por día (vista
 * móvil). Componente de presentación pura: recibe filas y celdas ya
 * calculadas, no conoce PensumService ni hace ningún cómputo de dominio.
 */
@Component({
  selector: 'app-tabla-horario',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './tabla-horario.component.html',
  styleUrl: './tabla-horario.component.css',
})
export class TablaHorarioComponent {
  readonly DIAS = DIAS_SEMANA;

  /** Filas (rangos horarios) a renderizar en la matriz desktop. */
  @Input({ required: true }) filasHorario: FilaHorario[] = [];

  /** Bloques agrupados por día, para la vista móvil. */
  @Input({ required: true }) vistaPorDia: BloqueDiaMovil[] = [];

  /** Id de este cdkDropList (debe coincidir con el connectedTo del sidebar). */
  @Input({ required: true }) dropListId!: string;

  /** Id del cdkDropList del sidebar, para conectar el drag entre ambas listas. */
  @Input({ required: true }) dropListIdSidebar!: string;

  /** Key del grupo "tomado" en modo táctil (controla el botón "Inscribir aquí"). */
  @Input() grupoTomado: string | null = null;

  /** Función que, dada una fila y un día, devuelve la celda ocupada (o undefined). */
  @Input({ required: true }) celdaEn!: (fila: FilaHorario, dia: string) => CeldaOcupada | undefined;

  /** Función de color determinístico por código de materia (delegada del padre para mantener un único hash). */
  @Input({ required: true }) colorPorMateria!: (codigo: string) => string;

  /** Un grupo fue soltado sobre la matriz (drag & drop, desktop). */
  @Output() soltar = new EventEmitter<CdkDragDrop<any>>();

  /** El usuario pidió eliminar una materia ya inscrita. */
  @Output() eliminar = new EventEmitter<string>();

  /** El usuario confirmó la inscripción del grupo "tomado" (modo táctil). */
  @Output() confirmarTomado = new EventEmitter<void>();

  /** Referencia al área imprimible — se mantiene por si se usa impresión nativa (Ctrl+P). */
  @ViewChild('areaImpresion', { static: false })
  areaImpresion?: ElementRef<HTMLElement>;

  alSoltar(event: CdkDragDrop<any>): void {
    this.soltar.emit(event);
  }
}
