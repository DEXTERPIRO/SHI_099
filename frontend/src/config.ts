/**
 * Application Configuration
 * Resolves the backend API base URL based on environment variables,
 * deployment host, and optional localStorage override for demo convenience.
 */

const getApiBaseUrl = (): string => {
  // 1. Optional localStorage override (enables pointing to any backend directly in the browser)
  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('NUMM_API_URL');
    if (storedUrl && storedUrl.trim() !== '') {
      return storedUrl.trim().replace(/\/+$/, '');
    }
  }

  // 2. Vite build-time environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return clean;
  }

  // 3. Render Static Site automatic detection
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.onrender.com')) {
    return 'https://numm-backend.onrender.com';
  }

  // 4. Local development fallback
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

export const setApiBaseUrlOverride = (url: string) => {
  if (typeof window !== 'undefined') {
    if (!url || url.trim() === '') {
      localStorage.removeItem('NUMM_API_URL');
    } else {
      localStorage.setItem('NUMM_API_URL', url.trim().replace(/\/+$/, ''));
    }
    window.location.reload();
  }
};
