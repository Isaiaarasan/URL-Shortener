import React from 'react';
import { LinkIcon } from './Icons';
import type { User } from '../hooks/useAuth';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <header className="navbar">
      <div className="nav-wrapper">
        <a href="#/" className="logo-container">
          <div className="logo-icon">
            <LinkIcon />
          </div>
          <div className="logo-text">Link<span>Snap</span></div>
        </a>
        <nav className="nav-links">
          <a href="#/" className="btn btn-text">Home</a>
          {user ? (
            <>
              <a href="#/dashboard" className="btn btn-text">Links</a>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '4px' }}>
                <strong>{user.name}</strong>
              </span>
              <button onClick={onLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <a href="#/login" className="btn btn-text">Login</a>
              <a href="#/signup" className="btn btn-primary">Sign Up</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
