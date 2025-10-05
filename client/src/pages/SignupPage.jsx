import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api';

const initialForm = {
  firstName: '',
  lastName: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  email: '',
  password: '',
  goal: '',
  dietaryPreference: '',
  allergies: '',
};

const SignupPage = () => {
  const [form, setForm] = useState(initialForm);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
        paddingTop: '4rem',
        paddingBottom: '4rem',
      }}
    >
      <button
        onClick={() => navigate('/')}
        className="btn btn-outline-success position-absolute top-0 start-0 m-3"
        style={{ zIndex: 10 }}
        aria-label="Back to landing page"
      >
        <i className="bi bi-arrow-left fs-4" />
      </button>

      <div
        className="card shadow p-4 w-100"
        style={{
          maxWidth: '520px',
          borderRadius: '16px',
          backgroundColor: '#fffef9',
          border: '1px solid #c8e6c9',
        }}
      >
        <h2 className="text-center mb-4" style={{ color: '#2e7d32' }}>
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-1">
            <div className="col-12 col-md-6">
              <input
                name="firstName"
                placeholder="First name"
                className="form-control"
                value={form.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <input
                name="lastName"
                placeholder="Last name"
                className="form-control"
                value={form.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <input
            name="age"
            type="number"
            placeholder="Age"
            className="form-control mb-3"
            value={form.age}
            onChange={handleChange}
            min="0"
            required
          />

          <div className="mb-3">
            <select
              name="gender"
              className="form-select"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="row g-3 mb-1">
            <div className="col-12 col-md-6">
              <input
                name="height"
                type="number"
                placeholder="Height (cm)"
                className="form-control"
                value={form.height}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <input
                name="weight"
                type="number"
                placeholder="Weight (kg)"
                className="form-control"
                value={form.weight}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="form-control mb-3"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="form-control mb-3"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />

          <div className="mb-3">
            <label className="fw-bold" htmlFor="goalSelect">
              Goal
            </label>
            <select
              id="goalSelect"
              name="goal"
              className="form-select"
              value={form.goal}
              onChange={handleChange}
              required
            >
              <option value="">Select goal</option>
              <option value="maintain">Maintain weight</option>
              <option value="gain">Gain weight</option>
              <option value="lose">Lose weight</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="fw-bold" htmlFor="dietSelect">
              Dietary preference
            </label>
            <select
              id="dietSelect"
              name="dietaryPreference"
              className="form-select"
              value={form.dietaryPreference}
              onChange={handleChange}
            >
              <option value="">None</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="halal">Halal</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="fw-bold" htmlFor="allergiesInput">
              Allergies
            </label>
            <input
              id="allergiesInput"
              type="text"
              name="allergies"
              className="form-control"
              placeholder="e.g. peanuts, dairy"
              value={form.allergies}
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

          <p className="text-center mt-3 mb-0" style={{ fontSize: '0.95rem' }}>
            Already have an account?{' '}
            <button
              type="button"
              className="btn btn-link p-0 align-baseline"
              onClick={() => navigate('/login')}
            >
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
