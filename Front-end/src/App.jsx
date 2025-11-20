import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
import { clearTokens, getAccessToken, apiRequest } from './api';
import { AuthTabs } from './components/AuthTabs';
import { Dashboard } from './components/Dashboard';
import { Websites } from './components/Websites';
import { Teams } from './components/Teams';
import { WebsiteDetail } from './components/WebsiteDetail';
import { Roles } from './components/Roles';
import { Permissions } from './components/Permissions';

function RequireAuth({ children }) {
  const hasToken = !!getAccessToken();
  const location = useLocation();

  if (!hasToken) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}

function RequireGuest({ children }) {
  const hasToken = !!getAccessToken();

  if (hasToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function WebsiteDetailRoute({ setStatus }) {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return <Navigate to="/websites" replace />;
  }

  return (
    <WebsiteDetail
      websiteId={id}
      onClose={() => navigate('/websites')}
      setStatus={setStatus}
    />
  );
}

export default function App() {
  const [status, setStatusState] = useState({ message: '', type: 'info' });
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();

  const setStatus = (message, type) => {
    setStatusState({ message, type });
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {}
    clearTokens();
    setCurrentUser(null);
    setStatus('Đã logout', 'info');
  };

  const hasToken = !!getAccessToken();

  const path = location.pathname;
  let title = 'Dashboard';
  if (path.startsWith('/auth')) title = 'Authentication';
  else if (path.startsWith('/websites')) title = 'Websites';
  else if (path.startsWith('/teams')) title = 'Teams';
  else if (path.startsWith('/roles')) title = 'Roles';
  else if (path.startsWith('/permissions')) title = 'Permissions';

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-logo">WM</span>
          <span className="app-title">Website Manager</span>
        </div>
        <div className="app-header-right">
          {hasToken ? (
            <span className="app-user">
              Đã đăng nhập{currentUser ? `: ${currentUser.email}` : ''}
            </span>
          ) : (
            <span className="app-user">Chưa đăng nhập</span>
          )}
          <button type="button" onClick={handleLogout} disabled={!hasToken}>
            Logout
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <div className="sidebar-section">Navigation</div>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/auth"
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            Auth
          </NavLink>
          <NavLink
            to="/websites"
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            Websites
          </NavLink>
          <NavLink
            to="/teams"
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            Teams
          </NavLink>
          <NavLink
            to="/roles"
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            Roles
          </NavLink>
          <NavLink
            to="/permissions"
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            Permissions
          </NavLink>
          <button type="button" className="sidebar-item" disabled>
            Settings (coming)
          </button>
        </aside>

        <main className="app-main">
          <h2 className="main-title">{title}</h2>

          <div className={`status-bar ${status.type}`}>{status.message}</div>

          <Routes>
            <Route
              path="/dashboard"
              element={(
                <RequireAuth>
                  <Dashboard setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/websites"
              element={(
                <RequireAuth>
                  <Websites setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/websites/:id"
              element={(
                <RequireAuth>
                  <WebsiteDetailRoute setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/teams"
              element={(
                <RequireAuth>
                  <Teams setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/roles"
              element={(
                <RequireAuth>
                  <Roles setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/permissions"
              element={(
                <RequireAuth>
                  <Permissions setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/auth"
              element={(
                <RequireGuest>
                  <AuthTabs
                    setStatus={setStatus}
                    onUserChange={(user) => {
                      setCurrentUser(user);
                    }}
                  />
                </RequireGuest>
              )}
            />
            <Route
              path="/"
              element={
                hasToken ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
