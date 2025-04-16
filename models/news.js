const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const News = sequelize.define('News', {
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  resume: { type: DataTypes.TEXT, allowNull: false },
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

News.associate = (models) => {
  News.belongsToMany(models.Media, {
    through: 'NewsMedia',
    foreignKey: 'news_id', // Utilisez le même nom que dans votre table
    otherKey: 'media_id'
  });
};

module.exports = News;
