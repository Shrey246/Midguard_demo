// backend/models/escrow.js
module.exports = (sequelize, DataTypes) => {
  const Escrow = sequelize.define(
    'Escrow',
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

      order_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
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

      escrow_amount: {
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

      currency: {
        type: DataTypes.ENUM('INR', 'USD', 'EUR'),
        allowNull: false,
        defaultValue: 'INR',
      },

      escrow_status: {
        type: DataTypes.ENUM(
          'initiated',
          'funds_received',
          'in_transit',
          'delivered',
          'completed',
          'disputed',
          'refunded',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'initiated',
      },

      seller_dispatched: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      buyer_received: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      buyer_approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      dispute_raised: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      dispute_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      incoming_payment_reference: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      outgoing_payment_reference: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      funds_received_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      closed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'escrow',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return Escrow;
};
