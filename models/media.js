const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Media = sequelize.define('Media', {
  media_url: { type: DataTypes.TEXT, allowNull: false, unique: true },
  media_type: { type: DataTypes.ENUM('image', 'video'), allowNull: false },
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false,
});

module.exports = Media;
