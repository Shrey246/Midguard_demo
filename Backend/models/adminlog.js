module.exports = (sequelize, DataTypes) => {
  const AdminLog = sequelize.define("AdminLog", {
    log_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },

    admin_id: {
      type: DataTypes.STRING,
      allowNull: false
    },

    action_type: {
      type: DataTypes.STRING,
      allowNull: false
    },

    target_type: {
      type: DataTypes.STRING,
      allowNull: false
    },

    target_id: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // 🔥 BEFORE / AFTER STATE (AUDIT TRAIL)
    before_state: {
      type: DataTypes.JSON,
      allowNull: true
    },

    after_state: {
      type: DataTypes.JSON,
      allowNull: true
    },

    // 🔐 EXTRA SECURITY + CONTEXT
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },

    // 🔐 REQUEST TRACKING
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true
    },

    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    }

  }, {
    tableName: "admin_logs",
    timestamps: true,

      indexes: [
        { fields: ["admin_id"] },
        { fields: ["target_id"] },
        { fields: ["action_type"] },
        { fields: ["created_at"] }
      ]
  });

  return AdminLog;
};