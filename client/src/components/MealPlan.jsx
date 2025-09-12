import { useEffect, useState } from 'react';
import axios from 'axios';

const MealPlan = ({ goal, dietaryPreference, allergies }) => {
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/meal/generate', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            goal,
            dietary_preference: dietaryPreference,
            allergies,
          },
        });

        setMealPlan(response.data.plan);
      } catch (err) {
        console.error('Error fetching meal plan:', err);
        setError('Failed to fetch meal plan. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, [goal, dietaryPreference, allergies]);

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
        🥗 7-Day Personalized Meal Plan
      </h4>

      <p className="text-muted text-center mb-4">
        <strong>Goal:</strong> {goal.charAt(0).toUpperCase() + goal.slice(1)} &nbsp;|&nbsp;
        <strong>Preference:</strong> {dietaryPreference || 'None'} &nbsp;|&nbsp;
        <strong>Allergies:</strong> {allergies || 'None'}
      </p>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : (
        <div>
          {mealPlan.map((day, i) => (
            <div
              key={i}
              className="mb-3 p-3 rounded"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #c5e1a5',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <h6 style={{ color: '#689f38' }}>{day.day}</h6>
              <ul className="mb-0 ps-3">
                <li><strong>Breakfast:</strong> {day.meals.breakfast}</li>
                <li><strong>Lunch:</strong> {day.meals.lunch}</li>
                <li><strong>Dinner:</strong> {day.meals.dinner}</li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealPlan;
