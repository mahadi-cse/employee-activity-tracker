import './globals.css';

export const metadata = {
  title: 'Work Tracker Admin',
  description: 'Monitor employee activity in real-time.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav style={{ borderBottom: '1px solid var(--border)', padding: '1rem 2rem', background: 'var(--bg-card)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-primary)' }}>WorkTracker</h1>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <a href="/dashboard">Dashboard</a>
              <a href="/dashboard/employees/new">New Employee</a>
              <span>Admin</span>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
