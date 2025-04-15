const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // ou ../config/database selon ton projet

const NewsMedia = sequelize.define('NewsMedia', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  news_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  media_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'news_media',
  timestamps: false
});

module.exports = NewsMedia;
