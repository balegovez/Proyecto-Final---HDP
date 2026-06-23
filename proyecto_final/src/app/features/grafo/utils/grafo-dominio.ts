import { Prerequisito } from '../../../core/db/dexie-db';

/**
 * Cuenta, para cada materia, cuántas OTRAS materias la tienen como
 * prerrequisito (out-degree de salida en el DAG).
 *
 * Una materia con out-degree alto es un "cuello de botella":
 * no aprobarla bloquea a muchas otras.
 *
 * Ejemplo: MAT255 (Matemática II) → out-degree 5 porque la requieren
 * FIS155, FIS255, PES155, FDE155 y MAT355.
 */
export function calcularOutDegree(prerequisitos: Prerequisito[]): Map<string, number> {
  const grados = new Map<string, number>();
  for (const p of prerequisitos) {
    const previo = grados.get(p.codigoPrerequisito) ?? 0;
    grados.set(p.codigoPrerequisito, previo + 1);
  }
  return grados;
}

/**
 * Dado el código de una materia, devuelve TODOS los códigos de las
 * materias que se desbloquean al aprobarla (directa e indirectamente).
 *
 * Usa BFS (Breadth-First Search):
 *  - Cola FIFO (`shift()`) → visita vecinos directos antes que los lejanos.
 *  - El Set `visitadas` evita procesar el mismo nodo dos veces.
 *
 * @param codigoInicial  Código de la materia de partida.
 * @param prerequisitos  Lista completa de relaciones prerrequisito→materia.
 * @returns              Array de códigos de materias desbloqueadas (sin incluir el inicial).
 */
export function materiasQueDesbloquea(
  codigoInicial: string,
  prerequisitos: Prerequisito[],
): string[] {
  const visitadas = new Set<string>();
  const cola: string[] = [codigoInicial];

  while (cola.length > 0) {
    const actual = cola.shift()!;

    const sucesoras = prerequisitos
      .filter((p) => p.codigoPrerequisito === actual)
      .map((p) => p.codigoMateria);

    for (const codigo of sucesoras) {
      if (!visitadas.has(codigo)) {
        visitadas.add(codigo);
        cola.push(codigo);
      }
    }
  }

  return Array.from(visitadas);
}

/**
 * Convierte un código de materia en una cadena descriptiva para el
 * panel lateral de selección.
 *
 * Ejemplo: "MAT255 - Matemática II (Ciclo 2)"
 *
 * Si no se encuentra la materia, devuelve el código tal cual para
 * que la lista nunca quede en blanco.
 */
export function describirMateria(
  codigo: string,
  materias: { codigo: string; nombre: string; ciclo: number }[],
): string {
  const materia = materias.find((m) => m.codigo === codigo);
  if (!materia) return codigo;
  return `${materia.codigo} - ${materia.nombre} (Ciclo ${materia.ciclo})`;
}
