// Add this model
const BlacklistedToken = sequelize.define("BlacklistedToken", {
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: "blacklisted_tokens",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

// Export it
module.exports = {
  ...existingModels,
  BlacklistedToken
};