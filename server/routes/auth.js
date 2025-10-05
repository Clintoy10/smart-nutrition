const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

const buildUserResponse = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  age: user.age,
  gender: user.gender,
  height: user.height,
  weight: user.weight,
  email: user.email,
  isAdmin: Boolean(user.is_admin),
});

const signToken = (user) =>
  jwt.sign({ userId: user.id, isAdmin: Boolean(user.is_admin) }, process.env.JWT_SECRET);

router.post('/signup', async (req, res) => {
  const { firstName, lastName, age, gender, height, weight, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
        INSERT INTO users (first_name, last_name, age, gender, height, weight, email, password)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [firstName, lastName, age, gender, height, weight, email, hashed]
    );

    const user = result.rows[0];
    const token = signToken(user);

    res.json({
      token,
      user: buildUserResponse(user),
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

    const token = signToken(user);
    return res.json({
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Login error' });
  }
});

module.exports = router;
