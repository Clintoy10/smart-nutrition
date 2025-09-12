const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Setup Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile_images/');
  },
  filename: function (req, file, cb) {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Example route to upload profile image
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const imageUrl = `/uploads/profile_images/${req.file.filename}`;
  // Here you would typically update the user record in your DB
  res.status(200).json({ imageUrl });
});

module.exports = router;
