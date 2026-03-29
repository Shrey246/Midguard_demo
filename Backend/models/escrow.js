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
        type: DataTypes.CHAR(26), // ✅ FIXED (ULID)
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
        defaultValue: 'INR',
      },

      escrow_status: {
        type: DataTypes.ENUM(
          'holding',
          'funds_received',
          'in_transit',
          'delivered',
          'released',
          'disputed',
          'refunded',
          'cancelled'
        ),
        defaultValue: 'holding',
      },

      seller_dispatched: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      buyer_received: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      buyer_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      dispute_raised: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      dispute_reason: {
        type: DataTypes.TEXT,
      },

      incoming_payment_reference: DataTypes.STRING(100),
      outgoing_payment_reference: DataTypes.STRING(100),

      funds_received_at: DataTypes.DATE,
      closed_at: DataTypes.DATE,
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