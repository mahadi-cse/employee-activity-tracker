'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (seconds) => {
    const eightHours = 8 * 3600;
    return Math.min(Math.round((seconds / eightHours) * 100), 100);
  };

  if (loading) return <div className="dashboard-container">Loading...</div>;

  return (
    <main className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Employee Status</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time activity tracking dashboard</p>
        </div>
        <Link href="/dashboard/employees/new" className="btn btn-primary">Add Employee</Link>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>STATUS</th>
              <th>TODAY'S WORK TIME</th>
              <th>PROGRESS (8H)</th>
              <th>LAST SEEN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>
                  <div style={{ fontWeight: '600' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.role}</div>
                </td>
                <td>
                  <span className={`badge badge-${emp.status}`}>
                    {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                  {formatTime(emp.totalWorkSecs)}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${getProgress(emp.totalWorkSecs)}%` }}></div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{getProgress(emp.totalWorkSecs)}%</span>
                  </div>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {new Date(emp.lastSeenAt).toLocaleTimeString()}
                </td>
                <td>
                  <Link href={`/dashboard/employees/${emp.id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>View History</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
