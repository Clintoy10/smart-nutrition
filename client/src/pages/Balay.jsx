import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Balay = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "BMI Calculator",
      desc: "Check your health status and goals instantly.",
      icon: "bi-activity",
      link: "/home",
    },
    {
      title: "Meal Planner",
      desc: "Personalized weekly meals just for you.",
      icon: "bi-egg-fried",
      link: "/features",
    },
    {
      title: "Nutrition Tracker",
      desc: "Track calories and nutrients with ease.",
      icon: "bi-clipboard-check",
      link: "/features",
    },
  ];

  return (
    <div style={{ backgroundColor: "#f0f9f4", minHeight: "100vh" }}>
      <Navbar />

      {/* 🌟 Hero Section */}
      <header
        className="d-flex justify-content-center align-items-center text-center"
        style={{
          background: "linear-gradient(to bottom right, #e8f5e9, #ffffff)",
          minHeight: "calc(100vh - 70px)",
          padding: "2rem",
        }}
      >
        <div className="container">
          <h1 className="text-success fw-bold mb-3 display-5">
            Welcome to <span className="text-dark">Smart Nutrition</span>
          </h1>
          <p className="lead text-secondary mb-4">
            Your personalized nutrition assistant to help you eat smarter and live healthier.
          </p>
          <div className="mt-3">
            <button
              onClick={() => navigate("/home")}
              className="btn btn-success me-3 px-4 py-2 fw-bold rounded-pill shadow-sm"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/features")}
              className="btn btn-outline-success px-4 py-2 fw-bold rounded-pill"
            >
              Explore Features
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 Features Section */}
      <section className="container my-5">
        <h2 className="text-center fw-bold text-success mb-4">Why Choose Smart Nutrition?</h2>
        <div className="row g-4 justify-content-center">
          {features.map((f, idx) => (
            <div key={idx} className="col-md-4">
              <div className="card shadow-sm border-0 rounded-4 h-100 text-center p-4">
                <i className={`bi ${f.icon} text-success fs-1 mb-3`}></i>
                <h5 className="fw-bold text-success">{f.title}</h5>
                <p className="text-muted">{f.desc}</p>
                <button
                  onClick={() => navigate(f.link)}
                  className="btn btn-sm btn-outline-success mt-2 rounded-pill"
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🌱 Footer */}
      <footer
        className="text-center py-4 mt-5"
        style={{ backgroundColor: "#c8e6c9" }}
      >
        <p className="mb-0 text-success fw-bold">
          🍃 Smart Nutrition © {new Date().getFullYear()} | Eat Smarter. Live Healthier.
        </p>
      </footer>
    </div>
  );
};

export default Balay;
