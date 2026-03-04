// src/models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      publicId: {
        type: DataTypes.CHAR(26),
        allowNull: false,
        unique: true,
        field: 'public_id'
      },

      fullName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'full_name'
      },

      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },

      email: {
        type: DataTypes.STRING(255),
        unique: true
      },

      phoneNumber: {
        type: DataTypes.CHAR(10),
        unique: true,
        field: 'phone_number'
      },

      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash'
      },

      authProvider: {
        type: DataTypes.ENUM('email', 'google', 'apple'),
        allowNull: false,
        defaultValue: 'email',
        field: 'auth_provider'
      },

      emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'email_verified'
      },

      phoneVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'phone_verified'
      },

      dateOfBirth: {
        type: DataTypes.DATEONLY,
        field: 'date_of_birth'
      },

      gender: {
        type: DataTypes.ENUM(
          'male',
          'female',
          'other',
          'prefer_not_to_say'
        )
      },

      profession: {
        type: DataTypes.STRING(150)
      },

      bio: {
        type: DataTypes.TEXT
      },

      profilePicture: {
        type: DataTypes.STRING(512),
        field: 'profile_picture'
      },

      preferredLanguage: {
        type: DataTypes.STRING(50),
        field: 'preferred_language'
      },

      timezone: {
        type: DataTypes.STRING(50)
      },

      lastLogin: {
        type: DataTypes.DATE,
        field: 'last_login'
      }
    },
    {
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return User;
};
