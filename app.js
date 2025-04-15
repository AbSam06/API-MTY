const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Remplace bodyParser

// Routes
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/medias', mediaRoutes);
app.use('/api/favorites', favoriteRoutes);

// Dossier statique pour les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route test
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Démarrage du serveur après connexion à la base
sequelize.sync().then(() => {
  app.listen(5000, () => {
    console.log('✅ API running on http://localhost:5000');
  });
});

module.exports = app;
