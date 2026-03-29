module.exports = (sequelize, DataTypes) => {

  const Dispute = sequelize.define("Dispute", {

    dispute_uid: {
      type: DataTypes.STRING,
      primaryKey: true
    },

    session_id: {
      type: DataTypes.STRING,
      allowNull: false
    },

    order_uid: {
      type: DataTypes.STRING,
      allowNull: false
    },

    raised_by: {
      type: DataTypes.ENUM("buyer", "seller"),
      allowNull: false
    },

    dispute_stage: {
      type: DataTypes.ENUM(
        "awaiting_buyer_approval",
        "escrow_active",
        "delivery_in_progress",
        "delivery_confirmed"
      ),
      allowNull: false
    },

    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT
    },

    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium"
    },

    status: {
      type: DataTypes.ENUM("open", "resolved", "rejected"),
      defaultValue: "open"
    },

    resolved_by: {
      type: DataTypes.STRING
    }

  }, {
    tableName: "disputes",
    timestamps: true
  });

  return Dispute;

};