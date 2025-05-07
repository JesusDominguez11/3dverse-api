import { pool } from "../config.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

export const getUsers = async () => {
    const { rows } = await pool.query("SELECT id, username, email, name FROM users");
    return rows;
};

export const getUserById = async (id) => {
    const { rows } = await pool.query(
        "SELECT id, username, email, name FROM users WHERE id = $1",
        [id]
    );
    return rows[0];
};

export const createUser = async (userData) => {
    const { username, email, password, name } = userData;
    
    // Validaciones básicas
    if (!username || !email || !password || !name) {
        throw { 
            statusCode: 400,
            type: 'ValidationError', 
            message: 'Todos los campos son requeridos' 
        };
    }

    // Validación de complejidad de password
    if (password.length < 8) {
        throw {
            statusCode: 400,
            type: 'ValidationError',
            message: 'La contraseña debe tener al menos 8 caracteres'
        };
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const { rows } = await pool.query(
            `INSERT INTO users (username, email, password, name) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, username, email, name`,
            [username, email, hashedPassword, name]
        );
        
        return rows[0];
    } catch (error) {
        // Manejo de errores específicos de PostgreSQL
        if (error.code === '23505') { // Violación de unique constraint
            throw {
                statusCode: 409,
                type: 'DatabaseError',
                message: 'El usuario o email ya existe'
            };
        }
        
        throw {
            statusCode: 500,
            type: 'DatabaseError',
            message: 'Error al crear el usuario en la base de datos'
        };
    }
};


export const updateUser = async (id, userData) => {
    const { username, email, name } = userData;
    const { rows } = await pool.query(
        "UPDATE users SET username = $1, email = $2, name = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, username, email, name",
        [username, email, name, id]
    );
    return rows[0];
};

export const deleteUser = async (id) => {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
};

// export const findUserByUsernameOrEmail = async (usernameOrEmail) => {
//     const { rows } = await pool.query(
//       `SELECT id, username, email, password FROM users 
//        WHERE username = $1 OR email = $1`,
//       [usernameOrEmail]
//     );
//     return rows[0];
//   };
