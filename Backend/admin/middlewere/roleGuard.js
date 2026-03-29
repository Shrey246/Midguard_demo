// ================= ROLE MATRIX =================
const ROLE_PERMISSIONS = {
  support: ["VIEW"],
  operations: ["VIEW", "MODERATE"],
  super: ["VIEW", "MODERATE", "FINANCIAL"],
  superadmin: ["VIEW", "MODERATE", "FINANCIAL", "ADMIN_MANAGE"]
};

// ================= MIDDLEWARE =================
function roleGuard(requiredPermission) {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !user.role) {
        return res.status(401).json({ error: "UNAUTHORIZED" });
      }

      const permissions = ROLE_PERMISSIONS[user.role] || [];

      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({
          error: "INSUFFICIENT_PERMISSIONS"
        });
      }

      next();

    } catch (err) {
      console.error("RoleGuard Error:", err.message);
      return res.status(500).json({ error: "ROLE_GUARD_ERROR" });
    }
  };
}

module.exports = roleGuard;