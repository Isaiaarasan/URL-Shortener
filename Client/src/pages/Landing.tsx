import React, { useState } from 'react';
import { LinkIcon, SettingsIcon, StatsIcon, PlusIcon } from '../components/Icons';
import type { Url } from '../hooks/useUrls';

interface LandingProps {
  onShorten: (url: string, alias: string | null, expires: string | null) => Promise<Url | null>;
  shortenLoading: boolean;
  shortenResult: Url | null;
  onCopy: (shortUrl: string) => void;
}

export const Landing: React.FC<LandingProps> = ({
  onShorten,
  shortenLoading,
  shortenResult,
  onCopy
}) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl) return;
    const success = await onShorten(originalUrl, customAlias || null, expiresAt || null);
    if (success) {
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresAt('');
      setShowAdvanced(false);
    }
  };

  return (
    <main className="hero-section">
      <div className="hero-badge">Open Source Developer Link Router</div>
      <h1 className="hero-title">
        Modern link shortening <span>for teams</span>
      </h1>
      <p className="hero-subtitle">
        Generate clean, secure redirect links and custom aliases. Monitor analytics dynamically through an index-optimized database cluster.
      </p>

      {/* Shortening panel */}
      <div className="shorten-container">
        <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '14px' }}>
          <div className="shorten-form-row">
            <div className="input-group">
              <span className="input-icon">
                <LinkIcon />
              </span>
              <input
                type="url"
                className="form-input"
                placeholder="Paste a long link destination here..."
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={shortenLoading} style={{ padding: '12px 24px' }}>
              {shortenLoading ? 'Snapping...' : 'Shorten'}
            </button>
          </div>

          <div className="advanced-trigger" onClick={() => setShowAdvanced(!showAdvanced)}>
            <SettingsIcon />
            <span>{showAdvanced ? 'Hide routing settings' : 'Configure custom alias & link expiry'}</span>
          </div>

          {showAdvanced && (
            <div className="advanced-options">
              <div className="option-field">
                <label htmlFor="alias-input">Custom Alias (Optional)</label>
                <input
                  id="alias-input"
                  type="text"
                  placeholder="e.g. repo-link"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                />
              </div>
              <div className="option-field">
                <label htmlFor="expiry-input">Expiration Date (Optional)</label>
                <input
                  id="expiry-input"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>
          )}
        </form>

        {/* Shorten Results Card */}
        {shortenResult && (
          <div className="result-card">
            <div className="result-urls">
              <a href={shortenResult.shortUrl} target="_blank" rel="noreferrer" className="result-short">
                {shortenResult.shortUrl}
              </a>
              <div className="result-original">{shortenResult.originalUrl}</div>
            </div>
            <div className="result-actions">
              <button onClick={() => onCopy(shortenResult.shortUrl)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                Copy
              </button>
              <a href={`#/stats/${shortenResult.shortCode}`} className="btn btn-text" style={{ padding: '6px 12px', fontSize: '13px' }}>
                View Stats
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Grid marketing features */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <PlusIcon />
          </div>
          <h3>Fast Redirections</h3>
          <p>Highly optimized indices inside MongoDB guarantee that routing requests execute under minimal latencies.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <StatsIcon />
          </div>
          <h3>Granular Analytics</h3>
          <p>Observe click trends grouped dynamically by date over the past 7 days, complete with IP masks and OS identifiers.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <SettingsIcon />
          </div>
          <h3>Privacy Compliance</h3>
          <p>Standard GDPR-compliant IP-masking and secure database structures protect user privacy while tracking click counts.</p>
        </div>
      </div>
    </main>
  );
};
