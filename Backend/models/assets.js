module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define(
    'Asset',
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      asset_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
        unique: true,
      },

      uploader_public_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      context_type: {
        type: DataTypes.ENUM('room', 'chat', 'escrow', 'profile'),
        allowNull: false,
      },

      context_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      purpose: {
        type: DataTypes.ENUM(
          'listing_image',
          'chat_attachment',
          'shipment_proof',
          'invoice',
          'profile_avatar'
        ),
        allowNull: false,
      },

      file_url: {
        type: DataTypes.STRING(512),
        allowNull: false,
      },

      file_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      immutable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'assets',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false, // intentional: assets are append-only
    }
  );

  return Asset;
};
