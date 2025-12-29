const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

class AuthMiddleware {
  static authenticateToken(req, res, next) {
const token = req.cookies.token || 
               (req.headers.authorization && req.headers.authorization.split(' ')[1]);

      if (!token) {
      return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: 'Invalid token.' });
      }

      req.user = decoded;
      next();
    });
  }

  static authorizeRole(requiredRole) {
    return (req, res, next) => {
      if (req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Access denied: insufficient privileges.' });
      }
      next();
    };
  }
}

module.exports = AuthMiddleware;
