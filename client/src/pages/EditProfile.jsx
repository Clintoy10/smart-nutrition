import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    dietaryPreference: '',
    allergies: '',
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.includes('@')) newErrors.email = 'Invalid email';
    if (!form.age || form.age <= 0) newErrors.age = 'Enter a valid age';
    if (!form.weight || form.weight <= 0) newErrors.weight = 'Enter a valid weight';
    if (!form.height || form.height <= 0) newErrors.height = 'Enter a valid height';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundErrors = validate();
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length === 0) {
      alert('Profile updated successfully!');
      console.log('Profile saved:', form, image);
      navigate('/profile');
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f9f4', minHeight: '100vh' }}>
      <div className="container py-5">
        <button className="btn btn-outline-success mb-3" onClick={() => navigate('/profile')}>
          <i className="bi bi-arrow-left"></i> Back to Profile
        </button>

        <h2 className="text-success fw-bold mb-4">✏️ Edit Profile</h2>

        <form onSubmit={handleSubmit} className="row g-4">
          <div className="col-md-4 text-center">
            <label htmlFor="profileImage" className="form-label d-block">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile Preview"
                  className="img-thumbnail rounded-circle"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              ) : (
                <div className="border rounded-circle d-flex justify-content-center align-items-center"
                  style={{ width: '150px', height: '150px', backgroundColor: '#e8f5e9' }}>
                  <span className="text-muted">Upload</span>
                </div>
              )}
            </label>
            <input
              type="file"
              className="form-control mt-2"
              id="profileImage"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="col-md-8">
            <div className="row g-3">
              {[{ label: 'Full Name', name: 'name', type: 'text' },
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
                <button type="submit" className="btn btn-success px-4">
                  Save Profile
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