const { verifyToken } = require('../utils/jwt');

/**
 * Vanguard Auth Guard
 * Blocks all unauthenticated access
 */
const authGuard = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Login required'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token + expiry
    const decoded = verifyToken(token);

    // Attach user identity to request
    req.user = decoded;

    next(); // allow request
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expired. Please login again.'
    });
  }
};
//the changes
module.exports = authGuard;
