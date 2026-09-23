/**
 * Application Configuration
 * Resolves the backend API base URL based on environment variables,
 * deployment host, and fallback to local development.
 */

// If VITE_API_URL is missing, fallback to the Render backend in production (e.g. Vercel) or local 127.0.0.1:8000
const resolveApiUrl = (): string => {
  // 1. Vite environment variable (set in .env, .env.production, or Vercel Environment Variables)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2. Production host fallback (when deployed on Vercel, Render static site, etc.)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://shi-099-backend.onrender.com';
  }

  // 3. Local development fallback
  return 'http://127.0.0.1:8000';
};

export const API_URL = resolveApiUrl();
export const API_BASE_URL = API_URL;

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
