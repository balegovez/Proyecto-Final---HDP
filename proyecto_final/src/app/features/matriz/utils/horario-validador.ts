import { FranjaHoraria } from '../../../core/services/pensum.service';
import { GrupoSeleccionable } from '../matriz.types';

// ════════════════════════════════════════════════════════════════════
// VALIDADOR DE HORARIOS — funciones puras, sin estado.
// Exclusivo de la feature matriz: recibe los datos que necesita como
// parámetros, nunca lee servicios ni signals directamente. Esto las
// hace testeables de forma aislada (sin TestBed, sin mocks de Angular).
// ════════════════════════════════════════════════════════════════════

/** Convierte "HH:MM" o "HH:MM:SS" en minutos desde medianoche. */
export function aMinutos(hhmm: string): number {
  const partes = hhmm.split(':').map(Number);
  return (partes[0] ?? 0) * 60 + (partes[1] ?? 0);
}

/** Formatea "HH:MM" a "HH:MM:SS" (estilo de la imagen de referencia). */
export function aHoraLarga(hhmm: string): string {
  if (hhmm.length === 5) return `${hhmm}:00`;
  return hhmm;
}

/** ¿Se solapan dos franjas? (mismo día, intervalos abiertos). */
export function franjasChocan(a: FranjaHoraria, b: FranjaHoraria): boolean {
  if (a.dia !== b.dia) return false;
  const ai = aMinutos(a.horaInicio);
  const af = aMinutos(a.horaFin);
  const bi = aMinutos(b.horaInicio);
  const bf = aMinutos(b.horaFin);
  return ai < bf && bi < af;
}

/**
 * Validación pura (sin efectos): ¿se puede inscribir este grupo?
 * Devuelve `null` si todo OK o un mensaje de error.
 *
 * @param grupo            Grupo que se quiere inscribir.
 * @param gruposInscritos  Grupos actualmente inscritos (snapshot).
 * @param esInscribible    Predicado que dice si la materia es inscribible
 *                         (prerrequisitos cumplidos). Se inyecta como
 *                         función para no acoplar este archivo a PensumService.
 */
export function validarInscripcion(
  grupo: GrupoSeleccionable,
  gruposInscritos: readonly GrupoSeleccionable[],
  esInscribible: (codigoMateria: string) => boolean
): string | null {
  if (!esInscribible(grupo.codigoMateria)) {
    return `${grupo.codigoMateria} no es inscribible (revisa prerrequisitos).`;
  }

  // Misma materia ya inscrita → cambio de grupo (UPDATE).
  // No bloquea; sus franjas se excluyen del chequeo de choque porque
  // van a ser reemplazadas por las del grupo nuevo.
  const yaInscrito = gruposInscritos.find(
    g => g.codigoMateria === grupo.codigoMateria
  );
  const codigoExcluir = yaInscrito?.codigoMateria;

  for (const f of grupo.horario) {
    for (const otro of gruposInscritos) {
      if (otro.codigoMateria === codigoExcluir) continue;
      for (const f2 of otro.horario) {
        if (franjasChocan(f, f2)) {
          return `Choque de horarios: ${grupo.codigoMateria} G${grupo.numeroGrupo} colisiona con ${otro.codigoMateria} G${otro.numeroGrupo} (${f.dia} ${f.horaInicio}-${f.horaFin}).`;
        }
      }
    }
  }
  return null;
}
