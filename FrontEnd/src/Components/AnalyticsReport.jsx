import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AnalyticsReport({ urlId, onBack }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/urls/${urlId}/analytics`);
      setAnalytics(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch url analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlId) fetchAnalytics();
  }, [urlId]);

  const handleCopyLink = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString(undefined, {
      weekday: 'short', year: 'numeric', month: 'short',
      day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  // Process visits data into clicks-per-day for the last 7 days
  const getChartData = () => {
    if (!analytics || !analytics.recentVisits) return { labels: [], data: [] };

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }

    const counts = days.map((day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const dailyClicks = analytics.recentVisits.filter((visit) => {
        const visitDate = new Date(visit.clickedAt);
        return visitDate >= day && visitDate < nextDay;
      });
      return dailyClicks.length;
    });

    const labels = days.map((d) => d.toLocaleDateString(undefined, { weekday: 'short' }));
    return { labels, data: counts };
  };

  // SVG Chart
  const renderSvgChart = () => {
    const { labels, data } = getChartData();
    if (labels.length === 0) return null;

    const maxVal = Math.max(...data, 5);
    const width = 500;
    const height = 200;
    const pL = 44, pR = 28, pT = 28, pB = 36;
    const cW = width - pL - pR;
    const cH = height - pT - pB;

    const getX = (i) => pL + i * (cW / (labels.length - 1));
    const getY = (v) => pT + cH - (v / maxVal) * cH;

    let linePath = `M ${getX(0)} ${getY(data[0])}`;
    for (let i = 1; i < data.length; i++) linePath += ` L ${getX(i)} ${getY(data[i])}`;
    const areaPath = `${linePath} L ${getX(data.length - 1)} ${pT + cH} L ${getX(0)} ${pT + cH} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const val = Math.round(maxVal * ratio);
          const y = getY(val);
          return (
            <g key={idx}>
              <line x1={pL} y1={y} x2={width - pR} y2={y} stroke="rgba(56,189,248,0.08)" strokeWidth={1} strokeDasharray="4 4" />
              <text x={pL - 8} y={y + 4} textAnchor="end" fill="#475569" fontSize={9} fontFamily="JetBrains Mono, monospace">{val}</text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaPath} fill="url(#chartFill)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#22d3ee" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />

        {/* Data points */}
        {data.map((val, i) => {
          const x = getX(i);
          const y = getY(val);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={5} fill="#0a1628" stroke="#22d3ee" strokeWidth={2.5} />
              <circle cx={x} cy={y} r={2} fill="#22d3ee" />
              {val > 0 && (
                <text x={x} y={y - 10} textAnchor="middle" fill="#22d3ee" fontSize={9} fontWeight={700} fontFamily="JetBrains Mono, monospace">{val}</text>
              )}
              <text x={x} y={height - 8} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={600}>{labels[i]}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return '📱';
      case 'tablet': return '📟';
      default: return '💻';
    }
  };

  const getBrowserIcon = (browser) => {
    switch (browser?.toLowerCase()) {
      case 'chrome': return '🌐';
      case 'safari': return '🧭';
      case 'firefox': return '🦊';
      case 'edge': return '🌐';
      default: return '🔗';
    }
  };

  const isLinkExpired = analytics?.expiresAt && new Date() > new Date(analytics.expiresAt);
  const totalClicksVal = analytics?.totalClicks || 0;

  // ── Shared card style ──
  const cardStyle = {
    background: 'rgba(10, 22, 40, 0.6)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 16, padding: 24,
    position: 'relative', overflow: 'hidden',
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(6,182,212,0.3)',
            position: 'relative',
          }}>
            <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div style={{ position: 'absolute', inset: -6, borderRadius: 22, border: '2px solid transparent', borderTopColor: 'rgba(34,211,238,0.6)', borderRightColor: 'rgba(34,211,238,0.2)', animation: 'spin 1.2s linear infinite' }} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>Loading intelligence report…</span>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ ...cardStyle, maxWidth: 440, margin: '0 auto', textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>Error Loading Report</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
          <button onClick={onBack} className="btn-ghost">← Back to Dashboard</button>
        </div>
      );
    }

    return (
      <>
        {/* URL meta block */}
        <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Destination URL
                </div>
                <a
                  href={analytics?.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', wordBreak: 'break-all', transition: 'color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.color = '#22d3ee'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  {analytics?.originalUrl}
                </a>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Shortened Address
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <a
                    href={analytics?.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 15, fontWeight: 700, color: '#22d3ee', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none' }}
                    onMouseOver={e => e.currentTarget.style.color = '#67e8f9'}
                    onMouseOut={e => e.currentTarget.style.color = '#22d3ee'}
                  >
                    {analytics?.shortUrl}
                  </a>
                  <button
                    onClick={() => handleCopyLink(analytics?.shortUrl)}
                    className="btn-ghost"
                    style={{ padding: '4px 10px', fontSize: 11, height: 'auto' }}
                  >
                    {copiedLink ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', flexDirection: 'column', gap: 18,
              paddingLeft: 24, borderLeft: '1px solid var(--border-subtle)',
            }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Link Status
                </div>
                {analytics?.expiresAt ? (
                  isLinkExpired
                    ? <span className="badge badge-rose">Expired Link</span>
                    : <span className="badge badge-emerald">Active · Expires Soon</span>
                ) : (
                  <span className="badge badge-emerald">Active · Permanent</span>
                )}
              </div>
              {analytics?.expiresAt && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Expiration
                  </div>
                  <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {formatDateTime(analytics.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {/* Total Clicks */}
          <div style={{ ...cardStyle, transition: 'all 0.3s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.25)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #06b6d4, #22d3ee)' }} />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Total Clicks</div>
            <div style={{ fontSize: 42, fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', background: 'linear-gradient(135deg, #22d3ee, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
              {totalClicksVal}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>Redirections processed</div>
          </div>

          {/* Last Visited */}
          <div style={{ ...cardStyle, transition: 'all 0.3s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.25)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Last Visited</div>
            {analytics?.lastVisited ? (
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>
                  {new Date(analytics.lastVisited).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', marginTop: 3 }}>
                  {new Date(analytics.lastVisited).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-muted)' }}>No visits yet</div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>Last redirect timestamp</div>
          </div>

          {/* Created */}
          <div style={{ ...cardStyle, transition: 'all 0.3s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #38bdf8, #818cf8)' }} />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Created Date</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>
                {new Date(analytics?.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', marginTop: 3 }}>
                {new Date(analytics?.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>Creation timestamp</div>
          </div>
        </div>

        {/* Chart */}
        <div style={cardStyle}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee' }} className="animate-pulse-glow" />
            Click Trend — Last 7 Days
          </div>
          <div style={{ background: 'rgba(2,8,23,0.5)', borderRadius: 12, border: '1px solid var(--border-subtle)', padding: '16px 12px 8px' }}>
            {renderSvgChart()}
          </div>
        </div>

        {/* Browser & Device grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>

          {/* Browser Stats */}
          <div style={cardStyle}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Visits by Browser</div>
            {totalClicksVal === 0 || !analytics?.browserStats?.length ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>No browser data yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {analytics.browserStats.map((item) => {
                  const pct = totalClicksVal > 0 ? Math.round((item.count / totalClicksVal) * 100) : 0;
                  return (
                    <div key={item.browser}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-secondary)' }}>
                          <span style={{ fontSize: 15 }}>{getBrowserIcon(item.browser)}</span>
                          {item.browser}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{item.count} ({pct}%)</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Device Stats */}
          <div style={cardStyle}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Visits by Device</div>
            {totalClicksVal === 0 || !analytics?.deviceStats?.length ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>No device data yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {analytics.deviceStats.map((item) => {
                  const pct = totalClicksVal > 0 ? Math.round((item.count / totalClicksVal) * 100) : 0;
                  return (
                    <div key={item.device}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-secondary)' }}>
                          <span style={{ fontSize: 15 }}>{getDeviceIcon(item.device)}</span>
                          {item.device}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{item.count} ({pct}%)</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Visit timeline */}
        <div style={cardStyle}>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color: '#f1f5f9', marginBottom: 20 }}>
            Click Redirection History
          </div>

          {!analytics?.recentVisits?.length ? (
            <div style={{
              padding: '48px 24px', textAlign: 'center', display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: 12,
              border: '1px dashed var(--border-dim)', borderRadius: 12,
              background: 'rgba(2,8,23,0.3)',
            }}>
              <svg width={40} height={40} fill="none" viewBox="0 0 24 24" stroke="rgba(100,116,139,0.6)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>No Visit Activity Recorded</div>
              <p style={{ fontSize: 12, color: '#334155', maxWidth: 260 }}>Click the short URL to test redirection analytics recording.</p>
            </div>
          ) : (
            <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 8 }}>
              <div style={{ position: 'relative', paddingLeft: 28, marginLeft: 12 }}>
                {/* Vertical timeline line */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: 1, background: 'var(--border-subtle)',
                }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {analytics.recentVisits.map((visit, index) => {
                    const visitNumber = totalClicksVal - index;
                    return (
                      <div key={index} style={{ position: 'relative', animation: 'slide-in-right 0.3s ease both', animationDelay: `${index * 0.04}s` }}>
                        {/* Timeline bullet */}
                        <div style={{
                          position: 'absolute', left: -35, top: 14,
                          width: 10, height: 10, borderRadius: '50%',
                          background: '#22d3ee', border: '2px solid var(--bg-base)',
                          boxShadow: '0 0 8px rgba(34,211,238,0.5)',
                        }} />

                        <div style={{
                          padding: '12px 16px', borderRadius: 12,
                          background: 'rgba(5,10,25,0.6)', border: '1px solid var(--border-subtle)',
                          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                          justifyContent: 'space-between', gap: 10,
                          transition: 'border-color 0.2s',
                        }}
                          onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.2)'}
                          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
                              color: '#22d3ee', background: 'rgba(34,211,238,0.08)',
                              border: '1px solid rgba(34,211,238,0.15)',
                              padding: '2px 8px', borderRadius: 99,
                            }}>
                              Visit #{visitNumber}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                              via {getBrowserIcon(visit.browser)} <strong style={{ color: 'var(--text-primary)' }}>{visit.browser}</strong>
                              {' '}on {getDeviceIcon(visit.device)} <strong style={{ color: 'var(--text-primary)' }}>{visit.device}</strong>
                            </span>
                          </div>
                          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {formatDateTime(visit.clickedAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      <main style={{
        width: '100%', maxWidth: 1280, margin: '0 auto',
        padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24,
        animation: 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        flex: 1,
      }}>
        {/* Page header */}
        {analytics && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
            alignItems: 'flex-start', gap: 16,
            paddingBottom: 24, borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.025em', color: '#f1f5f9' }}>
                  Analytics Report
                </h1>
                <span className="badge badge-cyan" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {analytics.shortCode}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Detailed visitor profiling and traffic source analysis.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                id="refresh-analytics-btn"
                onClick={fetchAnalytics}
                className="btn-ghost"
                style={{ gap: 7 }}
              >
                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
                </svg>
                Refresh
              </button>

              <button
                id="back-to-dashboard-btn"
                onClick={onBack}
                className="btn-ghost"
                style={{ gap: 7 }}
                onMouseOver={e => e.currentTarget.querySelector('.back-arrow').style.transform = 'translateX(-3px)'}
                onMouseOut={e => e.currentTarget.querySelector('.back-arrow').style.transform = 'translateX(0)'}
              >
                <svg className="back-arrow" width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }}>
                  <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Links
              </button>
            </div>
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
}
