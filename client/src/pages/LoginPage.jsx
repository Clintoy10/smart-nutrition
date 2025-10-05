import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      const destination = res.data.user?.isAdmin ? '/admin' : '/balay';
      navigate(destination);
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed!');
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
          maxWidth: '420px',
          borderRadius: '16px',
          backgroundColor: '#fffef9',
          border: '1px solid #c8e6c9',
        }}
      >
        <h2 className="text-center mb-4" style={{ color: '#2e7d32' }}>
          Log In
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold" htmlFor="loginEmail">
              Email
            </label>
            <input
              id="loginEmail"
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold" htmlFor="loginPassword">
              Password
            </label>
            <input
              id="loginPassword"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100"
            style={{ backgroundColor: '#388e3c', borderColor: '#2e7d32' }}
          >
            Log In
          </button>

          <p className="text-center mt-3 mb-0" style={{ fontSize: '0.95rem' }}>
            New here?{' '}
            <button
              type="button"
              className="btn btn-link p-0 align-baseline"
              onClick={() => navigate('/signup')}
            >
              Create an account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
