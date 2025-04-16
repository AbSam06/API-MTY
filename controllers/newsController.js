const { News, Media, NewsMedia } = require('../models');
const fs = require('fs');
const path = require('path');

exports.getAllNews = async (req, res) => {
  try {
    const news = await News.findAll({
      include: [
        {
          model: Media,
          through: { attributes: [] }, // Ne pas inclure les attributs de la table de jonction
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
        await NewsMedia.create({ NewsId: news.id, MediaId: media.id });
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
        await NewsMedia.create({ NewsId: news.id, MediaId: media.id });
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
    const newsMedia = await NewsMedia.findOne({
      where: { NewsId: newsId, MediaId: mediaId }
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