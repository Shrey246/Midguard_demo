module.exports = (sequelize, DataTypes) => {
  const SessionParticipant = sequelize.define(
    "SessionParticipant",
    {
      session_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },
      user_public_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("buyer", "seller", "admin"),
        allowNull: false,
      },
    },
    {
      tableName: "session_participants",
      timestamps: false,
    }
  );

  return SessionParticipant;
};
