import app from './app';
import pool from './config/database'; // Al importar base.ts ejecuta el autodiagnóstico
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🟢 [SERVER]: Servidor HTTP corriendo en: http://localhost:${PORT}`);
  console.log(`==================================================`);
});