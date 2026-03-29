module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define("Admin", {
    admin_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },

    role: {
    type: DataTypes.ENUM("support", "operations", "super", "superadmin"),
    allowNull: false
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    // 🔐 LOGIN TRACKING
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    failed_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    locked_until: {
      type: DataTypes.DATE,
      allowNull: true
    },

    // 🔐 OPTIONAL SECURITY EXTENSIONS (future-ready)
    password_changed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    created_by: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // 🔐 SOFT METADATA
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }

  }, {
    tableName: "admins",
    timestamps: true,

    indexes: [
      { unique: true, fields: ["email"] },
      { fields: ["role"] },
      { fields: ["is_active"] }
    ]
  });

  return Admin;
};