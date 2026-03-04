module.exports = (sequelize, DataTypes) => {
  const MessageAttachment = sequelize.define(
    "MessageAttachment",
    {
      attachment_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
        unique: true,
      },
      message_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },
      session_uid: {
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
      timestamps: false,
    }
  );

  return MessageAttachment;
};
