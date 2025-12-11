import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import BMICalculator from '../components/BMICalculator';
import MealPlan from '../components/MealPlan';
import { fetchProfile } from '../api';

const HomePage = () => {
  const [bmi, setBmi] = useState(null);
  const [status, setStatus] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileHint, setProfileHint] = useState('');

  const mergeWithCachedProfile = (incoming) => {
    if (!incoming) return null;
    const cachedRaw = localStorage.getItem('user');
    let cached = null;
    if (cachedRaw) {
      try {
        cached = JSON.parse(cachedRaw);
      } catch {
        cached = null;
      }
    }

    return {
      ...incoming,
      bodyType: incoming.bodyType ?? cached?.bodyType ?? '',
      calorieTarget: incoming.calorieTarget ?? cached?.calorieTarget ?? '',
    };
  };

  const getGoalFromStatus = (bmiStatus) => {
    if (bmiStatus === 'Underweight') return 'gain';
    if (bmiStatus === 'Normal') return 'maintain';
    if (!bmiStatus) return '';
    return 'lose';
  };

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setProfile(null);
        setProfileHint('');
        return;
      }

      try {
        const { data } = await fetchProfile();
        if (cancelled) {
          return;
        }

        if (data?.user) {
          const merged = mergeWithCachedProfile(data.user);
          setProfile(merged);
          setProfileHint('');
          localStorage.setItem('user', JSON.stringify(merged));
        }
      } catch (error) {
        console.error('Failed to load profile for meal plan', error);
        if (cancelled) {
          return;
        }

        const cached = localStorage.getItem('user');
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
            setProfileHint('Using your last saved profile details.');
          } catch (parseError) {
            console.error('Failed to parse cached profile', parseError);
            localStorage.removeItem('user');
            setProfile(null);
            setProfileHint('');
          }
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const recommendedGoal = getGoalFromStatus(status);
  const planGoal = profile?.goal || recommendedGoal || 'maintain';
  const planPreference = profile?.dietaryPreference || '';
  const planAllergies = profile?.allergies || '';
  const planBodyType = profile?.bodyType || '';
  const planCalorieTarget = profile?.calorieTarget || '';

  return (
    <div style={{ backgroundColor: '#f0f9f4', minHeight: '100vh' }}>
      <Navbar />

      <div className="container py-4">
        <h1
          className="fw-bold mb-4 text-success"
          style={{ fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)' }}
        >
          BMI Calculator
        </h1>

        <BMICalculator bmi={bmi} status={status} setBmi={setBmi} setStatus={setStatus} />

        {bmi && (
          <>
            <div id="features" className="mt-4">
              {profileHint && (
                <p className="text-muted text-center small mb-2">{profileHint}</p>
              )}
              <MealPlan
                bmi={bmi}
                goal={planGoal}
                dietaryPreference={planPreference}
                allergies={planAllergies}
                foodPreferences={planPreference}
                riskyFoods={planAllergies}
                bodyGoal={planGoal}
                bodyType={planBodyType}
                calorieTarget={planCalorieTarget}
              />
            </div>

            <div className="alert alert-success mt-4" role="alert">
              <h5 className="mb-1">Personalised Goal</h5>
              <p className="mb-0">
                <strong>Based on your BMI:</strong>{' '}
                <span className="text-capitalize">{status || 'Not calculated'}</span>
                <br />
                <strong>Recommended goal:</strong>{' '}
                <span className="text-capitalize">{recommendedGoal || 'Not available'}</span>
                {profile?.goal && recommendedGoal && profile.goal !== recommendedGoal && (
                  <>
                    <br />
                    <span className="text-capitalize">
                      Your saved goal is {profile.goal}.
                    </span>
                  </>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
