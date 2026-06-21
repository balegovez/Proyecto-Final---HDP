import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

interface Faq {
  pregunta: string;
  respuesta: string;
}

interface PasoGuia {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta?: string;
}

interface TerminoGlosario {
  sigla: string;
  significado: string;
}

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './ayuda.component.html',
  styleUrl: './ayuda.component.css',
})
export class AyudaComponent {

  /** Índice del FAQ abierto. -1 = todos cerrados. */
  readonly faqAbierto = signal(-1);

  readonly guia: PasoGuia[] = [
    {
      titulo: 'Crea tu perfil',
      descripcion: 'Ingresa tu carné y ciclo actual. Se arma tu historial académico inicial automáticamente.',
      icono: 'fas fa-user-plus',
      ruta: '/perfil',
    },
    {
      titulo: 'Revisa tu pensum',
      descripcion: 'Mira el plan completo de la carrera con todas las materias y sus prerrequisitos.',
      icono: 'fas fa-th',
      ruta: '/pensum',
    },
    {
      titulo: 'Mira qué puedes llevar',
      descripcion: 'La matriz te muestra qué materias tienes habilitadas según las que ya aprobaste.',
      icono: 'fas fa-table',
      ruta: '/matriz',
    },
    {
      titulo: 'Explora el grafo',
      descripcion: 'Visualiza las dependencias entre materias como un diagrama interactivo.',
      icono: 'fas fa-project-diagram',
      ruta: '/grafo',
    },
    {
      titulo: 'Inscribe grupos',
      descripcion: 'Arma tu horario del ciclo seleccionando grupos y horarios disponibles.',
      icono: 'fas fa-calendar-check',
      ruta: '/horarios',
    },
  ];

  readonly faqs: Faq[] = [
    {
      pregunta: '¿Para qué sirve esta aplicación?',
      respuesta: 'Es un asistente personal para estudiantes de Ingeniería de Sistemas Informáticos (Plan 1998) de la Facultad de Ingeniería y Arquitectura de la UES. Te ayuda a llevar control de tu pensum, ver qué materias puedes inscribir, planificar tu horario y visualizar dependencias entre materias.',
    },
    {
      pregunta: '¿Mis datos se guardan en algún servidor?',
      respuesta: 'No. Toda tu información (perfil, historial académico, inscripciones) se guarda únicamente en el navegador. Si borras los datos del navegador o entras desde otro dispositivo, vas a tener que crear tu perfil de nuevo.',
    },
    {
      pregunta: '¿Funciona sin conexión a internet?',
      respuesta: 'Sí, una vez que la app está cargada funciona localmente. Solo necesitas internet la primera vez para descargarla.',
    },
    {
      pregunta: '¿Cómo borro mi perfil?',
      respuesta: 'Desde el menú desplegable (esquina superior derecha) y elige "Cerrar sesión". Se te pedirá confirmación antes de eliminar tu perfil, historial e inscripciones.',
    },
    {
      pregunta: '¿Qué significan los colores en la matriz y el pensum?',
      respuesta: 'Verde: materia ya aprobada. Amarillo: materia que estás cursando. Blanco/gris: materia pendiente. Cuando pasas el mouse sobre una materia, en rojo se marcan sus prerrequisitos y en verde las materias que se desbloquean al aprobarla.',
    },
    {
      pregunta: '¿Cómo cambio mi ciclo actual?',
      respuesta: 'Ingresa a la sección "Perfil" desde el sidebar o el menú desplegable. Ahí puedes editar el ciclo en el que te encuentras. Tu historial se ajusta automáticamente.',
    },
    {
      pregunta: '¿Qué pasa si me equivoco al inscribir una materia?',
      respuesta: 'En la pantalla de Horarios puedes eliminar cualquier inscripción haciendo clic en el botón correspondiente. Los cambios se reflejan al instante.',
    },
    {
      pregunta: '¿Puedo cursar materias electivas?',
      respuesta: 'Sí. Las electivas aparecen marcadas con un badge especial y bordes punteados. Aplican las mismas reglas de prerrequisitos que las materias obligatorias.',
    },
    {
      pregunta: 'El grafo no me carga, ¿qué hago?',
      respuesta: 'Asegurate de tener un perfil creado y al menos una materia en tu historial. Si el problema persiste, recarga la página que se actualice la información.',
    },
  ];

  readonly glosario: TerminoGlosario[] = [
    { sigla: 'UV',     significado: 'Unidades Valorativas. Equivalente a créditos académicos.' },
    { sigla: 'Plan 1998', significado: 'Plan de estudios vigente para Ingeniería de Sistemas Informáticos en la UES.' },
    { sigla: 'FIA',    significado: 'Facultad de Ingeniería y Arquitectura de la Universidad de El Salvador.' },
    { sigla: 'Pensum', significado: 'Conjunto completo de materias que componen la carrera, organizadas por ciclo.' },
    { sigla: 'Prerrequisito', significado: 'Materia que debés aprobar antes de poder inscribir otra materia que depende de ella.' },
    { sigla: 'Ciclo',  significado: 'Período académico equivalente a un semestre. La carrera tiene 10 ciclos.' },
    { sigla: 'Electiva', significado: 'Materia opcional que el estudiante elige según su área de interés.' },
  ];

  toggleFaq(indice: number): void {
    this.faqAbierto.update(actual => (actual === indice ? -1 : indice));
  }
}