// backend/models/Wishlist.js

module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define(
    "Wishlist",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      user_public_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      room_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },
    },
    {
      tableName: "wishlist",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

      indexes: [
        {
          unique: true,
          fields: ["user_public_id", "room_uid"], // 🚨 prevents duplicates
        },
      ],
    }
  );

  return Wishlist;
};