import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  createAdminTask,
  fetchAdminBroadcasts,
  fetchAdminDashboard,
  impersonateMember,
  inviteNutritionist,
  removeOperationsTask,
  resetMemberPassword,
  resolveFlaggedReport,
  reviewMemberPlan,
  sendAdminBroadcast,
} from '../api';

const emptyStats = { total: 0, active: 0, pending: 0, flagged: 0 };

const statusBadgeClass = (status) => {
  if (status === 'Active') return 'badge bg-success';
  if (status === 'Pending') return 'badge bg-warning text-dark';
  if (status === 'Flagged') return 'badge bg-danger';
  return 'badge bg-secondary';
};

const severityBadgeClass = (severity) => {
  if (severity === 'High') return 'badge bg-danger';
  if (severity === 'Medium') return 'badge bg-warning text-dark';
  return 'badge bg-success';
};

const priorityBadgeClass = (priority) => {
  if (priority === 'High') return 'badge bg-danger';
  if (priority === 'Medium') return 'badge bg-warning text-dark';
  return 'badge bg-success';
};

const formatDate = (isoString) => {
  if (!isoString) return 'No activity yet';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

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

const formatDueLabel = (isoString) => {
  if (!isoString) return 'No due date';
  const dueDate = new Date(isoString);
  if (Number.isNaN(dueDate.getTime())) {
    return isoString;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compare = new Date(dueDate);
  compare.setHours(0, 0, 0, 0);
  const diffMs = compare.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) {
    const weekday = compare.toLocaleDateString('en-US', { weekday: 'short' });
    return `${weekday} (${diffDays} days)`;
  }
  if (diffDays < -1 && diffDays >= -7) {
    return `Overdue ${Math.abs(diffDays)} days`;
  }

  return compare.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const normalizePriority = (value) => {
  if (!value) return 'Medium';
  const lower = value.trim().toLowerCase();
  if (lower.startsWith('h')) return 'High';
  if (lower.startsWith('l')) return 'Low';
  return 'Medium';
};

const sortTasksByDue = (tasks) =>
  [...tasks].sort((a, b) => {
    const aTime = a.due ? new Date(a.due).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.due ? new Date(b.due).getTime() : Number.POSITIVE_INFINITY;
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;
    return aTime - bTime;
  });

const initialDashboard = {
  stats: emptyStats,
  users: [],
  reports: [],
  tasks: [],
  broadcasts: [],
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [banner, setBanner] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [canAccess, setCanAccess] = useState(false);
  const [isBroadcastModalOpen, setBroadcastModalOpen] = useState(false);

  const stats = useMemo(() => dashboard.stats || emptyStats, [dashboard.stats]);
  const broadcastCount = dashboard.broadcasts.length;

  const showBanner = useCallback((variant, text) => {
    setBanner({ variant, text });
  }, []);

  const handleErrorMessage = useCallback((error, fallback) => {
    const apiMessage = error?.response?.data?.error || error?.message;
    return apiMessage || fallback;
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await fetchAdminDashboard();
      setDashboard({
        stats: {
          total: Number(data?.stats?.total ?? 0),
          active: Number(data?.stats?.active ?? 0),
          pending: Number(data?.stats?.pending ?? 0),
          flagged: Number(data?.stats?.flagged ?? 0),
        },
        users: Array.isArray(data?.users) ? data.users : [],
        reports: Array.isArray(data?.reports) ? data.reports : [],
        tasks: Array.isArray(data?.tasks) ? sortTasksByDue(data.tasks) : [],
        broadcasts: Array.isArray(data?.broadcasts) ? data.broadcasts : [],
      });
    } catch (error) {
      console.error('Failed to fetch admin dashboard', error);
      setLoadError(handleErrorMessage(error, 'Unable to load admin data.'));
    } finally {
      setLoading(false);
    }
  }, [handleErrorMessage]);

  const refreshBroadcasts = useCallback(async () => {
    try {
      const { data } = await fetchAdminBroadcasts();
      if (Array.isArray(data?.broadcasts)) {
        setDashboard((prev) => ({
          ...prev,
          broadcasts: data.broadcasts,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh broadcasts', error);
      showBanner('danger', handleErrorMessage(error, 'Unable to refresh announcements.'));
    }
  }, [handleErrorMessage, showBanner]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = window.localStorage.getItem('token');
    const storedUser = window.localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      if (!parsed?.isAdmin) {
        navigate('/balay', { replace: true });
        return;
      }
      setCanAccess(true);
    } catch (error) {
      console.error('Failed to parse stored user', error);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (canAccess) {
      loadDashboard();
    }
  }, [canAccess, loadDashboard]);

  useEffect(() => {
    if (!isBroadcastModalOpen) {
      return undefined;
    }

    const handleKeyUp = (event) => {
      if (event.key === 'Escape') {
        setBroadcastModalOpen(false);
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isBroadcastModalOpen]);

  const handleSendBroadcast = async () => {
    const message = window.prompt('Enter the announcement to broadcast to members:');
    if (!message || !message.trim()) return;

    setBusyAction('broadcast');
    try {
      const { data } = await sendAdminBroadcast(message.trim());
      setDashboard((prev) => ({
        ...prev,
        broadcasts: data.broadcast
          ? [data.broadcast, ...prev.broadcasts]
          : prev.broadcasts,
      }));
      showBanner('success', data.message);
    } catch (error) {
      showBanner('danger', handleErrorMessage(error, 'Broadcast failed.'));
    } finally {
      setBusyAction(null);
    }
  };

  const handleInviteNutritionist = async () => {
    const email = window.prompt('Email address of the nutritionist to invite:');
    if (!email || !email.trim()) return;

    setBusyAction('invite');
    try {
      const { data } = await inviteNutritionist(email.trim());
      showBanner('success', data.message);
    } catch (error) {
      showBanner('danger', handleErrorMessage(error, 'Invitation failed.'));
    } finally {
      setBusyAction(null);
    }
  };

  const handleCreateTask = async () => {
    const label = window.prompt('Task title');
    if (!label || !label.trim()) return;

    const dueRaw = window.prompt('Due date (YYYY-MM-DD). Leave blank for today.');
    const priorityInput = window.prompt('Priority (High, Medium, Low). Leave blank for Medium.');

    const payload = {
      label: label.trim(),
      priority: normalizePriority(priorityInput),
    };

    if (dueRaw && dueRaw.trim()) {
      payload.due = dueRaw.trim();
    }

    setBusyAction('create-task');
    try {
      const { data } = await createAdminTask(payload);
      setDashboard((prev) => ({
        ...prev,
        tasks: sortTasksByDue([data.task, ...prev.tasks]),
      }));
      showBanner('success', data.message);
    } catch (error) {
      showBanner('danger', handleErrorMessage(error, 'Unable to add the task.'));
    } finally {
      setBusyAction(null);
    }
  };

  const handleReviewPlan = async (userId) => {
    setBusyAction(`review-${userId}`);
    try {
      const { data } = await reviewMemberPlan(userId);
      setDashboard((prev) => ({
        ...prev,
        stats: data.stats || prev.stats,
        users: prev.users.map((user) =>
          user.id === data.user?.id ? { ...user, ...data.user } : user
        ),
      }));
      showBanner('success', data.message);
    } catch (error) {
      showBanner('danger', handleErrorMessage(error, 'Review failed.'));
    } finally {
      setBusyAction(null);
    }
  };

  const handleImpersonate = async (userId) => {
    setBusyAction(`impersonate-${userId}`);
    try {
      const { data } = await impersonateMember(userId);

      if (navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(data.token);
          showBanner('success', `${data.message} Token copied to clipboard.`);
        } catch (clipboardError) {
          console.warn('Clipboard copy failed', clipboardError);
          showBanner('success', `${data.message} Token: ${data.token}`);
        }
      } else {
        showBanner('success', `${data.message} Token: ${data.token}`);
      }
    } catch (error) {
      showBanner('danger', handleErrorMessage(error, 'Impersonation failed.'));
    } finally {
      setBusyAction(null);
    }
  };

  const handleResetPassword = async (userId) => {
    setBusyAction(`reset-${userId}`);
    try {
      const { data } = await resetMemberPassword(userId);
      setDashboard((prev) => ({
        ...prev,
        stats: data.stats || prev.stats,
        users: prev.users.map((user) =>
          user.id === data.user?.id ? { ...user, ...data.user } : user
        ),
      }));
      showBanner('success', data.message);
    } catch (error) {
      showBanner('danger', handleErrorMessage(error, 'Password reset failed.'));
    } finally {
      setBusyAction(null);
    }
  };

  const handleResolveReport = async (reportId) => {
    setBusyAction(`resolve-report-${reportId}`);
    try {
      const { data } = await resolveFlaggedReport(reportId);
      setDashboard((prev) => ({
        ...prev,
        stats: data.stats || prev.stats,
        reports: prev.reports.filter((report) => report.id !== reportId),
      }));
      showBanner('success', 'Report resolved.');
    } catch (error) {
      showBanner('danger', handleErrorMessage(error, 'Unable to resolve the report.'));
    } finally {
      setBusyAction(null);
    }
  };

  const handleRemoveTask = async (taskId) => {
    setBusyAction(`remove-task-${taskId}`);
    try {
      await removeOperationsTask(taskId);
      setDashboard((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== taskId),
      }));
      showBanner('success', 'Task removed.');
    } catch (error) {
      showBanner('danger', handleErrorMessage(error, 'Unable to remove the task.'));
    } finally {
      setBusyAction(null);
    }
  };

  const openBroadcastModal = () => {
    if (!isBroadcastModalOpen) {
      if (dashboard.broadcasts.length === 0 && !loading) {
        refreshBroadcasts();
      }
      setBroadcastModalOpen(true);
    }
  };

  const closeBroadcastModal = () => setBroadcastModalOpen(false);

  return (
    <div style={{ backgroundColor: '#f1f8e9', minHeight: '100vh' }}>
      <Navbar />

      <div className="container py-4">
        {banner && (
          <div className={`alert alert-${banner.variant} alert-dismissible fade show`} role="alert">
            {banner.text}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setBanner(null)}
            />
          </div>
        )}

        {loadError && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
            <span>{loadError}</span>
            <button type="button" className="btn btn-sm btn-light" onClick={loadDashboard}>
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="alert alert-info d-flex align-items-center gap-2" role="status">
            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
            <span>Loading admin dashboard...</span>
          </div>
        )}

        {isBroadcastModalOpen && (
          <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
            role="dialog"
            aria-modal="true"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeBroadcastModal();
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title mb-0">Announcements</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    aria-label="Close announcements"
                    onClick={closeBroadcastModal}
                  />
                </div>
                <div className="modal-body p-0">
                  <ul className="list-group list-group-flush">
                    {dashboard.broadcasts.length === 0 ? (
                      <li className="list-group-item text-muted py-4 text-center">
                        No announcements posted yet.
                      </li>
                    ) : (
                      dashboard.broadcasts.map((item) => (
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
                          <span className="badge bg-success align-self-center">Broadcast</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-success" onClick={refreshBroadcasts}>
                    Refresh
                  </button>
                  <button type="button" className="btn btn-success" onClick={closeBroadcastModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-center gap-3 mb-4">
          <div>
            <h1 className="fw-bold text-success mb-1">Admin Dashboard</h1>
            <p className="text-muted mb-0">Monitor users and keep guidance relevant and safe.</p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-success d-flex align-items-center gap-2"
              onClick={openBroadcastModal}
              disabled={loading}
            >
              <i className="bi bi-bell-fill" />
              <span>Announcements</span>
              {broadcastCount > 0 && <span className="badge bg-danger rounded-pill">{broadcastCount}</span>}
            </button>
            <button
              type="button"
              className="btn btn-outline-success"
              onClick={() => navigate('/balay')}
            >
              <i className="bi bi-person-fill me-2" />
              Switch to user view
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSendBroadcast}
              disabled={busyAction === 'broadcast' || loading}
            >
              <i className="bi bi-megaphone-fill me-2" />
              Send broadcast
            </button>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <span className="text-uppercase text-muted small fw-semibold">Total users</span>
                <h2 className="mt-2 mb-0 text-success">{stats.total}</h2>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                  +3 new signups today
                </p>
              </div>
              <span className="position-absolute top-0 end-0 m-3 text-success" style={{ fontSize: '1.75rem' }}>
                <i className="bi bi-people-fill" />
              </span>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <span className="text-uppercase text-muted small fw-semibold">Active</span>
                <h2 className="mt-2 mb-0 text-success">{stats.active}</h2>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                  Users following plans
                </p>
              </div>
              <span className="position-absolute top-0 end-0 m-3 text-success" style={{ fontSize: '1.75rem' }}>
                <i className="bi bi-activity" />
              </span>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <span className="text-uppercase text-muted small fw-semibold">Pending</span>
                <h2 className="mt-2 mb-0 text-success">{stats.pending}</h2>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                  Approvals awaiting review
                </p>
              </div>
              <span className="position-absolute top-0 end-0 m-3 text-warning" style={{ fontSize: '1.75rem' }}>
                <i className="bi bi-hourglass-split" />
              </span>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <span className="text-uppercase text-muted small fw-semibold">Alerts</span>
                <h2 className="mt-2 mb-0 text-success">{stats.flagged}</h2>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                  Items requiring attention
                </p>
              </div>
              <span className="position-absolute top-0 end-0 m-3 text-danger" style={{ fontSize: '1.75rem' }}>
                <i className="bi bi-exclamation-triangle-fill" />
              </span>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
          <div className="card-body">
            <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-center gap-3 mb-3">
              <div>
                <h2 className="h4 text-success mb-0">User management</h2>
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                  Review plans, update roles, and respond to flagged accounts.
                </span>
              </div>
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={handleInviteNutritionist}
                disabled={busyAction === 'invite' || loading}
              >
                <i className="bi bi-person-plus-fill me-2" />
                Invite nutritionist
              </button>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col">User</th>
                    <th scope="col">Goal</th>
                    <th scope="col">Status</th>
                    <th scope="col">Last activity</th>
                    <th scope="col" className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.users.length === 0 && !loading && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        No users found.
                      </td>
                    </tr>
                  )}

                  {dashboard.users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="fw-semibold">{user.name}</div>
                        <div className="text-muted small">{user.email}</div>
                      </td>
                      <td className="text-capitalize">{user.goal}</td>
                      <td>
                        <span className={statusBadgeClass(user.status)}>{user.status}</span>
                      </td>
                      <td className="text-muted">{formatDate(user.lastLogin)}</td>
                      <td className="text-end">
                        <div className="btn-group" role="group" aria-label={`Actions for ${user.name}`}>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleReviewPlan(user.id)}
                            disabled={busyAction === `review-${user.id}` || loading}
                          >
                            <i className="bi bi-clipboard-check me-1" />
                            Review
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleImpersonate(user.id)}
                            disabled={busyAction === `impersonate-${user.id}` || loading}
                          >
                            <i className="bi bi-person-badge me-1" />
                            Impersonate
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleResetPassword(user.id)}
                            disabled={busyAction === `reset-${user.id}` || loading}
                          >
                            <i className="bi bi-shield-lock me-1" />
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h2 className="h5 text-success mb-1">Flagged reports</h2>
                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                      Prioritise nutrition risks and follow up with members.
                    </span>
                  </div>
                </div>

                <ul className="list-group list-group-flush">
                  {dashboard.reports.length === 0 && !loading && (
                    <li className="list-group-item px-0 text-muted">No flagged reports.</li>
                  )}

                  {dashboard.reports.map((report) => (
                    <li key={report.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <span className="fw-semibold text-success">{report.id}</span>
                          <p className="mb-1" style={{ lineHeight: 1.4 }}>{report.message}</p>
                          <span className="text-muted small">Filed {formatDate(report.createdAt)}</span>
                        </div>
                        <div className="d-flex flex-column align-items-end gap-2">
                          <span className={severityBadgeClass(report.severity)}>{report.severity}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleResolveReport(report.id)}
                            disabled={busyAction === `resolve-report-${report.id}` || loading}
                          >
                            <i className="bi bi-check2-circle me-1" />
                            Resolve
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <h2 className="h5 text-success mb-3">Operations checklist</h2>

                <ul className="list-group list-group-flush">
                  {dashboard.tasks.length === 0 && !loading && (
                    <li className="list-group-item px-0 text-muted">No tasks queued.</li>
                  )}

                  {dashboard.tasks.map((task) => (
                    <li key={task.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <span className="fw-semibold text-success">{task.label}</span>
                          <div className="text-muted small">Due {formatDueLabel(task.due)}</div>
                        </div>
                        <div className="d-flex flex-column align-items-end gap-2">
                          <span className={priorityBadgeClass(task.priority)}>{task.priority}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveTask(task.id)}
                            disabled={busyAction === `remove-task-${task.id}` || loading}
                          >
                            <i className="bi bi-trash3 me-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-success w-100"
                    onClick={handleCreateTask}
                    disabled={busyAction === 'create-task' || loading}
                  >
                    <i className="bi bi-plus-circle me-2" />
                    New task
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={() => navigate('/features')}
                  >
                    <i className="bi bi-kanban me-2" />
                    Open board
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
