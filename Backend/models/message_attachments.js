module.exports = (sequelize, DataTypes) => {
  const MessageAttachment = sequelize.define(
    "MessageAttachment",
    {
      attachment_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
        unique: true,
        primaryKey: true, // ✅ FIX
      },
      message_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },
      session_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mime_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "message_attachments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  MessageAttachment.associate = (models) => {
    MessageAttachment.belongsTo(models.Message, {
      foreignKey: "message_uid",
      targetKey: "message_uid",
      as: "message",
    });
  };

  return MessageAttachment;
};