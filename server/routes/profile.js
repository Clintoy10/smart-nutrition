const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const ensureUserProfileColumns = require('../utils/ensureUserProfileColumns');
const { mapUserRowToResponse } = require('../utils/userResponse');

const router = express.Router();

ensureUserProfileColumns().catch((error) => {
  console.error('Failed to ensure user profile columns', error);
});

const uploadsDir = path.join(__dirname, '..', 'uploads', 'profile_images');
fs.mkdirSync(uploadsDir, { recursive: true });

const toAbsoluteUploadPath = (relativePath) =>
  path.join(__dirname, '..', relativePath.replace(/^[\\/]+/, ''));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed.'));
    }
    return cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const processPhotoUpload = (req, res, next) => {
  upload.single('photo')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError || error.message) {
      return res.status(400).json({ error: error.message || 'Image upload failed.' });
    }

    return next(error);
  });
};

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { rows } = await pool.query(
      `
        SELECT
          id,
          first_name,
          last_name,
          email,
          age,
          weight,
          height,
          gender,
          goal,
          dietary_preference,
          allergies,
          body_type,
          calorie_target,
          photo_url,
          is_admin
        FROM users
        WHERE id = $1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: mapUserRowToResponse(req, rows[0]) });
  } catch (error) {
    return next(error);
  }
});

router.put('/me', authMiddleware, processPhotoUpload, async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    age,
    weight,
    height,
    gender,
    dietaryPreference,
    allergies,
    goal,
    bodyType,
    calorieTarget,
  } = req.body;
  const { userId } = req.user;
  const newPhotoPath = req.file ? `/uploads/profile_images/${req.file.filename}` : null;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const currentResult = await client.query(
      `
        SELECT
          first_name,
          last_name,
          email,
          age,
          weight,
          height,
          gender,
          goal,
          dietary_preference,
          allergies,
          body_type,
          calorie_target,
          photo_url,
          is_admin
        FROM users
        WHERE id = $1
        FOR UPDATE
      `,
      [userId]
    );

    if (currentResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found.' });
    }

    const current = currentResult.rows[0];

    const parseNumber = (value, fallback) => {
      if (value === undefined || value === null || value === '') {
        return fallback;
      }
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : fallback;
    };

    const parseOptionalPositive = (value, fallback) => {
      if (value === undefined) return fallback;
      if (value === null || value === '') return null;

      // Accept raw numbers, comma-separated thousands, and trailing text (e.g., "1,800", "1800 kcal")
      const cleaned = String(value).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
      if (!cleaned || !cleaned[1]) return fallback;

      const numeric = Number(cleaned[1]);
      if (!Number.isFinite(numeric) || numeric <= 0) return fallback;

      return Math.round(numeric);
    };

    const normalizeRequired = (value, fallback) => {
      if (typeof value !== 'string') {
        return fallback;
      }
      const trimmed = value.trim();
      return trimmed || fallback;
    };

    const normalizeOptional = (value, fallback) => {
      if (value === undefined) {
        return fallback;
      }
      const trimmed = String(value).trim();
      return trimmed.length === 0 ? null : trimmed;
    };

    const updateResult = await client.query(
      `
        UPDATE users
        SET
          first_name = $1,
          last_name = $2,
          email = $3,
          age = $4,
          weight = $5,
          height = $6,
          gender = $7,
          dietary_preference = $8,
          allergies = $9,
          goal = $10,
          body_type = $11,
          calorie_target = $12,
          photo_url = COALESCE($13, photo_url)
        WHERE id = $14
        RETURNING
          id,
          first_name,
          last_name,
          email,
          age,
          weight,
          height,
          gender,
          goal,
          dietary_preference,
          allergies,
          body_type,
          calorie_target,
          photo_url,
          is_admin
      `,
      [
        normalizeRequired(firstName, current.first_name),
        normalizeRequired(lastName, current.last_name),
        normalizeRequired(email, current.email),
        parseNumber(age, current.age),
        parseNumber(weight, current.weight),
        parseNumber(height, current.height),
        normalizeOptional(gender, current.gender),
        normalizeOptional(dietaryPreference, current.dietary_preference),
        normalizeOptional(allergies, current.allergies),
        normalizeOptional(goal, current.goal),
        normalizeOptional(bodyType, current.body_type),
        parseOptionalPositive(calorieTarget, current.calorie_target),
        newPhotoPath,
        userId,
      ]
    );

    await client.query('COMMIT');

    const updatedUser = updateResult.rows[0];
    const previousPhotoPath =
      newPhotoPath && current.photo_url && current.photo_url !== updatedUser.photo_url
        ? current.photo_url
        : null;

    if (previousPhotoPath) {
      const deletePath = toAbsoluteUploadPath(previousPhotoPath);
      fs.promises.unlink(deletePath).catch(() => {});
    }

    return res.json({ user: mapUserRowToResponse(req, updatedUser) });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
});

module.exports = router;
