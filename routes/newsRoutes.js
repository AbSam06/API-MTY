// routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const upload = require('../middlewares/uploadMiddleware');

// Routes pour les actualités
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);
router.post('/', upload.array('files', 10), newsController.createNews);
router.put('/:id', upload.array('files', 10), newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

// Route pour supprimer un média spécifique d'une actualité
router.delete('/:newsId/media/:mediaId', newsController.deleteMediaFromNews);

module.exports = router;