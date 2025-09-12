import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const SignupPage = () => {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup(form);
      localStorage.setItem('token', res.data.token);
      navigate('/login');
    } catch {
      alert('Signup failed!');
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100 position-relative px-3"
      style={{
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/green-dust-and-scratches.png')",
        backgroundColor: '#e8f5e9',
        backgroundRepeat: 'repeat',
      }}
    >
      {/* Back Arrow */}
      <button
        onClick={() => navigate('/')}
        className="btn btn-outline-success position-absolute top-0 start-0 m-3"
        style={{ zIndex: 10 }}
      >
        <i className="bi bi-arrow-left fs-4"></i>
      </button>

      <div
        className="card shadow p-4 w-100"
        style={{
          maxWidth: '500px',
          borderRadius: '16px',
          backgroundColor: '#fffef9',
          border: '1px solid #c8e6c9',
        }}
      >
        <h2 className="text-center mb-4" style={{ color: '#2e7d32' }}>
          🌱 Sign Up
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col">
              <input
                name="firstName"
                placeholder="First Name"
                className="form-control"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col">
              <input
                name="lastName"
                placeholder="Last Name"
                className="form-control"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <input
            name="age"
            type="number"
            placeholder="Age"
            className="form-control mb-3"
            onChange={handleChange}
            required
          />

          <div className="mb-3">
  <select
    name="gender"
    className="form-control"
    onChange={handleChange}
    required
  >
    <option value="">Select Gender</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
    <option value="other">Other</option>
  </select>
</div>

          <input
            name="height"
            type="number"
            placeholder="Height (cm)"
            className="form-control mb-3"
            onChange={handleChange}
            required
          />

          <input
            name="weight"
            type="number"
            placeholder="Weight (kg)"
            className="form-control mb-3"
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="form-control mb-3"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="form-control mb-3"
            onChange={handleChange}
            required
          />

          <div className="mb-3">
            <label className="fw-bold">Goal</label>
            <select
              name="goal"
              className="form-control"
              onChange={handleChange}
              required
            >
              <option value="">Select Goal</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain">Gain Weight</option>
              <option value="lose">Lose Weight</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="fw-bold">Dietary Preference</label>
            <select
              name="dietaryPreference"
              className="form-control"
              onChange={handleChange}
            >
              <option value="">None</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="halal">Halal</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="fw-bold">Allergies</label>
            <input
              type="text"
              name="allergies"
              className="form-control"
              placeholder="e.g. peanuts, dairy"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100"
            style={{ backgroundColor: '#388e3c', borderColor: '#2e7d32' }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
