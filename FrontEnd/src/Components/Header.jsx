// ── Icon Components ────────────────────────────────────────────────────────

const IconLink = ({ size = 20 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const IconChart = ({ size = 20 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconLogout = ({ size = 15 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

// ── Header Component ───────────────────────────────────────────────────────

export default function Header({ user, onLogout, currentPath }) {
  const isAnalytics = currentPath && (currentPath.startsWith('/analytics') || currentPath.startsWith('/analyts'));

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(2, 8, 23, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 24px',
      height: 68,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Left: Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Logo mark */}
        <div style={{
          width: 42, height: 42,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(6,182,212,0.3), 0 4px 12px rgba(0,0,0,0.3)',
          flexShrink: 0,
        }}>
          {isAnalytics ? <IconChart size={18} /> : <IconLink size={18} />}
        </div>

        {/* Brand text */}
        <div>
          <div style={{
            fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1,
            background: 'linear-gradient(135deg, #f8fafc, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Katomarn
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--cyan-400)',
            lineHeight: 1.2,
          }}>
            {isAnalytics ? 'URL Intelligence' : 'URL Management'}
          </div>
        </div>
      </div>

      {/* Center: nav indicator pill (analytics only) */}
      {isAnalytics && (
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 99,
          background: 'rgba(34,211,238,0.08)',
          border: '1px solid rgba(34,211,238,0.15)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee' }} className="animate-pulse-glow" />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan-400)', letterSpacing: '0.06em' }}>Analytics Report</span>
        </div>
      )}

      {/* Right: User + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right', display: 'none' }} id="user-info-desktop">
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>

          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #06b6d4, #2dd4bf)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: 'white',
            boxShadow: '0 0 15px rgba(6,182,212,0.25)',
            letterSpacing: '0.02em',
            flexShrink: 0,
          }}>
            {initials}
          </div>

          {/* User name (visible on sm+) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user?.name}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.2 }}>{user?.email}</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--border-subtle)' }} />

        {/* Logout button */}
        <button
          id="logout-button"
          onClick={onLogout}
          className="btn-danger"
          style={{ gap: 6 }}
        >
          <IconLogout size={13} />
          <span>Log Out</span>
        </button>
      </div>
    </header>
  );
}
