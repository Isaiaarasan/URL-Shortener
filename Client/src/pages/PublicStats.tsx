import React, { useEffect } from 'react';
import { Spinner } from '../components/Spinner';

interface PublicStatsProps {
  shortCode: string;
  publicStats: any;
  loading: boolean;
  onFetch: (code: string) => Promise<void>;
}

export const PublicStats: React.FC<PublicStatsProps> = ({
  shortCode,
  publicStats,
  loading,
  onFetch
}) => {

  useEffect(() => {
    if (shortCode) {
      onFetch(shortCode);
    }
  }, [shortCode]);

  const formatDateString = (isoString: string | null) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <main className="auth-page">
      <div className="auth-card" style={{ maxWidth: '440px', padding: '24px' }}>
        <div className="auth-header" style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '20px' }}>Short Link Analytics</h2>
          <p>Aggregate counts for shortcode <strong>/{shortCode}</strong></p>
        </div>

        {loading ? (
          <div style={{ padding: '30px' }}>
            <Spinner message="Syncing counts..." />
          </div>
        ) : !publicStats ? (
          <div style={{ padding: '16px 0', color: 'var(--accent-danger)' }}>
            <p>The stats for this short link could not be loaded or the code is invalid.</p>
            <button onClick={() => window.location.hash = '#/'} className="btn btn-secondary" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}>
              Back to Home
            </button>
          </div>
        ) : (
          <div className="auth-form" style={{ gap: '12px' }}>
            <div className="option-field" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <label>Destination link</label>
              <a href={publicStats.originalUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', wordBreak: 'break-all', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
                {publicStats.originalUrl}
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '4px 0' }}>
              <div className="stat-card" style={{ padding: '12px' }}>
                <span className="stat-label" style={{ fontSize: '10px' }}>Created</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatDateString(publicStats.createdAt)}
                </span>
              </div>
              <div className="stat-card" style={{ padding: '12px' }}>
                <span className="stat-label" style={{ fontSize: '10px' }}>Total Clicks</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {publicStats.clicks}
                </span>
              </div>
            </div>
            <div className="option-field" style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
              <label>Last Click Logged</label>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {publicStats.lastVisited ? new Date(publicStats.lastVisited).toLocaleString() : 'No clicks logged yet'}
              </span>
            </div>
            <button onClick={() => window.location.hash = '#/'} className="btn btn-secondary" style={{ justifyContent: 'center', marginTop: '10px' }}>
              Back to Homepage
            </button>
          </div>
        )}
      </div>
    </main>
  );
};
