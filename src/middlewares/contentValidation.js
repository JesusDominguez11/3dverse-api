export const validateContentType = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (!req.is('application/json')) {
        return res.status(415).json({
          message: 'Content-Type debe ser application/json'
        });
      }
    }
    next();
  };
  
  export const validateAcceptHeader = (req, res, next) => {
    if (!req.accepts('json')) {
      return res.status(406).json({
        message: 'Este endpoint solo soporta respuestas en formato JSON'
      });
    }
    next();
  };