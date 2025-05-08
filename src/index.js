import express from "express";
import { PORT } from "./config.js";
import { config } from "dotenv";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import pg from "pg";
import {
    securityHeaders,
    apiLimiter,
    noSniff,
    frameguard
  } from './middlewares/security.js';
  import { requestLogger, errorLogger } from './middlewares/logger.js';
  import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
  import { validateContentType, validateAcceptHeader } from './middlewares/contentValidation.js';
  import { timeoutMiddleware } from "./middlewares/timeout.js";
import cors from "cors";
import uploadRoutes from "./routes/upload.routes.js";

config()

const app = express()
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

// O permitir solo tu dominio de Angular (mejor opción)
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const uploadsDir = join(process.cwd(), 'uploads');

// Crear directorio uploads si no existe
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
  console.log(`Directorio uploads creado en: ${uploadsDir}`);
}

// Middlewares de seguridad
app.use(securityHeaders);
app.use(apiLimiter);
app.use(noSniff);
app.use(frameguard);

// Middlewares de logging
app.use(requestLogger);

// Middlewares de validación de contenido
app.use(validateContentType);
app.use(validateAcceptHeader);

// Middlewares de timeout
app.use(timeoutMiddleware(5000)); // 5 segundos

// Parseo del body
app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.use("/products", productRoutes);
app.use("/auth", authRoutes);
// Upload route 
app.use('/images', uploadRoutes);
// Basic routes
app.get('/', (req, res) => {
    res.send('API de 3Dverse');
});
app.get('/ping', async (req, res) => {
    const result = await pool.query('SELECT NOW()')
    return res.json(result.rows[0])
})

// Manejo de errores
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);
// Manejo de errores
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'Error al subir el archivo', error: err.message });
  }
  res.status(500).json({ message: err.message || 'Error interno del servidor' });
});

app.listen(PORT)
console.log('Server on port', PORT)