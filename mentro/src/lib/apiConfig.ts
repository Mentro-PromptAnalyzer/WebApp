// Build-time validation requires this URL in production; local development keeps its existing default.
export const API_BASE = (import.meta.env.VITE_PROXY_URL || 'http://localhost:3001').replace(
  /\/$/,
  ''
);
