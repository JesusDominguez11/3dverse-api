import { body, param, validationResult } from 'express-validator';
import { pool } from '../config.js';

// Validaciones comunes reutilizables
const usernameValidation = body('username')
  .notEmpty().withMessage('El nombre de usuario es requerido')
  .isLength({ min: 3, max: 30 }).withMessage('El username debe tener entre 3 y 30 caracteres')
  .matches(/^[a-zA-Z0-9_]+$/).withMessage('El username solo puede contener letras, números y guiones bajos')
  .custom(async (username) => {
    const { rows } = await pool.query(
      'SELECT 1 FROM users WHERE username = $1',
      [username]
    );
    if (rows.length > 0) {
      throw new Error('El nombre de usuario ya está en uso');
    }
  });

const emailValidation = body('email')
  .notEmpty().withMessage('El email es requerido')
  .isEmail().withMessage('Debe ser un email válido')
  .normalizeEmail()
  .custom(async (email) => {
    const { rows } = await pool.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );
    if (rows.length > 0) {
      throw new Error('El email ya está registrado');
    }
  });

const passwordValidation = body('password')
  .notEmpty().withMessage('La contraseña es requerida')
  .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
  .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula')
  .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una minúscula')
  .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número');

const nameValidation = body('name')
  .notEmpty().withMessage('El nombre es requerido')
  .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
  .trim()
  .escape();

// Validaciones para cada endpoint
export const validateCreateUser = [
  usernameValidation,
  emailValidation,
  passwordValidation,
  nameValidation,
  handleValidationErrors
];

export const validateUpdateUser = [
  param('id').isInt().withMessage('ID debe ser un número entero'),
  usernameValidation.optional(),
  emailValidation.optional(),
  passwordValidation.optional(),
  nameValidation.optional(),
  handleValidationErrors
];

export const validateUserId = [
  param('id').isInt().withMessage('ID debe ser un número entero'),
  handleValidationErrors
];

export const validateLogin = [
  body('usernameOrEmail')
    .notEmpty().withMessage('Usuario o email es requerido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
  handleValidationErrors
];

// Middleware para manejar errores de validación
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      type: 'ValidationError',
      errors: errors.array() 
    });
  }
  next();
}