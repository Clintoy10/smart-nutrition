import { NavLink, useNavigate } from 'react-router-dom';

const Features = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const features = [
    {
      title: 'BMI Calculator',
      desc: 'Understand your health status and receive a personalized goal based on your BMI.',
      icon: 'bi-activity',
      link: '/home',
    },
    {
      title: 'Meal Planner',
      desc: 'Get meal suggestions tailored to your goals and dietary preferences.',
      icon: 'bi-egg-fried',
    },
    {
      title: 'Nutrition Tracker',
      desc: 'Easily monitor your daily calorie and nutrient intake.',
      icon: 'bi-clipboard-check',
    },
    {
      title: 'Allergy Filter',
      desc: 'Exclude ingredients that may trigger allergies in your personalized plans.',
      icon: 'bi-shield-exclamation',
    },
    {
      title: 'Goal Setting',
      desc: 'Automatically detect if you should gain, lose, or maintain weight.',
      icon: 'bi-bullseye',
    },
    {
      title: 'Mobile-Friendly',
      desc: 'Fully responsive and optimized for mobile and tablet use.',
      icon: 'bi-phone',
    },
  ];

  return (
    <>
      {/* 🌿 Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: '#c8e6c9' }}>
        <div className="container-fluid">
          <NavLink className="navbar-brand text-success fw-bold fs-4" to="/balay">
             Smart Nutrition
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
              {['balay', 'home', 'features', 'profile'].map((route, idx) => (
                <li key={idx} className="nav-item mx-3">
                  <NavLink
                    to={`/${route}`}
                    className={({ isActive }) =>
                      `nav-link fw-bold px-3 py-1 rounded ${
                        isActive ? 'text-white bg-success' : 'text-success'
                      }`
                    }
                  >
                    {route === 'balay' ? 'Home' : route.charAt(0).toUpperCase() + route.slice(1)}
                  </NavLink>
                </li>
              ))}
            </ul>

            <button onClick={handleLogout} className="btn fw-bold ms-auto">
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* 🌱 Features Section */}
      <div
        className="container-fluid py-5"
        style={{
          background: 'linear-gradient(to right, #e8f5e9, #f4fbf6)',
          minHeight: 'calc(100vh - 70px)',
        }}
      >
        <div className="container">
          <h2 className="text-success fw-bold mb-5 text-center display-5">📋 App Features</h2>

          <div className="row g-4">
            {features.map((feature, idx) => (
              <div key={idx} className="col-sm-12 col-md-6 col-lg-4">
                <div
                  className="card h-100 border-0 shadow-sm feature-card"
                  style={{ borderRadius: '16px' }}
                >
                  <div className="card-body text-center">
                    <i className={`bi ${feature.icon} text-success mb-3`} style={{ fontSize: '2.5rem' }}></i>
                    <h5 className="fw-bold mb-2">{feature.title}</h5>
                    <p className="text-muted">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 💅 Custom Styles */}
      <style>{`
        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
        }

        .nav-link:hover:not(.active) {
          background-color: #a5d6a7;
          color: white !important;
          border-radius: 8px;
        }
      `}</style>
    </>
  );
};

export default Features;
