module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      message_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
        unique: true,
      },
      session_uid: {
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
      timestamps: false,
    }
  );

  return Message;
};
