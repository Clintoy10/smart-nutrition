import { useState } from 'react';

const BMICalculator = ({ bmi, status, setBmi, setStatus }) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [mealSuggestions, setMealSuggestions] = useState([]);
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);

  const getSuggestions = (bmiValue) => {
    if (bmiValue < 18.5) {
      setMealSuggestions([
        'Add protein-rich foods',
        'Include healthy fats such as avocado',
        'Eat small meals more frequently',
      ]);
      setExerciseSuggestions(['Light strength training', 'Yoga', 'Daily stretching']);
      return 'Underweight';
    }
    if (bmiValue < 25) {
      setMealSuggestions([
        'Maintain a balanced plate with vegetables',
        'Stay hydrated',
        'Keep portion sizes moderate',
      ]);
      setExerciseSuggestions(['Brisk walking', '30 minutes of cardio', 'Light weights']);
      return 'Normal';
    }
    if (bmiValue < 30) {
      setMealSuggestions([
        'Reduce added sugar',
        'Increase vegetables and fibre-rich foods',
        'Monitor portion sizes',
      ]);
      setExerciseSuggestions(['Daily cardio', 'Strength training', 'HIIT sessions']);
      return 'Overweight';
    }

    setMealSuggestions([
      'Prioritise lean proteins and vegetables',
      'Limit refined carbohydrates',
      'Avoid deep-fried foods',
    ]);
    setExerciseSuggestions([
      'Walk for at least an hour daily',
      'Low-impact cardio',
      'Work with a trainer if possible',
    ]);
    return 'Obese';
  };

  const calculateBMI = (e) => {
    e.preventDefault();
    if (!height || !weight) return;

    const heightInMeters = Number(height) / 100;
    const bmiValue = Number(weight) / (heightInMeters * heightInMeters);
    const fixedBMI = parseFloat(bmiValue.toFixed(2));
    setBmi(fixedBMI);

    const result = getSuggestions(bmiValue);
    setStatus(result);
  };

  return (
    <div className="mt-4 mb-5">
      <div
        className="card shadow p-4 mx-auto"
        style={{
          maxWidth: '600px',
          borderRadius: '20px',
          backgroundColor: '#e8f5e9',
          border: '1px solid #c8e6c9',
        }}
      >
        <h3
          className="mb-4 text-center fw-bold"
          style={{ color: '#2e7d32', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}
        >
          BMI Calculator
        </h3>

        <form onSubmit={calculateBMI}>
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="heightInput">
              Height (cm)
            </label>
            <input
              id="heightInput"
              type="number"
              className="form-control"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 170"
              min="0"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="weightInput">
              Weight (kg)
            </label>
            <input
              id="weightInput"
              type="number"
              className="form-control"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 65"
              min="0"
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
            <h5 className="text-success">Results</h5>
            <p className="mb-1">
              <strong>BMI:</strong> {bmi}
            </p>
            <p className="mb-3">
              <strong>Status:</strong> {status}
            </p>

            <h6 className="mt-3">Meal suggestions</h6>
            <ul className="mb-2">
              {mealSuggestions.map((item) => (
                <li key={item}>
                  <i className="bi bi-check-circle text-success me-2" />
                  {item}
                </li>
              ))}
            </ul>

            <h6 className="mt-3">Exercise suggestions</h6>
            <ul>
              {exerciseSuggestions.map((item) => (
                <li key={item}>
                  <i className="bi bi-heart-pulse-fill text-danger me-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BMICalculator;
