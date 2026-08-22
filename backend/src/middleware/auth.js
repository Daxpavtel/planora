const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'planora_secret_jwt_key_2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // Invalid token, fall through to default guest user
    }
  }

  // Fallback to default user_id: 1 if no auth token provided
  // to ensure seamless full-stack prototype interactivity
  req.user = {
    user_id: 1,
    email: 'yash.mehta@example.com',
    full_name: 'Yash Mehta',
  };
  next();
}

module.exports = authMiddleware;
