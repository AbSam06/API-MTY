const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  resetToken: DataTypes.STRING,
  resetTokenExpiry: DataTypes.DATE,
  resetAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastResetAttempt: DataTypes.DATE,
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

module.exports = User;
