import { FranjaHoraria } from '../../core/services/pensum.service';

// TIPOS COMPARTIDOS — Feature matriz
// Usados por el componente padre y todos sus hijos de presentación.

export const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];

/**
 * Un grupo teórico "aplanado" para mostrarlo como tarjeta independiente
 * en la barra lateral. Une la materia con uno de sus grupos.
 */
export interface GrupoSeleccionable {
  /** Clave única "CODIGO-NUMGRUPO" — sirve de identificador en CDK. */
  key: string;
  codigoMateria: string;
  nombreMateria: string;
  cicloAcademico: number;
  uv: number;
  numeroGrupo: string;
  tipo: string;
  docente: string;
  horario: readonly FranjaHoraria[];
}

/** Fila de la matriz: un rango horario único (ej. "07:00 - 08:40"). */
export interface FilaHorario {
  /** Etiqueta para mostrar (ej. "07:00:00 - 08:40:00"). */
  etiqueta: string;
  horaInicio: string;
  horaFin: string;
}

/** Lo que se renderiza dentro de una celda ocupada. */
export interface CeldaOcupada {
  codigoMateria: string;
  nombreMateria: string;
  numeroGrupo: string;
  tipo: string;
  aula: string;
  /** Texto plano concatenado: "SYP155 Teorico 1 Cómputo B". */
  contenido: string;
}

/** Detalle por grupo inscrito que se muestra en la modal de confirmación. */
export interface GrupoConfirmable {
  key: string;
  codigoMateria: string;
  nombreMateria: string;
  numeroGrupo: string;
  tipo: string;
  uv: number;
  franjas: readonly FranjaHoraria[];
}

/** Item agrupado por día, para la vista móvil en acordeón. */
export interface ItemDiaMovil {
  codigoMateria: string;
  nombreMateria: string;
  numeroGrupo: string;
  tipo: string;
  aula: string;
  horaInicio: string;
  horaFin: string;
  rangoEtq: string;
}

/** Bloque de un día con sus items, para la vista móvil. */
export interface BloqueDiaMovil {
  dia: DiaSemana;
  items: ItemDiaMovil[];
}
