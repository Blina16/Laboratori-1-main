const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Simple HMAC-signed token (JWT-like but handcrafted to avoid extra deps)
// token format: base64url(header).base64url(payload).base64url(signature)
// where signature = HMACSHA256(header.payload, SECRET)
const SECRET = process.env.AUTH_SECRET || 'dev_secret_change_me';

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signToken(claims, ttlSeconds = 900) { // default 15 minutes
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + ttlSeconds, ...claims };
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  try {
    const [h, p, s] = token.split('.');
    if (!h || !p || !s) return null;
    const data = `${h}.${p}`;
    const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64')
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    if (expected !== s) return null;
    const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

// Middleware to protect routes
function authRequired(roles = []) {
  return (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing token' });
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
    if (roles.length && !roles.includes(payload.role)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient role' });
    }
    req.user = payload; // { sub, email, role, iat, exp }
    next();
  };
}

// In-memory user store placeholder (no DB). Keys by email.
// NOTE: Replace with real DB when available.
const users = new Map(); // email -> { email, passwordHash, role, name }

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

router.post('/signup', (req, res) => {
  const { email, password, role = 'student', name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'email and password required' });
  if (!['student', 'admin', 'tutor'].includes(role)) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'invalid role' });
  const key = email.toLowerCase();
  if (users.has(key)) return res.status(400).json({ error: 'DUPLICATE', message: 'User already exists' });
  users.set(key, { email: key, passwordHash: hashPassword(password), role, name: name || key.split('@')[0] });
  const token = signToken({ sub: key, email: key, role }, 15 * 60);
  const refresh = signToken({ sub: key, email: key, role, type: 'refresh' }, 7 * 24 * 60 * 60);
  res.status(201).json({ message: 'User registered!', user: { email: key, role }, accessToken: token, refreshToken: refresh });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'email and password required' });
  const key = email.toLowerCase();
  const u = users.get(key);
  if (!u || u.passwordHash !== hashPassword(password)) return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
  const token = signToken({ sub: key, email: key, role: u.role }, 15 * 60);
  const refresh = signToken({ sub: key, email: key, role: u.role, type: 'refresh' }, 7 * 24 * 60 * 60);
  res.json({ message: 'Login successful!', user: { email: key, role: u.role }, accessToken: token, refreshToken: refresh });
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'refreshToken required' });
  const payload = verifyToken(refreshToken);
  if (!payload || payload.type !== 'refresh') return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid refresh token' });
  const { sub, email, role } = payload;
  const token = signToken({ sub, email, role }, 15 * 60);
  res.json({ accessToken: token });
});

router.get('/me', authRequired(), (req, res) => {
  res.json({ user: { email: req.user.email, role: req.user.role } });
});

// Export middleware for use in other routes if needed
router.authRequired = authRequired;
router.verifyToken = verifyToken;

module.exports = router;
