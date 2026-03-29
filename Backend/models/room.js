// backend/models/room.js
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    'Room',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      room_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
        unique: true,
      },

      seller_public_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      product_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      base_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      used_duration: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      warranty_remaining: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      original_box_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      invoice_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      room_type: {
      type: DataTypes.ENUM('auction', 'public', 'private', 'digital'),
      allowNull: false,
      defaultValue: 'public',
      },

      end_time: {
      type: DataTypes.DATE,
      allowNull: true,
      },

      auction_duration_hours:{
          type: DataTypes.INTEGER,
          allowNull: true,
        },

      room_password_hash:{
          type: DataTypes.STRING,
          allowNull: true,
        },
      listing_status:{
        type: DataTypes.ENUM(
          'draft',
          'active',
          'locked',
          'completed',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'draft',
      },

    },
    {
      tableName: 'rooms',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Room;
};
