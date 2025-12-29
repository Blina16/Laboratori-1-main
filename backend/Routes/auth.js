const express = require('express');
const AuthController = require('../controllers/authControllers');
const AuthMiddleware = require('../middleware/authmiddleware');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/signup', AuthController.signup);
router.post('/logout', AuthController.logout);

// endpointi per me verifiku userin dhe me i marr user info
router.get('/me', AuthMiddleware.authenticateToken, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    authenticated: true
  });
});

router.get('/protected', AuthMiddleware.authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route!' });
});

router.get(
  '/admin-only',
  AuthMiddleware.authenticateToken,
  AuthMiddleware.authorizeRole(1), // 1 = admin
  (req, res) => {
    res.json({ message: 'Welcome admin!' });
  }
);

module.exports = router;
