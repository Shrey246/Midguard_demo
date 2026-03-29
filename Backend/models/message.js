module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      message_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
        unique: true,
        primaryKey: true,
      },

      session_id: { // ✅ FIXED (not session_uid)
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      sender_public_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      message_type: {
        type: DataTypes.ENUM(
          "text",
          "system",
          "image",
          "document"
        ),
        defaultValue: "text",
      },

      body: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "messages",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  Message.associate = (models) => {
    Message.belongsTo(models.Session, {
      foreignKey: "session_id",   // ✅ FIX
      targetKey: "session_id",    // ✅ FIX
      onDelete: "CASCADE",        // ✅ FIX (not SET NULL)
      onUpdate: "CASCADE",
    });

    Message.hasMany(models.MessageAttachment, {
      foreignKey: "message_uid",
      sourceKey: "message_uid",
      as: "attachments",
    });
  };

  return Message;
};