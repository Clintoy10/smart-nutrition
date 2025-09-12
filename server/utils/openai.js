const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateMealPlan({ goal, dietary_preference, allergies }) {
  const prompt = `
You are a certified nutritionist AI. Create a personalized 7-day meal plan with 3 meals per day (Breakfast, Lunch, Dinner) for a person who wants to "${goal}" weight.
Dietary preference: ${dietary_preference || 'None'}
Allergies to avoid: ${allergies || 'None'}

Format your response in JSON as:
[
  {
    "day": "Monday",
    "meals": {
      "breakfast": "...",
      "lunch": "...",
      "dinner": "..."
    }
  },
  ...
]
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  const raw = response.choices[0].message.content.trim();

  // Remove ```json and ``` if wrapped in markdown
  const cleaned = raw.replace(/^```json\s*|\s*```$/g, '').trim();

  try {
    const plan = JSON.parse(cleaned);
    return plan;
  } catch (e) {
    console.error('Error parsing AI response:', e.message);
    return null;
  }
}

module.exports = generateMealPlan;
