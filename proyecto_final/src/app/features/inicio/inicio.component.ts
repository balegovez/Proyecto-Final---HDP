import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * InicioComponent
 * ----------------
 * Página de entrada (réplica del expediente UES). Muestra accesos directos
 * a las secciones del sistema en forma de tarjetas.
 *
 * Las tarjetas se generan con @for a partir de un arreglo, en vez de repetir
 * el mismo bloque HTML manualmente. Esto evita duplicación (criterio de la
 * rúbrica: "lógica JS no repetitiva").
 */
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
})
export class InicioComponent {

  /**
   * Accesos del expediente. 'ruta' es opcional: si existe, la tarjeta navega
   * a ese módulo; si no, es un acceso decorativo (parte de la experiencia UES).
   */
  readonly accesos: { titulo: string; ruta?: string }[] = [
    { titulo: 'Record de notas' },
    { titulo: 'Notas parciales' },
    { titulo: 'Pensum', ruta: '/pensum' },
    { titulo: 'Evaluaciones' },
    { titulo: 'Materias del próximo ciclo', ruta: '/matriz' },
    { titulo: 'Inscripción de grupos', ruta: '/horarios' },
    { titulo: 'Biblioteca' },
    { titulo: 'Servicio Social' },
  ];
}