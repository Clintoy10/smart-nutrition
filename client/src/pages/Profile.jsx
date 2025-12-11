import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchProfile } from '../api';

const formatValue = (value, suffix) => {
  if (value === undefined || value === null || value === '') {
    return 'Not provided';
  }

  if (!suffix) {
    return value;
  }

  return `${value} ${suffix}`;
};

const formatText = (value) => {
  if (!value) {
    return 'Not provided';
  }

  const stringValue = String(value);
  return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const { data } = await fetchProfile();
        if (!data?.user) {
          navigate('/login');
          return;
        }

        const merged = mergeWithCachedProfile(data.user);
        setUser(merged);
        localStorage.setItem('user', JSON.stringify(merged));
      } catch (error) {
        console.error('Failed to load profile', error);
        const cached = localStorage.getItem('user');

        if (!cached) {
          navigate('/login');
          return;
        }

        try {
          const parsed = JSON.parse(cached);
          setUser(parsed);
        } catch (storageError) {
          console.error('Failed to parse cached profile', storageError);
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#f0f9f4', minHeight: '100vh' }}>
        <Navbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Not provided';
  const profilePhoto = user.photoUrl || user.photo || null;

  return (
    <div style={{ backgroundColor: '#f0f9f4', minHeight: '100vh' }}>
      <Navbar />

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h1 className="fw-bold text-success mb-1">Profile</h1>
            <p className="text-muted mb-0">Review and keep your personal details up to date.</p>
          </div>

          <button
            className="btn btn-success d-flex align-items-center"
            onClick={() => navigate('/editprofile')}
          >
            <i className="bi bi-pencil-square me-2"></i>
            Edit Profile
          </button>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm text-center p-4">
              <div
                className="rounded-circle overflow-hidden mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{ width: '140px', height: '140px', backgroundColor: '#e8f5e9' }}
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span className="text-muted fw-semibold">No Photo</span>
                )}
              </div>

              <h4 className="fw-bold mb-1">{fullName}</h4>
              <p className="text-muted mb-0">{user.email || 'Not provided'}</p>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card h-100 shadow-sm p-4">
              <h5 className="fw-bold text-success mb-3">Personal Details</h5>

              <div className="row gy-3">
                <div className="col-sm-6">
                  <span className="text-uppercase text-muted small">Age</span>
                  <p className="fw-semibold mb-0">{formatValue(user.age, 'years')}</p>
                </div>
                <div className="col-sm-6">
                  <span className="text-uppercase text-muted small">Gender</span>
                  <p className="fw-semibold mb-0">{formatText(user.gender)}</p>
                </div>
                <div className="col-sm-6">
                  <span className="text-uppercase text-muted small">Height</span>
                  <p className="fw-semibold mb-0">{formatValue(user.height, 'cm')}</p>
                </div>
                <div className="col-sm-6">
                  <span className="text-uppercase text-muted small">Weight</span>
                  <p className="fw-semibold mb-0">{formatValue(user.weight, 'kg')}</p>
                </div>
                <div className="col-sm-6">
                  <span className="text-uppercase text-muted small">Dietary Preference</span>
                  <p className="fw-semibold mb-0">{formatText(user.dietaryPreference)}</p>
                </div>
                <div className="col-sm-6">
                  <span className="text-uppercase text-muted small">Allergies</span>
                  <p className="fw-semibold mb-0">{formatText(user.allergies)}</p>
                </div>
                <div className="col-sm-6">
                  <span className="text-uppercase text-muted small">Goal</span>
                  <p className="fw-semibold mb-0">{formatText(user.goal)}</p>
                </div>
                <div className="col-sm-6">
                  <span className="text-uppercase text-muted small">Body Type</span>
                  <p className="fw-semibold mb-0">{formatText(user.bodyType)}</p>
                </div>
                <div className="col-sm-6">
                  <span className="text-uppercase text-muted small">Calorie Target</span>
                  <p className="fw-semibold mb-0">{formatValue(user.calorieTarget, 'kcal')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
