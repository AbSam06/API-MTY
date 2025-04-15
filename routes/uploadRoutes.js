// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const uploadController = require('../controllers/uploadController');

// ATTENTION : 'file' ici est important



router.post('/', upload.single('file'), uploadController.uploadFile);

module.exports = router;
