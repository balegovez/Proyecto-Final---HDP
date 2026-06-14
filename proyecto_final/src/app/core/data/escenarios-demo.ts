import { HistorialEstudiante } from '../db/dexie-db';

/**
 * Escenarios predefinidos para la pantalla de Perfil ("botones de demo").
 *
 * Cada escenario es simplemente una lista de registros de 'historial'
 * (codigoMateria + estado). Al cargarlos con PensumService.cargarEscenario(),
 * NO se ejecuta ningún algoritmo especial: se reemplaza el historial del
 * alumno y los componentes de Matriz/Grafo/Planificador reaccionan con
 * la MISMA lógica que usarían para un alumno real que marcó esas materias
 * a mano. Por eso son seguros de usar en la defensa: lo que se ve en
 * pantalla es el comportamiento real del sistema, no una simulación aparte.
 */

/**
 * Alumno de nuevo ingreso: historial vacío.
 * Toda la Matriz debería verse en gris/pendiente.
 */
export const ESCENARIO_NUEVO_INGRESO: HistorialEstudiante[] = [];

/**
 * Alumno que terminó su primer año (Ciclo 1 y Ciclo 2 completos).
 * Resultado esperado: las 5 materias de Ciclo 3 (FIS155, PES155, FDE155,
 * PRN255, MAT355) quedan DISPONIBLES, porque todos sus prerrequisitos
 * están en Ciclo 1/2.
 */
export const ESCENARIO_SEGUNDO_ANIO: HistorialEstudiante[] = [
  // --- Ciclo 1 ---
  { codigoMateria: 'PSS155', estado: 'aprobada' }, // Psicología Social
  { codigoMateria: 'ILI155', estado: 'aprobada' }, // Introducción a la Informática
  { codigoMateria: 'MEX155', estado: 'aprobada' }, // Métodos Experimentales
  { codigoMateria: 'MAT155', estado: 'aprobada' }, // Matemática I
  { codigoMateria: 'ADC155', estado: 'aprobada' }, // Análisis de Costos Informáticos
  { codigoMateria: 'AEC155', estado: 'aprobada' }, // Análisis Estadístico por Computadoras
  { codigoMateria: 'POO155', estado: 'aprobada' }, // Programación Orientada a Objetos
  { codigoMateria: 'IPI155', estado: 'aprobada' }, // Introducción a la Programación en Internet
  { codigoMateria: 'TCD155', estado: 'aprobada' }, // Tecnología de la Comunicación de Datos
  { codigoMateria: 'PDD155', estado: 'aprobada' }, // Programación 3D
  { codigoMateria: 'LPR155', estado: 'aprobada' }, // Legislación Profesional
  { codigoMateria: 'CPR155', estado: 'aprobada' }, // Consultoría Profesional

  // --- Ciclo 2 ---
  { codigoMateria: 'HSC155', estado: 'aprobada' }, // Historia Social y Económica
  { codigoMateria: 'PRN155', estado: 'aprobada' }, // Programación I
  { codigoMateria: 'MAT255', estado: 'aprobada' }, // Matemática II
  { codigoMateria: 'MSM155', estado: 'aprobada' }, // Manejo de Software para Microcomputadoras
  { codigoMateria: 'QTR155', estado: 'aprobada' }, // Química Técnica
];

/**
 * Alumno en "flujo crítico": aprobó todo Ciclo 1 y Ciclo 2 EXCEPTO
 * Matemática II (MAT255).
 *
 * MAT255 es prerrequisito de 5 materias de Ciclo 3/4 (FIS155, FIS255,
 * PES155, FDE155, MAT355). Resultado esperado en Ciclo 3:
 *   - PRN255 (Programación II) -> DISPONIBLE (solo depende de PRN155)
 *   - FIS155, PES155, FDE155, MAT355 -> BLOQUEADAS (faltan MAT255)
 *
 * Es la misma lista que ESCENARIO_SEGUNDO_ANIO, solo que sin MAT255.
 */
export const ESCENARIO_FLUJO_CRITICO: HistorialEstudiante[] =
  ESCENARIO_SEGUNDO_ANIO.filter((registro) => registro.codigoMateria !== 'MAT255');