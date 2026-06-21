import { Injectable, computed, signal } from '@angular/core';
import {
  db,
  Materia,
  Prerequisito,
  Perfil,
  HistorialEstudiante,
  Inscripcion,
} from '../db/dexie-db';
import {
  ESCENARIO_NUEVO_INGRESO,
  ESCENARIO_SEGUNDO_ANIO,
  ESCENARIO_FLUJO_CRITICO,
} from '../data/escenarios-demo';

/** Forma del archivo assets/data/pensum-seed.json. */
interface PensumSeed {
  materias: Materia[];
  prerequisitos: Prerequisito[];
}

// ── Tipos del archivo horarios.json ──────────────────────────────
export interface FranjaHoraria {
  dia: string;
  horaInicio: string;
  horaFin: string;
  aula: string;
}

export interface GrupoMateria {
  numeroGrupo: string;
  tipo: string;
  docente: string;
  cuposTotal: number;
  horario: FranjaHoraria[];
}

export interface MateriaConHorarios {
  codigoMateria: string;
  nombreMateria: string;
  cicloAcademico: number;
  grupos: GrupoMateria[];
}

interface HorariosSeed {
  ciclo: string;
  materias: MateriaConHorarios[];
}

/**
 * Solo manejamos UN perfil local por navegador, así que usamos siempre el
 * mismo ID fijo para esa única fila de la tabla 'perfil'.
 */
const PERFIL_ID = 1;

@Injectable({ providedIn: 'root' })
export class PensumService {

  // ════════════════════════════════════════════════════════════
  // ESTADO REACTIVO (Signals)
  // ════════════════════════════════════════════════════════════
  materias = signal<Materia[]>([]);
  prerequisitos = signal<Prerequisito[]>([]);
  perfil = signal<Perfil | null>(null);
  historial = signal<HistorialEstudiante[]>([]);
  inscripciones = signal<Inscripcion[]>([]);          // ← NUEVO
  horarios = signal<MateriaConHorarios[]>([]);        // ← NUEVO (del JSON)

  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  /** Se resuelve cuando termina la carga inicial desde IndexedDB. */
  readonly listo: Promise<void>;

  constructor() {
    this.listo = this.inicializar();
  }

  // ════════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ════════════════════════════════════════════════════════════

  private async inicializar(): Promise<void> {
    try {
      await this.sembrarPensumSiEstaVacio();
      await this.cargarHorarios();
      await this.recargarTodoDesdeDB();
    } catch (err) {
      console.error('Error inicializando PensumService:', err);
      this.error.set('No se pudo cargar la información del pensum.');
    } finally {
      this.cargando.set(false);
    }
  }

  private async sembrarPensumSiEstaVacio(): Promise<void> {
    const totalMaterias = await db.materias.count();
    if (totalMaterias > 0) return;

    const respuesta = await fetch('/assets/data/pensum-seed.json');
    if (!respuesta.ok) {
      throw new Error(`No se pudo leer pensum-seed.json (HTTP ${respuesta.status})`);
    }

    const seed: PensumSeed = await respuesta.json();
    await db.materias.bulkAdd(seed.materias);
    await db.prerequisitos.bulkAdd(seed.prerequisitos);
  }

  /**
   * Carga horarios.json (catálogo de grupos). NO se guarda en IndexedDB
   * porque es data estática de solo lectura (la oferta de la universidad);
   * solo las INSCRIPCIONES del estudiante se persisten.
   */
  private async cargarHorarios(): Promise<void> {
    try {
      const respuesta = await fetch('/assets/data/horarios.json');
      if (!respuesta.ok) {
        console.warn(`No se pudo leer horarios.json (HTTP ${respuesta.status})`);
        return;
      }
      const seed: HorariosSeed = await respuesta.json();
      this.horarios.set(seed.materias ?? []);
    } catch (err) {
      console.warn('No se pudo cargar horarios.json:', err);
      this.horarios.set([]);
    }
  }

  private async recargarTodoDesdeDB(): Promise<void> {
    const [materias, prerequisitos, perfil, historial, inscripciones] =
      await Promise.all([
        db.materias.toArray(),
        db.prerequisitos.toArray(),
        db.perfil.get(PERFIL_ID),
        db.historial.toArray(),
        db.inscripciones.toArray(),
      ]);

    this.materias.set(materias);
    this.prerequisitos.set(prerequisitos);
    this.perfil.set(perfil ?? null);
    this.historial.set(historial);
    this.inscripciones.set(inscripciones);
  }

