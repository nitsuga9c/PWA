const jwt = require('jsonwebtoken');

// Verifica que el usuario haya enviado un token válido
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Acceso denegado. Token requerido.' });

  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token no válido.' });
  }
};

// Verifica que además de estar logueado, su rol sea 'admin'
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }
  });
};

module.exports = { verifyToken, verifyAdmin };