// backend/models/wallettransaction.js
module.exports = (sequelize, DataTypes) => {
  const WalletTransaction = sequelize.define(
    'WalletTransaction',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      transaction_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
        unique: true,
      },

      user_public_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      transaction_type: {
        type: DataTypes.ENUM(
          'credit',
          'debit',
          'lock',
          'unlock',
          'escrow_in',
          'escrow_out',
          'refund'
        ),
        allowNull: false,
      },

      reference_type: {
        type: DataTypes.ENUM(
          'topup',
          'bid',
          'room',
          'escrow',
          'admin'
        ),
        allowNull: false,
      },

      reference_id: {
        type: DataTypes.CHAR(26),
        allowNull: true,
      },
    },
    {
      tableName: 'wallet_transactions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return WalletTransaction;
};
