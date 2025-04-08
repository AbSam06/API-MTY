const { Favorite } = require('../models');

exports.addFavorite = async (req, res) => {
  try {
    const { user_id, news_id } = req.body;
    const fav = await Favorite.create({ user_id, news_id });
    res.status(201).json({ message: 'Ajouté aux favoris', fav });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { user_id, news_id } = req.body;
    await Favorite.destroy({ where: { user_id, news_id } });
    res.json({ message: 'Retiré des favoris' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const favorites = await Favorite.findAll({ where: { user_id } });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
