const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const NewsMedia = sequelize.define('NewsMedia', {
  news_id: { type: DataTypes.INTEGER, allowNull: false },
  media_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['news_id', 'media_id']
    }
  ]
});

module.exports = NewsMedia;
