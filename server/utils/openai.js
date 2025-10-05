// utils/openai.js
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Normalize weird inputs like "gpt=5", "GPT 5", "gpt5" → "gpt-5"
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

function buildMessages({ goal, dietary_preference, allergies }) {
  return [
    {
      role: "system",
      content:
        "You are a nutritionist. Always return ONLY a JSON object with keys: 'breakfast', 'lunch', 'dinner', 'snacks' (arrays of strings). No extra text."
    },
    {
      role: "user",
      content: `Generate a one-day meal plan for:
- Goal: ${goal}
- Dietary preference: ${dietary_preference || "none"}
- Allergies: ${allergies || "none"}

Return exact JSON:
{
  "breakfast": ["..."],
  "lunch": ["..."],
  "dinner": ["..."],
  "snacks": ["..."]
}`
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

async function generateMealPlan({ goal, dietary_preference, allergies }) {
  try {
    const messages = buildMessages({ goal, dietary_preference, allergies });

    const payload = {
      model: MODEL,
      messages,
      response_format: { type: "json_object" } // ask the API for strict JSON
    };

    // Only include temperature if the chosen model supports it and you configured one
    if (!NO_TEMP_MODELS.test(MODEL) && process.env.OPENAI_TEMPERATURE) {
      const t = Number(process.env.OPENAI_TEMPERATURE);
      if (!Number.isNaN(t)) payload.temperature = t;
    }

    const response = await client.chat.completions.create(payload);
    const raw = response.choices?.[0]?.message?.content?.trim() || "";

    const parsed = tryParseJson(raw);
    if (parsed) return parsed;

    console.warn("⚠️ Failed to parse AI JSON. Raw:", raw);
    return { error: "Invalid AI format", raw };
  } catch (err) {
    const apiMsg = err?.error?.message || err?.message || String(err);
    console.error("❌ OpenAI API error:", apiMsg);
    throw new Error("Meal plan generation failed");
  }
}

module.exports = generateMealPlan;
