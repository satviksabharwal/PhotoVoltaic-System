import axios from 'axios';

// ----------------------------------------------------------------------
// Centralized API client.
//
// The base URL is resolved ONCE, from the environment, so that every request
// throughout the app only ever passes a *path* (e.g. `/user/login`) — never a
// hardcoded, environment-specific full URL.
//
//   - Local development : `REACT_APP_API_URL` comes from `.env.development`
//                         (defaults to http://localhost:5500/api).
//   - Production build   : `REACT_APP_API_URL` comes from `.env.production`
//                         (defaults to a same-origin `/api`, so the app works
//                          behind a reverse proxy with no code changes).
//
// Create React App inlines any `REACT_APP_*` variable at build time, which is
// why this is read from `process.env` rather than fetched at runtime.
// ----------------------------------------------------------------------

const resolveBaseUrl = (): string => {
  const fromEnv = process.env.REACT_APP_API_URL?.trim();
  if (fromEnv) {
    // Strip trailing slashes so joining `baseURL` + path stays predictable.
    return fromEnv.replace(/\/+$/, '');
  }

  // No env var supplied: same-origin `/api` in production, localhost in dev.
  return process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5500/api';
};

export const API_BASE_URL = resolveBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
