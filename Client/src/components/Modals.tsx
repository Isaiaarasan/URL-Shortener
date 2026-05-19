import React, { useState } from 'react';
import type { Url } from '../hooks/useUrls';

interface QrModalProps {
  url: Url;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ url, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">QR Link Asset</div>
        <div className="qr-modal-body">
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Download or scan to open short link <strong>/{url.shortCode}</strong>
          </p>
          <div className="qr-image-container">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url.shortUrl)}`}
              alt="Short link QR code asset"
              width="200"
              height="200"
            />
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
            {url.shortUrl}
          </p>
          <a
            href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url.shortUrl)}`}
            target="_blank"
            rel="noreferrer"
            download={`qr-${url.shortCode}.png`}
            className="btn btn-primary qr-download-btn"
          >
            Download Asset PNG
          </a>
        </div>
      </div>
    </div>
  );
};

interface EditModalProps {
  url: Url;
  onClose: () => void;
  onSubmit: (originalUrl: string, expiresAt: string | null) => Promise<void>;
}

export const EditModal: React.FC<EditModalProps> = ({ url, onClose, onSubmit }) => {
  const [editUrl, setEditUrl] = useState(url.originalUrl);
  const [expiresAt, setExpiresAt] = useState(
    url.expiresAt ? new Date(url.expiresAt).toISOString().split('T')[0] : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(editUrl, expiresAt || null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Edit redirect target</div>
        <form onSubmit={handleSubmit} className="auth-form">
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Updating routing address for shortcode <strong>/{url.shortCode}</strong>
          </p>
          <div className="auth-field">
            <label>New Destination URL</label>
            <input
              type="url"
              className="form-input"
              style={{ paddingLeft: '12px' }}
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label>Expiration Date (Optional)</label>
            <input
              type="date"
              className="form-input"
              style={{ paddingLeft: '12px' }}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteModalProps {
  url: Url;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ url, onClose, onConfirm }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title" style={{ color: 'var(--accent-danger)' }}>Delete Link Asset</div>
        <div className="auth-form">
          <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
            Are you sure you want to delete shortlink <strong>/{url.shortCode}</strong>?
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', background: '#fef2f2', padding: '8px', borderRadius: '4px', border: '1px solid #fee2e2' }}>
            This is a permanent operational action. All visit records and analytics logs will be deleted from the database.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="button" onClick={onConfirm} className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
              Purge Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
