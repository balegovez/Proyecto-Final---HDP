import { Routes } from '@angular/router';
import { perfilGuard } from './core/guards/perfil.guard';

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
        // Protegida: necesita un perfil creado.
        path: 'planificador',
        canActivate: [perfilGuard],
        loadComponent: () =>
            import('./features/planificador/planificador.component').then(
                (m) => m.PlanificadorComponent,
            ),
    },
    {
        path: '**',
        redirectTo: 'inicio',
    },
];