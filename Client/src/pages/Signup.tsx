import React, { useState } from 'react';

interface SignupProps {
  onSignup: (name: string, email: string, password: string) => Promise<boolean>;
}

export const Signup: React.FC<SignupProps> = ({ onSignup }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    await onSignup(name, email, password);
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create an account</h2>
          <p>Get started with secure link management</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              className="form-input"
              style={{ paddingLeft: '12px' }}
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              className="form-input"
              style={{ paddingLeft: '12px' }}
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="signup-password">Password (Min 6 characters)</label>
            <input
              id="signup-password"
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
            {loading ? 'Provisioning...' : 'Register'}
          </button>
        </form>
        <div className="auth-redirect">
          Already have an account? <span onClick={() => window.location.hash = '#/login'}>Sign in</span>
        </div>
      </div>
    </main>
  );
};
