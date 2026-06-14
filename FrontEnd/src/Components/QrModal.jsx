import { useState } from 'react';

function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
      <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} style={{ opacity: 0.25 }} />
      <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function QrModal({ shortUrl, shortCode, onClose }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Free secure QR Code Generator API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}&margin=10&color=020817&bgcolor=FFFFFF`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qr_${shortCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('QR Code Download Error:', error);
      alert('Failed to download QR code. Please try saving the image manually.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(2, 8, 23, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 360,
        background: 'rgba(10, 22, 40, 0.96)',
        border: '1px solid rgba(34,211,238,0.15)',
        borderRadius: 20, padding: '28px 24px',
        boxShadow: '0 0 40px rgba(34,211,238,0.1), 0 24px 60px rgba(0,0,0,0.6)',
        animation: 'scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        overflow: 'hidden',
      }}>
        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, #06b6d4, #22d3ee, #2dd4bf)',
        }} />

        {/* Close button */}
        <button
          id="qr-modal-close"
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border-subtle)', borderRadius: 8,
            background: 'rgba(5,10,25,0.6)', color: 'var(--text-muted)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
          onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
        >
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee' }} className="animate-pulse-glow" />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              QR Code
            </h2>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Scan to redirect to target URL</p>
        </div>

        {/* QR Code with gradient glow border */}
        <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto 24px' }}>
          {/* Glow behind */}
          <div style={{
            position: 'absolute', inset: -8, borderRadius: 22,
            background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)',
            filter: 'blur(12px)',
            zIndex: 0,
          }} />
          {/* Gradient border ring */}
          <div style={{
            position: 'relative', zIndex: 1,
            padding: 3, borderRadius: 18,
            background: 'linear-gradient(135deg, #06b6d4, #22d3ee, #2dd4bf)',
          }}>
            <div style={{
              background: 'white', padding: 12, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src={qrImageUrl}
                alt={`QR Code for ${shortCode}`}
                style={{ width: 170, height: 170, display: 'block', borderRadius: 8 }}
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Short URL + copy */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(5,10,25,0.7)', border: '1px solid var(--border-subtle)',
          marginBottom: 14,
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600,
            color: '#22d3ee', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {shortUrl}
          </span>
          <button
            id="qr-copy-btn"
            onClick={handleCopy}
            style={{
              flexShrink: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6,
              border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
              background: copied ? 'rgba(52,211,153,0.1)' : 'rgba(34,211,238,0.08)',
              borderColor: copied ? 'rgba(52,211,153,0.3)' : 'rgba(34,211,238,0.2)',
              color: copied ? '#34d399' : '#22d3ee',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {/* Download button */}
        <button
          id="qr-download-btn"
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary"
          style={{ width: '100%', height: 44, gap: 8 }}
        >
          {downloading ? <Spinner size={16} /> : (
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          {downloading ? 'Downloading…' : 'Download QR Code'}
        </button>
      </div>
    </div>
  );
}
