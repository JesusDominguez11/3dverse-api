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
  try {
      const { usernameOrEmail, password } = req.body;
      
      // Autenticar usuario
      const user = await userService.authenticateUser(usernameOrEmail, password);
      
      // Generar token
      const token = userService.generateAuthToken(user.id);
      
      res.json({
          user,
          token
      });
      
  } catch (error) {
      console.error('Login error:', error);
      
      // Manejo específico de errores
      const statusCode = error.statusCode || 500;
      const type = error.type || 'ServerError';
      const message = error.message || 'Error en el servidor';
      
      res.status(statusCode).json({ type, message });
  }
};