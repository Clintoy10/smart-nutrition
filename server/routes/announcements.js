const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `
        SELECT id, message, created_at
        FROM admin_broadcasts
        ORDER BY created_at DESC
      `
    );

    const announcements = rows.map((row) => ({
      id: row.id,
      message: row.message,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    }));

    return res.json({ announcements });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
