const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email déjà utilisé.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: 'Utilisateur enregistré', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Mot de passe incorrect.' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '2d'
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "Email non trouvé" });

    // Générer un code de vérification à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const expiry = new Date(Date.now() + 15 * 60000); // expire dans 15 minutes

    // Enregistrer dans la BDD
    user.resetToken = verificationCode;
    user.resetTokenExpiry = expiry;
    await user.save();

    // Contenu de l'email
    const html = `
      <h3>Code de réinitialisation</h3>
      <p>Votre code de vérification est :</p>
      <h1 style="letter-spacing: 5px;">${verificationCode}</h1>
      <p>Ce code expirera dans 15 minutes.</p>
    `;

    await sendEmail(user.email, "Votre code de réinitialisation", html);

    res.json({ message: "Code envoyé par e-mail" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || user.resetToken !== code) {
      return res.status(400).json({ message: "Code invalide" });
    }

    if (new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ message: "Code expiré" });
    }

    // Hacher le nouveau mot de passe
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (user.resetToken !== code) {
      return res.status(400).json({ message: "Code incorrect" });
    }

    if (new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ message: "Code expiré" });
    }

    // Code est valide
    res.json({ message: "Code vérifié" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

