'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EmployeeDetail() {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/employees/${id}/logs?date=${selectedDate}`);
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [id, selectedDate]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateStats = () => {
    let active = 0;
    if (logs.length > 0) {
      active = logs[0].totalWorkSecs;
    }
    return { active };
  };

  const { active } = calculateStats();

  return (
    <main className="dashboard-container">
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          ← Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Employee Performance</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Activity details and historical performance</p>
          </div>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem', color: 'white' }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>TODAY'S ACTIVE TIME</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent-working)' }}>{formatTime(active)}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>LAST 7 DAYS AVG</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{formatTime(active * 0.9)}</div> {/* Simulated avg */}
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>PRODUCTIVITY SCORE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{Math.min(100, Math.round((active / (8 * 3600)) * 100))}%</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Activity Timeline</h3>
        {loading ? (
          <div>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No activity recorded for this date.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>TIME</th>
                <th>STATUS</th>
                <th>WORK ACCUMULATED</th>
                <th>RAW TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: '600' }}>
                    {new Date(log.loggedAt).toLocaleTimeString()}
                  </td>
                  <td>
                    <span className={`badge badge-${log.status}`}>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>
                    {formatTime(log.totalWorkSecs)}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {log.loggedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
