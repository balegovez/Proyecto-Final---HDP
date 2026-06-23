import { Materia } from '../../core/db/dexie-db';

/**
 * Información de una materia seleccionada en el grafo, junto con
 * la cadena de materias que se desbloquean al aprobarla (BFS).
 */
export interface SeleccionGrafo {
  materia: Materia;
  cadenaDesbloqueada: string[];
}
