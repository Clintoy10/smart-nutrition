import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createAdminTask, fetchAdminDashboard, removeOperationsTask } from '../api';

const SAMPLE_TASKS = [
  { id: 'T-510', label: 'Verify celiac-friendly pantry stock.', due: new Date().toISOString(), priority: 'High' },
  { id: 'T-498', label: 'Schedule midweek member check-ins.', due: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), priority: 'Medium' },
  { id: 'T-482', label: 'Publish weekend hydration tips.', due: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), priority: 'Low' },
];

const normalizePriority = (value) => {
  if (!value) return 'Medium';
  const lower = value.trim().toLowerCase();
  if (lower.startsWith('h')) return 'High';
  if (lower.startsWith('l')) return 'Low';
  return 'Medium';
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

const sortTasksByDue = (tasks) =>
  [...tasks].sort((a, b) => {
    const aTime = a.due ? new Date(a.due).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.due ? new Date(b.due).getTime() : Number.POSITIVE_INFINITY;
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;
    return aTime - bTime;
  });

const buildLocalTask = (payload) => {
  const fallbackDate = payload.due ? new Date(payload.due) : new Date();
  const safeDate = Number.isNaN(fallbackDate.getTime()) ? new Date() : fallbackDate;

  return {
    id: `LOCAL-${Date.now()}`,
    label: payload.label,
    due: safeDate.toISOString(),
    priority: payload.priority || 'Medium',
  };
};

const priorityBadgeClass = (priority) => {
  if (priority === 'High') return 'badge bg-danger';
  if (priority === 'Medium') return 'badge bg-warning text-dark';
  return 'badge bg-success';
};

const OperationsBoard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState(null);
  const [banner, setBanner] = useState(null);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data } = await fetchAdminDashboard();
      setTasks(sortTasksByDue(Array.isArray(data?.tasks) ? data.tasks : []));
      setBanner(null);
    } catch (error) {
      console.error('Failed to load operations board', error);
      setTasks(sortTasksByDue(SAMPLE_TASKS));
      setBanner({
        variant: 'warning',
        text: 'Live data unavailable. Showing sample tasks so you can keep planning.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    } catch (error) {
      console.error('Failed to parse stored user', error);
      navigate('/login', { replace: true });
      return;
    }

    loadTasks();
  }, [navigate]);

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
      setTasks((prev) => sortTasksByDue([data.task, ...prev]));
      setBanner({ variant: 'success', text: data.message });
    } catch (error) {
      const isNetworkError = !error?.response;
      if (isNetworkError) {
        const localTask = buildLocalTask(payload);
        setTasks((prev) => sortTasksByDue([localTask, ...prev]));
        setBanner({
          variant: 'warning',
          text: 'Server unreachable. Task added locally for now.',
        });
      } else {
        setBanner({
          variant: 'danger',
          text: error?.response?.data?.error || 'Unable to add the task.',
        });
      }
    } finally {
      setBusyAction(null);
    }
  };

  const handleRemoveTask = async (taskId) => {
    setBusyAction(`remove-task-${taskId}`);
    try {
      await removeOperationsTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setBanner({ variant: 'success', text: 'Task removed.' });
    } catch (error) {
      const status = error?.response?.status;
      const canRemoveLocally = !error?.response || status === 404;

      if (canRemoveLocally) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
        const text =
          status === 404
            ? 'Task not found on the server. Removed locally.'
            : 'Server unreachable. Task removed locally for now.';
        setBanner({ variant: 'warning', text });
      } else {
        setBanner({
          variant: 'danger',
          text: error?.response?.data?.error || 'Unable to remove the task.',
        });
      }
    } finally {
      setBusyAction(null);
    }
  };

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

        <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-center gap-3 mb-3">
          <div>
            <h1 className="fw-bold text-success mb-1">Operations Board</h1>
            <p className="text-muted mb-0">
              Manage the checklist in one place. Add tasks, review due dates, and clear completed items.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-success" onClick={() => navigate('/admin')}>
              <i className="bi bi-speedometer2 me-2" />
              Back to dashboard
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleCreateTask}
              disabled={busyAction === 'create-task' || loading}
            >
              <i className="bi bi-plus-circle me-2" />
              New task
            </button>
          </div>
        </div>

        <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 text-success mb-0">Checklist</h2>
              <button type="button" className="btn btn-outline-success btn-sm" onClick={loadTasks} disabled={loading}>
                <i className="bi bi-arrow-clockwise me-1" />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center text-muted py-3">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center text-muted py-3">No tasks on the board.</div>
            ) : (
              <ul className="list-group list-group-flush">
                {tasks.map((task) => (
                  <li key={task.id} className="list-group-item px-0">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <div className="fw-semibold text-success">{task.label}</div>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsBoard;
