exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier reçu." });
  }

  const fileUrl = `http://172.105.11.38:5000/uploads/${req.file.filename}`;


  return res.status(200).json({
    fileUrl: fileUrl
  });
};

  