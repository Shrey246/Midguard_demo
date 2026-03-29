const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Admin, BlacklistedToken } = require("../../models");
const { logAdminAction } = require("../utils/adminLogger");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

class AdminAuthController {

  // ================= LOGIN =================
static async login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "MISSING_CREDENTIALS" });
    }

    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    if (!admin.is_active) {
      return res.status(403).json({ error: "ACCOUNT_DISABLED" });
    }

    if (admin.locked_until && new Date() < admin.locked_until) {
      return res.status(403).json({ error: "ACCOUNT_LOCKED" });
    }

    // 🔥 SAFETY CHECK (THIS FIXES YOUR 500)
    if (!admin.password_hash) {
      console.error("❌ Missing password hash for admin:", admin.email);
      return res.status(500).json({ error: "INVALID_ADMIN_DATA" });
    }

    let isValid = false;

    try {
      isValid = await bcrypt.compare(password, admin.password_hash);
    } catch (err) {
      console.error("❌ Bcrypt crash:", err.message);
      return res.status(500).json({ error: "HASH_ERROR" });
    }

    if (!isValid) {
      admin.failed_attempts = (admin.failed_attempts || 0) + 1;

      if (admin.failed_attempts >= 5) {
        admin.locked_until = new Date(Date.now() + 15 * 60 * 1000);
      }

      await admin.save();

      await logAdminAction({
        admin_id: admin.admin_id,
        action_type: "ADMIN_LOGIN_FAILED",
        target_type: "admin",
        target_id: admin.admin_id,
        metadata: { reason: "INVALID_PASSWORD" },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"]
      });

      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    // ✅ SUCCESS FLOW
    admin.failed_attempts = 0;
    admin.locked_until = null;
    admin.last_login_at = new Date();

    await admin.save();

    const token = jwt.sign(
      { admin_id: admin.admin_id, role: admin.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    await logAdminAction({
      admin_id: admin.admin_id,
      action_type: "ADMIN_LOGIN",
      target_type: "admin",
      target_id: admin.admin_id,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"]
    });

    return res.json({
      token,
      admin: {
        admin_id: admin.admin_id,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    console.error("🔥 LOGIN CRASH:", err); // 👈 VERY IMPORTANT
    return res.status(500).json({ error: err.message }); // 👈 show real error
  }
}

  // ================= LOGOUT =================
  static async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(400).json({ error: "NO_TOKEN_PROVIDED" });
      }

      const token = authHeader.split(" ")[1];

      await BlacklistedToken.create({
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // ✅ FIXED
      });

      return res.json({ success: true });

    } catch (err) {
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  }
}

module.exports = AdminAuthController;