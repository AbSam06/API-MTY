const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Favorite = sequelize.define('Favorite', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  news_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'news_id']
    }
  ]
});

module.exports = Favorite;
