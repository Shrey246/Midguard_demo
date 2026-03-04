// backend/models/order.js
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      session_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        unique: true,
      },

      accepted_bid_uid: {
        type: DataTypes.CHAR(26),
        allowNull: true,
      },

      room_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      buyer_public_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      seller_public_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      final_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      platform_fee: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      seller_net_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      order_status: {
        type: DataTypes.ENUM(
          'created',
          'in_progress',
          'completed',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'created',
      },

      buyer_confirmation_status: {
        type: DataTypes.ENUM(
          'pending',
          'confirmed',
          'rejected'
        ),
        allowNull: false,
        defaultValue: 'pending',
      },

      payment_status: {
        type: DataTypes.ENUM(
          'pending',
          'held',
          'released',
          'refunded'
        ),
        allowNull: false,
        defaultValue: 'pending',
      },

      payment_reference_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'orders',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Order;
};
