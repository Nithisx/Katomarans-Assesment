import { useState } from 'react';
import { api, setAccessToken } from '../services/api';

// ── Icons ──────────────────────────────────────────────────────────────────

const IconUser = () => (
  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconMail = () => (
  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconLock = () => (
  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconAlert = () => (
  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconCheckCircle = () => (
  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconArrow = () => (
  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const IconShield = () => (
  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

function Spinner() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
      <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} style={{ opacity: 0.25 }} />
      <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// ── Password Strength Indicator ───────────────────────────────────────────

function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: 'transparent' };
    if (password.length < 6) return { level: 1, label: 'Too short', color: '#f87171' };
    if (password.length < 8) return { level: 2, label: 'Weak', color: '#fb923c' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { level: 3, label: 'Fair', color: '#fbbf24' };
    return { level: 4, label: 'Strong', color: '#34d399' };
  };

  const { level, label, color } = getStrength();
  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= level ? color : 'rgba(30,50,80,0.8)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ── Signup Component ───────────────────────────────────────────────────────

export default function Signup({ onAuthSuccess, onToggleAuth }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await api.post('/auth/signup', { name, email, password });
      setSuccess('Account created successfully!');
      setAccessToken(data.accessToken);
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-scale-in" style={{ width: '100%' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 18, margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(6,182,212,0.4), 0 0 60px rgba(6,182,212,0.15)',
          position: 'relative',
        }}>
          <svg width={26} height={26} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <div style={{
            position: 'absolute', inset: -1, borderRadius: 19,
            background: 'linear-gradient(135deg, rgba(34,211,238,0.5), rgba(52,211,153,0.3))',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: 1,
          }} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          <span style={{
            background: 'linear-gradient(135deg, #f8fafc, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Create Account</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, fontWeight: 500 }}>
          Join Katomarn and supercharge your links
        </p>
      </div>

      {/* Card */}
      <div className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, #06b6d4, #22d3ee, #2dd4bf)',
        }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div className="alert-error">
              <IconAlert />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert-success">
              <IconCheckCircle />
              <span>{success}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <span className="input-icon"><IconUser /></span>
              <input
                id="signup-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="form-input"
                required
                disabled={loading}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <span className="input-icon"><IconMail /></span>
              <input
                id="signup-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                className="form-input"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <span className="input-icon"><IconLock /></span>
              <input
                id="signup-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <PasswordStrength password={formData.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="form-label">Confirm Password</label>
            <div className="input-with-icon">
              <span className="input-icon"><IconLock /></span>
              <input
                id="signup-confirm-password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', height: 48, marginTop: 4 }}
          >
            {loading ? <Spinner /> : (
              <>
                <IconShield />
                <span>Create Account</span>
                <IconArrow />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center', fontSize: 13,
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <button
            id="toggle-to-login"
            onClick={onToggleAuth}
            disabled={loading}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--cyan-400)', fontWeight: 700, fontSize: 13,
              transition: 'color 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#67e8f9'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--cyan-400)'}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
