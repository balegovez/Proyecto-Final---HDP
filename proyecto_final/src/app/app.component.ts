import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

/**
 * AppComponent
 * -----------
 * Layout principal de la aplicación.
 * Contiene el sidebar de navegación, el navbar superior, el router-outlet
 * donde se cargan los módulos, y el footer.
 *
 * Cada item del sidebar tiene su 'routerLink' real y se resalta con
 * 'routerLinkActive' cuando la ruta actual coincide.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {

  /**
   * Items de navegación del sidebar.
   * Cada uno tiene:
   *  - icono: clase de Font Awesome
   *  - etiqueta: texto que se muestra
   *  - ruta: a dónde navega (o null si es solo decorativo / placeholder UES)
   */
  readonly navItems = [
    { icono: 'fas fa-user',           etiqueta: 'Perfil',      ruta: '/perfil'    },
    { icono: 'fas fa-home',           etiqueta: 'Inicio',      ruta: '/inicio'    },
    { icono: 'fas fa-th',             etiqueta: 'Pensum',      ruta: '/pensum'    },
    { icono: 'fas fa-table',          etiqueta: 'Matriz',      ruta: '/matriz'    },
    { icono: 'fas fa-project-diagram', etiqueta: 'Grafo',      ruta: '/grafo'     },
  ];
}