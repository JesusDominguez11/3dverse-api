import { body, param, validationResult } from 'express-validator';

// Validaciones comunes reutilizables
const nameValidation = body('name')
  .notEmpty().withMessage('El nombre es requerido')
  .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres');

const priceValidation = body('price')
  .notEmpty().withMessage('El precio es requerido')
  .isFloat({ min: 0.01 }).withMessage('El precio debe ser un número positivo');

const imagesValidation = body('images')
  .notEmpty().withMessage('Las imágenes son requeridas')
  .isArray({ min: 1 }).withMessage('Debe proporcionar al menos una imagen')
  .custom((images) => {
    return images.every(image => typeof image === 'string');
  }).withMessage('Todas las imágenes deben ser strings');

const categoryValidation = body('category')
  .notEmpty().withMessage('La categoría es requerida')
  .isString().withMessage('La categoría debe ser un texto')
  .isIn(['anime', 'videogames', 'tv', 'custom', 'other']).withMessage('Categoría no válida');

const sizeValidation = body('size')
  .optional()
  .isString().withMessage('El tamaño debe ser un texto')
  .isIn(['Pequeño (5-10cm)', 'Mediano (15-20cm)', 'Grande (25-30cm)']).withMessage('Tamaño no válido');

const descriptionValidation = body('description')
  .optional()
  .isLength({ max: 500 }).withMessage('La descripción no puede exceder los 500 caracteres');

// Validaciones para cada endpoint
export const validateCreateProduct = [
  nameValidation,
  priceValidation,
  imagesValidation,
  categoryValidation,
  sizeValidation,
  descriptionValidation,
  handleValidationErrors
];

export const validateUpdateProduct = [
  param('id').isInt().withMessage('ID debe ser un número entero'),
  nameValidation.optional(),
  priceValidation.optional(),
  imagesValidation.optional(),
  categoryValidation.optional(),
  sizeValidation,
  descriptionValidation,
  handleValidationErrors
];

export const validateProductId = [
  param('id').isInt().withMessage('ID debe ser un número entero'),
  handleValidationErrors
];

export const validateCategory = [
  param('category').isString().withMessage('Categoría debe ser texto'),
  handleValidationErrors
];

// Middleware para manejar errores de validación
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export const validateRelatedProducts = validateProductId;