const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const TABLE_INIT_QUERIES = [
  `
    CREATE TABLE IF NOT EXISTS admin_user_profiles (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'Pending',
      goal TEXT NOT NULL DEFAULT 'maintain',
      last_login TIMESTAMP NULL
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS admin_reports (
      code TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS admin_tasks (
      code TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      due_date DATE NULL,
      priority TEXT NOT NULL DEFAULT 'Medium',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS admin_broadcasts (
      id SERIAL PRIMARY KEY,
      message TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS admin_invitations (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `,
];

const reportTemplates = [
  {
    severity: 'High',
    interval: '2 day',
    buildMessage: (user) => `High saturated fat intake flagged for ${user.first_name} ${user.last_name}.`,
  },
  {
    severity: 'Medium',
    interval: '4 day',
    buildMessage: (user) => `Pending allergy verification for ${user.first_name} ${user.last_name}.`,
  },
  {
    severity: 'Low',
    interval: '5 day',
    buildMessage: (user) => `Incomplete profile updates for ${user.first_name} ${user.last_name}.`,
  },
];

const buildReportSeeds = async () => {
  const { rows } = await pool.query(
    `
      SELECT id, first_name, last_name, email
      FROM users
      ORDER BY id
      LIMIT 9
    `
  );

  if (rows.length === 0) {
    return [];
  }

  return rows.map((user, index) => {
    const template = reportTemplates[index % reportTemplates.length];
    const baseCode = index < reportTemplates.length ? `R-23${index + 1}` : `R-${800 + user.id}`;
    return {
      code: baseCode,
      severity: template.severity,
      interval: template.interval,
      message: template.buildMessage(user),
      userId: user.id,
    };
  });
};

const seedAdminData = async () => {
  const reportSeeds = await buildReportSeeds();

  if (reportSeeds.length > 0) {
    await Promise.all(
      reportSeeds.map((seed) =>
        pool.query(
          `
            INSERT INTO admin_reports (code, message, severity, created_at, user_id)
            VALUES ($1, $2, $3, NOW() - $4::interval, $5)
            ON CONFLICT (code) DO UPDATE
              SET message = EXCLUDED.message,
                  severity = EXCLUDED.severity,
                  user_id = EXCLUDED.user_id
          `,
          [seed.code, seed.message, seed.severity, seed.interval, seed.userId]
        )
      )
    );

    const uniqueFlaggedIds = Array.from(new Set(reportSeeds.map((seed) => seed.userId)));
    await pool.query(
      `
        UPDATE admin_user_profiles
        SET status = 'Flagged'
        WHERE user_id = ANY($1::int[])
      `,
      [uniqueFlaggedIds]
    );

    await pool.query(
      `
        UPDATE admin_user_profiles
        SET status = 'Active'
        WHERE status = 'Flagged'
          AND user_id NOT IN (SELECT DISTINCT user_id FROM admin_reports WHERE user_id IS NOT NULL)
      `
    );
  }

  await pool.query(
    `
      INSERT INTO admin_tasks (code, label, due_date, priority, created_at)
      VALUES
        ('T-14', 'Audit weekly meal plan templates.', CURRENT_DATE, 'High', NOW()),
        ('T-09', 'Approve registered dietitian applications.', CURRENT_DATE + INTERVAL '1 day', 'Medium', NOW()),
        ('T-03', 'Publish seasonal tips newsletter.', CURRENT_DATE + INTERVAL '2 day', 'Low', NOW())
      ON CONFLICT (code) DO NOTHING
    `
  );

  await pool.query(
    `
      INSERT INTO admin_broadcasts (message, created_at)
      SELECT seed.message, seed.created_at
      FROM (VALUES
        ('Remember to review allergy alerts before publishing meal plans.', NOW() - INTERVAL '3 day'),
        ('New seasonal recipes are ready for approval.', NOW() - INTERVAL '2 day'),
        ('Weekly wellness newsletter draft needs feedback by Friday.', NOW() - INTERVAL '1 day')
      ) AS seed(message, created_at)
      WHERE NOT EXISTS (SELECT 1 FROM admin_broadcasts)
    `
  );

  await pool.query(
    `
      INSERT INTO admin_user_profiles (user_id, status, goal, last_login)
      SELECT id, 'Active', 'maintain', NOW() - INTERVAL '1 day'
      FROM users
      WHERE id NOT IN (SELECT user_id FROM admin_user_profiles)
    `
  );
};
const ensureAdminReportSchema = async () => {
  await pool.query(
    `
      ALTER TABLE admin_reports
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
    `
  );
};
const ensureInitialAdmin = async () => {
  const existingAdmin = await pool.query('SELECT id FROM users WHERE is_admin = true LIMIT 1');
  if (existingAdmin.rowCount === 0) {
    const firstUser = await pool.query('SELECT id FROM users ORDER BY id LIMIT 1');
    if (firstUser.rowCount > 0) {
      await pool.query('UPDATE users SET is_admin = true WHERE id = $1', [firstUser.rows[0].id]);
    }
  }
};

