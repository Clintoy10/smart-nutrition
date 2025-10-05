import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
};

const toStringValue = (value) =>
  value !== undefined && value !== null ? String(value) : '';

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [storedUser, setStoredUser] = useState(null);

  useEffect(() => {
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
      });

      if (parsedUser.photo) {
        setPreview(parsedUser.photo);
      }
    } catch (err) {
      console.error('Error loading user profile from localStorage:', err);
      localStorage.removeItem('user');
      navigate('/login');
    }
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

    return validationErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || !storedUser) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = {
        ...storedUser,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        gender: form.gender,
        dietaryPreference: form.dietaryPreference,
        allergies: form.allergies,
        photo: preview || storedUser.photo || null,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Profile updated successfully!');
      navigate('/profile');
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
