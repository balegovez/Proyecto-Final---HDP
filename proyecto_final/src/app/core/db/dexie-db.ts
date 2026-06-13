import Dexie, { Table } from 'dexie';

// 1. LOS DATOS DE LAS MATERIAS Y PREREQUISITOS
export interface Materia {
    codigo: string;
    nombre: string;
    uv: number;
    tipo: string;
    ciclo: number;
}

// Para los prerequisitos, guardamos el código de la materia y el código del prerequisito, y un ID autoincremental para facilitar las consultas. Esto nos permite tener múltiples prerequisitos para una misma materia sin complicaciones.
export interface Prerequisito {
    id?: number;
    codigoMateria: string;
    codigoPrerequisito: string;
}

// 2. LOS DATOS DEL USUARIO LOCAL
export interface Perfil {
    id?: number;
    nombre: string;
    carnet: string;
}

// 3. EL HISTORIAL ACADÉMICO DEL ESTUDIANTE
export interface HistorialEstudiante {
    codigoMateria: string;
    estado: 'aprobada' | 'cursando' | 'pendiente';
}

export class PensumNavigatorDB extends Dexie {
    materias!: Table<Materia, string>;
    prerequisitos!: Table<Prerequisito, number>;
    perfil!: Table<Perfil, number>;
    historial!: Table<HistorialEstudiante, string>;

    constructor() {
        super('PensumNavigatorDB');
        this.version(3).stores({
            // Subimos a versión 3 por los cambios en 'Materia'
            materias: 'codigo, ciclo',
            prerequisitos: '++id, codigoMateria',
            perfil: '++id',
            historial: 'codigoMateria, estado',
        });
    }
}

// Exportamos una instancia de la base de datos para que pueda ser utilizada en toda la aplicación.
export const db = new PensumNavigatorDB();
