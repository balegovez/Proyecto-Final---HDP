import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PensumService } from '../../core/services/pensum.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent {
  pensumService = inject(PensumService);

  // Datos del formulario de perfil
  nombre: string = '';
  carnet: string = '';

  // Flag para mostrar el formulario o la lista de materias
  mostrarFormulario: boolean = true;

  // Track para optimizar *ngFor
  trackByCodigoMateria = (index: number, materia: any) => materia.codigo;

  constructor() {
    // Si ya existe un perfil guardado, carga los datos
    const perfilGuardado = this.pensumService.perfil();
    if (perfilGuardado) {
      this.nombre = perfilGuardado.nombre;
      this.carnet = perfilGuardado.carnet;
      this.mostrarFormulario = false; // Salta directo a la lista de materias
    }
  }

  /**
   * Guarda el perfil en IndexedDB (o lo actualiza si ya existe).
   * Después de guardar, muestra la lista de materias.
   */
  async guardarPerfil(): Promise<void> {
    if (!this.nombre.trim() || !this.carnet.trim()) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    await this.pensumService.guardarPerfil(this.nombre, this.carnet);
    this.mostrarFormulario = false; // Esconde el formulario, muestra la lista
  }

  /**
   * Borra el perfil y vuelve al formulario para que pueda crear uno nuevo.
   */
  async borrarPerfil(): Promise<void> {
    if (confirm('¿Seguro que quieres borrar tu perfil y todo tu historial académico?')) {
      await this.pensumService.borrarPerfil();
      this.nombre = '';
      this.carnet = '';
      this.mostrarFormulario = true;
    }
  }

  /**
   * Al hacer clic en el checkbox de una materia, actualiza su estado en IndexedDB.
   * El evento `change` del checkbox pasa el valor (aprobada/pendiente).
   */
  async marcarMateria(codigoMateria: string, evento: any): Promise<void> {
    const estado = evento.target.checked ? 'aprobada' : 'pendiente';
    await this.pensumService.actualizarEstadoMateria(codigoMateria, estado);
  }

  /**
   * Carga uno de los escenarios predefinidos (para la defensa).
   * No borra el perfil, solo reemplaza el historial de materias.
   */
  async cargarEscenarioDemo(escenario: any): Promise<void> {
    if (confirm('Esto reemplazará tu historial. ¿Continuar?')) {
      await this.pensumService.cargarEscenario(escenario);
    }
  }

  /**
   * Getter: devuelve true si una materia tiene estado 'aprobada'.
   * Usado en el template para marcar/desmarcar el checkbox.
   */
  estaAprobada(codigoMateria: string): boolean {
    return this.pensumService.estadoDe(codigoMateria) === 'aprobada';
  }
}