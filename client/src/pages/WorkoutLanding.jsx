import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { WORKOUT_TYPES } from '../data/workouts';

const WorkoutLanding = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const workout = WORKOUT_TYPES.find((item) => item.slug === slug);

  const scrollToGuide = () => {
    const el = document.getElementById('guide');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!workout) {
    return (
      <div style={{ backgroundColor: '#f1f8e9', minHeight: '100vh' }}>
        <Navbar />
        <div className="container py-5 text-center">
          <h1 className="fw-bold text-success mb-3">Workout not found</h1>
          <p className="text-muted mb-4">We could not find that workout type.</p>
          <Link to="/workouts" className="btn btn-success">
            Back to workouts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f1f8e9', minHeight: '100vh' }}>
      <Navbar />

      <div className="container py-5">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-4 mb-4">
          <div className="flex-shrink-0" style={{ maxWidth: '420px' }}>
            <img
              src={workout.media}
              alt={`${workout.title} preview`}
              className="w-100 rounded shadow-sm"
              style={{ objectFit: 'cover', border: '1px solid #e0e0e0' }}
            />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className={`bi ${workout.icon} text-success`} style={{ fontSize: '2rem' }} />
              <h1 className="fw-bold text-success mb-0">{workout.title}</h1>
            </div>
            <p className="text-muted mb-2">{workout.description}</p>
            <div className="text-success fw-semibold">Focus</div>
            <p className="text-muted mb-3">{workout.focus}</p>
            <p className="mb-0">{workout.detail}</p>
          </div>
        </div>

        <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 text-success mb-0">Sample session</h2>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-success btn-sm" onClick={scrollToGuide}>
                  {workout.title} guide
                </button>
                <button type="button" className="btn btn-outline-success btn-sm" onClick={() => navigate('/workouts')}>
                  Back to all
                </button>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-lg-6">
                <div className="p-3 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
                  <h6 className="text-success fw-bold">Movements</h6>
                  <ul className="text-muted mb-0">
                    {workout.moves.map((move) => (
                      <li key={move}>{move}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="p-3 rounded h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
                  <h6 className="text-success fw-bold">Coach notes</h6>
                  <ul className="text-muted mb-0">
                    <li>Warm up 5-10 minutes specific to today&apos;s moves.</li>
                    <li>Quality first: stop sets when form slips.</li>
                    <li>Match breathing to effort; keep rest honest.</li>
                    <li>Finish with 3-5 minutes of light mobility or walking.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div id="guide" className="p-3 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-success fw-bold mb-0">Movement guide</h6>
                <button type="button" className="btn btn-success btn-sm" onClick={scrollToGuide}>
                  Start guide
                </button>
              </div>
              <ul className="text-muted mb-0">
                {workout.guide?.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutLanding;
