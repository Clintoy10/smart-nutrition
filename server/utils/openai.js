// utils/openai.js
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Normalize weird inputs like "gpt=5", "GPT 5", "gpt5" -> "gpt-5"
function normalizeModel(name) {
  if (!name) return null;
  const n = String(name).trim().toLowerCase();
  if (n === "gpt=5" || n === "gpt5" || n === "gpt 5") return "gpt-5";
  return n;
}

const DEFAULT_MODEL = "gpt-5";
const MODEL = normalizeModel(process.env.OPENAI_MODEL) || DEFAULT_MODEL;

// Families that reject custom temperature (keep it off)
const NO_TEMP_MODELS = /^(gpt-5|gpt-4o(\b|-)|o4(\b|-)|gpt-4\.1)/i;

function buildMessages({
  goal,
  dietary_preference,
  allergies,
  food_preferences,
  risky_foods,
  body_type,
  body_goal,
  calorie_target,
}) {
  return [
    {
      role: "system",
      content:
        "You are a nutritionist specializing in healthy Filipino cuisine. Always return ONLY a JSON object with a single key 'days'. The value must be an array of exactly 7 day objects. Each day object must include a 'day' string, a 'calories' number representing the approximate total calories for that day, and a 'meals' object. The 'meals' object must include 'breakfast', 'lunch', 'dinner', and 'snacks' arrays of meal strings that highlight nutrient-dense Filipino dishes using lean proteins, vegetables, fruits, and whole grains. Honor the stated goal, dietary preference, food preferences, body type, body goal, and allergies. Avoid risky foods or disease triggers provided by the user. Keep calories realistic (generally 1,500-2,300 kcal unless the goal or a calorie target suggests otherwise). No extra keys or narration."
    },
    {
      role: "user",
      content: `Generate a 7-day meal plan for:
- Goal: ${goal}
- Dietary preference: ${dietary_preference || "none"}
- Allergies: ${allergies || "none"}
- Food preferences: ${food_preferences || "none"}
- Risky foods / disease considerations: ${risky_foods || "none"}
- Body type: ${body_type || "unspecified"}
- Body goal: ${body_goal || goal || "unspecified"}
- Calorie target (per day): ${calorie_target || "use a balanced target"}

Focus on wholesome Filipino dishes--plenty of vegetables, fruits, legumes, lean meats or seafood, brown rice, adlai, and minimal added sugar--while aligning with the goal, dietary preference, and allergies.
Reflect food preferences, avoid risky foods, and bias choices toward the stated body type and body goal. Keep daily calories close to the provided calorie target if given; otherwise stay sensible for the goal.

Return a JSON object that looks like:
{
  "days": [
    {
      "day": "Day 1",
      "calories": 1850,
      "meals": {
        "breakfast": ["Oatmeal with berries"],
        "lunch": ["Grilled chicken salad"],
        "dinner": ["Salmon with quinoa and broccoli"],
        "snacks": ["Greek yogurt with honey"]
      }
    }
  ]
}

Replace the example meals with the actual plan, provide exactly 7 sequential days (Day 1 through Day 7), and ensure every meal array contains one or more meal strings.`
    }
  ];
}

// Robust JSON extractor (handles ```json fences, stray whitespace)
function tryParseJson(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : text;
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

const goalDefaults = {
  gain: 2200,
  lose: 1700,
  maintain: 1900
};

const coerceCalories = (value, fallback) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (value === null || value === undefined || value === "") {
    return fallback ?? null;
  }

  const match = String(value).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return fallback ?? null;

  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback ?? null;

  return Math.round(parsed);
};

const hydrateCalories = (plan, { goal, calorie_target }) => {
  const defaultCal = coerceCalories(
    calorie_target,
    goalDefaults[(goal || "").toLowerCase()] ?? 1900
  );

  const ensureDay = (day, index) => {
    if (!day || typeof day !== "object") return day;
    return {
      ...day,
      calories: coerceCalories(day.calories, defaultCal)
    };
  };

  if (Array.isArray(plan)) {
    return plan.map((day, idx) => ensureDay(day, idx));
  }

  if (plan && typeof plan === "object" && Array.isArray(plan.days)) {
    return {
      ...plan,
      days: plan.days.map((day, idx) => ensureDay(day, idx))
    };
  }

  return plan;
};

async function generateMealPlan({
  goal,
  dietary_preference,
  allergies,
  food_preferences,
  risky_foods,
  body_type,
  body_goal,
  calorie_target,
}) {
  try {
    const messages = buildMessages({
      goal,
      dietary_preference,
      allergies,
      food_preferences,
      risky_foods,
      body_type,
      body_goal,
      calorie_target,
    });

    const responseFormat = {
      type: "json_schema",
      json_schema: {
        name: "weekly_meal_plan",
        schema: {
          type: "object",
          required: ["days"],
          additionalProperties: false,
          properties: {
            days: {
              type: "array",
              minItems: 7,
              maxItems: 7,
              items: {
                type: "object",
                required: ["day", "calories", "meals"],
                additionalProperties: false,
                properties: {
                  day: { type: "string" },
                  calories: { type: "number", minimum: 800, maximum: 4000 },
                  meals: {
                    type: "object",
                    required: ["breakfast", "lunch", "dinner", "snacks"],
                    additionalProperties: false,
                    properties: {
                      breakfast: { type: "array", items: { type: "string" } },
                      lunch: { type: "array", items: { type: "string" } },
                      dinner: { type: "array", items: { type: "string" } },
                      snacks: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            }
          }
        },
        strict: true
      }
    };

    const payload = {
      model: MODEL,
      messages,
      response_format: responseFormat
    };

    // Only include temperature if the chosen model supports it and you configured one
    if (!NO_TEMP_MODELS.test(MODEL) && process.env.OPENAI_TEMPERATURE) {
      const t = Number(process.env.OPENAI_TEMPERATURE);
      if (!Number.isNaN(t)) payload.temperature = t;
    }

    const response = await client.chat.completions.create(payload);
    const message = response.choices?.[0]?.message ?? {};

    if (message.parsed && typeof message.parsed === 'object') {
      return hydrateCalories(message.parsed.days ?? message.parsed, { goal, calorie_target });
    }

    const raw = Array.isArray(message.content)
      ? message.content
          .map((part) => {
            if (typeof part === 'string') return part;
            if (part && typeof part === 'object' && 'text' in part) return part.text;
            return '';
          })
          .join('')
          .trim()
      : (message.content ?? '').toString().trim();

    const parsed = tryParseJson(raw);
    if (parsed) {
      return hydrateCalories(parsed.days ?? parsed, { goal, calorie_target });
    }

    console.warn('Failed to parse AI JSON. Raw:', raw);
    return { error: 'Invalid AI format', raw };
  } catch (err) {
    const apiMsg = err?.error?.message || err?.message || String(err);
    console.error('OpenAI API error:', apiMsg);
    throw new Error("Meal plan generation failed");
  }
}

module.exports = generateMealPlan;









