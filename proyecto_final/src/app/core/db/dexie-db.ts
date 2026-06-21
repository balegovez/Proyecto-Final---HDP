import Dexie, { Table } from 'dexie';

export interface Materia {
  codigo: string;
  nombre: string;
  uv: number;
  tipo: string;
  ciclo: number;
}

export interface Prerequisito {
  id?: number;
  codigoMateria: string;
  codigoPrerequisito: string;
}


export interface Perfil {
  id?: number;
  nombre: string;
  carnet: string;
  cicloActual: number; 
}

export interface HistorialEstudiante {
  codigoMateria: string;
  estado: 'aprobada' | 'cursando' | 'pendiente';
}


/**
 * Inscripción del estudiante a UN grupo de UNA materia.
 *
 * Diseño clave: la PK es `codigoMateria`. Así, por diseño, el estudiante solo
 * puede estar en UN grupo por materia: si se inscribe a otro grupo de la misma
 * materia, el put() sobreescribe la inscripción anterior (eso es el UPDATE,
 * o sea el "cambio de grupo").
 */
export interface Inscripcion {
  codigoMateria: string;    // PK — una materia = una inscripción activa
  numeroGrupo: string;      // '01', '02', ...
  fechaInscripcion: string; // ISO date string
}


export class PensumNavigatorDB extends Dexie {
  materias!: Table<Materia, string>;
  prerequisitos!: Table<Prerequisito, number>;
  perfil!: Table<Perfil, number>;
  historial!: Table<HistorialEstudiante, string>;
  inscripciones!: Table<Inscripcion, string>; // ← NUEVA tabla

  constructor() {
    super('PensumNavigatorDB');

    // ── Versión 1 (esquema original) ──
    // Se mantiene para que un navegador que ya tenga la v1 migre a v2 sin
    // perder los datos que ya guardó.
    this.version(1).stores({
      materias: 'codigo, ciclo',
      prerequisitos: '++id, codigoMateria',
      perfil: '++id',
      historial: 'codigoMateria, estado',
    });

    // ── Versión 2 (agrega inscripciones; perfil ahora lleva cicloActual) ──
    // Dexie migra de v1 a v2 automáticamente. 'inscripciones' es tabla nueva.
    // 'cicloActual' no se indexa (no va en el string del store), solo se
    // guarda como propiedad del objeto Perfil.
    this.version(2).stores({
      materias: 'codigo, ciclo',
      prerequisitos: '++id, codigoMateria',
      perfil: '++id',
      historial: 'codigoMateria, estado',
      inscripciones: 'codigoMateria, numeroGrupo',
    });
  }
}

// Instancia única de la base de datos, usada en toda la aplicación.
export const db = new PensumNavigatorDB();