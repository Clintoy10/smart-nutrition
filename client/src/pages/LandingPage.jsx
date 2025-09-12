import { Link } from "react-router-dom";

const LandingPage = () => (
  <div
    className="d-flex flex-column justify-content-center align-items-center vh-100 text-center"
    style={{
      backgroundImage:
        "url('https://www.transparenttextures.com/patterns/green-dust-and-scratches.png')",
      backgroundColor: "#e8f5e9",
      backgroundSize: "cover",
      backgroundRepeat: "repeat",
      padding: "1rem",
    }}
  >
    {/* 🌿 Main Card */}
    <div>
      <h1
        className="fw-bold mb-3"
        style={{ color: "#2e7d32", fontSize: "2.8rem" }}
      >
        🍃 Smart Nutrition
      </h1>

      <p className="lead mb-4" style={{ color: "#4e5d52" }}>
        Helping college students eat smarter and live healthier — one meal at a
        time.
      </p>

      <div className="d-grid gap-3">
        <Link
          to="/login"
          className="btn btn-outline-success btn-lg rounded-pill shadow-sm"
          style={{
            borderColor: "#81c784",
            color: "#2e7d32",
            fontWeight: "600",
          }}
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="btn btn-success btn-lg rounded-pill shadow-sm"
          style={{
            backgroundColor: "#388e3c",
            borderColor: "#2e7d32",
            fontWeight: "600",
          }}
        >
          Signup
        </Link>
      </div>
    </div>
  </div>
);

export default LandingPage;
