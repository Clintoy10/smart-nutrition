import { useState } from 'react';
import Navbar from '../components/Navbar';
import BMICalculator from '../components/BMICalculator';
import MealPlan from '../components/MealPlan';

const HomePage = () => {
  // const navigate = useNavigate();
  const [bmi, setBmi] = useState(null);
  const [status, setStatus] = useState('');

  const getGoalFromStatus = (bmiStatus) => {
    if (bmiStatus === 'Underweight') return 'gain';
    if (bmiStatus === 'Normal') return 'maintain';
    return 'lose';
  };

  const goal = getGoalFromStatus(status);

  return (
    <div style={{ backgroundColor: '#f0f9f4', minHeight: '100vh' }}>
      <Navbar />

      <div className="container py-4">
        <h1 className="fw-bold mb-4 text-success">BMI Calculator</h1>

        <BMICalculator bmi={bmi} status={status} setBmi={setBmi} setStatus={setStatus} />

        {bmi && (
          <>
            <div id="features" className="mt-4">
              <MealPlan
                bmi={bmi}
                goal={goal}
                dietaryPreference="vegetarian"
                allergies="peanuts"
              />
            </div>

            <div className="alert alert-success mt-4" role="alert">
              <h5 className="mb-1">🧠 Personalized Goal</h5>
              <p className="mb-0">
                <strong>Based on your BMI:</strong>{' '}
                <span className="text-capitalize">{status}</span><br />
                <strong>Recommended Goal:</strong>{' '}
                <span className="text-capitalize">{goal}</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
