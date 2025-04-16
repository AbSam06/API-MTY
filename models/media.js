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

Media.associate = (models) => {
  Media.belongsToMany(models.News, {
    through: 'NewsMedia',
    foreignKey: 'media_id', // Utilisez le même nom que dans votre table
    otherKey: 'news_id'
  });
};

module.exports = Media;