  // ════════════════════════════════════════════════════════════
  // CRUD: PERFIL  (ahora con cicloActual y validación)
  // ════════════════════════════════════════════════════════════

  /**
   * Crea el perfil + arma el historial automáticamente según el ciclo elegido.
   *
   * Lógica de "ciclo actual":
   *   - Materias de ciclos ANTERIORES al actual → aprobadas...
   *   - ...EXCEPTO las que el estudiante marcó como reprobadas
   *   - ...y EXCEPTO las que dependen (directa o transitivamente) de una
   *     reprobada (porque no las pudo haber cursado).
   *   - Materias del ciclo actual o posteriores → pendientes.
   *
   * @param nombre        Nombre del estudiante
   * @param carnet        Carné
   * @param cicloActual   Ciclo que está por cursar (1..11)
   * @param reprobadas    Códigos de materias de ciclos anteriores que dejó
   */
  async guardarPerfil(
    nombre: string,
    carnet: string,
    cicloActual: number,
    reprobadas: string[] = []
  ): Promise<void> {
    // 1. Guardar datos del perfil
    await db.perfil.put({ id: PERFIL_ID, nombre, carnet, cicloActual });

    // 2. Construir el historial automáticamente
    const historialCalculado = this.calcularHistorialPorCiclo(cicloActual, reprobadas);

    // 3. Reemplazar el historial en la base
    await db.historial.clear();
    if (historialCalculado.length > 0) {
      await db.historial.bulkPut(historialCalculado);
    }

    await this.recargarTodoDesdeDB();
  }

  /**
   * Calcula qué materias quedan aprobadas y cuáles pendientes según el ciclo
   * actual y la lista de reprobadas.
   *
   * Algoritmo:
   *   1. "Bloqueadas" = todas las reprobadas + todo lo que depende de ellas
   *      (se calcula con un recorrido hacia adelante por el grafo de prereqs).
   *   2. Para cada materia:
   *        - ciclo < cicloActual Y no está bloqueada → 'aprobada'
   *        - en cualquier otro caso → se omite (queda 'pendiente' por defecto)
   *
   * Solo devolvemos las 'aprobada' (las pendientes son el estado por defecto
   * de estadoDe(), así no llenamos la base con filas innecesarias).
   */
  private calcularHistorialPorCiclo(
    cicloActual: number,
    reprobadas: string[]
  ): HistorialEstudiante[] {
    const materias = this.materias();
    const prerequisitos = this.prerequisitos();

    // 1. Conjunto de materias bloqueadas (reprobadas + sus dependientes)
    const bloqueadas = this.calcularDependientes(reprobadas, prerequisitos);
    for (const r of reprobadas) bloqueadas.add(r);

    // 2. Aprobar las de ciclos anteriores que NO estén bloqueadas
    const aprobadas: HistorialEstudiante[] = [];
    for (const m of materias) {
      if (m.ciclo < cicloActual && !bloqueadas.has(m.codigo)) {
        aprobadas.push({ codigoMateria: m.codigo, estado: 'aprobada' });
      }
    }
    return aprobadas;
  }

  /**
   * Dado un conjunto de materias "raíz", devuelve TODAS las materias que
   * dependen de ellas (directa o transitivamente), usando un BFS hacia
   * adelante sobre el grafo de prerrequisitos.
   *
   * Ej: si MAT255 está reprobada y MAT355 depende de MAT255, y MAT455 depende
   * de MAT355, entonces {MAT355, MAT455} son dependientes de MAT255.
   */
  private calcularDependientes(
    raices: string[],
    prerequisitos: Prerequisito[]
  ): Set<string> {
    const dependientes = new Set<string>();
    const cola = [...raices];

    while (cola.length > 0) {
      const actual = cola.shift()!;

      // Materias que tienen 'actual' como prerrequisito
      const hijos = prerequisitos
        .filter(p => p.codigoPrerequisito === actual)
        .map(p => p.codigoMateria);

      for (const hijo of hijos) {
        if (!dependientes.has(hijo)) {
          dependientes.add(hijo);
          cola.push(hijo);
        }
      }
    }

    return dependientes;
  }

  /** Borra el perfil, su historial y sus inscripciones. */
  async borrarPerfil(): Promise<void> {
    await db.perfil.delete(PERFIL_ID);
    await db.historial.clear();
    await db.inscripciones.clear();
    await this.recargarTodoDesdeDB();
  }

