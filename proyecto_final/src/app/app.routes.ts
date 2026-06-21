import { Routes } from '@angular/router';
import { perfilGuard } from './core/guards/perfil.guard';

/**
 * Rutas de la aplicación.
 * - 'inicio' es la ruta por defecto.
 * - 'perfil' es la única accesible sin perfil creado.
 * - 'matriz', 'grafo' y 'horarios' están protegidas con perfilGuard.
 *
 * Todas usan lazy loading: el código del componente solo se descarga al
 * navegar a esa ruta.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./features/inicio/inicio.component').then(m => m.InicioComponent),
  },
  {
    path: 'pensum',
    loadComponent: () =>
      import('./features/pensum/pensum.component').then(m => m.PensumComponent),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./features/perfil/perfil.component').then(m => m.PerfilComponent),
  },
  {
    path: 'matriz',
    canActivate: [perfilGuard],
    loadComponent: () =>
      import('./features/matriz/matriz.component').then(m => m.MatrizComponent),
  },
  {
    path: 'grafo',
    canActivate: [perfilGuard],
    loadComponent: () =>
      import('./features/grafo/grafo.component').then(m => m.GrafoComponent),
  },
  {
    // NUEVO: módulo de inscripción a grupos (CRUD sobre IndexedDB).
    path: 'horarios',
    canActivate: [perfilGuard],
    loadComponent: () =>
      import('./features/horarios/horarios.component').then(m => m.HorariosComponent),
  },
  {
    path: 'ayuda',
    loadComponent: () =>
      import('./features/ayuda/ayuda.component').then(m => m.AyudaComponent),
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];