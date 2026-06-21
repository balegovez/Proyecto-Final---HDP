import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PensumService } from '../services/pensum.service';

/**
 * perfilGuard
 * -----------
 * Protege las rutas que NO tienen sentido sin un perfil creado:
 * /matriz, /grafo y /horarios. Si no hay perfil, redirige a /perfil.
 *
 * ¿Por qué es async y espera 'pensumService.listo'?
 * La carga desde IndexedDB es asíncrona. Si el usuario recarga la página
 * directamente en /matriz, el guard se ejecuta ANTES de que termine esa
 * carga; en ese instante perfil() todavía sería null (aunque sí exista en
 * la base) y redirigiría por error. Esperando 'listo' decidimos solo cuando
 * la data real ya está en memoria.
 */
export const perfilGuard: CanActivateFn = async () => {
  const pensumService = inject(PensumService);
  const router = inject(Router);

  // Esperar a que la carga inicial desde IndexedDB termine.
  await pensumService.listo;

  // ¿Hay perfil? Deja pasar.
  if (pensumService.perfil() !== null) {
    return true;
  }

  // No hay perfil: redirige a /perfil.
  // createUrlTree es la forma recomendada de redirigir desde un guard
  // (devuelve la redirección en vez de hacer router.navigate + return false).
  return router.createUrlTree(['/perfil']);
};