const initializeAdminTables = async () => {
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false');
  await Promise.all(TABLE_INIT_QUERIES.map((query) => pool.query(query)));
  await ensureAdminReportSchema();
  await ensureInitialAdmin();
  await seedAdminData();
};

initializeAdminTables().catch((error) => {
  console.error('Failed to initialise admin tables', error);
});

const normalizePriority = (priority) => {
  if (!priority) return 'Medium';
  const lower = priority.trim().toLowerCase();
  if (lower.startsWith('h')) return 'High';
  if (lower.startsWith('l')) return 'Low';
  return 'Medium';
};

const computeStats = async () => {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*)::INT FROM users) AS total,
      (SELECT COUNT(*)::INT FROM admin_user_profiles WHERE status = 'Active') AS active,
      (SELECT COUNT(*)::INT FROM admin_user_profiles WHERE status = 'Pending') AS pending,
      (SELECT COUNT(*)::INT FROM admin_reports) AS flagged
  `);
  return rows[0] || { total: 0, active: 0, pending: 0, flagged: 0 };
};

const ensureUserProfile = async (userId) => {
  await pool.query(
    `
      INSERT INTO admin_user_profiles (user_id, status, goal)
      VALUES ($1, 'Pending', 'maintain')
      ON CONFLICT (user_id) DO NOTHING
    `,
    [userId]
  );
};

const mapUserRow = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  goal: row.goal ?? 'maintain',
  status: row.status ?? 'Pending',
  lastLogin: row.last_login ? new Date(row.last_login).toISOString() : null,
});

const getUserSummary = async (userId) => {
  const { rows } = await pool.query(
    `
      SELECT
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        u.email,
        p.goal,
        p.status,
        p.last_login
      FROM users u
      LEFT JOIN admin_user_profiles p ON p.user_id = u.id
      WHERE u.id = $1
    `,
    [userId]
  );

  return rows[0] ? mapUserRow(rows[0]) : null;
};

const ensureProfilesForNewUsers = async () => {
  await pool.query(`
    INSERT INTO admin_user_profiles (user_id, status, goal)
    SELECT id, 'Pending', 'maintain'
    FROM users
    WHERE id NOT IN (SELECT user_id FROM admin_user_profiles)
  `);
};

const fetchDashboardData = async () => {
  await ensureInitialAdmin();
  await ensureProfilesForNewUsers();
  await seedAdminData();

  const [
    stats,
    usersResult,
    reportsResult,
    tasksResult,
    broadcastsResult,
  ] = await Promise.all([
    computeStats(),
    pool.query(
      `
        SELECT
          u.id,
          CONCAT(u.first_name, ' ', u.last_name) AS name,
          u.email,
          COALESCE(p.goal, 'maintain') AS goal,
          COALESCE(p.status, 'Pending') AS status,
          p.last_login
        FROM users u
        LEFT JOIN admin_user_profiles p ON p.user_id = u.id
        ORDER BY u.last_name, u.first_name
      `
    ),
    pool.query(
      `
        SELECT
          r.code,
          r.message,
          r.severity,
          r.created_at,
          r.user_id,
          u.first_name,
          u.last_name,
          u.email
        FROM admin_reports r
        LEFT JOIN users u ON u.id = r.user_id
        ORDER BY r.created_at DESC
      `
    ),
    pool.query(
      `
        SELECT code, label, due_date, priority
        FROM admin_tasks
        ORDER BY COALESCE(due_date, CURRENT_DATE + INTERVAL '365 day'), created_at
      `
    ),
    pool.query(
      `
        SELECT id, message, created_at
        FROM admin_broadcasts
        ORDER BY created_at DESC
      `
    ),
  ]);

  const flaggedUserIds = new Set(
    reportsResult.rows
      .map((row) => (row.user_id == null ? null : Number(row.user_id)))
      .filter((value) => Number.isInteger(value))
  );

  const users = usersResult.rows.map((row) => {
    const mapped = mapUserRow(row);
    if (flaggedUserIds.has(mapped.id)) {
      mapped.status = 'Flagged';
    }
    return mapped;
  });

  const usersById = new Map(users.map((user) => [user.id, user]));

  const reports = reportsResult.rows.map((row) => {
    const userId = row.user_id == null ? null : Number(row.user_id);
    const linkedUser = userId ? usersById.get(userId) : null;
    const fallbackName = [row.first_name, row.last_name].filter(Boolean).join(' ').trim();

    return {
      id: row.code,
      message: row.message,
      severity: row.severity,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      user: linkedUser
        ? { id: linkedUser.id, name: linkedUser.name, email: linkedUser.email }
        : userId
          ? {
              id: userId,
              name: fallbackName || null,
              email: row.email || null,
            }
          : null,
    };
  });

  const tasks = tasksResult.rows.map((row) => ({
    id: row.code,
    label: row.label,
    due: row.due_date ? new Date(row.due_date).toISOString() : null,
    priority: row.priority,
  }));
  const broadcasts = broadcastsResult.rows.map((row) => ({
    id: row.id,
    message: row.message,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }));

  return { stats, users, reports, tasks, broadcasts };
};
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { rows } = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    if (rows.length === 0 || rows[0].is_admin !== true) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/dashboard', async (req, res, next) => {
  try {
    const data = await fetchDashboardData();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/broadcasts', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `
        SELECT id, message, created_at
        FROM admin_broadcasts
        ORDER BY created_at DESC
      `
    );
    const broadcasts = rows.map((row) => ({
      id: row.id,
      message: row.message,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    }));
    return res.json({ broadcasts });
  } catch (error) {
    return next(error);
  }
});

router.post('/broadcasts', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Broadcast message is required.' });
    }

    const trimmed = message.trim();
    const { rows } = await pool.query(
      `
        INSERT INTO admin_broadcasts (message)
        VALUES ($1)
        RETURNING id, message, created_at
      `,
      [trimmed]
    );

    const broadcast = {
      id: rows[0].id,
      message: rows[0].message,
      createdAt: rows[0].created_at ? new Date(rows[0].created_at).toISOString() : null,
    };

    return res.status(201).json({ message: 'Broadcast scheduled successfully.', broadcast });
  } catch (error) {
    return next(error);
  }
});

router.post('/invitations', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'An email address is required.' });
    }

    const trimmed = email.trim().toLowerCase();
    const { rows } = await pool.query(
      `
        INSERT INTO admin_invitations (email)
        VALUES ($1)
        ON CONFLICT (email) DO NOTHING
        RETURNING id, email, created_at
      `,
      [trimmed]
    );

    if (rows.length === 0) {
      return res.status(200).json({ message: 'Invitation already exists for this email.' });
    }

    return res.status(201).json({ message: 'Invitation sent to nutritionist.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/tasks', async (req, res, next) => {
  try {
    const { label, due, priority } = req.body;
    if (!label || !label.trim()) {
      return res.status(400).json({ error: 'Task label is required.' });
    }

    const dueDate = due ? new Date(due) : new Date();
    if (Number.isNaN(dueDate.getTime())) {
      return res.status(400).json({ error: 'Invalid due date.' });
    }
    const code = `T-${Date.now()}`;
    const normalizedPriority = normalizePriority(priority);

    const { rows } = await pool.query(
      `
        INSERT INTO admin_tasks (code, label, due_date, priority)
        VALUES ($1, $2, $3, $4)
        RETURNING code, label, due_date, priority
      `,
      [code, label.trim(), dueDate, normalizedPriority]
    );

    return res.status(201).json({
      message: 'Task added to operations board.',
      task: {
        id: rows[0].code,
        label: rows[0].label,
        due: rows[0].due_date ? new Date(rows[0].due_date).toISOString() : null,
        priority: rows[0].priority,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/users/:userId/review', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await ensureUserProfile(userId);
    await pool.query(
      `
        UPDATE admin_user_profiles
        SET status = 'Active', last_login = NOW()
        WHERE user_id = $1
      `,
      [userId]
    );

    const [user, stats] = await Promise.all([getUserSummary(userId), computeStats()]);

    return res.json({
      message: user ? `Review completed for ${user.name}.` : 'Review completed.',
      user,
      stats,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/users/:userId/impersonate', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    const { rows } = await pool.query('SELECT id, first_name, last_name FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = rows[0];
    return res.json({
      message: `Impersonation token issued for ${user.first_name} ${user.last_name}.`,
      token: `impersonation-${user.id}-${Date.now()}`,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/users/:userId/reset-password', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await ensureUserProfile(userId);
    await pool.query(
      `
        UPDATE admin_user_profiles
        SET status = 'Pending'
        WHERE user_id = $1
      `,
      [userId]
    );

    const [user, stats] = await Promise.all([getUserSummary(userId), computeStats()]);

    return res.json({
      message: user ? `Password reset link sent to ${user.email}.` : 'Password reset link issued.',
      user,
      stats,
    });
  } catch (error) {
    return next(error);
  }
});

router.delete('/reports/:reportId', async (req, res, next) => {
  try {
    const reportId = req.params.reportId;
    const reportLookup = await pool.query('SELECT user_id FROM admin_reports WHERE code = $1', [reportId]);

    if (reportLookup.rowCount === 0) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const userId = reportLookup.rows[0].user_id ? Number(reportLookup.rows[0].user_id) : null;
    await pool.query('DELETE FROM admin_reports WHERE code = $1', [reportId]);

    if (userId) {
      await pool.query(
        `
          UPDATE admin_user_profiles
          SET status = CASE
            WHEN EXISTS (SELECT 1 FROM admin_reports WHERE user_id = $1)
              THEN 'Flagged'
            ELSE 'Active'
          END
          WHERE user_id = $1
        `,
        [userId]
      );
    }

    const [stats, user] = await Promise.all([
      computeStats(),
      userId ? getUserSummary(userId) : Promise.resolve(null),
    ]);

    return res.json({ message: 'Report resolved.', stats, user });
  } catch (error) {
    return next(error);
  }
});
router.delete('/tasks/:taskId', async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const result = await pool.query('DELETE FROM admin_tasks WHERE code = $1', [taskId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    return res.json({ message: 'Task removed.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

