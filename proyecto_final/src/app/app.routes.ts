import { Routes } from '@angular/router';
import { perfilGuard } from './core/guards/perfil.guard';

/**
 * Rutas de la aplicación.
 * - 'inicio' es la ruta por defecto (página principal del expediente).
 * - 'perfil' es la ÚNICA ruta accesible sin perfil creado.
 * - 'matriz' y 'grafo' están protegidas con perfilGuard.
 *
 * Todas usan lazy loading (`loadComponent`): el código del componente solo
 * se descarga cuando el usuario navega a esa ruta, no al iniciar la app.
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
      import('./features/inicio/inicio.component').then(
        (m) => m.InicioComponent,
      ),
  },
  {
    path: 'pensum',
    loadComponent: () =>
      import('./features/pensum/pensum.component').then(
        (m) => m.PensumComponent,
      ),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./features/perfil/perfil.component').then(
        (m) => m.PerfilComponent,
      ),
  },
  {
    // Protegida: necesita un perfil creado.
    path: 'matriz',
    canActivate: [perfilGuard],
    loadComponent: () =>
      import('./features/matriz/matriz.component').then(
        (m) => m.MatrizComponent,
      ),
  },
  {
    // Protegida: necesita un perfil creado.
    path: 'grafo',
    canActivate: [perfilGuard],
    loadComponent: () =>
      import('./features/grafo/grafo.component').then(
        (m) => m.GrafoComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];