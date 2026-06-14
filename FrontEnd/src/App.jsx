import { useState, useEffect } from 'react';
import Signup from './Components/Signup';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import AnalyticsReport from './Components/AnalyticsReport';
import Header from './Components/Header';
import { api, setAccessToken, registerLogoutCallback } from './services/api';
import './index.css';

// ── Particle Background ────────────────────────────────────────────────────

function ParticleField() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 15,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: '-10px',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

// ── Ambient Glow Orbs ─────────────────────────────────────────────────────

function AmbientOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* Top-left cyan orb */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
      }} />
      {/* Bottom-right teal orb */}
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-8%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)',
      }} />
      {/* Center accent */}
      <div style={{
        position: 'absolute', top: '35%', left: '50%',
        transform: 'translateX(-50%)',
        width: 400, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.03) 0%, transparent 70%)',
      }} />
    </div>
  );
}

// ── Grid Pattern Overlay ──────────────────────────────────────────────────

function GridOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: `
        linear-gradient(rgba(56,189,248,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(56,189,248,0.025) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
    }} />
  );
}

// ── Loading Screen ────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <AmbientOrbs />
      <GridOverlay />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {/* Animated logo mark */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(6,182,212,0.4), 0 0 60px rgba(6,182,212,0.15)',
          }}>
            <svg width={30} height={30} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          {/* Rotating ring */}
          <div style={{
            position: 'absolute', inset: -6, borderRadius: 24,
            border: '2px solid transparent',
            borderTopColor: 'rgba(34,211,238,0.6)',
            borderRightColor: 'rgba(34,211,238,0.2)',
            animation: 'spin 1.2s linear infinite',
          }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#e2e8f0', marginBottom: 6 }}>
            Katomarn
          </div>
          <div style={{ fontSize: 12, color: '#22d3ee', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Securing connection...
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Auth Layout Wrapper ───────────────────────────────────────────────────

function AuthLayout({ children }) {
  return (
    <div className="auth-bg">
      <AmbientOrbs />
      <GridOverlay />
      <ParticleField />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}>
        {children}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────

function App() {
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handleLocationChange);

    registerLogoutCallback(() => {
      setUser(null);
      setIsSignup(false);
      navigate('/');
    });

    const checkSession = async () => {
      try {
        const refreshData = await fetch('http://localhost:5000/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshData.ok) {
          const { accessToken } = await refreshData.json();
          setAccessToken(accessToken);
          const profileData = await api.get('/auth/profile');
          setUser(profileData.user);
        }
      } catch (err) {
        console.log('No active session found on boot.');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setIsSignup(false);
    navigate('/');
  };

  const toggleAuth = () => {
    setIsSignup(!isSignup);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <AuthLayout>
        {isSignup
          ? <Signup onAuthSuccess={handleAuthSuccess} onToggleAuth={toggleAuth} />
          : <Login onAuthSuccess={handleAuthSuccess} onToggleAuth={toggleAuth} />
        }
      </AuthLayout>
    );
  }

  const path = currentPath.split('?')[0];
  const params = new URLSearchParams(currentPath.split('?')[1] || '');

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <AmbientOrbs />
      <GridOverlay />
      <ParticleField />

      <Header user={user} onLogout={handleLogout} currentPath={currentPath} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {path === '/analytics' || path === '/analyts' ? (
          <AnalyticsReport urlId={params.get('id')} onBack={() => navigate('/')} />
        ) : (
          <Dashboard user={user} onLogout={handleLogout} navigate={navigate} />
        )}
      </div>
    </div>
  );
}

export default App;
