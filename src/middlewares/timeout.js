export const timeoutMiddleware = (timeout) => {
    return (req, res, next) => {
      res.setTimeout(timeout, () => {
        res.status(503).json({ message: 'La solicitud ha excedido el tiempo máximo' });
      });
      next();
    };
  };
