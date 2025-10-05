import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const features = [
  {
    title: 'BMI Calculator',
    desc: 'Check your health status and goals instantly.',
    icon: 'bi-activity',
    link: '/home',
  },
  {
    title: 'Meal Planner',
    desc: 'Personalised weekly meals tailored to your goals.',
    icon: 'bi-egg-fried',
    link: '/features',
  },
  {
    title: 'Nutrition Tracker',
    desc: 'Track calories and nutrients with confidence.',
    icon: 'bi-clipboard-check',
    link: '/features',
  },
];

const Balay = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#f0f9f4', minHeight: '100vh' }}>
      <Navbar />

      <header
        className="d-flex align-items-center text-center"
        style={{
          background: 'linear-gradient(to bottom right, #e8f5e9, #ffffff)',
          minHeight: '70vh',
          paddingTop: '4rem',
          paddingBottom: '4rem',
        }}
      >
        <div className="container" style={{ maxWidth: '720px', minHeight: '75vh' }}>
          <h1
            className="text-success fw-bold mb-3"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)' }}
          >
            Welcome to <span className="text-dark">Smart Nutrition</span>
          </h1>
          <p
            className="lead text-secondary mb-4"
            style={{ fontSize: 'clamp(1rem, 3.6vw, 1.3rem)' }}
          >
            Your personalised nutrition assistant to help you eat smarter and live healthier every day.
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <button
              onClick={() => navigate('/home')}
              className="btn btn-success px-4 py-2 fw-bold rounded-pill shadow-sm"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/features')}
              className="btn btn-outline-success px-4 py-2 fw-bold rounded-pill"
            >
              Explore Features
            </button>
          </div>
        </div>
      </header>

      <section className="container my-5">
        <h2 className="text-center fw-bold text-success mb-4">Why Choose Smart Nutrition?</h2>
        <div className="row g-4 justify-content-center">
          {features.map((feature) => (
            <div key={feature.title} className="col-12 col-sm-6 col-lg-4">
              <div className="card shadow-sm border-0 rounded-4 h-100 text-center p-4">
                <i className={`bi ${feature.icon} text-success fs-1 mb-3`} />
                <h5 className="fw-bold text-success">{feature.title}</h5>
                <p className="text-muted">{feature.desc}</p>
                <button
                  onClick={() => navigate(feature.link)}
                  className="btn btn-sm btn-outline-success mt-2 rounded-pill"
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-4 mt-5" style={{ backgroundColor: '#c8e6c9' }}>
        <p className="mb-0 text-success fw-bold">
          � Smart Nutrition {new Date().getFullYear()} | Eat Smarter. Live Healthier.
        </p>
      </footer>
    </div>
  );
};

export default Balay;
