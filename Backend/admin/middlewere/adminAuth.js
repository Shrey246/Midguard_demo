const jwt = require("jsonwebtoken");
const { Admin } = require("../../models");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "NO_TOKEN_PROVIDED" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "INVALID_OR_EXPIRED_TOKEN" });
    }

    // 🔐 ALWAYS VERIFY FROM DB
    const admin = await Admin.findByPk(decoded.admin_id);

    if (!admin) {
      return res.status(401).json({ error: "ADMIN_NOT_FOUND" });
    }

    if (!admin.is_active) {
      return res.status(403).json({ error: "ADMIN_DISABLED" });
    }

    if (admin.locked_until && new Date() < admin.locked_until) {
      return res.status(403).json({ error: "ADMIN_ACCOUNT_LOCKED" });
    }

    // 🔐 Optional: invalidate old tokens if password changed
    if (
      admin.password_changed_at &&
      decoded.iat * 1000 < new Date(admin.password_changed_at).getTime()
    ) {
      return res.status(401).json({ error: "TOKEN_INVALIDATED" });
    }

    // attach safe user object
    req.user = {
      admin_id: admin.admin_id,
      role: admin.role
    };

    next();

  } catch (err) {
    console.error("AdminAuth Error:", err.message);
    return res.status(500).json({ error: "AUTH_MIDDLEWARE_ERROR" });
  }
}

module.exports = adminAuth;