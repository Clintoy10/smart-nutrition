import { useEffect, useState } from 'react';
import { API } from '../api';

const MEAL_KEYS = [
  ['breakfast', 'Breakfast'],
  ['lunch', 'Lunch'],
  ['dinner', 'Dinner'],
  ['snacks', 'Snacks'],
];

const FALLBACK_PLAN = [
  {
    day: 'Day 1',
    calories: 1850,
    meals: {
      breakfast: ['Brown sinangag with scrambled egg whites, tomatoes, and malunggay'],
      lunch: ['Steamed fish fillet with calamansi, blanched kangkong, and red rice'],
      dinner: ['Chicken tinola with sayote, malunggay, and brown rice'],
      snacks: ['Fresh papaya slices with chia seeds'],
    },
  },
  {
    day: 'Day 2',
    calories: 1800,
    meals: {
      breakfast: ['Overnight oats with mango, toasted pinipig, and coconut yogurt'],
      lunch: ['Ginisang monggo with ampalaya leaves served over adlai'],
      dinner: ['Inihaw na bangus belly with ensaladang talong'],
      snacks: ['Cucumber sticks with calamansi yogurt dip'],
    },
  },
  {
    day: 'Day 3',
    calories: 1900,
    meals: {
      breakfast: ['Taho-inspired soy pudding with arnibal made from muscovado and topped with sago and langka'],
      lunch: ['Pinakbet with squash, sitaw, okra, and lean pork tenderloin'],
      dinner: ['Grilled chicken inasal breast with laing and red rice'],
      snacks: ['Banana saba slices with peanut butter'],
    },
  },
  {
    day: 'Day 4',
    calories: 1950,
    meals: {
      breakfast: ['Whole-wheat pandesal with kesong puti, kamatis, and lettuce'],
      lunch: ['Lentil and malunggay lugaw with boiled egg and calamansi'],
      dinner: ['Pork sinigang sa bayabas with lots of kangkong, labanos, and okra'],
      snacks: ['Roasted chickpeas seasoned adobo-style'],
    },
  },
  {
    day: 'Day 5',
    calories: 1850,
    meals: {
      breakfast: ['Vegetable omelette with talbos ng kamote and onions, served with brown rice'],
      lunch: ['Tinapang salmon salad with mixed greens, singkamas, and pineapple vinaigrette'],
      dinner: ['Ginataang kalabasa at sitaw with grilled tilapia'],
      snacks: ['Buko pandan chia pudding'],
    },
  },
  {
    day: 'Day 6',
    calories: 2000,
    meals: {
      breakfast: ['Champorado made with tablea, low-fat milk, and topped with toasted coconut'],
      lunch: ['Chicken adobo sa gata with pechay and red rice'],
      dinner: ['Adobong pusit with sauteed sayote tops'],
      snacks: ['Kamote fries baked with olive oil'],
    },
  },
  {
    day: 'Day 7',
    calories: 1825,
    meals: {
      breakfast: ['Lugaw topped with shredded chicken, ginger, and crispy garlic'],
      lunch: ['Bistek Tagalog using lean beef, caramelized onions, and blanched bok choy'],
      dinner: ['Vegetable stir-fry with tofu, broccoli, carrots, and brown rice'],
      snacks: ['Fresh mango and pineapple fruit cup'],
    },
  },
];

const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => Boolean(item && String(item).trim()));
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/) // split on line breaks or commas
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [String(value).trim()].filter(Boolean);
};

const normalizeCalories = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  const match = String(value).match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed);
};

const normalizeEntry = (entry, index) => {
  if (!entry || typeof entry !== 'object') {
    return {
      title: `Day ${index + 1}`,
      calories: null,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      },
    };
  }

  const meals = entry.meals && typeof entry.meals === 'object' ? entry.meals : entry;
  const calories = normalizeCalories(entry.calories ?? entry.totalCalories ?? entry.kcal);

  return {
    title: entry.day || `Day ${index + 1}`,
    calories,
    meals: {
      breakfast: ensureArray(meals.breakfast),
      lunch: ensureArray(meals.lunch),
      dinner: ensureArray(meals.dinner),
      snacks: ensureArray(meals.snacks),
    },
  };
};

const normalizePlan = (rawPlan) => {
  if (!rawPlan) {
    return [];
  }

  // Handle common shapes: array of days, { days: [...] }, or { plan: { days: [...] } }
  const daysArray =
    (rawPlan && typeof rawPlan === 'object' && Array.isArray(rawPlan.days) && rawPlan.days) ||
    (rawPlan &&
      typeof rawPlan === 'object' &&
      rawPlan.plan &&
      typeof rawPlan.plan === 'object' &&
      Array.isArray(rawPlan.plan.days) &&
      rawPlan.plan.days);

  if (daysArray) {
    return daysArray.map((entry, index) => normalizeEntry(entry, index));
  }

  if (Array.isArray(rawPlan)) {
    return rawPlan.map((entry, index) => normalizeEntry(entry, index));
  }

  if (typeof rawPlan === 'object') {
    return [normalizeEntry(rawPlan, 0)];
  }

  return [];
};

