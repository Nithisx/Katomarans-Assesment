import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import QrModal from './QrModal';

// ── Icon Components ────────────────────────────────────────────────────────

const IconLink = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const IconChart = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconQr = ({ size = 15 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const IconRefresh = ({ size = 15 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
  </svg>
);

const IconCopy = ({ size = 13 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" />
  </svg>
);

const IconTrash = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconPlus = ({ size = 15 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v16m8-8H4" />
  </svg>
);

const IconWarn = ({ size = 15 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconCheck = ({ size = 15 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconClock = ({ size = 15 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function Spinner({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }}>
      <circle cx={12} cy={12} r={10} stroke={color} strokeWidth={4} style={{ opacity: 0.25 }} />
      <path fill={color} style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// ── KPI Stat Card ──────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accentColor, icon, bgColor, loading }) {
  return (
    <div className="stat-card" style={{ cursor: 'default' }}>
      <div className="accent-bar" style={{ background: accentColor }} />

      {/* Glow blob */}
      <div style={{
        position: 'absolute', bottom: -20, right: -20, width: 100, height: 100,
        borderRadius: '50%', background: bgColor, filter: 'blur(30px)', opacity: 0,
        transition: 'opacity 0.4s',
      }} className="stat-glow" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12,
          }}>
            {label}
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: 36, width: 80, marginBottom: 4 }} />
          ) : (
            <div style={{
              fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em',
              color: '#f1f5f9', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1,
            }}>
              {value}
            </div>
          )}
        </div>

        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginTop: 14,
        fontSize: 11, color: 'var(--text-muted)', fontWeight: 500,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor }} />
        {sub}
      </div>
    </div>
  );
}

// ── Table Skeleton ─────────────────────────────────────────────────────────

const TableSkeleton = () => (
  <>
    {[1, 2, 3].map((n) => (
      <tr key={n}>
        <td style={{ padding: '16px 20px' }}><div className="skeleton" style={{ height: 14, width: 180 }} /></td>
        <td style={{ padding: '16px 20px' }}><div className="skeleton" style={{ height: 14, width: 120 }} /></td>
        <td style={{ padding: '16px 20px' }}><div className="skeleton" style={{ height: 22, width: 70, borderRadius: 99 }} /></td>
        <td style={{ padding: '16px 20px' }}><div className="skeleton" style={{ height: 14, width: 90 }} /></td>
        <td style={{ padding: '16px 20px', textAlign: 'center' }}><div className="skeleton" style={{ height: 22, width: 44, borderRadius: 8, margin: '0 auto' }} /></td>
        <td style={{ padding: '16px 20px' }}><div className="skeleton" style={{ height: 30, width: 160, borderRadius: 8, marginLeft: 'auto' }} /></td>
      </tr>
    ))}
  </>
);

// ── Action Button ──────────────────────────────────────────────────────────

function ActionBtn({ onClick, children, variant = 'default', title }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', borderRadius: 7,
    fontSize: 11, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.15s ease', border: '1px solid',
    fontFamily: 'Inter, sans-serif',
  };

  const styles = {
    default: {
      ...base,
      borderColor: 'var(--border-subtle)',
      background: 'rgba(5,10,25,0.5)',
      color: 'var(--text-secondary)',
    },
    success: {
      ...base,
      borderColor: 'rgba(52,211,153,0.3)',
      background: 'rgba(52,211,153,0.08)',
      color: '#34d399',
    },
  };

  return (
    <button
      onClick={onClick}
      style={styles[variant] || styles.default}
      title={title}
      onMouseOver={e => {
        if (variant === 'default') {
          e.currentTarget.style.borderColor = 'var(--border-accent)';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'rgba(34,211,238,0.05)';
        }
      }}
      onMouseOut={e => {
        if (variant === 'default') {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'rgba(5,10,25,0.5)';
        }
      }}
    >
      {children}
    </button>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function Dashboard({ user, navigate }) {
  const [urls, setUrls]                     = useState([]);
  const [longUrl, setLongUrl]               = useState('');
  const [expiresAt, setExpiresAt]           = useState('');
  const [shortenLoading, setShortenLoading] = useState(false);
  const [fetchLoading, setFetchLoading]     = useState(false);
  const [urlError, setUrlError]             = useState('');
  const [urlSuccess, setUrlSuccess]         = useState('');
  const [copiedId, setCopiedId]             = useState(null);
  const [fetchError, setFetchError]         = useState('');
  const [tableAlert, setTableAlert]         = useState({ type: '', message: '' });

  // QR Modal
  const [activeQrUrl, setActiveQrUrl]   = useState(null);
  const [activeQrCode, setActiveQrCode] = useState(null);

  // Computed stats
  const totalClicks = urls.reduce((a, u) => a + (u.clicks || 0), 0);
  const activeLinks = urls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length;
  const avgClicks   = urls.length ? Math.round(totalClicks / urls.length) : 0;

  // API: fetch URLs
  const fetchUrls = useCallback(async () => {
    setFetchLoading(true);
    setFetchError('');
    try {
      const data = await api.get('/urls');
      setUrls(data.urls || []);
    } catch (err) {
      setFetchError(err.message || 'Failed to retrieve shortened links.');
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  // URL Validation
  const validateUrl = (urlStr) => {
    try {
      const parsed = new URL(urlStr);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch { return false; }
  };

  // API: Shorten
  const handleShorten = async (e) => {
    e.preventDefault();
    setUrlError('');
    setUrlSuccess('');

    if (!longUrl) { setUrlError('Please enter a destination URL.'); return; }
    if (!validateUrl(longUrl.trim())) { setUrlError('Invalid URL. Must start with http:// or https://'); return; }
    if (expiresAt && new Date(expiresAt) < new Date()) { setUrlError('Expiry date cannot be in the past.'); return; }

    setShortenLoading(true);
    try {
      const response = await api.post('/urls/shorten', {
        originalUrl: longUrl.trim(),
        expiresAt: expiresAt || null,
      });
      setUrlSuccess('Link shortened successfully!');
      setUrls((prev) => [response.data, ...prev]);
      setLongUrl('');
      setExpiresAt('');
      setTimeout(() => setUrlSuccess(''), 3000);
    } catch (err) {
      setUrlError(err.message || 'Failed to shorten URL');
    } finally {
      setShortenLoading(false);
    }
  };

  // API: Delete
  const handleDeleteUrl = async (id) => {
    if (!window.confirm('Delete this shortened link?')) return;
    setTableAlert({ type: '', message: '' });
    try {
      await api.delete(`/urls/${id}`);
      setUrls((prev) => prev.filter((item) => item.id !== id));
      setTableAlert({ type: 'success', message: 'Link was deleted successfully.' });
      setTimeout(() => setTableAlert({ type: '', message: '' }), 3000);
    } catch (err) {
      setTableAlert({ type: 'error', message: err.message || 'Failed to delete URL' });
    }
  };

  // Copy
  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const truncate = (text, max = 44) =>
    text.length <= max ? text : text.slice(0, max) + '…';

  return (
    <>
      <main style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 1280,
        margin: '0 auto',
        padding: '32px 24px',
        display: 'flex', flexDirection: 'column', gap: 28,
        animation: 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}>

        {/* ── Welcome Banner ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{
              fontSize: 26, fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.2,
              background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
              Manage and track your shortened links in real-time.
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 99,
            background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.15)',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22d3ee' }} className="animate-pulse-glow" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan-400)', letterSpacing: '0.06em' }}>LIVE DASHBOARD</span>
          </div>
        </div>

        {/* ── KPI Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <StatCard
            label="Total Links"
            value={urls.length}
            sub="Links created"
            accentColor="#22d3ee"
            bgColor="rgba(34,211,238,0.08)"
            icon={<IconLink size={20} />}
            loading={fetchLoading && urls.length === 0}
          />
          <StatCard
            label="Total Clicks"
            value={totalClicks.toLocaleString()}
            sub="Across all links"
            accentColor="#34d399"
            bgColor="rgba(52,211,153,0.08)"
            icon={<IconChart size={20} />}
            loading={fetchLoading && urls.length === 0}
          />
          <StatCard
            label="Active Links"
            value={activeLinks}
            sub="Not yet expired"
            accentColor="#38bdf8"
            bgColor="rgba(56,189,248,0.08)"
            icon={<IconCheck size={20} />}
            loading={fetchLoading && urls.length === 0}
          />
          <StatCard
            label="Avg. Clicks"
            value={avgClicks}
            sub="Per shortened link"
            accentColor="#fb923c"
            bgColor="rgba(251,146,60,0.08)"
            icon={<IconChart size={20} />}
            loading={fetchLoading && urls.length === 0}
          />
        </div>

        {/* ── Create Link Panel ── */}
        <div className="glass-card-elevated" style={{ padding: '28px 28px', position: 'relative', overflow: 'hidden' }}>
          {/* Corner glow */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)',
          }} />

          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: '#f1f5f9' }}>
              Create Shortened Link
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Generate clean, trackable short URLs with optional expiry.
            </p>
          </div>

          <form onSubmit={handleShorten} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
            {/* URL Input */}
            <div style={{ flex: '1 1 280px', minWidth: 0 }}>
              <label className="form-label">Destination URL</label>
              <div className="input-with-icon">
                <span className="input-icon"><IconLink size={16} /></span>
                <input
                  id="url-input"
                  className="form-input"
                  type="text"
                  value={longUrl}
                  onChange={(e) => { setLongUrl(e.target.value); if (urlError) setUrlError(''); }}
                  placeholder="https://example.com/your/long/url/here"
                  disabled={shortenLoading}
                />
              </div>
            </div>

            {/* Expiry */}
            <div style={{ flex: '0 1 240px' }}>
              <label className="form-label">Link Expiry (optional)</label>
              <div className="input-with-icon">
                <span className="input-icon"><IconClock size={16} /></span>
                <input
                  id="expiry-input"
                  className="form-input"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  disabled={shortenLoading}
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            {/* Submit */}
            <div style={{ flex: '0 0 auto' }}>
              <button
                id="shorten-url-btn"
                type="submit"
                disabled={shortenLoading}
                className="btn-primary"
                style={{ height: 46, paddingLeft: 22, paddingRight: 22, gap: 8 }}
              >
                {shortenLoading ? <Spinner size={16} /> : <IconPlus size={15} />}
                {shortenLoading ? 'Shortening…' : 'Shorten URL'}
              </button>
            </div>
          </form>

          {urlError && (
            <div className="alert-error" style={{ marginTop: 16 }}>
              <IconWarn size={15} />
              <span>{urlError}</span>
            </div>
          )}
          {urlSuccess && (
            <div className="alert-success" style={{ marginTop: 16 }}>
              <IconCheck size={15} />
              <span>{urlSuccess}</span>
            </div>
          )}
        </div>

        {/* ── Links Table Panel ── */}
        <div style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          overflow: 'hidden',
        }}>
          {/* Panel header */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
            alignItems: 'center', padding: '20px 24px', gap: 16,
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: '#f1f5f9' }}>
                Your Shortened Links
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                Manage, copy, and trace your links. Click a row to view analytics.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="badge badge-cyan">
                {urls.length} Link{urls.length !== 1 ? 's' : ''}
              </span>

              <button
                id="refresh-links-btn"
                onClick={fetchUrls}
                disabled={fetchLoading}
                className="btn-ghost"
                style={{ width: 38, height: 38, padding: 0, justifyContent: 'center' }}
                title="Refresh"
              >
                {fetchLoading ? <Spinner size={14} /> : <IconRefresh size={14} />}
              </button>
            </div>
          </div>

          {/* Table Alert */}
          {tableAlert.message && (
            <div style={{ padding: '0 24px' }}>
              <div
                className={tableAlert.type === 'success' ? 'alert-success' : 'alert-error'}
                style={{ marginTop: 16 }}
              >
                {tableAlert.type === 'success' ? <IconCheck size={14} /> : <IconWarn size={14} />}
                <span>{tableAlert.message}</span>
              </div>
            </div>
          )}

          {/* Content */}
          {fetchError ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '64px 24px', textAlign: 'center',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, marginBottom: 16,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171',
              }}>
                <IconWarn size={22} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>Failed to load links</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, marginBottom: 24, lineHeight: 1.6 }}>{fetchError}</p>
              <button onClick={fetchUrls} className="btn-ghost">Retry Connection</button>
            </div>
          ) : urls.length === 0 && !fetchLoading ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '72px 24px', textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18, marginBottom: 20,
                background: 'rgba(34,211,238,0.05)', border: '1px dashed var(--border-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
              }}>
                <IconLink size={26} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>No links yet</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 300, lineHeight: 1.6 }}>
                Enter a destination URL above to create your first shortened link.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Original URL</th>
                    <th>Short URL</th>
                    <th>Expires</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'center' }}>Clicks</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchLoading && urls.length === 0 ? (
                    <TableSkeleton />
                  ) : (
                    urls.map((item) => {
                      const isExpired = item.expiresAt && new Date() > new Date(item.expiresAt);
                      const handleRowClick = () => navigate(`/analytics?id=${item.id}`);

                      return (
                        <tr key={item.id}>
                          {/* Original URL */}
                          <td
                            onClick={handleRowClick}
                            style={{ cursor: 'pointer', maxWidth: 240 }}
                          >
                            <span style={{
                              display: 'block', overflow: 'hidden', textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap', fontSize: 12,
                            }}>
                              {truncate(item.originalUrl, 42)}
                            </span>
                          </td>

                          {/* Short URL */}
                          <td onClick={handleRowClick} style={{ cursor: 'pointer' }}>
                            <span style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 12, fontWeight: 600, color: '#22d3ee',
                            }}>
                              {item.shortUrl}
                            </span>
                          </td>

                          {/* Expiry */}
                          <td onClick={handleRowClick} style={{ cursor: 'pointer' }}>
                            {item.expiresAt ? (
                              isExpired ? (
                                <span className="badge badge-rose">Expired</span>
                              ) : (
                                <span className="badge badge-emerald">
                                  {new Date(item.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )
                            ) : (
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Never</span>
                            )}
                          </td>

                          {/* Created */}
                          <td onClick={handleRowClick} style={{ cursor: 'pointer', fontSize: 12 }}>
                            {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>

                          {/* Clicks */}
                          <td onClick={handleRowClick} style={{ cursor: 'pointer', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              minWidth: 44, padding: '3px 10px', borderRadius: 7,
                              background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.15)',
                              fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700,
                              color: '#22d3ee',
                            }}>
                              {item.clicks}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                              {/* Copy */}
                              <ActionBtn
                                onClick={() => handleCopy(item.shortUrl, item.id)}
                                variant={copiedId === item.id ? 'success' : 'default'}
                              >
                                {copiedId === item.id ? (
                                  <>✓ Copied</>
                                ) : (
                                  <><IconCopy size={12} /> Copy</>
                                )}
                              </ActionBtn>

                              {/* QR */}
                              <ActionBtn
                                onClick={() => { setActiveQrUrl(item.shortUrl); setActiveQrCode(item.shortCode); }}
                              >
                                <IconQr size={12} /> QR
                              </ActionBtn>

                              {/* Stats */}
                              <ActionBtn onClick={handleRowClick}>
                                <IconChart size={12} /> Stats
                              </ActionBtn>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteUrl(item.id)}
                                className="btn-danger"
                                style={{ padding: '6px 10px', minWidth: 'unset' }}
                                title="Delete Link"
                              >
                                <IconTrash size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* QR Modal */}
      {activeQrUrl && (
        <QrModal
          shortUrl={activeQrUrl}
          shortCode={activeQrCode}
          onClose={() => { setActiveQrUrl(null); setActiveQrCode(null); }}
        />
      )}
    </>
  );
}