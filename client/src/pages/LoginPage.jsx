  import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { login } from '../api';
  import 'bootstrap-icons/font/bootstrap-icons.css';

  const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await login({ email, password });
        localStorage.setItem('token', res.data.token);
        navigate('/balay');
      } catch {
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
        }}
      >
        {/* Back arrow to Landing Page */}
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
            maxWidth: '400px',
            borderRadius: '16px',
            backgroundColor: '#fffef9',
            border: '1px solid #c8e6c9',
          }}
        >
          <h2 className="text-center mb-4" style={{ color: '#2e7d32' }}>
            🌿 Login
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              style={{ backgroundColor: '#388e3c', borderColor: '#2e7d32' }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  };

  export default LoginPage;
