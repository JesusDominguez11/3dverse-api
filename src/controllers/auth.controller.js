import bcrypt from "bcryptjs";
import { pool } from '../config.js';
import jwt from 'jsonwebtoken';

export const loginUser = async (req, res) => {

    // Verificar si está bajo rate limiting
    if (req.rateLimit.remaining <= 3) {
        console.warn(`Login con pocos intentos restantes para IP ${req.ip}`);
    }

    // Validación básica de entrada
    const { usernameOrEmail, password } = req.body;
    
    if (!usernameOrEmail || !password) {
        return res.status(400).json({
            type: 'ValidationError',
            message: 'Usuario/email y contraseña son requeridos'
        });
    }

    try {
        console.log(`Intento de login para: ${usernameOrEmail}`);

        // Buscar usuario en la base de datos
        const user = await findUserByCredentials(usernameOrEmail);
        
        // Verificar contraseña
        await verifyPassword(password, user.password);
        
        // Generar token JWT
        const token = generateAuthToken(user.id);

        logTokenDetails(token);  // función para logging
        
        // Preparar respuesta
        const response = prepareUserResponse(user, token);
        console.log(token);
        res.json(response);
        
    } catch (error) {
        handleLoginError(error, res);
    }
};

export const registerUser = async (req, res) => {
    const { username, email, password, name } = req.body;
    
    // Validación básica
    if (!username || !email || !password || !name) {
        return res.status(400).json({
            type: 'ValidationError',
            message: 'Todos los campos son requeridos'
        });
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await pool.query(
            'SELECT 1 FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                type: 'ValidationError',
                message: 'El usuario o email ya existe'
            });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Crear usuario
        const { rows } = await pool.query(
            `INSERT INTO users (username, email, password, name, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, username, email, name, role`,
            [username, email, hashedPassword, name, 'user'] // Rol por defecto: 'user'
        );

        // Generar token automáticamente después del registro
        const token = generateAuthToken(rows[0].id);
        
        res.status(201).json({
            user: rows[0],
            token
        });
        
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            type: 'ServerError',
            message: 'Error al registrar usuario'
        });
    }
};


export const logoutUser = async (req, res) => {
    try {
        // El middleware authenticate ya adjuntó el token a req.token
        if (!req.token) {
            return res.status(400).json({
                type: 'AuthError',
                message: 'No hay sesión activa'
            });
        }

        // Agregar token a la lista negra (necesitarás importar tokenBlacklist)
        tokenBlacklist.add(req.token);
        
        // Opcional: Eliminar token del cliente
        res.setHeader('Clear-Site-Data', '"cookies", "storage"');
        
        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
        
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            type: 'ServerError',
            message: 'Error al cerrar sesión'
        });
    }
};


// Buscar usuario en la base de datos
const findUserByCredentials = async (usernameOrEmail) => {
    const { rows } = await pool.query(
        `SELECT id, username, email, password, role FROM users 
         WHERE username = $1 OR email = $1`,
        [usernameOrEmail]
    );
    
    if (rows.length === 0) {
        throw { 
            statusCode: 401,
            type: 'AuthError',
            message: 'Credenciales inválidas' 
        };
    }
    
    return rows[0];
};

// Verificar contraseña
const verifyPassword = async (inputPassword, hashedPassword) => {
    const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
    if (!isMatch) {
        throw {
            statusCode: 401,
            type: 'AuthError',
            message: 'Credenciales inválidas'
        };
    }
};

// Generar token JWT
const generateAuthToken = (userId) => {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw {
          statusCode: 500,
          type: 'ConfigError',
          message: 'Configuración de seguridad inválida'
        };
      }
    
    return jwt.sign(
        { userId }, // Payload
        process.env.JWT_SECRET, // Secreto
        { 
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
            algorithm: 'HS256'
        } // Expiración
    );
};

// Preparar respuesta al usuario
const prepareUserResponse = (user, token) => {
    const { password, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        token
    };
};

// Manejo de errores
const handleLoginError = (error, res) => {
    const errorMap = {
      'JsonWebTokenError': { status: 401, type: 'AuthError' },
      'TokenExpiredError': { status: 401, type: 'AuthError' },
      'ConfigError': { status: 500, type: 'ServerError' }
    };
    
    const errorInfo = errorMap[error.name] || { 
      status: error.statusCode || 500, 
      type: error.type || 'ServerError' 
    };
    
    res.status(errorInfo.status).json({
      type: errorInfo.type,
      message: error.message || 'Error en el servidor'
    });
  };


  // Nueva función para logging detallado
const logTokenDetails = (token) => {
    const decoded = jwt.decode(token);
    console.log('Token generado:', {
      userId: decoded.userId,
      issuedAt: new Date(decoded.iat * 1000).toISOString(),
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
      duration: `${decoded.exp - decoded.iat} segundos`
    });
  };