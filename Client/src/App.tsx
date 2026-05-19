import { useState, useEffect } from 'react';

// Interfaces for strict TypeScript typing
interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Url {
  _id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface Visit {
  _id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
}

interface AnalyticsData {
  url: {
    shortCode: string;
    originalUrl: string;
    createdAt: string;
  };
  totalClicks: number;
  lastVisited: string | null;
  recentVisits: Visit[];
  dailyClicks: Array<{ date: string; count: number }>;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App Routing (Hash-based)
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

  // Dashboard & Shortening States
  const [urls, setUrls] = useState<Url[]>([]);
  const [urlsLoading, setUrlsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Public stats state
  const [publicStats, setPublicStats] = useState<any | null>(null);
  const [publicStatsLoading, setPublicStatsLoading] = useState(false);

  // Active Analytics Detail state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Shortener Form state (for home & dashboard quick actions)
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shortenResult, setShortenResult] = useState<Url | null>(null);
  const [shortenLoading, setShortenLoading] = useState(false);

  // Auth Inputs
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Modals state
  const [showQrModal, setShowQrModal] = useState<Url | null>(null);
  const [showEditModal, setShowEditModal] = useState<Url | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Url | null>(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editExpiresAt, setEditExpiresAt] = useState('');

  // Toast stack state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // API base URL
  const API_URL = 'http://localhost:5000/api';

  // 1. Toast Notification trigger
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // 2. Load token from localStorage on initialization
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('linksnap_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setUser(data.data.user);
          } else {
            // Token expired or invalid
            localStorage.removeItem('linksnap_token');
            setToken(null);
          }
        } catch (error) {
          console.error("Auth validation failed", error);
        }
      }
      setAuthLoading(false);
    };

    initializeAuth();
  }, []);

  // 3. Router Listener & Route guards
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setCurrentPath(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 4. Handle route updates & protection rules
  useEffect(() => {
    const navigateBasedOnPath = async () => {
      if (authLoading) return;

      // Parse current route
      if (currentPath === '#/') {
        // Safe homepage
      } else if (currentPath === '#/login') {
        if (user) window.location.hash = '#/dashboard';
      } else if (currentPath === '#/signup') {
        if (user) window.location.hash = '#/dashboard';
      } else if (currentPath === '#/dashboard') {
        if (!user) {
          showToast('Please login to access the dashboard', 'error');
          window.location.hash = '#/login';
        } else {
          fetchUserUrls();
        }
      } else if (currentPath.startsWith('#/analytics/')) {
        if (!user) {
          window.location.hash = '#/login';
        } else {
          const urlId = currentPath.split('#/analytics/')[1];
          if (urlId) {
            fetchUrlAnalytics(urlId);
          }
        }
      } else if (currentPath.startsWith('#/stats/')) {
        const code = currentPath.split('#/stats/')[1];
        if (code) {
          fetchPublicStats(code);
        }
      }
    };

    navigateBasedOnPath();
  }, [currentPath, user, authLoading, currentPage]);

  // Search debounce effect
  useEffect(() => {
    if (user && currentPath === '#/dashboard') {
      const timer = setTimeout(() => {
        fetchUserUrls();
      }, 4000); // 400ms debounce
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // 5. Fetch Dashboard URLs
  const fetchUserUrls = async () => {
    if (!token) return;
    setUrlsLoading(true);
    try {
      const res = await fetch(`${API_URL}/urls?page=${currentPage}&limit=10&search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUrls(data.data.urls);
        setTotalPages(data.data.pagination.totalPages || 1);
        setTotalCount(data.data.pagination.totalCount || 0);
      } else {
        showToast(data.message || 'Failed to load links', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch links', 'error');
    } finally {
      setUrlsLoading(false);
    }
  };

  // 6. Fetch URL Analytics
  const fetchUrlAnalytics = async (urlId: string) => {
    if (!token) return;
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`${API_URL}/urls/${urlId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalytics(data.data);
      } else {
        showToast(data.message || 'Failed to fetch analytics', 'error');
        window.location.hash = '#/dashboard';
      }
    } catch (err: any) {
      showToast(err.message || 'Analytics fetch error', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // 7. Fetch Public Stats
  const fetchPublicStats = async (shortCode: string) => {
    setPublicStatsLoading(true);
    try {
      const res = await fetch(`${API_URL}/stats/${shortCode}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPublicStats(data.data);
      } else {
        showToast(data.message || 'Stats not found', 'error');
      }
    } catch (err: any) {
      showToast('Public stats fetch error', 'error');
    } finally {
      setPublicStatsLoading(false);
    }
  };

  // 8. Action: Shorten URL
  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl) {
      showToast('Please enter a destination URL', 'error');
      return;
    }
    setShortenLoading(true);
    setShortenResult(null);

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_URL}/urls`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          originalUrl,
          customAlias: customAlias || null,
          expiresAt: expiresAt || null
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShortenResult(data.data);
        showToast('Link shortened successfully!', 'success');
        // Clear forms
        setOriginalUrl('');
        setCustomAlias('');
        setExpiresAt('');
        setShowAdvanced(false);
        // Refresh dashboard list if logged in
        if (user && currentPath === '#/dashboard') fetchUserUrls();
      } else {
        showToast(data.message || 'Failed to shorten URL', 'error');
      }
    } catch (err: any) {
      showToast('Connection to server failed', 'error');
    } finally {
      setShortenLoading(false);
    }
  };

  // 9. Action: Copy link to clipboard
  const handleCopyLink = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    showToast('Link copied to clipboard!', 'success');
  };

  // 10. Action: Auth Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      showToast('All fields are required', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('linksnap_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        showToast('Welcome back to LinkSnap!', 'success');
        // Reset state
        setAuthEmail('');
        setAuthPassword('');
        window.location.hash = '#/dashboard';
      } else {
        showToast(data.message || 'Login failed', 'error');
      }
    } catch (err: any) {
      showToast('Network error, login failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // 11. Action: Auth Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName || !authEmail || !authPassword) {
      showToast('All fields are required', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authName, email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('linksnap_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        showToast('Account registered successfully!', 'success');
        // Reset state
        setAuthName('');
        setAuthEmail('');
        setAuthPassword('');
        window.location.hash = '#/dashboard';
      } else {
        showToast(data.message || 'Signup failed', 'error');
      }
    } catch (err: any) {
      showToast('Network error, signup failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // 12. Action: Logout
  const handleLogout = () => {
    localStorage.removeItem('linksnap_token');
    setToken(null);
    setUser(null);
    setUrls([]);
    showToast('Logged out successfully', 'success');
    window.location.hash = '#/';
  };

  // 13. Action: Edit URL modal submit
  const triggerEditModal = (url: Url) => {
    setShowEditModal(url);
    setEditOriginalUrl(url.originalUrl);
    setEditExpiresAt(url.expiresAt ? new Date(url.expiresAt).toISOString().split('T')[0] : '');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal || !token) return;
    try {
      const res = await fetch(`${API_URL}/urls/${showEditModal._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          originalUrl: editOriginalUrl,
          expiresAt: editExpiresAt || null
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Link destination updated successfully!', 'success');
        setShowEditModal(null);
        fetchUserUrls();
      } else {
        showToast(data.message || 'Update failed', 'error');
      }
    } catch (err: any) {
      showToast('Failed to update URL details', 'error');
    }
  };

  // 14. Action: Delete URL modal submit
  const handleDeleteSubmit = async () => {
    if (!showDeleteModal || !token) return;
    try {
      const res = await fetch(`${API_URL}/urls/${showDeleteModal._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Link and its analytics purged!', 'success');
        setShowDeleteModal(null);
        fetchUserUrls();
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch (err: any) {
      showToast('Failed to delete URL', 'error');
    }
  };

  // 15. Helper: Date Formatter
  const formatDateString = (isoString: string | null) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (expiry: string | null) => {
    if (!expiry) return false;
    return new Date(expiry) <= new Date();
  };

  // Spinner Screen if App Initialization in progress
  if (authLoading) {
    return (
      <div className="app-container">
        <div className="loader-overlay">
          <div className="spinner"></div>
          <p>Initializing LinkSnap Security context...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 🚀 TOAST ALERTS */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            <span style={{ fontSize: '18px' }}>{toast.type === 'error' ? '⚠️' : '✨'}</span>
            <p style={{ fontSize: '14px', fontWeight: 500 }}>{toast.message}</p>
          </div>
        ))}
      </div>

      {/* 🌐 NAVIGATION BAR */}
      <header className="navbar">
        <div className="nav-wrapper">
          <a href="#/" className="logo-container">
            <div className="logo-icon">🔗</div>
            <div className="logo-text">Link<span>Snap</span></div>
          </a>
          <nav className="nav-links">
            <a href="#/" className="btn btn-text">Home</a>
            {user ? (
              <>
                <a href="#/dashboard" className="btn btn-text">Dashboard</a>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '8px' }}>
                  Hi, <strong>{user.name}</strong>
                </span>
                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
              </>
            ) : (
              <>
                <a href="#/login" className="btn btn-text">Login</a>
                <a href="#/signup" className="btn btn-primary">Get Started</a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 📺 VIEW ROUTING SECTION */}

      {/* A. LANDING VIEW */}
      {currentPath === '#/' && (
        <main className="hero-section">
          <div className="hero-badge">Katomaran Hackathon 2026 Entry</div>
          <h1 className="hero-title">
            Unlock the Power of Your Links with <span>Deep Analytics</span>
          </h1>
          <p className="hero-subtitle">
            Shorten long URLs instantly, inject custom memorable aliases, manage your link assets under a glassmorphic dashboard, and track granular daily visual statistics.
          </p>

          {/* Quick shorten card */}
          <div className="shorten-container">
            <form onSubmit={handleShorten} className="auth-form" style={{ gap: '14px' }}>
              <div className="shorten-form-row">
                <div className="input-group">
                  <span className="input-icon">🔗</span>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Paste a long, messy link here (e.g. https://www.google.com/search?q=hackathon)..."
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={shortenLoading} style={{ padding: '14px 28px' }}>
                  {shortenLoading ? 'Snapping...' : 'Snip Link'}
                </button>
              </div>

              {/* Advanced option toggles */}
              <div className="advanced-trigger" onClick={() => setShowAdvanced(!showAdvanced)}>
                <span>⚙️</span>
                <span>{showAdvanced ? 'Hide advanced routing options' : 'Configure custom alias & link expiration'}</span>
              </div>

              {showAdvanced && (
                <div className="advanced-options">
                  <div className="option-field">
                    <label htmlFor="alias-input">Memorable Custom Alias (Optional)</label>
                    <input
                      id="alias-input"
                      type="text"
                      placeholder="e.g. my-hack-repo"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                    />
                  </div>
                  <div className="option-field">
                    <label htmlFor="expiry-input">Expiration Timestamp (Optional)</label>
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

            {/* Render shorten result */}
            {shortenResult && (
              <div className="result-card">
                <div className="result-urls">
                  <a href={shortenResult.shortUrl} target="_blank" rel="noreferrer" className="result-short">
                    {shortenResult.shortUrl}
                  </a>
                  <div className="result-original">{shortenResult.originalUrl}</div>
                </div>
                <div className="result-actions">
                  <button onClick={() => handleCopyLink(shortenResult.shortUrl)} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
                    Copy Link
                  </button>
                  <a href={`#/stats/${shortenResult.shortCode}`} className="btn btn-text" style={{ padding: '8px 14px', fontSize: '13px' }}>
                    View Stats
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Marketing features grid */}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">🚀</div>
              <h3>Sub-millisecond Snaps</h3>
              <p>Highly optimized redirection layers powered by Mongo indexes provide near-instant redirects for your audience.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">📊</div>
              <h3>Granular Analytics</h3>
              <p>Observe click trends grouped dynamically by date over the past 7 days, complete with IP masks and OS identifiers.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">🛡️</div>
              <h3>Privacy Hardened</h3>
              <p>GDPR-compliant IP-masking and secure database structures protect visitor privacy while tracking link performance.</p>
            </div>
          </div>
        </main>
      )}

      {/* B. LOGIN VIEW */}
      {currentPath === '#/login' && (
        <main className="auth-page">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Sign in to manage your active short link assets</p>
            </div>
            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-field">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  placeholder="name@company.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Account Password</label>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }} disabled={formLoading}>
                {formLoading ? 'Verifying session...' : 'Access Dashboard'}
              </button>
            </form>
            <div className="auth-redirect">
              Don't have an account? <span onClick={() => window.location.hash = '#/signup'}>Get snapping</span>
            </div>
          </div>
        </main>
      )}

      {/* C. SIGNUP VIEW */}
      {currentPath === '#/signup' && (
        <main className="auth-page">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Snip Links Free</h2>
              <p>Create a secure account in under 30 seconds</p>
            </div>
            <form onSubmit={handleSignup} className="auth-form">
              <div className="auth-field">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  placeholder="Jane Doe"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  placeholder="jane@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Password (Min 6 chars)</label>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }} disabled={formLoading}>
                {formLoading ? 'Provisioning...' : 'Create Snappy Account'}
              </button>
            </form>
            <div className="auth-redirect">
              Already have an account? <span onClick={() => window.location.hash = '#/login'}>Sign in instead</span>
            </div>
          </div>
        </main>
      )}

      {/* D. PROTECTED DASHBOARD VIEW */}
      {currentPath === '#/dashboard' && (
        <main className="dashboard-container">
          <div className="dashboard-header">
            <div className="dashboard-title">
              <h1>Link Workspace</h1>
              <p>Manage, track, and generate assets for your links</p>
            </div>
            <button className="btn btn-primary" onClick={() => {
              window.location.hash = '#/';
              showToast('Create links directly using the homepage Snip form!', 'success');
            }}>
              ➕ Snap New URL
            </button>
          </div>

          {/* Table Search filters */}
          <div className="dashboard-controls">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search matching long URLs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing <strong>{urls.length}</strong> of <strong>{totalCount}</strong> link assets
            </div>
          </div>

          {/* Links paginated table */}
          {urlsLoading ? (
            <div className="table-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div className="spinner"></div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Syncing link ledger from MongoDB...</p>
            </div>
          ) : urls.length === 0 ? (
            <div className="table-card">
              <div className="empty-state">
                <div className="empty-icon">📂</div>
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
                      <th>Total Clicks</th>
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
                                {expired ? '⌛ Expired' : `📅 ${formatDateString(url.expiresAt)}`}
                              </span>
                            ) : (
                              <span className="expiry-badge expiry-none">No expiry</span>
                            )}
                          </td>
                          <td>
                            <div className="click-badge">📈 {url.clicks} clicks</div>
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button onClick={() => handleCopyLink(url.shortUrl)} className="action-icon-btn" title="Copy to clipboard">
                                📋
                              </button>
                              <button onClick={() => setShowQrModal(url)} className="action-icon-btn" title="Generate QR Asset">
                                📱
                              </button>
                              <button onClick={() => window.location.hash = `#/analytics/${url._id}`} className="action-icon-btn" title="View Full Analytics">
                                📊
                              </button>
                              <button onClick={() => triggerEditModal(url)} className="action-icon-btn" title="Modify Link Destination">
                                ✏️
                              </button>
                              <button onClick={() => setShowDeleteModal(url)} className="action-icon-btn" style={{ color: 'var(--accent-danger)' }} title="Delete Link">
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
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
      )}

      {/* E. PROTECTED ANALYTICS VIEW */}
      {currentPath.startsWith('#/analytics/') && (
        <main className="dashboard-container">
          <div className="analytics-title-row">
            <button onClick={() => window.location.hash = '#/dashboard'} className="back-btn">
              ◀ Back to Dashboard
            </button>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Link Performance</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Metrics analysis for shortlink <strong>/{analytics?.url.shortCode}</strong>
              </p>
            </div>
          </div>

          {analyticsLoading || !analytics ? (
            <div className="table-card" style={{ padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div className="spinner"></div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Gathering server logs and running aggregation...</p>
            </div>
          ) : (
            <>
              {/* Stat highlights */}
              <div className="analytics-grid">
                <div className="stat-card">
                  <span className="stat-label">Total Clicks</span>
                  <span className="stat-value">{analytics.totalClicks}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Last Visited</span>
                  <span className="stat-value" style={{ fontSize: '18px', paddingTop: '10px' }}>
                    {analytics.lastVisited ? formatDateString(analytics.lastVisited) : 'Never'}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Unique IPs</span>
                  <span className="stat-value">
                    {new Set(analytics.recentVisits.map(v => v.ip)).size}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Created Date</span>
                  <span className="stat-value" style={{ fontSize: '18px', paddingTop: '10px' }}>
                    {formatDateString(analytics.url.createdAt)}
                  </span>
                </div>
              </div>

              {/* Chart and Table detail */}
              <div className="analytics-details-row">
                {/* Visual SVG Chart */}
                <div className="details-card">
                  <div className="card-title">
                    <span>Daily aggregate clicks (Past 7 Days)</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Updated real-time</span>
                  </div>

                  <div className="chart-container">
                    <div className="bar-chart">
                      {analytics.dailyClicks.map((d, index) => {
                        const maxVal = Math.max(...analytics.dailyClicks.map(item => item.count)) || 1;
                        const percentHeight = Math.max((d.count / maxVal) * 100, 2); // At least 2% height for empty indicators
                        const dayLabel = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' });

                        return (
                          <div key={index} className="bar-wrapper">
                            <div
                              className="bar-column"
                              style={{ height: `${percentHeight}%` }}
                            >
                              {/* Hover tooltip details */}
                              <div className="bar-tooltip">{d.count} clicks ({d.date})</div>
                            </div>
                            <span className="bar-label">{dayLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recent visits logs table */}
                <div className="details-card">
                  <div className="card-title">
                    <span>Recent Visitor Logs</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Showing last 20 hits</span>
                  </div>

                  <div className="visits-list">
                    {analytics.recentVisits.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>
                        No clicks recorded yet. Share your short link to capture traffic!
                      </p>
                    ) : (
                      analytics.recentVisits.map((visit, index) => {
                        // User Agent simplifier
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
      )}

      {/* F. PUBLIC STATS VIEW */}
      {currentPath.startsWith('#/stats/') && (
        <main className="auth-page">
          <div className="auth-card" style={{ maxWidth: '520px', padding: '36px' }}>
            <div className="auth-header" style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '24px' }}>Public Link Statistics</h2>
              <p>Aggregate counts for shortcode <strong>/{publicStats?.shortCode}</strong></p>
            </div>

            {publicStatsLoading ? (
              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div className="spinner"></div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Fetching metrics from MongoDB...</p>
              </div>
            ) : !publicStats ? (
              <div style={{ padding: '20px 0', color: 'var(--accent-danger)' }}>
                <p>The stats for this short link could not be loaded or the code is invalid.</p>
                <button onClick={() => window.location.hash = '#/'} className="btn btn-secondary" style={{ marginTop: '16px' }}>
                  Back to Homepage
                </button>
              </div>
            ) : (
              <div className="auth-form" style={{ gap: '16px' }}>
                <div className="option-field" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <label>Destination link</label>
                  <a href={publicStats.originalUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-secondary)', wordBreak: 'break-all', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                    {publicStats.originalUrl}
                  </a>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '8px 0' }}>
                  <div className="stat-card" style={{ padding: '16px' }}>
                    <span className="stat-label" style={{ fontSize: '11px' }}>Created</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatDateString(publicStats.createdAt)}
                    </span>
                  </div>
                  <div className="stat-card" style={{ padding: '16px' }}>
                    <span className="stat-label" style={{ fontSize: '11px' }}>Total clicks</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {publicStats.clicks}
                    </span>
                  </div>
                </div>
                <div className="option-field" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <label>Last recorded hit</label>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {publicStats.lastVisited ? new Date(publicStats.lastVisited).toLocaleString() : 'No clicks logged yet'}
                  </span>
                </div>
                <button onClick={() => window.location.hash = '#/'} className="btn btn-secondary" style={{ justifyContent: 'center', marginTop: '12px' }}>
                  Back to Homepage
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* 📥 ACTIVE INTERACTIVE MODALS */}

      {/* 1. QR Code Asset generation modal */}
      {showQrModal && (
        <div className="modal-overlay" onClick={() => setShowQrModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowQrModal(null)}>✕</button>
            <div className="modal-title">QR Asset Generator</div>
            <div className="qr-modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Download asset or scan code to route to short link <strong>/{showQrModal.shortCode}</strong>
              </p>
              <div className="qr-image-container">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(showQrModal.shortUrl)}`}
                  alt="Short link QR code asset"
                  width="200"
                  height="200"
                />
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent-secondary)' }}>
                {showQrModal.shortUrl}
              </p>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(showQrModal.shortUrl)}`}
                target="_blank"
                rel="noreferrer"
                download={`qr-${showQrModal.shortCode}.png`}
                className="btn btn-primary qr-download-btn"
              >
                💾 Download PNG Asset
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Destination Link Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEditModal(null)}>✕</button>
            <div className="modal-title">Edit Short Link Destination</div>
            <form onSubmit={handleEditSubmit} className="auth-form">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Modifying original redirect destination for shortcode <strong>/{showEditModal.shortCode}</strong>
              </p>
              <div className="auth-field">
                <label>New Destination URL</label>
                <input
                  type="url"
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Update Link Expiry (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  value={editExpiresAt}
                  onChange={(e) => setEditExpiresAt(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowEditModal(null)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Purge Link and Analytics Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDeleteModal(null)}>✕</button>
            <div className="modal-title" style={{ color: 'var(--accent-danger)' }}>⚠️ Purge URL Asset</div>
            <div className="auth-form">
              <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                Are you absolutely sure you want to delete shortlink <strong>/{showDeleteModal.shortCode}</strong>?
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(239,68,68,0.08)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.2)' }}>
                This is a destructive operational action. All visit records, statistics, and charts historical logs will be permanently deleted from MongoDB and cannot be restored.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowDeleteModal(null)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="button" onClick={handleDeleteSubmit} className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
                  🔥 Purge Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📝 FOOTER SIGNATURE */}
      <footer className="footer">
        © 2026 LinkSnap. Snapped with 💜 for the <span>Katomaran Hackathon</span>
      </footer>
    </div>
  );
}

export default App;
