import express from "express";
import { PORT } from "./config.js";
import { config } from "dotenv";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
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

config()

const app = express()
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

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

app.listen(PORT)
console.log('Server on port', PORT)