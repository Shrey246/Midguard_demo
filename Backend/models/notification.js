const { DataTypes } = require("sequelize");
const { ulid } = require("ulid");

module.exports = (sequelize) => {

  const Notification = sequelize.define("Notification", {

    notification_uid: {
      type: DataTypes.STRING(26),
      primaryKey: true,
      defaultValue: () => ulid()
    },

    user_public_id: {
      type: DataTypes.STRING,
      allowNull: false
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    reference_type: {
      type: DataTypes.STRING
    },

    reference_id: {
      type: DataTypes.STRING
    },

    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }

  }, {
    tableName: "notifications",
    timestamps: true
  });

  return Notification;
};