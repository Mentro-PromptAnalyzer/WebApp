import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchProtectedApi } from './protectedApi';
import { supabase } from './supabase';

vi.mock('./supabase', () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

describe('fetchProtectedApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the current access token with protected requests', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'current-token' } },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }));

    await fetchProtectedApi('https://api.example.test/api/count-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer current-token');
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
    expect(init?.body).toBe('{}');
  });

  it('refuses requests without a signed-in session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    await expect(fetchProtectedApi('https://api.example.test/api/fetch-share')).rejects.toThrow(
      'AUTH_REQUIRED'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
