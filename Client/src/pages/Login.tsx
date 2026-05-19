import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome back</h2>
          <p>Sign in to manage your active link assets</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              style={{ paddingLeft: '12px' }}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              style={{ paddingLeft: '12px' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
        <div className="auth-redirect">
          Don't have an account? <span onClick={() => window.location.hash = '#/signup'}>Sign up free</span>
        </div>
      </div>
    </main>
  );
};
