import { Component, computed, inject } from '@angular/core';

import { PensumService } from '../../core/services/pensum.service';
import {CommonModule } from '@angular/common';

@Component({
  selector: 'app-pensum',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './pensum.component.html',
  styleUrl: './pensum.component.css'
})
export class PensumComponent {
  // Inyectamos el servicio para acceder a los datos del pensum y perfil
  pensumService = inject(PensumService);

  // Agrupamos las materias por ciclo automaticamente
          //computed nos sirve para crear valores derivados de otras señales
          //aqui lo utilizamos para que si agregamos una nueva materia en nustro json
          // la lista de materias cambie segun el ciclo donde esta la nueva materia agregada 
  ciclos = computed(() => {
    const materias = this.pensumService.materias();
    //Creamos un mapa (diccionario) el cual como key (clave) toma el numero de ciclo
    //y como value (valor) toma una lista la cual guardara todas las materias del ciclo 
    //utilizas any[] la cual en ts se utiliza para ignorar el tipo de dato que le da a una variable
    //y que pueda cambiar como de number a string, en este caso la utilizamos para que la lista 
    //contenga objetos de cualquier tipo, como aqui meteremos los prerrequisitos, en lugar de usar un objeto
    //solo le ponemos any, aunque es mas seguro creando un objeto porque al usar any si hay un error en tiempo de copilacion 
    //o al escribir codigo no nos dira que tipo de error tenemos
    const mapaCiclos = new Map<number, any[]>();

    //Clasificamos cada materia en su ciclo 
    materias.forEach(materia => {
      if(!mapaCiclos.has(materia.ciclo)){
        mapaCiclos.set(materia.ciclo, []);
      }
      //mapaCiclos.get(...) busca y obtiene el arreglo del ciclo correspondiente, ! le asegura a typescript que el resultado
      //de get no sera undefined. Es obligatorio ponerlo porque typexcript es muy sensible y estricto
      //y teme que hagamos un push en algo que no existe 
      mapaCiclos.get(materia.ciclo)!.push(materia);
    });
    
    //Convertimos el mapa a un array ordenado de menor a mayor 
    //// Convierte el mapa en un arreglo de parejas [ciclo, materias]
    return Array.from(mapaCiclos.entries())
      .map(([ciclo, listaMaterias]) =>({ciclo, listaMaterias})).
      sort((a, b) => a.ciclo - b.ciclo); //la resta le indica a JS que ordene de forma ascendente


  })

}
