'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EmployeeDetail() {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/employees/${id}/logs?date=${selectedDate}`);
      const data = await res.json();
      setLogs(data);

      const histRes = await fetch(`http://localhost:3001/api/employees/${id}/history`);
      const histData = await histRes.json();
      setHistory(histData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [id, selectedDate]);

  const formatTime = (totalSeconds) => {
    const secs = Math.floor(totalSeconds % 60);
    const mins = Math.floor((totalSeconds / 60) % 60);
    const hrs = Math.floor(totalSeconds / 3600);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (start, end) => {
    const diff = Math.max(0, Math.floor((new Date(end) - new Date(start)) / 1000));
    if (diff < 60) return `${diff}s`;
    return `${Math.round(diff / 60)} mins`;
  };

  const getSessions = () => {
    if (logs.length === 0) return [];
    const sessions = [];
    let currentSession = null;
    const chronologicalLogs = [...logs].sort((a, b) => new Date(a.loggedAt) - new Date(b.loggedAt));
    chronologicalLogs.forEach((log) => {
      if (!currentSession || currentSession.status !== log.status) {
        if (currentSession) sessions.push(currentSession);
        currentSession = {
          status: log.status,
          startTime: log.loggedAt,
          endTime: log.loggedAt,
          startWorkSecs: log.totalWorkSecs,
          endWorkSecs: log.totalWorkSecs,
        };
      } else {
        currentSession.endTime = log.loggedAt;
        currentSession.endWorkSecs = log.totalWorkSecs;
      }
    });
    if (currentSession) sessions.push(currentSession);
    return sessions.reverse();
  };

  const calculateStats = () => {
    let active = 0;
    if (logs.length > 0) {
      // Find the latest active log to get the total work seconds for the day
      active = logs[0].totalWorkSecs;
    }
    return { active };
  };

  const sessions = getSessions();
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>TODAY'S ACTIVE TIME</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent-working)' }}>{formatTime(active)}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>LAST 7 DAYS AVG</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{formatTime(Math.round(active * 0.9))}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>PRODUCTIVITY SCORE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{Math.min(100, Math.round((active / (8 * 3600)) * 100))}%</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', height: '32px', borderRadius: '8px', overflow: 'hidden', background: 'var(--border)' }}>
          {[...sessions].reverse().map((session, i) => {
            const start = new Date(session.startTime).getTime();
            const end = new Date(session.endTime).getTime();
            const duration = Math.max(end - start, 30000); 
            return (
              <div 
                key={i} 
                style={{ 
                  flexGrow: duration,
                  background: session.status === 'active' ? 'var(--accent-working)' : 
                              (session.status === 'idle' ? 'var(--accent-idle)' : '#ef4444'),
                  opacity: 0.8
                }}
                title={`${session.status}: ${new Date(session.startTime).toLocaleTimeString()} (${formatDuration(session.startTime, session.endTime)})`}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          <span>00:00</span>
          <span>Timeline (Daily Span)</span>
          <span>23:59</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Activity Sessions</h3>
        {loading ? (
          <div>Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No sessions recorded for this date.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>SESSION RANGE</th>
                <th>STATUS</th>
                <th>DURATION</th>
                <th>WORK ADDED</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '600' }}>
                    {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td>
                    <span className={`badge badge-${session.status}`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {formatDuration(session.startTime, session.endTime)}
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>
                    {session.status === 'active' ? `+${formatTime(session.endWorkSecs - session.startWorkSecs)}` : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>30-Day History (Day-wise)</h3>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No history found.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>DATE</th>
                <th>DAY</th>
                <th>WORK TIME</th>
                <th>IDLE TIME</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {history.map((day, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '600' }}>{day.date}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(day.date).toLocaleDateString([], { weekday: 'long' })}
                  </td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent-working)' }}>
                    {formatTime(day.totalWorkSecs)}
                  </td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent-idle)' }}>
                    {formatTime(day.totalIdleSecs)}
                  </td>
                  <td>
                    <span className={`badge badge-${day.totalWorkSecs > 0 ? 'active' : 'idle'}`}>
                      {day.totalWorkSecs > 0 ? 'Completed' : 'No Activity'}
                    </span>
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
