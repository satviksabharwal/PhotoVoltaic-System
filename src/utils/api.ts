import axios from 'axios';
import { supabase } from './supabase';

// ----------------------------------------------------------------------
// Centralized API client.
//
// The base URL is resolved ONCE, from the environment, so that every request
// throughout the app only ever passes a *path* (e.g. `/project`) — never a
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

// Attach the current Supabase access token to every request. This runs after
// per-request config is merged, so it also replaces any stale token a caller
// passed manually via `headers: { Authorization: ... }`. `getSession()`
// refreshes the token automatically when it has expired.
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
