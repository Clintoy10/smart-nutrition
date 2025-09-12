import { useNavigate, NavLink, Link } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const user = {
    name: 'Jerimiah Toring',
    email: 'toring@gmail.com',
    age: 22,
    goal: 'Maintain weight',
    dietaryPreference: 'Vegetarian',
    allergies: 'Peanuts',
  };

  return (
    <div style={{ backgroundColor: '#f0f9f4', minHeight: '100vh' }}>
      {/* 🌿 Shared Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: '#c8e6c9' }}>
        <div className="container-fluid">
          <Link className="navbar-brand text-success fw-bold fs-4" to="/balay">
            🍃 Smart Nutrition
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
            <ul className="navbar-nav mx-auto">
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

            <button onClick={handleLogout} className="btn  fw-bold ms-auto">
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* 👤 Profile Content */}
      <div className="container py-5">
        <h2 className="text-success fw-bold mb-4 text-center">👤 My Profile</h2>

        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body">
                <h5 className="fw-bold text-success mb-3">User Information</h5>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Age:</strong> {user.age}</p>
                <p><strong>Goal:</strong> {user.goal}</p>
                <p><strong>Dietary Preference:</strong> {user.dietaryPreference}</p>
                <p><strong>Allergies:</strong> {user.allergies}</p>

                {/* Optional: Edit button */}
               <button
                className="btn btn-outline-success mt-3"
                onClick={() => navigate('/editprofile')}
              >
                <i className="bi bi-pencil me-2"></i>Edit Profile
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .nav-link:hover:not(.active) {
          background-color: #a5d6a7;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default Profile;
