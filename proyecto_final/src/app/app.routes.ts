import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'perfil',
        pathMatch: 'full',
    },
    {
        path: 'perfil',
        loadComponent: () =>
            import('./features/perfil/perfil.component').then(
                (m) => m.PerfilComponent,
            ),
    },
    {
        path: 'matriz',
        loadComponent: () =>
            import('./features/matriz/matriz.component').then(
                (m) => m.MatrizComponent,
            ),
    },
    {
        path: 'grafo',
        loadComponent: () =>
            import('./features/grafo/grafo.component').then(
                (m) => m.GrafoComponent,
            ),
    },
    {
        path: 'planificador',
        loadComponent: () =>
            import('./features/planificador/planificador.component').then(
                (m) => m.PlanificadorComponent,
            ),
    },
    {
        path: '**',
        redirectTo: 'perfil',
    },
];