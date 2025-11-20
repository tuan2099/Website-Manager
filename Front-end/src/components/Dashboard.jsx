import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';

export function Dashboard({ setStatus }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      setStatus('Đang tải dashboard...', 'info');
      try {
        const res = await apiRequest('/dashboard/summary');
        if (!cancelled) {
          setData(res);
          setStatus('Đã tải dashboard', 'success');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus(err.message, 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && !data) {
    return <div>Đang tải...</div>;
  }

  if (error && !data) {
    return <div className="dashboard-error">Lỗi: {error}</div>;
  }

  if (!data) return null;

  return (
    <div className="dashboard-grid">
      <div className="dashboard-card">
        <div className="card-label">Total Websites</div>
        <div className="card-value">{data.totalWebsites}</div>
      </div>
      <div className="dashboard-card">
        <div className="card-label">Offline Websites</div>
        <div className="card-value highlight-red">{data.offlineWebsites}</div>
      </div>
      <div className="dashboard-card">
        <div className="card-label">SSL Expiring (≤15d)</div>
        <div className="card-value highlight-amber">{data.sslExpiring}</div>
      </div>
      <div className="dashboard-card">
        <div className="card-label">Domain Expiring (≤15d)</div>
        <div className="card-value highlight-amber">{data.domainExpiring}</div>
      </div>
      <div className="dashboard-card">
        <div className="card-label">Open Alerts</div>
        <div className="card-value highlight-red">{data.openAlerts}</div>
      </div>
      <div className="dashboard-card">
        <div className="card-label">Checks last 24h</div>
        <div className="card-value">{data.checksLast24h}</div>
      </div>
    </div>
  );
}
