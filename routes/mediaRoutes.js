const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');

router.post('/', mediaController.uploadMedia);

module.exports = router;
