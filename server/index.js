const express = require('express');
const cors = require('cors');
const announcementsRoutes = require('./routes/announcements');
const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meal');
const bmiRoutes = require('./routes/bmi');
const adminRoutes = require('./routes/admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/meal', mealRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/bmi', bmiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
