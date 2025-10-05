// routes/mealPlan.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const generateMealPlan = require("../utils/openai");

// GET /api/meal/generate
router.get("/generate", authMiddleware, async (req, res) => {
  const { goal = "maintain", dietary_preference = "", allergies = "" } = req.query;

  try {
    const plan = await generateMealPlan({ goal, dietary_preference, allergies });

    if (!plan) {
      return res.status(500).json({ error: "Meal plan generation failed" });
    }

    res.json({ plan });
  } catch (err) {
    console.error("❌ Server error in /api/meal/generate:", err.message);
    res.status(500).json({ error: "Server error while generating meal plan" });
  }
});

module.exports = router;