const deriveDefaultCalories = (goal, calorieTarget) => {
  const parsedTarget = normalizeCalories(calorieTarget);
  if (parsedTarget) return parsedTarget;

  const g = (goal || '').toLowerCase();
  if (g === 'gain') return 2200;
  if (g === 'lose') return 1700;
  return 1900; // maintain or unknown
};

const MealPlan = ({
  goal,
  dietaryPreference,
  allergies,
  foodPreferences,
  riskyFoods,
  bodyType,
  bodyGoal,
  calorieTarget,
}) => {
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fallbackCalories = deriveDefaultCalories(goal, calorieTarget);

    const fetchMealPlan = async () => {
      setLoading(true);
      setError('');
      setWarning('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to generate a meal plan.');
        setMealPlan([]);
        setLoading(false);
        return;
      }

      try {
        const { data } = await API.get('/meal/generate', {
          params: {
            goal: goal || 'maintain',
            dietary_preference: dietaryPreference || '',
            allergies: allergies || '',
            food_preferences: foodPreferences ?? dietaryPreference ?? '',
            risky_foods: riskyFoods ?? allergies ?? '',
            body_type: bodyType || '',
            body_goal: bodyGoal ?? goal ?? '',
            calorie_target: calorieTarget || '',
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cancelled) {
          return;
        }

        const payload = data?.plan ?? data;
        const normalized = normalizePlan(payload).map((day) => ({
          ...day,
          calories: normalizeCalories(day.calories) ?? fallbackCalories,
        }));
        setMealPlan(normalized);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error('Meal generation failed:', err);
        const status = err?.response?.status;
        const serverMessage = err?.response?.data?.error;

        if (status === 401) {
          setError('Your session expired. Please log in again to generate a meal plan.');
          setMealPlan([]);
          return;
        }

        setWarning(
          serverMessage
            ? `${serverMessage}. Showing a sample plan you can use right away.`
            : 'We could not reach the meal service. Here is a sample 7-day plan you can use right away.'
        );
        setMealPlan(
          normalizePlan(FALLBACK_PLAN).map((day) => ({
            ...day,
            calories: normalizeCalories(day.calories) ?? fallbackCalories,
          }))
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMealPlan();

    return () => {
      cancelled = true;
    };
  }, [goal, dietaryPreference, allergies, foodPreferences, riskyFoods, bodyType, bodyGoal, calorieTarget]);

  const renderMealItems = (items) =>
    items.length > 0 ? items.join(', ') : 'Not specified';

  const renderCalories = (value) => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return `~${value.toLocaleString()} kcal`;
    }
    return 'Calories not provided';
  };

  const renderCalorieTarget = (value) => {
    const normalized = normalizeCalories(value);
    if (normalized) {
      return `${normalized.toLocaleString()} kcal`;
    }
    return value ? String(value) : 'Not set';
  };

  return (
    <div
      className="card shadow p-4 mx-auto mb-4"
      style={{
        maxWidth: '600px',
        borderRadius: '16px',
        backgroundColor: '#f9fbe7',
        border: '1px solid #dce775',
      }}
    >
      <h4 className="text-center mb-3" style={{ color: '#558b2f' }}>
        Personalized Meal Plan
      </h4>

      <p className="text-muted text-center mb-2">
        <strong>Goal:</strong>{' '}
        {goal ? goal.charAt(0).toUpperCase() + goal.slice(1) : 'Unknown'} &nbsp;|&nbsp;
        <strong>Body goal:</strong>{' '}
        {bodyGoal ? bodyGoal.charAt(0).toUpperCase() + bodyGoal.slice(1) : 'Not set'}{' '}
        &nbsp;|&nbsp;
        <strong>Body type:</strong> {bodyType || 'Not set'} &nbsp;|&nbsp;
        <strong>Calorie target:</strong> {renderCalorieTarget(calorieTarget)}
      </p>
      <p className="text-muted text-center mb-4">
        <strong>Dietary preference:</strong> {dietaryPreference || 'None'} &nbsp;|&nbsp;
        <strong>Food prefs:</strong> {foodPreferences ?? dietaryPreference ?? 'None'}{' '}
        &nbsp;|&nbsp;
        <strong>Allergies / risky foods:</strong> {riskyFoods ?? allergies ?? 'None'}
      </p>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : (
        <>
          {warning && <p className="text-warning text-center fw-semibold">{warning}</p>}

          {mealPlan.length > 0 ? (
            <div>
              {mealPlan.map((day, index) => (
                <div
                  key={`${day.title}-${index}`}
              className="mb-3 p-3 rounded"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #c5e1a5',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h6 className="mb-0" style={{ color: '#689f38' }}>
                  {day.title || `Day ${index + 1}`}
                </h6>
                <span
                  className="badge rounded-pill"
                  style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}
                >
                  {renderCalories(day.calories)}
                </span>
              </div>
              <ul className="mb-0 ps-3">
                {MEAL_KEYS.map(([key, label]) => (
                  <li key={key}>
                    <strong>{label}:</strong> {renderMealItems(day.meals[key] || [])}
                  </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">No meal plan available.</p>
          )}
        </>
      )}
    </div>
  );
};

export default MealPlan;
