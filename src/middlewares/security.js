import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

// Configuración de seguridad básica
export const securityHeaders = helmet();

// Limitador de peticiones para evitar ataques de fuerza bruta
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: 'RateLimitError',
    message: 'Demasiadas peticiones desde esta IP'
  }
});

// Limiter específico para autenticación (más restrictivo)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Solo 20 intentos de login por IP
  standardHeaders: true,
  skipSuccessfulRequests: true, // No contar peticiones exitosas
  handler: (req, res) => {
    res.status(429).json({
      type: 'RateLimitError',
      message: isProduction
        ? 'Demasiados intentos de login. Intenta nuevamente más tarde'
        :'Límite de desarrollo excedido'
    });
  }
});

// Middleware para prevenir MIME type sniffing
export const noSniff = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};

// Middleware para evitar clickjacking
export const frameguard = (req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
};