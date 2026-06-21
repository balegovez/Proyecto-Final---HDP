import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

/**
 * AppComponent
 * -----------
 * Layout principal de la aplicación.
 *
 * En ESCRITORIO: sidebar vertical a la izquierda.
 * En MÓVIL: el sidebar se oculta y aparece una barra de navegación inferior
 * (bottom navigation), patrón estándar de apps móviles. Así los íconos de
 * navegación siguen accesibles en pantallas pequeñas.
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
   * Items de navegación. Se usan tanto en el sidebar (escritorio) como en
   * la barra inferior (móvil), iterando con @for.
   */
  readonly navItems = [
    { icono: 'fas fa-user',            etiqueta: 'Perfil',   ruta: '/perfil'   },
    { icono: 'fas fa-home',            etiqueta: 'Inicio',   ruta: '/inicio'   },
    { icono: 'fas fa-th',              etiqueta: 'Pensum',   ruta: '/pensum'   },
    { icono: 'fas fa-table',           etiqueta: 'Matriz',   ruta: '/matriz'   },
    { icono: 'fas fa-project-diagram', etiqueta: 'Grafo',    ruta: '/grafo'    },
    { icono: 'fas fa-calendar-check',  etiqueta: 'Horarios', ruta: '/horarios' },
  ];
}