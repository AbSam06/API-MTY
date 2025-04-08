const { Favorite } = require('../models');

// Ajouter aux favoris
exports.addFavorite = async (req, res) => {
  const { user_id, news_id } = req.body;
  try {
    const existing = await Favorite.findOne({ where: { user_id, news_id } });
    if (existing) return res.status(409).json({ message: 'Déjà dans les favoris' });

    const fav = await Favorite.create({ user_id, news_id });
    res.status(201).json(fav);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer des favoris
exports.removeFavorite = async (req, res) => {
  const { user_id, news_id } = req.body;
  try {
    const deleted = await Favorite.destroy({ where: { user_id, news_id } });
    if (!deleted) return res.status(404).json({ message: 'Favori non trouvé' });

    res.json({ message: 'Supprimé des favoris' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir tous les favoris d'un utilisateur
exports.getUserFavorites = async (req, res) => {
  const { user_id } = req.params;
  try {
    const favorites = await Favorite.findAll({ where: { user_id } });
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
