const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const ensureUserProfileColumns = require('../utils/ensureUserProfileColumns');
const { mapUserRowToResponse } = require('../utils/userResponse');

const promoteFirstUserToAdmin = async (userId) => {
  if (!userId) {
    return false;
  }

  const existingAdmin = await pool.query('SELECT id FROM users WHERE is_admin = true LIMIT 1');
  if (existingAdmin.rowCount === 0) {
    await pool.query('UPDATE users SET is_admin = true WHERE id = $1', [userId]);
    return true;
  }

  return false;
};

const router = express.Router();

ensureUserProfileColumns().catch((error) => {
  console.error('Failed to ensure user profile columns', error);
});

const signToken = (user) =>
  jwt.sign({ userId: user.id, isAdmin: Boolean(user.is_admin) }, process.env.JWT_SECRET);

router.post('/signup', async (req, res) => {
  const {
    firstName,
    lastName,
    age,
    gender,
    height,
    weight,
    email,
    password,
    goal,
    dietaryPreference,
    allergies,
  } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
        INSERT INTO users (
          first_name,
          last_name,
          age,
          gender,
          height,
          weight,
          email,
          password,
          goal,
          dietary_preference,
          allergies
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `,
      [
        firstName,
        lastName,
        age,
        gender,
        height,
        weight,
        email,
        hashed,
        goal || null,
        dietaryPreference || null,
        allergies || null,
      ]
    );

    const user = result.rows[0];
    if (await promoteFirstUserToAdmin(user.id)) {
      user.is_admin = true;
    }
    const token = signToken(user);

    res.json({
      token,
      user: mapUserRowToResponse(req, user),
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    if (await promoteFirstUserToAdmin(user.id)) {
      user.is_admin = true;
    }
    const token = signToken(user);
    return res.json({
      token,
      user: mapUserRowToResponse(req, user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Login error' });
  }
});

module.exports = router;

