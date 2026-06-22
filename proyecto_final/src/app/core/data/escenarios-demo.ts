/**
 * Escenarios de demostración para la pantalla de Perfil ("botones de demo").
 *
 * Cada escenario se define por el ÚLTIMO ciclo que el alumno tendría aprobado.
 * El servicio (PensumService.cargarEscenarioHastaCiclo) marca como aprobadas
 * todas las materias hasta ese ciclo. NO ejecuta ningún algoritmo especial:
 * el resultado es el mismo historial que tendría un alumno real que marcó esas
 * materias a mano, por eso la Matriz y el Grafo reaccionan con su lógica
 * normal. Son seguros para la defensa: lo que se ve en pantalla es el
 * comportamiento real del sistema, no una simulación aparte.
 *
 * En este pensum cada año académico equivale a 2 ciclos (10 ciclos = 5 años):
 *   Nuevo ingreso -> nada aprobado
 *   Primer año    -> ciclos 1-2 aprobados
 *   Segundo año   -> ciclos 1-4 aprobados
 *   Tercer año    -> ciclos 1-6 aprobados
 */
export const ESCENARIOS_DEMO = {
  nuevoIngreso: 0,
  primerAnio: 2,
  segundoAnio: 4,
  tercerAnio: 6,
} as const;
  