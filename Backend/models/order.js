module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {

      order_uid: {
        type: DataTypes.CHAR(26),
        primaryKey: true, // ✅ FIX
        allowNull: false,
        unique: true,
      },

      session_id: {
        type: DataTypes.CHAR(26), // ✅ match ULID
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
        defaultValue: 'created',
      },

      buyer_confirmation_status: {
        type: DataTypes.ENUM(
          'pending',
          'confirmed',
          'rejected'
        ),
        defaultValue: 'pending',
      },

      payment_status: {
        type: DataTypes.ENUM(
          'pending',
          'held',
          'released',
          'refunded'
        ),
        defaultValue: 'pending',
      },

      payment_reference_id: {
        type: DataTypes.STRING(100),
      },

      completed_at: {
        type: DataTypes.DATE,
      },

      trade_status: {
        type: DataTypes.ENUM(
          "initiated",
          "awaiting_buyer_approval",
          "escrow_active",
          "delivery_in_progress",
          "delivery_confirmed",
          "completed",
          "disputed",
          "cancelled"
        ),
        defaultValue: "initiated"
      },

      shipping_status: {
        type: DataTypes.ENUM(
          "not_shipped",
          "shipped",
          "delivered"
        ),
        defaultValue: "not_shipped"
      },

      courier_name: DataTypes.STRING,
      tracking_link: DataTypes.TEXT,
      shipped_at: DataTypes.DATE,

      digital_delivery_confirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }

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