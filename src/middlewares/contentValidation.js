export const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      // Permitir tanto application/json como multipart/form-data
      if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
          return res.status(415).json({
              message: 'Content-Type debe ser application/json o multipart/form-data'
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