import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { fetchAnnouncements } from '../api';

const baseLinks = [
  { to: '/balay', label: 'Home' },
  { to: '/home', label: 'BMI' },
  { to: '/features', label: 'Features' },
  { to: '/profile', label: 'Profile' },
];

const formatDateTime = (isoString) => {
  if (!isoString) return 'Unknown time';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [isAnnouncementsOpen, setAnnouncementsOpen] = useState(false);
  const [isFetchingAnnouncements, setFetchingAnnouncements] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState(null);

  const announcementCount = announcements.length;

  const links = useMemo(() => {
    if (isAdmin) {
      return [...baseLinks, { to: '/admin', label: 'Admin' }];
    }
    return baseLinks;
  }, [isAdmin]);

  const loadAnnouncements = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = window.localStorage.getItem('token');
    if (!token) {
      setAnnouncements([]);
      setAnnouncementsError(null);
      return;
    }

    try {
      setFetchingAnnouncements(true);
      const { data } = await fetchAnnouncements();
      setAnnouncements(Array.isArray(data?.announcements) ? data.announcements : []);
      setAnnouncementsError(null);
    } catch (error) {
      console.error('Failed to load announcements', error);
      setAnnouncementsError('Unable to load announcements.');
    } finally {
      setFetchingAnnouncements(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUser = window.localStorage.getItem('user');
    if (!storedUser) {
      setIsAdmin(false);
      setAnnouncements([]);
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      setIsAdmin(Boolean(parsed?.isAdmin));
      loadAnnouncements();
    } catch {
      setIsAdmin(false);
      setAnnouncements([]);
    }
  }, [location.pathname, loadAnnouncements]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAnnouncementsOpen) {
      return undefined;
    }

    const handleKeyUp = (event) => {
      if (event.key === 'Escape') {
        setAnnouncementsOpen(false);
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isAnnouncementsOpen]);

  const handleLogout = () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
    }

    setAnnouncementsOpen(false);
    setAnnouncements([]);
    setIsOpen(false);
    navigate('/');
    setIsLoggingOut(false);
  };

  const handleOpenAnnouncements = () => {
    if (!isAnnouncementsOpen) {
      if (announcements.length === 0 && !isFetchingAnnouncements) {
        loadAnnouncements();
      }
      setAnnouncementsOpen(true);
    }
  };

  const handleRefreshAnnouncements = () => {
    loadAnnouncements();
  };

  const hasAuthToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

  return (
    <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: '#c8e6c9' }}>
      <div className="container-fluid">
        <NavLink className="navbar-brand text-success fw-bold fs-4" to="/balay">
          Smart Nutrition
        </NavLink>

        <button
          type="button"
          className="navbar-toggler"
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          onClick={toggleMenu}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          id="navbarNav"
          className={`collapse navbar-collapse justify-content-between${isOpen ? ' show' : ''}`}
        >
          <ul className="navbar-nav mx-auto text-center">
            {links.map((item) => (
              <li key={item.to} className="nav-item mx-lg-3 my-2 my-lg-0">
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

          <div className="d-flex align-items-center gap-2 ms-lg-auto">
            {hasAuthToken && (
              <button
                type="button"
                className="btn btn-outline-success d-flex align-items-center gap-2"
                onClick={handleOpenAnnouncements}
              >
                <i className="bi bi-bell-fill" />
                {announcementCount > 0 && (
                  <span className="badge bg-danger rounded-pill">{announcementCount}</span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline-success fw-bold mt-2 mt-lg-0 d-flex align-items-center gap-2 px-3"
              disabled={isLoggingOut}
            >
              <i className="bi bi-box-arrow-right" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .nav-link:hover:not(.active) {
          background-color: #a5d6a7;
          color: white !important;
        }
      `}</style>

      {isAnnouncementsOpen && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setAnnouncementsOpen(false);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title mb-0">Announcements</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close announcements"
                  onClick={() => setAnnouncementsOpen(false)}
                />
              </div>
              <div className="modal-body p-0">
                {isFetchingAnnouncements && (
                  <div className="d-flex align-items-center gap-2 px-3 py-3 text-success">
                    <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                    <span>Loading announcements...</span>
                  </div>
                )}

                {announcementsError && (
                  <div className="alert alert-danger m-3" role="alert">
                    {announcementsError}
                  </div>
                )}

                {!isFetchingAnnouncements && !announcementsError && (
                  <ul className="list-group list-group-flush">
                    {announcements.length === 0 ? (
                      <li className="list-group-item text-muted py-4 text-center">
                        No announcements yet.
                      </li>
                    ) : (
                      announcements.map((item) => (
                        <li
                          key={item.id}
                          className="list-group-item d-flex justify-content-between align-items-start gap-3"
                        >
                          <div>
                            <p className="mb-1" style={{ lineHeight: 1.4 }}>
                              {item.message}
                            </p>
                            <span className="text-muted small">{formatDateTime(item.createdAt)}</span>
                          </div>
                          <span className="badge bg-success align-self-center">Info</span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-success" onClick={handleRefreshAnnouncements}>
                  Refresh
                </button>
                <button type="button" className="btn btn-success" onClick={() => setAnnouncementsOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

