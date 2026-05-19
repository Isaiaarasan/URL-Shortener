import React, { useEffect } from 'react';
import type { AnalyticsData } from '../hooks/useUrls';
import { BackIcon } from '../components/Icons';
import { Spinner } from '../components/Spinner';

interface AnalyticsProps {
  urlId: string;
  analytics: AnalyticsData | null;
  loading: boolean;
  onFetch: (id: string) => Promise<void>;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  urlId,
  analytics,
  loading,
  onFetch
}) => {

  useEffect(() => {
    if (urlId) {
      onFetch(urlId);
    }
  }, [urlId]);

  const formatDateString = (isoString: string | null) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <main className="dashboard-container">
      <div className="analytics-title-row">
        <button onClick={() => window.location.hash = '#/dashboard'} className="back-btn">
          <BackIcon /> Back to workspace
        </button>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Performance Metrics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Aggregate metrics for shortlink <strong>/{analytics?.url.shortCode}</strong>
          </p>
        </div>
      </div>

      {loading || !analytics ? (
        <div className="table-card" style={{ padding: '80px' }}>
          <Spinner message="Compiling transaction logs..." />
        </div>
      ) : (
        <>
          {/* Metrics grid cards */}
          <div className="analytics-grid">
            <div className="stat-card">
              <span className="stat-label">Total Redirects</span>
              <span className="stat-value">{analytics.totalClicks}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Last Clicked</span>
              <span className="stat-value" style={{ fontSize: '16px', paddingTop: '8px' }}>
                {analytics.lastVisited ? formatDateString(analytics.lastVisited) : 'Never'}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Unique Devices</span>
              <span className="stat-value">
                {new Set(analytics.recentVisits.map(v => v.ip)).size}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Creation Date</span>
              <span className="stat-value" style={{ fontSize: '16px', paddingTop: '8px' }}>
                {formatDateString(analytics.url.createdAt)}
              </span>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="analytics-details-row">
            {/* 7-day trend chart */}
            <div className="details-card">
              <div className="card-title">
                <span>Daily Clicks (Past 7 Days)</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Updated real-time</span>
              </div>

              <div className="chart-container">
                <div className="bar-chart">
                  {analytics.dailyClicks.map((d, index) => {
                    const maxVal = Math.max(...analytics.dailyClicks.map(item => item.count)) || 1;
                    const percentHeight = Math.max((d.count / maxVal) * 100, 4);
                    const dayLabel = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' });

                    return (
                      <div key={index} className="bar-wrapper">
                        <div
                          className="bar-column"
                          style={{ height: `${percentHeight}%` }}
                        >
                          <div className="bar-tooltip">{d.count} hits ({d.date})</div>
                        </div>
                        <span className="bar-label">{dayLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Traffic hit ledger */}
            <div className="details-card">
              <div className="card-title">
                <span>Traffic Ledger</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Showing last 20 events</span>
              </div>

              <div className="visits-list">
                {analytics.recentVisits.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>
                    No traffic logged yet.
                  </p>
                ) : (
                  analytics.recentVisits.map((visit, index) => {
                    let browser = 'Device';
                    if (visit.userAgent.includes('Chrome')) browser = 'Chrome';
                    else if (visit.userAgent.includes('Safari')) browser = 'Safari';
                    else if (visit.userAgent.includes('Firefox')) browser = 'Firefox';
                    else if (visit.userAgent.includes('Edge')) browser = 'Edge';

                    return (
                      <div key={index} className="visit-item">
                        <div className="visit-info">
                          <span className="visit-ip">{visit.ip}</span>
                          <span className="visit-time">
                            {new Date(visit.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })},{' '}
                            {new Date(visit.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="visit-ua">{browser}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};
