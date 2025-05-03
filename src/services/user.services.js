import { pool } from "../config.js";

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

// export const createUser = async (userData) => {
//     const { username, email, password, name } = userData;
//     // En una aplicación real, aquí deberías hashear la contraseña
//     const { rows } = await pool.query(
//         "INSERT INTO users (username, email, password, name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, name",
//         [username, email, password, name]
//     );
//     return rows[0];
// };

import bcrypt from "bcrypt";

export const createUser = async (userData) => {
    const { username, email, password, name } = userData;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const { rows } = await pool.query(
        "INSERT INTO users (username, email, password, name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, name",
        [username, email, hashedPassword, name]
    );
    return rows[0];
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