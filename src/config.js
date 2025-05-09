import pg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pg;

// Configuración del pool de conexiones
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Esto permite conexiones SSL sin validar el certificado (NO recomendado para producción)
    }
  });

// Opcional: Exporta otras configuraciones que necesites
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const PORT = process.env.PORT || 3000;