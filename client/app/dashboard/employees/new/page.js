'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NewEmployee() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [createdEmployee, setCreatedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role }),
      });
      const data = await res.json();
      setCreatedEmployee(data);
    } catch (error) {
      alert('Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  if (createdEmployee) {
    return (
      <main className="dashboard-container">
        <div className="card" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--accent-working)', marginBottom: '1rem' }}>Employee Created!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Give this token to <strong>{createdEmployee.name}</strong>. They must enter it in their extension setup screen.
          </p>
          
          <div style={{ background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.25rem', fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: '700' }}>
              {createdEmployee.token}
            </span>
          </div>

          <Link href="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-container">
      <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Add New Employee</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Create a new identity and generate a unique tracking token.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              required
              style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.75rem', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Role / Job Title</label>
            <input 
              type="text" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Developer"
              required
              style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.75rem', color: 'white' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Employee & Generate Token'}
          </button>
          
          <Link href="/dashboard" style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Cancel</Link>
        </form>
      </div>
    </main>
  );
}
