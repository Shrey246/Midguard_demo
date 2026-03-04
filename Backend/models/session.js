module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    "Session",
    {

      room_uid: {
      type: DataTypes.CHAR(26),
      allowNull: true
      },
      session_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
        unique: true,
      },
      session_type: {
        type: DataTypes.ENUM(
          "auction",
          "private_room",
          "marketplace",
          "direct",
          "support"
        ),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "closed"),
        defaultValue: "active",
      },
      created_by: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },
    },
    {
      tableName: "sessions",
      timestamps: false,
    }
  );

  return Session;
};
