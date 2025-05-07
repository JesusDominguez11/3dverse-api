import jwt from 'jsonwebtoken';
import { pool } from '../config.js';

// Lista de tokens invalidados (para logout)
const tokenBlacklist = new Set();

/**
 * Middleware de autenticación JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    // 1. Verificar header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        type: 'AuthError',
        message: 'Formato de token inválido. Use: Bearer <token>' 
      });
    }

    // 2. Extraer token
    const token = authHeader.split(' ')[1];
    
    // 3. Verificar token en lista negra
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        type: 'AuthError',
        message: 'Sesión expirada'
      });
    }

    // 4. Verificar y decodificar token JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado');
    }

    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Verificar usuario en base de datos
    const { rows } = await pool.query(
      `SELECT id, username, email, role FROM users 
       WHERE id = $1`,
      [decoded.userId]
    );
    
    if (!rows[0]) {
      return res.status(401).json({ 
        type: 'AuthError',
        message: 'Credenciales inválidas' 
      });
    }

    // 6. Adjuntar usuario a la request
    req.user = rows[0];
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        type: 'AuthError',
        message: 'Sesión expirada' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        type: 'AuthError',
        message: 'Token inválido' 
      });
    }
    
    res.status(500).json({ 
      type: 'ServerError',
      message: 'Error en el servidor' 
    });
  }
};

/**
 * Middleware de autorización por roles
 * @param {string[ 'admin']} roles - Roles permitidos
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    // Si no se especifican roles, cualquier usuario autenticado puede acceder
    if (roles.length === 0) return next();
    
    // Verificar si el usuario tiene alguno de los roles requeridos
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        type: 'ForbiddenError',
        message: 'No tienes permisos para esta acción' 
      });
    }
    
    next();
  };
};

/**
 * Middleware para logout
 */
export const logout = (req, res) => {
  try {
    // Agregar token a la lista negra
    tokenBlacklist.add(req.token);
    
    res.json({ 
      success: true,
      message: 'Sesión cerrada exitosamente' 
    });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ 
      type: 'ServerError',
      message: 'Error al cerrar sesión' 
    });
  }
};