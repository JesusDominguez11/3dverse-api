export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Errores de validación
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        type: 'ValidationError',
        message: err.message,
        details: err.errors
      });
    }
    
    // Errores de base de datos
    if (err.code === '23505') { // Violación de unique constraint
      return res.status(409).json({
        type: 'DatabaseError',
        message: 'Conflicto de datos: ya existe un registro con estos valores'
      });
    }
  
    // Error no manejado específicamente
    res.status(500).json({
      type: 'InternalServerError',
      message: 'Ocurrió un error inesperado'
    });
  };
  
  // Middleware para rutas no encontradas
  export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
      type: 'NotFound',
      message: `Ruta ${req.originalUrl} no encontrada`
    });
  };