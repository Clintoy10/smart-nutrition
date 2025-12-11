import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, updateProfile } from '../api';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  age: '',
  weight: '',
  height: '',
  gender: '',
  dietaryPreference: '',
  allergies: '',
  goal: '',
  bodyType: '',
  calorieTarget: '',
};

const toStringValue = (value) => (value !== undefined && value !== null ? String(value) : '');
const normalizeCalorieTarget = (value) => {
  if (value === undefined || value === null || value === '') return '';
  const cleaned = String(value).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  if (!cleaned || !cleaned[1]) return '';
  const parsed = Number(cleaned[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) return '';
  return String(Math.round(parsed));
};

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [storedUser, setStoredUser] = useState(null);

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

        const user = mergeWithCachedProfile(data.user);
        setStoredUser(user);
        setForm({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          age: toStringValue(user.age),
          weight: toStringValue(user.weight),
          height: toStringValue(user.height),
          gender: user.gender || '',
          dietaryPreference: user.dietaryPreference || '',
          allergies: user.allergies || '',
          goal: user.goal || '',
          bodyType: user.bodyType || '',
          calorieTarget: toStringValue(user.calorieTarget),
        });
        setPreview(user.photoUrl || user.photo || null);
        setPhotoFile(null);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Failed to load profile from API:', error);
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
          navigate('/login');
          return;
        }

        try {
          const parsedUser = JSON.parse(savedUser);
          setStoredUser(parsedUser);
          setForm({
            firstName: parsedUser.firstName || '',
            lastName: parsedUser.lastName || '',
            email: parsedUser.email || '',
            age: toStringValue(parsedUser.age),
            weight: toStringValue(parsedUser.weight),
            height: toStringValue(parsedUser.height),
            gender: parsedUser.gender || '',
            dietaryPreference: parsedUser.dietaryPreference || '',
            allergies: parsedUser.allergies || '',
            goal: parsedUser.goal || '',
            bodyType: parsedUser.bodyType || '',
            calorieTarget: toStringValue(parsedUser.calorieTarget),
          });
          setPreview(parsedUser.photoUrl || parsedUser.photo || null);
          setPhotoFile(null);
        } catch (storageError) {
          console.error('Error parsing profile from localStorage:', storageError);
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };

    loadProfile();
  }, [navigate]);

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Please upload a valid image file.' }));
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      clearFieldError('photo');
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const validationErrors = {};

    if (!form.firstName.trim()) {
      validationErrors.firstName = 'First name is required.';
    }

    if (!form.lastName.trim()) {
      validationErrors.lastName = 'Last name is required.';
    }

    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      validationErrors.email = 'Enter a valid email address.';
    }

    const numericChecks = [
      ['age', 'Enter a valid age.'],
      ['weight', 'Enter a valid weight.'],
      ['height', 'Enter a valid height.'],
    ];

    numericChecks.forEach(([field, message]) => {
      const numericValue = Number(form[field]);
      if (!numericValue || numericValue <= 0) {
        validationErrors[field] = message;
      }
    });

    if (!form.gender) {
      validationErrors.gender = 'Select a gender option.';
    }

    if (!form.goal) {
      validationErrors.goal = 'Select a goal.';
    }

    if (form.calorieTarget) {
      const numericValue = Number(form.calorieTarget);
      if (!numericValue || numericValue <= 0) {
        validationErrors.calorieTarget = 'Enter a valid calorie target or leave blank.';
      }
    }

    return validationErrors;
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || !storedUser) {
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('firstName', form.firstName.trim());
      formData.append('lastName', form.lastName.trim());
      formData.append('email', form.email.trim());
      formData.append('age', form.age);
      formData.append('weight', form.weight);
      formData.append('height', form.height);
      formData.append('gender', form.gender);
      formData.append('dietaryPreference', form.dietaryPreference);
      formData.append('allergies', form.allergies);
      formData.append('goal', form.goal);
      formData.append('bodyType', form.bodyType);
      formData.append('calorieTarget', form.calorieTarget);

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const { data } = await updateProfile(formData);
      const updatedUser = data?.user;

      if (updatedUser) {
        const mergedUser = {
          ...updatedUser,
          bodyType: updatedUser.bodyType ?? form.bodyType,
          calorieTarget:
            (updatedUser.calorieTarget ?? normalizeCalorieTarget(form.calorieTarget)) || null,
        };

        setStoredUser(mergedUser);
        setForm({
          firstName: mergedUser.firstName || '',
          lastName: mergedUser.lastName || '',
          email: mergedUser.email || '',
          age: toStringValue(mergedUser.age),
          weight: toStringValue(mergedUser.weight),
          height: toStringValue(mergedUser.height),
          gender: mergedUser.gender || '',
          dietaryPreference: mergedUser.dietaryPreference || '',
          allergies: mergedUser.allergies || '',
          goal: mergedUser.goal || '',
          bodyType: mergedUser.bodyType || '',
          calorieTarget: toStringValue(mergedUser.calorieTarget),
        });
        setPreview(mergedUser.photoUrl || mergedUser.photo || null);
        setPhotoFile(null);
        localStorage.setItem('user', JSON.stringify(mergedUser));
      }

      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f9f4', minHeight: '100vh' }}>
      <div className="container py-5">
        <button
          className="btn btn-outline-success mb-3"
          onClick={() => navigate('/profile')}
        >
          <i className="bi bi-arrow-left"></i> Back to Profile
        </button>

        <h2 className="text-success fw-bold mb-4">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="row g-4">
          <div className="col-md-4 text-center">
            <label htmlFor="profileImage" className="form-label d-block">
              <div
                className="border rounded-circle d-flex justify-content-center align-items-center mx-auto"
                style={{ width: '150px', height: '150px', backgroundColor: '#e8f5e9', overflow: 'hidden' }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span className="text-muted">Upload</span>
                )}
              </div>
            </label>
            <input
              type="file"
              className={`form-control mt-2 ${errors.photo ? 'is-invalid' : ''}`}
              id="profileImage"
              accept="image/*"
              onChange={handleImageChange}
            />
            {errors.photo && <div className="invalid-feedback">{errors.photo}</div>}
          </div>

          <div className="col-md-8">
            <div className="row g-3">
              {[{ label: 'First Name', name: 'firstName', type: 'text' },
                { label: 'Last Name', name: 'lastName', type: 'text' },
                { label: 'Email Address', name: 'email', type: 'email' },
                { label: 'Age', name: 'age', type: 'number' },
                { label: 'Weight (kg)', name: 'weight', type: 'number' },
                { label: 'Height (cm)', name: 'height', type: 'number' },
              ].map(({ label, name, type }) => (
                <div className="col-md-6" key={name}>
                  <label className="form-label fw-semibold">{label}</label>
                  <input
                    type={type}
                    name={name}
                    className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
                    value={form[name]}
                    onChange={handleChange}
                  />
                  {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
                </div>
              ))}

              <div className="col-md-6">
                <label className="form-label fw-semibold">Gender</label>
                <select
                  name="gender"
                  className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Goal</label>
                <select
                  name="goal"
                  className={`form-select ${errors.goal ? 'is-invalid' : ''}`}
                  value={form.goal}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="maintain">Maintain weight</option>
                  <option value="gain">Gain weight</option>
                  <option value="lose">Lose weight</option>
                </select>
                {errors.goal && <div className="invalid-feedback">{errors.goal}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Body Type</label>
                <select
                  name="bodyType"
                  className="form-select"
                  value={form.bodyType}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="ectomorph">Ectomorph</option>
                  <option value="mesomorph">Mesomorph</option>
                  <option value="endomorph">Endomorph</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Calorie Target (per day)</label>
                <input
                  type="number"
                  name="calorieTarget"
                  className={`form-control ${errors.calorieTarget ? 'is-invalid' : ''}`}
                  placeholder="e.g., 1800"
                  value={form.calorieTarget}
                  onChange={handleChange}
                  min="0"
                />
                {errors.calorieTarget && (
                  <div className="invalid-feedback">{errors.calorieTarget}</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Dietary Preference</label>
                <select
                  name="dietaryPreference"
                  className="form-select"
                  value={form.dietaryPreference}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="pescatarian">Pescatarian</option>
                  <option value="omnivore">Omnivore</option>
                  <option value="halal">Halal</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Allergies</label>
                <input
                  type="text"
                  name="allergies"
                  className="form-control"
                  placeholder="e.g., peanuts, dairy"
                  value={form.allergies}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 mt-3">
                <button
                  type="submit"
                  className="btn btn-success px-4"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
