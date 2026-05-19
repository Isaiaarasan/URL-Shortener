import { useState, useEffect } from 'react';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useUrls } from './hooks/useUrls';
import type { Url } from './hooks/useUrls';

// Layout & UI Elements
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Spinner } from './components/Spinner';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

// Modals
import { QrModal, EditModal, DeleteModal } from './components/Modals';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { PublicStats } from './pages/PublicStats';

function App() {
  // 1. Path Router state
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

  // 2. Toast alerts list
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // 3. Auth hook
  const { user, token, authLoading, login, signup, logout } = useAuth(showToast);

  // 4. URL transactions hook
  const {
    urls,
    urlsLoading,
    totalCount,
    totalPages,
    shortenLoading,
    shortenResult,
    analytics,
    analyticsLoading,
    publicStats,
    publicStatsLoading,
    fetchUserUrls,
    shortenUrl,
    updateUrl,
    deleteUrl,
    fetchUrlAnalytics,
    fetchPublicStats
  } = useUrls(token, showToast);

  // 5. Active Modal switches
  const [activeQrUrl, setActiveQrUrl] = useState<Url | null>(null);
  const [activeEditUrl, setActiveEditUrl] = useState<Url | null>(null);
  const [activeDeleteUrl, setActiveDeleteUrl] = useState<Url | null>(null);

  // Router listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setCurrentPath(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Route security guard checks
  useEffect(() => {
    if (authLoading) return;

    if (currentPath === '#/login' || currentPath === '#/signup') {
      if (user) window.location.hash = '#/dashboard';
    } else if (currentPath === '#/dashboard' || currentPath.startsWith('#/analytics/')) {
      if (!user) {
        showToast('Please sign in to access this workspace', 'error');
        window.location.hash = '#/login';
      }
    }
  }, [currentPath, user, authLoading]);

  // Modal actions
  const handleEditSubmit = async (originalUrl: string, expiresAt: string | null) => {
    if (!activeEditUrl) return;
    const success = await updateUrl(activeEditUrl._id, originalUrl, expiresAt);
    if (success) {
      setActiveEditUrl(null);
      fetchUserUrls(1, ''); // Refresh page
    }
  };

  const handleDeleteSubmit = async () => {
    if (!activeDeleteUrl) return;
    const success = await deleteUrl(activeDeleteUrl._id);
    if (success) {
      setActiveDeleteUrl(null);
      fetchUserUrls(1, ''); // Refresh page
    }
  };

  const handleCopyLink = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    showToast('Copied short link to clipboard!', 'success');
  };

  // Spinner Screen if App Initialization in progress
  if (authLoading) {
    return (
      <div className="app-container">
        <Spinner message="Initializing security context..." overlay={true} />
      </div>
    );
  }

  // Parse path variables
  const isAnalyticsPath = currentPath.startsWith('#/analytics/');
  const analyticsUrlId = isAnalyticsPath ? currentPath.split('#/analytics/')[1] : '';

  const isStatsPath = currentPath.startsWith('#/stats/');
  const statsShortCode = isStatsPath ? currentPath.split('#/stats/')[1] : '';

  return (
    <div className="app-container">
      {/* Dynamic alerts */}
      <ToastContainer toasts={toasts} />

      {/* Global navbar header */}
      <Navbar user={user} onLogout={logout} />

      {/* Main content route view splits */}
      {currentPath === '#/' && (
        <Landing
          onShorten={shortenUrl}
          shortenLoading={shortenLoading}
          shortenResult={shortenResult}
          onCopy={handleCopyLink}
        />
      )}

      {currentPath === '#/login' && (
        <Login onLogin={login} />
      )}

      {currentPath === '#/signup' && (
        <Signup onSignup={signup} />
      )}

      {currentPath === '#/dashboard' && (
        <Dashboard
          urls={urls}
          loading={urlsLoading}
          totalCount={totalCount}
          totalPages={totalPages}
          fetchUrls={fetchUserUrls}
          onCopy={handleCopyLink}
          onQrClick={setActiveQrUrl}
          onEditClick={setActiveEditUrl}
          onDeleteClick={setActiveDeleteUrl}
        />
      )}

      {isAnalyticsPath && analyticsUrlId && (
        <Analytics
          urlId={analyticsUrlId}
          analytics={analytics}
          loading={analyticsLoading}
          onFetch={fetchUrlAnalytics}
        />
      )}

      {isStatsPath && statsShortCode && (
        <PublicStats
          shortCode={statsShortCode}
          publicStats={publicStats}
          loading={publicStatsLoading}
          onFetch={fetchPublicStats}
        />
      )}

      {/* Modals mount point */}
      {activeQrUrl && (
        <QrModal url={activeQrUrl} onClose={() => setActiveQrUrl(null)} />
      )}

      {activeEditUrl && (
        <EditModal
          url={activeEditUrl}
          onClose={() => setActiveEditUrl(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {activeDeleteUrl && (
        <DeleteModal
          url={activeDeleteUrl}
          onClose={() => setActiveDeleteUrl(null)}
          onConfirm={handleDeleteSubmit}
        />
      )}

      {/* Global footer copyright details */}
      <Footer />
    </div>
  );
}

export default App;
