export const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log({
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    });
    
    next();
  };
  
  export const errorLogger = (err, req, res, next) => {
    console.error({
      error: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    next(err);
  };