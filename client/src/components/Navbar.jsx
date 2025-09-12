import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: '#c8e6c9' }}>
      <div className="container-fluid">
        <NavLink className="navbar-brand text-success fw-bold fs-4" to="/balay">
          🍃 Smart Nutrition
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          <ul className="navbar-nav mx-auto text-center">
            {[
              { to: '/balay', label: 'Home' },
              { to: '/home', label: 'BMI' },
              { to: '/features', label: 'Features' },
              { to: '/profile', label: 'Profile' },
            ].map((item, idx) => (
              <li key={idx} className="nav-item mx-3">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link fw-bold px-3 py-1 rounded ${
                      isActive ? 'text-white bg-success' : 'text-success'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            onClick={handleLogout}
            className="btn fw-bold ms-auto"
          >
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </div>

      {/* Hover effect styling */}
      <style>{`
        .nav-link:hover:not(.active) {
          background-color: #a5d6a7;
          color: white !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
