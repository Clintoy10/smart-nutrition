const pool = require('../db');

let ensurePromise;

const ensureUserProfileColumns = () => {
  if (!ensurePromise) {
    ensurePromise = pool
      .query(`
        ALTER TABLE users
          ADD COLUMN IF NOT EXISTS dietary_preference TEXT,
          ADD COLUMN IF NOT EXISTS allergies TEXT,
          ADD COLUMN IF NOT EXISTS goal TEXT,
          ADD COLUMN IF NOT EXISTS photo_url TEXT
      `)
      .catch((error) => {
        ensurePromise = null;
        throw error;
      });
  }

  return ensurePromise;
};

module.exports = ensureUserProfileColumns;
