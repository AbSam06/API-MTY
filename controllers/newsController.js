const { News, Media, NewsMedia } = require('../models');
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models')

exports.getAllNews = async (req, res) => {
  try {
    // 1. D'abord, récupérez toutes les actualités
    const news = await News.findAll({
      order: [["createdAt", "DESC"]],
    });
    
    // 2. Pour chaque actualité, récupérez manuellement les médias associés
    const newsWithMedia = [];
    
    for (const newsItem of news) {
      // Recherchez manuellement dans la table NewsMedia
      const newsMedias = await sequelize.query(
        "SELECT m.* FROM Media m JOIN news_media nm ON m.id = nm.media_id WHERE nm.news_id = :newsId",
        {
          replacements: { newsId: newsItem.id },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      console.log(`🔍 Actualité ${newsItem.id} (${newsItem.title}) : ${newsMedias.length} médias trouvés`);
      
      // Créez un nouvel objet avec les médias ajoutés
      const newsWithMediaItem = newsItem.toJSON();
      newsWithMediaItem.Media = newsMedias;
      newsWithMedia.push(newsWithMediaItem);
    }
    
    res.json(newsWithMedia);
  } catch (error) {
    console.error("Erreur lors de la récupération des actualités :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByPk(id, {
      include: [
        {
          model: Media,
          through: { attributes: [] },
        },
      ],
    });

    if (!news) {
      return res.status(404).json({ message: "Actualité non trouvée" });
    }

    res.json(news);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'actualité :", error);
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
      for (const file of req.files) {
        const media_url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        const media_type = file.mimetype.startsWith('video') ? 'video' : 'image';
        
        const media = await Media.create({ media_url, media_type });
        
        // Utiliser les noms de colonnes corrects news_id et media_id
        await NewsMedia.create({ 
          news_id: news.id,
          media_id: media.id
        });
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

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, resume, content } = req.body;
    
    // Vérifier si l'actualité existe
    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({ message: "Actualité non trouvée" });
    }
    
    // Mettre à jour les champs de l'actualité
    await news.update({
      title: title || news.title,
      resume: resume || news.resume,
      content: content || news.content
    });
    
    // Gérer les nouveaux fichiers si présents
    if (req.files && req.files.length > 0) {
      console.log("🟡 Nouveaux fichiers reçus :", req.files);
      for (const file of req.files) {
        const media_url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        const media_type = file.mimetype.startsWith('video') ? 'video' : 'image';
        
        const media = await Media.create({ media_url, media_type });
        
        // CORRECTION ICI : Utiliser les noms de colonnes corrects news_id et media_id
        await NewsMedia.create({ 
          news_id: news.id, 
          media_id: media.id 
        });
      }
    }
    
    // Récupérer l'actualité mise à jour avec ses médias
    const updatedNews = await News.findByPk(id, {
      include: [
        {
          model: Media,
          through: { attributes: [] },
        },
      ],
    });
    
    return res.json({
      message: 'Actualité mise à jour avec succès',
      news: updatedNews
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'actualité :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'actualité existe
    const news = await News.findByPk(id, {
      include: [
        {
          model: Media,
          through: { attributes: [] },
        },
      ],
    });
    
    if (!news) {
      return res.status(404).json({ message: "Actualité non trouvée" });
    }
    
    // Supprimer les fichiers physiques des médias associés
    if (news.Media && news.Media.length > 0) {
      for (const media of news.Media) {
        try {
          // Extraire le nom du fichier de l'URL
          const fileUrl = media.media_url;
          const fileName = fileUrl.split('/uploads/')[1];
          
          if (fileName) {
            const filePath = path.join(__dirname, '../uploads', fileName);
            
            // Vérifier si le fichier existe avant de le supprimer
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`🗑️ Fichier supprimé: ${filePath}`);
            }
          }
        } catch (fileError) {
          console.error(`Erreur lors de la suppression du fichier: ${media.media_url}`, fileError);
          // Continuer malgré l'erreur de suppression de fichier
        }
      }
    }
    
    // Supprimer l'actualité (les associations seront supprimées en cascade si configurées)
    await news.destroy();
    
    return res.json({ message: "Actualité et médias associés supprimés avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'actualité :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.deleteMediaFromNews = async (req, res) => {
  try {
    const { newsId, mediaId } = req.params;
    
    // Vérifier si l'association existe
    // CORRECTION ICI : Utiliser les noms de colonnes corrects news_id et media_id
    const newsMedia = await NewsMedia.findOne({
      where: { news_id: newsId, media_id: mediaId }
    });
    
    if (!newsMedia) {
      return res.status(404).json({ message: "Association média-actualité non trouvée" });
    }
    
    // Récupérer les informations du média avant suppression
    const media = await Media.findByPk(mediaId);
    
    if (media) {
      // Supprimer le fichier physique
      try {
        const fileUrl = media.media_url;
        const fileName = fileUrl.split('/uploads/')[1];
        
        if (fileName) {
          const filePath = path.join(__dirname, '../uploads', fileName);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Fichier supprimé: ${filePath}`);
          }
        }
      } catch (fileError) {
        console.error(`Erreur lors de la suppression du fichier: ${media.media_url}`, fileError);
      }
      
      // Supprimer l'entrée de média
      await media.destroy();
    }
    
    // Supprimer l'association
    await newsMedia.destroy();
    
    return res.json({ message: "Média supprimé de l'actualité avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du média :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};