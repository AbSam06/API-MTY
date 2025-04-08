const { News, Media, NewsMedia } = require('../models');

exports.getAllNews = async (req, res) => {
  try {
    const news = await News.findAll({
      include: [
        {
          model: Media,
          through: { attributes: [] }, // si relation many-to-many
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(news);
  } catch (error) {
    console.error("Erreur lors de la récupération des actualités :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.createNews = async (req, res) => {

  console.log('🟢 createNews a été appelée');
  try {
    const { title, resume, content } = req.body;

    if (!title || !resume || !content) {
      return res.status(400).json({ message: 'Champs requis manquants.' });
    }

    const news = await News.create({ title, resume, content });

    if (req.files && req.files.length > 0) {
      console.log("🟡 Fichiers reçus :", req.files);
      console.log("📨 Corps reçu :", req.body);
      for (const file of req.files) {
        const media_url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        const media_type = file.mimetype.startsWith('video') ? 'video' : 'image';

        const media = await Media.create({ media_url, media_type });
        await NewsMedia.create({ news_id: news.id, media_id: media.id });
      }
    }

    return res.status(201).json({
      message: 'News et médias ajoutés avec succès',
      news
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
