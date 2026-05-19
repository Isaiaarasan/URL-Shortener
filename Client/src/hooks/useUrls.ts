import { useState } from 'react';

export interface Url {
  _id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Visit {
  _id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
}

export interface AnalyticsData {
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

const API_URL = import.meta.env.PROD 
  ? 'https://url-shortener-78wi.onrender.com/api' 
  : 'http://localhost:5000/api';

export const useUrls = (token: string | null, showToast: (msg: string, type?: 'success' | 'error') => void) => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [urlsLoading, setUrlsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Shortener form status
  const [shortenLoading, setShortenLoading] = useState(false);
  const [shortenResult, setShortenResult] = useState<Url | null>(null);

  // Analytics states
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Public stats states
  const [publicStats, setPublicStats] = useState<any | null>(null);
  const [publicStatsLoading, setPublicStatsLoading] = useState(false);

  const fetchUserUrls = async (page: number, search: string) => {
    if (!token) return;
    setUrlsLoading(true);
    try {
      const res = await fetch(`${API_URL}/urls?page=${page}&limit=10&search=${encodeURIComponent(search)}`, {
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
    } catch (err) {
      showToast('Connection issue, failed to load links', 'error');
    } finally {
      setUrlsLoading(false);
    }
  };

  const shortenUrl = async (originalUrl: string, customAlias: string | null, expiresAt: string | null): Promise<Url | null> => {
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
        setShortenLoading(false);
        return data.data;
      } else {
        showToast(data.message || 'Failed to shorten URL', 'error');
        setShortenLoading(false);
        return null;
      }
    } catch (err) {
      showToast('Connection to server failed', 'error');
      setShortenLoading(false);
      return null;
    }
  };

  const updateUrl = async (urlId: string, originalUrl: string, expiresAt: string | null): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_URL}/urls/${urlId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUrl, expiresAt })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Link destination updated successfully!', 'success');
        return true;
      } else {
        showToast(data.message || 'Update failed', 'error');
        return false;
      }
    } catch (err) {
      showToast('Failed to update URL details', 'error');
      return false;
    }
  };

  const deleteUrl = async (urlId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_URL}/urls/${urlId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Link and its analytics purged!', 'success');
        return true;
      } else {
        showToast(data.message || 'Delete failed', 'error');
        return false;
      }
    } catch (err) {
      showToast('Failed to delete URL', 'error');
      return false;
    }
  };

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
      }
    } catch (err) {
      showToast('Analytics fetch error', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

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
    } catch (err) {
      showToast('Public stats fetch error', 'error');
    } finally {
      setPublicStatsLoading(false);
    }
  };

  return {
    urls,
    urlsLoading,
    totalCount,
    totalPages,
    shortenLoading,
    shortenResult,
    setShortenResult,
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
  };
};
