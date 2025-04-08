const multer = require('multer');
const path = require('path');

// Filtrer types autorisés
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'video/mp4'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

// Config stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage, fileFilter });

module.exports = upload;
