const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

router.post('/add', favoriteController.addFavorite);
router.post('/remove', favoriteController.removeFavorite);
router.get('/:user_id', favoriteController.getUserFavorites);

module.exports = router;
