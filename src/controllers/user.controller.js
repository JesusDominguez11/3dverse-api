import * as userService from "../services/user.services.js";
import bcrypt from "bcryptjs";
import { pool } from '../config.js';
import jwt from 'jsonwebtoken';

export const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req, res) => {
  try {
      const newUser = await userService.createUser(req.body);
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
  } catch (error) {
      res.status(error.statusCode || 400).json({
          type: error.type || 'DatabaseError',
          message: error.message
      });
  }
};

export const updateUser = async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    // Paso 1: Validación básica de entrada
    const { usernameOrEmail, password } = req.body;
    
    if (!usernameOrEmail || !password) {
        return res.status(400).json({
            type: 'ValidationError',
            message: 'Usuario/email y contraseña son requeridos'
        });
    }

    try {
        // Paso 2: Buscar usuario en la base de datos
        const user = await findUserByCredentials(usernameOrEmail);
        
        // Paso 3: Verificar contraseña
        await verifyPassword(password, user.password);
        
        // Paso 4: Generar token JWT
        const token = generateAuthToken(user.id);
        
        // Paso 5: Preparar respuesta
        const response = prepareUserResponse(user, token);
        
        res.json(response);

        const decoded = jwt.decode(token);
        console.log('Middleware auth - Token recibido:', token);
        console.log('Usuario autenticado:', {
        id: decoded.userId,
        timestamp: new Date(decoded.iat * 1000),
        expira: new Date(decoded.exp * 1000)
        });
        
    } catch (error) {
        handleLoginError(error, res);
    }
};

















// Buscar usuario en la base de datos
const findUserByCredentials = async (usernameOrEmail) => {
    const { rows } = await pool.query(
        `SELECT id, username, email, password FROM users 
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
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET no está configurado');
    }
    
    return jwt.sign(
        { userId }, // Payload
        process.env.JWT_SECRET, // Secreto
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // Expiración
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
    console.error('Error en login:', error);
    
    const statusCode = error.statusCode || 500;
    const type = error.type || 'ServerError';
    const message = error.message || 'Error en el servidor';
    
    res.status(statusCode).json({ type, message });
};