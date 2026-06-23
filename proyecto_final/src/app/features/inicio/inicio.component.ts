import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * InicioComponent
 * Las tarjetas se generan con @for a partir de un arreglo, en vez de repetir
 * el mismo bloque HTML manualmente. Esto evita duplicación 
 */
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
})
export class InicioComponent {

  readonly accesos: { titulo: string; ruta?: string }[] = [
    { titulo: 'Perfil', ruta: '/perfil' },
    { titulo: 'Pensum', ruta: '/pensum' },
    { titulo: 'Horarios', ruta: '/horarios' },
    { titulo: 'Planificar horario', ruta: '/matriz' },
    { titulo: 'Pensum Grafo', ruta: '/grafo' },
  ];
}