  // ════════════════════════════════════════════════════════════
  // CRUD: HISTORIAL ACADÉMICO
  // ════════════════════════════════════════════════════════════

  async actualizarEstadoMateria(
    codigoMateria: string,
    estado: HistorialEstudiante['estado']
  ): Promise<void> {
    await db.historial.put({ codigoMateria, estado });
    await this.recargarTodoDesdeDB();
  }

  /** Lectura síncrona del estado de una materia (desde la signal en memoria). */
  estadoDe(codigoMateria: string): HistorialEstudiante['estado'] {
    const registro = this.historial().find(h => h.codigoMateria === codigoMateria);
    return registro?.estado ?? 'pendiente';
  }

  // ════════════════════════════════════════════════════════════
  // CRUD: INSCRIPCIONES A GRUPOS  (módulo de Horarios)
  // ════════════════════════════════════════════════════════════

  /**
   * CREATE / UPDATE — Inscribe al estudiante a un grupo.
   *
   * Como la PK de la tabla es codigoMateria, si ya existía una inscripción
   * para esa materia, este put() la sobreescribe. Es decir:
   *   - Si no estaba inscrito → CREATE (se inscribe al grupo)
   *   - Si ya estaba en otro grupo → UPDATE (se cambia de grupo)
   */
  async inscribirAGrupo(codigoMateria: string, numeroGrupo: string): Promise<void> {
    const inscripcion: Inscripcion = {
      codigoMateria,
      numeroGrupo,
      fechaInscripcion: new Date().toISOString(),
    };
    await db.inscripciones.put(inscripcion);
    await this.recargarTodoDesdeDB();
  }

  /**
   * DELETE — Da de baja al estudiante de un grupo (se sale de la materia).
   */
  async desinscribirDeGrupo(codigoMateria: string): Promise<void> {
    await db.inscripciones.delete(codigoMateria);
    await this.recargarTodoDesdeDB();
  }

  /**
   * READ — ¿En qué grupo está inscrito el estudiante para esta materia?
   * Devuelve la inscripción o null. Lectura síncrona desde la signal.
   */
  inscripcionDe(codigoMateria: string): Inscripcion | null {
    return this.inscripciones().find(i => i.codigoMateria === codigoMateria) ?? null;
  }

  // ════════════════════════════════════════════════════════════
  // COMPUTED: MATERIAS INSCRIBIBLES (filtrado por ciclo + prereqs)
  // ════════════════════════════════════════════════════════════

  /**
   * Materias que el estudiante PUEDE inscribir ahora mismo.
   *
   * Una materia es inscribible si:
   *   1. NO está aprobada (ni cursando).
   *   2. TODOS sus prerrequisitos están aprobados.
   *
   * Esto cubre automáticamente el requisito pedido: si va en ciclo 4 pero dejó
   * Matemática II (MAT255), entonces MAT255 aparece (prereq MAT155 aprobado)
   * pero MAT455 NO aparece (su cadena de prereqs incluye MAT255, que no está
   * aprobada). Y las materias del ciclo 4 cuyos prereqs sí cumple, aparecen.
   */
  materiasInscribibles = computed(() => {
    return this.materias().filter(m => this.esInscribible(m.codigo));
  });

  /**
   * ¿La materia es inscribible? (versión método para usar en templates).
   */
  esInscribible(codigoMateria: string): boolean {
    // Ya aprobada o cursando → no se vuelve a inscribir
    const estado = this.estadoDe(codigoMateria);
    if (estado === 'aprobada' || estado === 'cursando') return false;

    // Todos los prerrequisitos deben estar aprobados
    const prereqs = this.prerequisitos().filter(p => p.codigoMateria === codigoMateria);
    if (prereqs.length === 0) return true;

    return prereqs.every(p => this.estadoDe(p.codigoPrerequisito) === 'aprobada');
  }

  // ════════════════════════════════════════════════════════════
  // ESCENARIOS DE DEMOSTRACIÓN
  // ════════════════════════════════════════════════════════════
  readonly escenariosDemo = {
    nuevoIngreso: ESCENARIO_NUEVO_INGRESO,
    segundoAnio: ESCENARIO_SEGUNDO_ANIO,
    flujoCritico: ESCENARIO_FLUJO_CRITICO,
  };

  async cargarEscenario(escenario: HistorialEstudiante[]): Promise<void> {
    await db.historial.clear();
    if (escenario.length > 0) {
      await db.historial.bulkPut(escenario);
    }
    await this.recargarTodoDesdeDB();
  }
}