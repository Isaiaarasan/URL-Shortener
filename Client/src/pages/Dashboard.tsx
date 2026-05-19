import React, { useState, useEffect } from 'react';
import type { Url } from '../hooks/useUrls';
import { SearchIcon, PlusIcon, LinkIcon, CopyIcon, QrIcon, StatsIcon, EditIcon, TrashIcon } from '../components/Icons';
import { Spinner } from '../components/Spinner';

interface DashboardProps {
  urls: Url[];
  loading: boolean;
  totalCount: number;
  totalPages: number;
  fetchUrls: (page: number, search: string) => Promise<void>;
  onCopy: (shortUrl: string) => void;
  onQrClick: (url: Url) => void;
  onEditClick: (url: Url) => void;
  onDeleteClick: (url: Url) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  urls,
  loading,
  totalCount,
  totalPages,
  fetchUrls,
  onCopy,
  onQrClick,
  onEditClick,
  onDeleteClick
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Trigger data fetching on page or search changes
  useEffect(() => {
    fetchUrls(currentPage, search);
  }, [currentPage, search]);

  const formatDateString = (isoString: string | null) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (expiry: string | null) => {
    if (!expiry) return false;
    return new Date(expiry) <= new Date();
  };

  return (
    <main className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Branded Links</h1>
          <p>Workspace asset manager and metric tracker</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.location.hash = '#/'}>
          <PlusIcon /> New Link
        </button>
      </div>

      {/* Table filters */}
      <div className="dashboard-controls">
        <div className="search-input-wrapper">
          <span className="search-icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search link assets..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset page on new query
            }}
          />
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Showing <strong>{urls.length}</strong> of <strong>{totalCount}</strong> link assets
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="table-card" style={{ padding: '60px' }}>
          <Spinner message="Syncing link ledger..." />
        </div>
      ) : urls.length === 0 ? (
        <div className="table-card">
          <div className="empty-state">
            <div className="empty-icon" style={{ width: '48px', height: '48px' }}>
              <LinkIcon />
            </div>
            <h3>No link assets matching query</h3>
            <p>Snip a new URL or adjust search parameters to begin tracking details.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="table-card">
            <table className="links-table">
              <thead>
                <tr>
                  <th>Short Link</th>
                  <th>Destination Link</th>
                  <th>Expiry</th>
                  <th>Clicks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => {
                  const expired = isExpired(url.expiresAt);
                  return (
                    <tr key={url._id}>
                      <td>
                        <a href={url.shortUrl} target="_blank" rel="noreferrer" className="table-short-code">
                          /{url.shortCode}
                        </a>
                        <span className="table-date">Added {formatDateString(url.createdAt)}</span>
                      </td>
                      <td>
                        <span className="table-original-url" title={url.originalUrl}>
                          {url.originalUrl}
                        </span>
                      </td>
                      <td>
                        {url.expiresAt ? (
                          <span className={`expiry-badge ${expired ? 'expiry-expired' : 'expiry-active'}`}>
                            {expired ? 'Expired' : `${formatDateString(url.expiresAt)}`}
                          </span>
                        ) : (
                          <span className="expiry-badge expiry-none">No expiry</span>
                        )}
                      </td>
                      <td>
                        <div className="click-badge">{url.clicks} clicks</div>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button onClick={() => onCopy(url.shortUrl)} className="action-icon-btn" title="Copy link">
                            <CopyIcon />
                          </button>
                          <button onClick={() => onQrClick(url)} className="action-icon-btn" title="QR Asset">
                            <QrIcon />
                          </button>
                          <button onClick={() => window.location.hash = `#/analytics/${url._id}`} className="action-icon-btn" title="Analytics">
                            <StatsIcon />
                          </button>
                          <button onClick={() => onEditClick(url)} className="action-icon-btn" title="Edit">
                            <EditIcon />
                          </button>
                          <button onClick={() => onDeleteClick(url)} className="action-icon-btn" style={{ color: 'var(--accent-danger)' }} title="Delete">
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table pagination control list */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <span className="page-indicator">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                className="page-btn"
              >
                ◀
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`page-btn ${currentPage === p ? 'active' : ''}`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                className="page-btn"
              >
                ▶
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
};
