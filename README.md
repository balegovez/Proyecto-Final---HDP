# SIGMA UES

**SIGMA — Sistema Integral de Gestión y Manejo Académico**

## Descripción

SIGMA UES es una aplicación web desarrollada en Angular que permite a los estudiantes de la Universidad de El Salvador planificar y gestionar su carga académica de forma visual e interactiva. El sistema permite:

- Visualizar el pensum académico como un grafo de materias y prerrequisitos.
- Consultar qué materias son inscribibles según el avance del estudiante.
- Armar el horario semanal arrastrando grupos teóricos disponibles a una matriz interactiva, con detección automática de choques de horario.
- Confirmar las materias seleccionadas y exportar el horario final a PDF o a un archivo `.ics` compatible con Google Calendar.

El proyecto es completamente frontend: no depende de un servidor backend propio. La persistencia de datos (planificacion de horarios, perfil del estudiante, avance académico) se maneja en el navegador mediante **Dexie.js** sobre IndexedDB.

## Instalación de dependencias

```bash
npm install
```

## Cómo instalar y ejecutar el proyecto

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/balegovez/Proyecto-Final---HDP.git
   ```

2. Entrar a la carpeta del proyecto:

   ```bash
   cd Proyecto-Final---HDP
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

4. Levantar el servidor de desarrollo:

   ```bash
   ng serve
   ```

5. Abrir el navegador en:

   ```
   http://localhost:4200
   ```

> Requiere tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada) y, opcionalmente, el [Angular CLI](https://angular.dev/tools/cli) de forma global (`npm install -g @angular/cli`) si se desea usar el comando `ng` directamente.

## Integrantes

- Jefferson Antonio Vásquez González
- Bairon Leví Gómez Velásquez
- José Isaú Romero Gómez
- Fernando Josué Vides Meléndez
