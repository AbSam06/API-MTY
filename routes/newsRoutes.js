const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const upload = require('../middlewares/uploadMiddleware');

router.post('/', upload.array('files', 10), newsController.createNews);

module.exports = router;