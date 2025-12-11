import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import Balay from './pages/Balay';
import Features from './pages/Features';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import AdminPage from './pages/AdminPage';
import OperationsBoard from './pages/OperationsBoard';
import Workouts from './pages/Workouts';
import WorkoutLanding from './pages/WorkoutLanding';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/balay" element={<Balay />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/editprofile" element={<EditProfile />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/operations-board" element={<OperationsBoard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/:slug" element={<WorkoutLanding />} />
      </Routes>
    </Router>
  );
}

export default App;
