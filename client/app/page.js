'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('admin@worktracker.com');
  const [password, setPassword] = useState('password');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple simulated login for demo purposes
    router.push('/dashboard');
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #1e293b, #0f172a)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>WorkTracker</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Admin Dashboard Authentication</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.75rem', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.75rem', color: 'white' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', fontSize: '1rem', marginTop: '1rem' }}>
            Sign In to Dashboard
          </button>
          
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Enter any credentials to enter demo mode
          </p>
        </form>
      </div>
    </div>
  );
}
