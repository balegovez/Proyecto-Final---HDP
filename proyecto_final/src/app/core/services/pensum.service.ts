import { Injectable, signal } from '@angular/core';
import { db, Materia, Prerequisito, Perfil, HistorialEstudiante } from '../db/dexie-db';
import {
  ESCENARIO_NUEVO_INGRESO,
  ESCENARIO_SEGUNDO_ANIO,
  ESCENARIO_FLUJO_CRITICO,
} from '../data/escenarios-demo';

/**
 * Forma exacta del archivo assets/data/pensum-seed.json.
 * Esto le dice a TypeScript qué esperar dentro del JSON, para que
 * autocomplete y valide los campos.
 */
interface PensumSeed {
  materias: Materia[];
  prerequisitos: Prerequisito[];
}

/**
 * Solo manejamos UN perfil local por navegador (no hay login de varios
 * usuarios), así que usamos siempre el mismo ID fijo para esa única fila
 * de la tabla 'perfil'.
 */
const PERFIL_ID = 1;

@Injectable({ providedIn: 'root' })
export class PensumService {

  // ---------- ESTADO REACTIVO (Signals) ----------
  // Cualquier componente que lea estas signals en su template se vuelve
  // a renderizar automáticamente cuando cambian.
  materias = signal<Materia[]>([]);
  prerequisitos = signal<Prerequisito[]>([]);
  perfil = signal<Perfil | null>(null);
  historial = signal<HistorialEstudiante[]>([]);

  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  /**
   * Promesa que se resuelve cuando termina la carga inicial desde IndexedDB.
   * El Route Guard la espera antes de decidir, para no leer perfil() cuando
   * todavía es null por estar a medio cargar (p. ej. al recargar en /matriz).
   */
  readonly listo: Promise<void>;

  constructor() {
    // No se puede hacer 'await' dentro de un constructor, así que delegamos
    // a un método async aparte y guardamos su promesa en 'listo'.
    this.listo = this.inicializar();
  }

  // ---------- INICIALIZACIÓN ----------

  private async inicializar(): Promise<void> {
    try {
      await this.sembrarPensumSiEstaVacio();
      await this.recargarTodoDesdeDB();
    } catch (err) {
      console.error('Error inicializando PensumService:', err);
      this.error.set('No se pudo cargar la información del pensum.');
    } finally {
      this.cargando.set(false);
    }
  }

  /**
   * La primera vez que se abre la app, IndexedDB está vacía.
   * Revisamos si 'materias' ya tiene datos; si no, los traemos del JSON
   * estático y los insertamos UNA SOLA VEZ. En cargas futuras, esta función
   * no hace nada porque count() > 0.
   */
  private async sembrarPensumSiEstaVacio(): Promise<void> {
    const totalMaterias = await db.materias.count();
    if (totalMaterias > 0) {
      return; // Ya se cargó antes, no volver a insertar.
    }

    // OJO: ruta absoluta (empieza con '/'). Si fuera relativa ('assets/...'),
    // se rompería al navegar a rutas como '/grafo' o '/planificador'.
    const respuesta = await fetch('/assets/data/pensum-seed.json');
    if (!respuesta.ok) {
      throw new Error(`No se pudo leer pensum-seed.json (HTTP ${respuesta.status})`);
    }

    const seed: PensumSeed = await respuesta.json();

    await db.materias.bulkAdd(seed.materias);
    await db.prerequisitos.bulkAdd(seed.prerequisitos);
  }

  /**
   * Lee TODO de Dexie y actualiza las signals.
   * Se llama al iniciar y después de cualquier escritura, para que la UI
   * siempre refleje lo que realmente hay guardado en IndexedDB.
   */
  private async recargarTodoDesdeDB(): Promise<void> {
    const [materias, prerequisitos, perfil, historial] = await Promise.all([
      db.materias.toArray(),
      db.prerequisitos.toArray(),
      db.perfil.get(PERFIL_ID),
      db.historial.toArray(),
    ]);

    this.materias.set(materias);
    this.prerequisitos.set(prerequisitos);
    this.perfil.set(perfil ?? null);
    this.historial.set(historial);
  }

  // ---------- CRUD: PERFIL ----------

  /** Crea el perfil si no existe, o lo reemplaza si ya existía (upsert). */
  async guardarPerfil(nombre: string, carnet: string): Promise<void> {
    await db.perfil.put({ id: PERFIL_ID, nombre, carnet });
    await this.recargarTodoDesdeDB();
  }

  /** Borra el perfil y su historial académico asociado. */
  async borrarPerfil(): Promise<void> {
    await db.perfil.delete(PERFIL_ID);
    await db.historial.clear();
    await this.recargarTodoDesdeDB();
  }

  // ---------- CRUD: HISTORIAL ACADÉMICO ----------

  /** Marca una materia con un estado. Si ya existía un registro, lo actualiza. */
  async actualizarEstadoMateria(
    codigoMateria: string,
    estado: HistorialEstudiante['estado']
  ): Promise<void> {
    await db.historial.put({ codigoMateria, estado });
    await this.recargarTodoDesdeDB();
  }

  /**
   * Lectura síncrona y rápida desde la signal en memoria (no toca IndexedDB).
   * Pensada para usarse en bucles de la Matriz sin disparar consultas async.
   */
  estadoDe(codigoMateria: string): HistorialEstudiante['estado'] {
    const registro = this.historial().find(h => h.codigoMateria === codigoMateria);
    return registro?.estado ?? 'pendiente';
  }

  // ---------- ESCENARIOS DE DEMOSTRACIÓN ----------
  // Datos curados para mostrar la app en distintos estados sin tener que
  // marcar materias una por una durante la defensa. Solo reemplazan
  // 'historial'; NO tocan 'materias' ni 'prerequisitos' (el catálogo del
  // pensum nunca se borra ni se vuelve a descargar).
  readonly escenariosDemo = {
    nuevoIngreso: ESCENARIO_NUEVO_INGRESO,
    segundoAnio: ESCENARIO_SEGUNDO_ANIO,
    flujoCritico: ESCENARIO_FLUJO_CRITICO,
  };

  /**
   * Reemplaza por completo el historial académico con un escenario predefinido.
   * El resto del sistema (Matriz, Grafo, Planificador) reacciona con su
   * lógica normal, como si el alumno hubiera marcado esas materias a mano.
   */
  async cargarEscenario(escenario: HistorialEstudiante[]): Promise<void> {
    await db.historial.clear();
    if (escenario.length > 0) {
      await db.historial.bulkPut(escenario);
    }
    await this.recargarTodoDesdeDB();
  }
}