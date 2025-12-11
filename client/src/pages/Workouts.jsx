git add .import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { WORKOUT_TYPES } from '../data/workouts';

const Workouts = () => (
  <div style={{ backgroundColor: '#f1f8e9', minHeight: '100vh' }}>
    <Navbar />

    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold text-success mb-2">Workouts</h1>
        <p className="text-muted mb-0">
          Explore every workout type in one place. Mix strength, cardio, mobility, and recovery to stay balanced.
        </p>
      </div>

      <div className="row g-4">
        {WORKOUT_TYPES.map((item) => (
          <div key={item.title} className="col-sm-12 col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${item.icon} text-success`} style={{ fontSize: '1.5rem' }} />
                  <div>
                    <h5 className="fw-bold mb-0">{item.title}</h5>
                    <small className="text-muted">{item.focus}</small>
                  </div>
                </div>
                <img
                  src={item.media}
                  alt={`${item.title} preview`}
                  className="w-100 rounded"
                  style={{ objectFit: 'cover', height: '140px', border: '1px solid #e0e0e0' }}
                />
                <p className="text-muted mb-0">{item.description}</p>
                <div>
                  <div className="text-success fw-semibold mb-1">Sample moves</div>
                  <ul className="mb-0 text-muted small">
                    {item.moves.map((move) => (
                      <li key={move}>{move}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto pt-2 d-flex flex-column gap-2">
                  <Link to={`/workouts/${item.slug}`} className="btn btn-success w-100">
                    View {item.title} plan
                  </Link>
                  <Link to={`/workouts/${item.slug}#guide`} className="btn btn-outline-success w-100">
                    Sample & tips
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Workouts;
