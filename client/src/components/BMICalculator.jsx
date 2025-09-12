import { useState } from 'react';

const BMICalculator = ({ bmi, status, setBmi, setStatus }) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [mealPlan, setMealPlan] = useState([]);
  const [exercisePlan, setExercisePlan] = useState([]);

  const getSuggestions = (bmiValue) => {
    if (bmiValue < 18.5) {
      setMealPlan(['Add protein-rich foods', 'Healthy fats like avocado', 'Eat more frequently']);
      setExercisePlan(['Light strength training', 'Yoga', 'Stretching']);
      return 'Underweight';
    } else if (bmiValue < 25) {
      setMealPlan(['Balanced diet with veggies', 'Stay hydrated', 'Moderate portions']);
      setExercisePlan(['Brisk walking', 'Cardio 30 mins/day', 'Light weights']);
      return 'Normal';
    } else if (bmiValue < 30) {
      setMealPlan(['Reduce sugar', 'More vegetables & fiber', 'Control portions']);
      setExercisePlan(['Daily cardio', 'Strength training', 'HIIT']);
      return 'Overweight';
    } else {
      setMealPlan(['Low-carb meals', 'Vegetables & lean proteins', 'Avoid fried foods']);
      setExercisePlan(['Walking 1hr/day', 'Low-impact cardio', 'Supervised training']);
      return 'Obese';
    }
  };

  const calculateBMI = (e) => {
    e.preventDefault();
    if (!height || !weight) return;

    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);
    const fixedBMI = parseFloat(bmiValue.toFixed(2));
    setBmi(fixedBMI);

    const result = getSuggestions(bmiValue);
    setStatus(result);
  };

  return (
    <div className="container mt-5 mb-5">
      <div
        className="card shadow p-4 mx-auto"
        style={{
          maxWidth: '600px',
          borderRadius: '20px',
          backgroundColor: '#e8f5e9',
          border: '1px solid #c8e6c9',
        }}
      >
        <h3 className="mb-4 text-center fw-bold" style={{ color: '#2e7d32' }}>
          🍀 BMI Calculator
        </h3>

        <form onSubmit={calculateBMI}>
          <div className="mb-3">
            <label className="form-label fw-semibold">📏 Height (cm)</label>
            <input
              type="number"
              className="form-control"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 170"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">⚖️ Weight (kg)</label>
            <input
              type="number"
              className="form-control"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 65"
              required
            />
          </div>
          <button
            type="submit"
            className="btn w-100 fw-bold"
            style={{ backgroundColor: '#66bb6a', color: '#fff', border: 'none' }}
          >
            Calculate BMI
          </button>
        </form>

        {bmi && (
          <div
            className="alert mt-4"
            style={{
              backgroundColor: '#f1f8e9',
              border: '1px solid #c5e1a5',
              borderRadius: '12px',
              animation: 'fadeIn 0.5s ease-in-out',
            }}
          >
            <h5 className="text-success">💡 Result</h5>
            <p><strong>BMI:</strong> {bmi}</p>
            <p><strong>Status:</strong> {status}</p>

            <h6 className="mt-3">🥗 Meal Suggestions</h6>
            <ul className="mb-2">
              {mealPlan.map((item, i) => (
                <li key={i}><i className="bi bi-check-circle text-success me-2"></i>{item}</li>
              ))}
            </ul>

            <h6 className="mt-3">🏃 Exercise Suggestions</h6>
            <ul>
              {exercisePlan.map((item, i) => (
                <li key={i}><i className="bi bi-heart-pulse-fill text-danger me-2"></i>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BMICalculator;
