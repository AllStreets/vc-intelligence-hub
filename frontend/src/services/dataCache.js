/**
 * Data caching service for persistent data across page navigation
 * Data persists in localStorage and only refreshes on manual refresh or at midnight EST
 */

const CACHE_KEYS = {
  TRENDS: 'vc-trends-cache',
  DEALS: 'vc-deals-cache',
  FOUNDERS: 'vc-founders-cache',
  API_STATUS: 'vc-api-status-cache',
  CACHE_TIMESTAMPS: 'vc-cache-timestamps'
};

const MIDNIGHT_EST_HOURS = 5; // 5 AM UTC is midnight EST (UTC-5)

/**
 * Check if cache has expired (past midnight EST)
 */
const hasCacheExpired = (lastFetchTime) => {
  if (!lastFetchTime) return true;

  const lastFetch = new Date(lastFetchTime);
  const now = new Date();

  // Convert to EST (UTC-5)
  const nowEST = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const lastFetchEST = new Date(lastFetch.getTime() - 5 * 60 * 60 * 1000);

  // Check if dates are different (crossed midnight EST)
  return nowEST.getDate() !== lastFetchEST.getDate();
};

/**
 * Get cached data or return null if expired
 */
const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const timestamps = JSON.parse(localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMPS) || '{}');
    const lastFetchTime = timestamps[key];

    // Return cached data if not expired
    if (!hasCacheExpired(lastFetchTime)) {
      return JSON.parse(cached);
    }

    // Cache expired, remove it
    localStorage.removeItem(key);
    delete timestamps[key];
    localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMPS, JSON.stringify(timestamps));
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

/**
 * Set cached data with timestamp
 */
const setCachedData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));

    const timestamps = JSON.parse(localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMPS) || '{}');
    timestamps[key] = new Date().toISOString();
    localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMPS, JSON.stringify(timestamps));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
};

/**
 * Clear all cache (used for manual refresh)
 */
export const clearAllCache = () => {
  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * Get the API base URL
 */
export const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://api.example.com';
  }
  // In development, use localhost:5002
  return 'http://localhost:5002';
};

/**
 * Fetch trends with caching
 */
export const fetchTrendsWithCache = async (forceRefresh = false) => {
  // Return cached data if available and not forcing refresh
  if (!forceRefresh) {
    const cached = getCachedData(CACHE_KEYS.TRENDS);
    if (cached) {
      return cached;
    }
  }

  // Fetch fresh data
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/trends/scored`);
    const data = await response.json();

    // Cache the data
    setCachedData(CACHE_KEYS.TRENDS, data);

    return data;
  } catch (error) {
    console.error('Error fetching trends:', error);
    throw error;
  }
};

/**
 * Fetch deals with caching
 */
export const fetchDealsWithCache = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = getCachedData(CACHE_KEYS.DEALS);
    if (cached) {
      return cached;
    }
  }

  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/deals`);
    const data = await response.json();

    setCachedData(CACHE_KEYS.DEALS, data);

    return data;
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
};

/**
 * Fetch founders with caching
 */
export const fetchFoundersWithCache = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = getCachedData(CACHE_KEYS.FOUNDERS);
    if (cached) {
      return cached;
    }
  }

  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/founders`);
    const data = await response.json();

    setCachedData(CACHE_KEYS.FOUNDERS, data);

    return data;
  } catch (error) {
    console.error('Error fetching founders:', error);
    throw error;
  }
};

/**
 * Fetch API status with caching
 */
export const fetchAPIStatusWithCache = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = getCachedData(CACHE_KEYS.API_STATUS);
    if (cached) {
      return cached;
    }
  }

  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/api-status`);
    const data = await response.json();

    setCachedData(CACHE_KEYS.API_STATUS, data);

    return data;
  } catch (error) {
    console.error('Error fetching API status:', error);
    return { apis: {}, activePlugins: [] };
  }
};

export default {
  fetchTrendsWithCache,
  fetchDealsWithCache,
  fetchFoundersWithCache,
  fetchAPIStatusWithCache,
  clearAllCache,
  getCachedData,
  setCachedData
};
