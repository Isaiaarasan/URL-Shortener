import React from 'react';

interface SpinnerProps {
  message?: string;
  overlay?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ message, overlay = false }) => {
  const content = (
    <div className={overlay ? "loader-overlay" : "spinner-container"} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
      <div className="spinner"></div>
      {message && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>{message}</p>}
    </div>
  );

  return content;
};
