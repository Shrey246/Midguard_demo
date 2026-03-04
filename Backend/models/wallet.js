// backend/models/wallet.js
module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define(
    'Wallet',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      user_public_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
        unique: true,
      },

      available_balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00,
      },

      locked_balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
    },
    {
      tableName: 'wallets',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Wallet;
};
