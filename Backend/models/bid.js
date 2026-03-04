// backend/models/bid.js
module.exports = (sequelize, DataTypes) => {
  const Bid = sequelize.define(
    'Bid',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      bid_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
        unique: true,
      },

      room_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      bidder_public_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      bid_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      locked_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      bid_status: {
        type: DataTypes.ENUM(
          'placed',
          'leading',
          'waitlisted',
          'outbid',
          'won',
          'cancelled',
          'expired'
        ),
        allowNull: false,
        defaultValue: 'placed',
      },

      bid_rank: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'bids',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Bid;
};
