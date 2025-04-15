const { Media } = require('../models');

exports.uploadMedia = async (req, res) => {
  try {
    const { media_url, media_type } = req.body;
    const media = await Media.create({ media_url, media_type });
    res.status(201).json({ message: 'Média ajouté', media });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
