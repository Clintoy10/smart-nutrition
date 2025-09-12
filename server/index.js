const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meal');
const bmiRoutes = require('./routes/bmi');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/meal', mealRoutes);
app.use('/api/bmi', bmiRoutes);

app.use('/api/auth', authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
