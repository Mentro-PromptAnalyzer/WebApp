import { supabase } from './supabase';

/** Attach the current Supabase access token to a protected server request. */
export async function fetchProtectedApi(url: string, init: RequestInit = {}): Promise<Response> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error('AUTH_REQUIRED');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${data.session.access_token}`);
  return fetch(url, { ...init, headers });
}
