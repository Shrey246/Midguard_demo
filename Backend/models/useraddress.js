module.exports = (sequelize, DataTypes) => {
  const UserAddress = sequelize.define(
    'UserAddress',
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      address_uid: {
        type: DataTypes.CHAR(26),
        allowNull: false,
        unique: true,
      },

      user_public_id: {
        type: DataTypes.CHAR(26),
        allowNull: false,
      },

      label: {
        type: DataTypes.ENUM('home', 'work', 'other'),
        allowNull: false,
      },

      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      phone_number: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },

      address_line1: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      address_line2: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      state: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      postal_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },

      country: {
        type: DataTypes.STRING(50),
        defaultValue: 'India',
      },

      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'user_addresses',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return UserAddress;
};
