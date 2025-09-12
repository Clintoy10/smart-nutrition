const express = require('express');
const pool = require('../db');
const router = express.Router();

// Middleware to decode JWT
const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.sendStatus(403);
  }
};

// Save BMI history
router.post('/save', authMiddleware, async (req, res) => {
  const { height, weight, bmi_value, status } = req.body;
  const userId = req.user.userId;

  try {
    await pool.query(
      `INSERT INTO bmi_records (user_id, height, weight, bmi_value, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, height, weight, bmi_value, status]
    );
    res.json({ message: 'BMI saved successfully' });
  } catch (err) {
    console.error('BMI Save Error:', err);
    res.status(500).json({ error: 'Failed to save BMI' });
  }
});

module.exports = router;
