const { verifyToken } = require('../utils/jwt');
const { BlacklistedToken } = require('../models');

const authGuard = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Login required'
      });
    }

    const token = authHeader.split(' ')[1];

    // 🔥 First check blacklist (faster fail)
    const isBlacklisted = await BlacklistedToken.findOne({
      where: { token }
    });

    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }

    // Then verify token
    const decoded = verifyToken(token);

    if (!decoded || !decoded.publicId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);

    let message = "Authentication failed";

    if (error.name === "TokenExpiredError") {
      message = "Session expired. Please login again.";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token";
    }

    return res.status(401).json({
      success: false,
      message
    });
  }
};

module.exports = authGuard;