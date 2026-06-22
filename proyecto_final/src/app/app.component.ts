import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PensumService } from './core/services/pensum.service';

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

  private readonly pensumService = inject(PensumService);
  private readonly router = inject(Router);

  /**
   * Items de navegación. Se usan tanto en el sidebar (escritorio) como en
   * la barra inferior (móvil), iterando con @for.
   */
  readonly navItems = [
    { icono: 'fas fa-user',            etiqueta: 'Perfil',   ruta: '/perfil'   },
    { icono: 'fas fa-home',            etiqueta: 'Inicio',   ruta: '/inicio'   },
    { icono: 'fas fa-th',              etiqueta: 'Pensum',   ruta: '/pensum'   },
    { icono: 'fas fa-table',           etiqueta: 'Planificar Horario',   ruta: '/matriz'   },
    { icono: 'fas fa-project-diagram', etiqueta: 'Pensum Grafo',    ruta: '/grafo'    },
    { icono: 'fas fa-calendar-check',  etiqueta: 'Horarios', ruta: '/horarios' },
  ];

  readonly menuAbierto = signal(false);

  /** Perfil del estudiante. null = todavía no se ha creado uno. */
  readonly perfil = this.pensumService.perfil;

  toggleMenu(evento: MouseEvent): void {
    evento.stopPropagation();
    this.menuAbierto.update(v => !v);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  async cerrarSesion(): Promise<void> {
    this.cerrarMenu();

    const confirmar = confirm(
      'Esto borrará tu perfil, historial y horarios guardados en este navegador. ¿Continuar?'
    );
    if (!confirmar) return;

    await this.pensumService.borrarPerfil();
    await this.router.navigate(['/perfil']);
  }

  @HostListener('document:click')
  onClickFuera(): void {
    if (this.menuAbierto()) this.cerrarMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cerrarMenu();
  }
}