const sequelize = require('../config/db');

const User = require('./user');
const News = require('./news');
const Media = require('./media');
const NewsMedia = require('./newsMedia');
const Favorite = require('./favorite');

// Associations
User.hasMany(Favorite, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });

News.hasMany(Favorite, { foreignKey: 'news_id', onDelete: 'CASCADE' });
Favorite.belongsTo(News, { foreignKey: 'news_id' });


module.exports = {
  sequelize,
  User,
  News,
  Media,
  NewsMedia,
  Favorite,
};
