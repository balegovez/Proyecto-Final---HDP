import { Component, computed, inject } from '@angular/core';
import { PensumService } from '../../core/services/pensum.service';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.css',
})
export class HorariosComponent {

  pensumService = inject(PensumService);

  horariosPorCiclo = computed(() => {
    const materias = this.pensumService.horarios();
    const mapa = new Map<number, typeof materias>();

    for (const materia of materias) {
      const ciclo = materia.cicloAcademico;
      if (!mapa.has(ciclo)) {
        mapa.set(ciclo, []);
      }
      mapa.get(ciclo)!.push(materia);
    }

    return Array.from(mapa.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([ciclo, listaMaterias]) => ({ ciclo, listaMaterias }));
  });
}