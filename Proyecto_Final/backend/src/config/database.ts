import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Configurar el Pool utilizando los datos seguros del .env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Opciones óptimas para desarrollo local nativo:
  max: 10,                 // Máximo de conexiones simultáneas en el pool
  idleTimeoutMillis: 30000, // Tiempo para cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // Tiempo límite para lograr conectarse
});

// Verificar de forma automática si la conexión con PostgreSQL local funciona al encender el servidor
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error crítico: No se pudo conectar a PostgreSQL nativo:', err.message);
    console.log('👉 Revisa que pgAdmin esté corriendo y que los datos del archivo .env sean correctos.');
  } else {
    console.log('🚀 ¡Conexión exitosa a PostgreSQL nativo establecida correctamente!');
  }
});

// Exportar el pool para que tus Modelos y Controladores puedan hacer consultas SQL ejecutanado: pool.query()
export default pool;