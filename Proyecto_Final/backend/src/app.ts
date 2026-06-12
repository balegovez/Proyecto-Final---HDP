import express from 'express';
import cors from 'cors';

const app = express();

// Habilitar CORS para que Angular (puerto 4200) pueda consultar la API libremente
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// Permitir que el servidor entienda formatos JSON en las peticiones body
app.use(express.json());

// Ruta de prueba inicial para verificar que el backend responde
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor de PensumNavigator corriendo perfectamente' });
});

export default app;