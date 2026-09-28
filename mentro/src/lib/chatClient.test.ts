import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock('./supabase', () => ({ supabase: { auth: { getSession } } }));
import { streamChatReply } from './chatClient';

beforeEach(() => {
  getSession.mockResolvedValue({
    data: { session: { access_token: 'fixture-user-token' } },
    error: null,
  });
});
afterEach(() => vi.unstubAllGlobals());

it('sends the current session token and consumes token/end events', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      new Response('event: token\ndata: {"text":"Hello"}\n\nevent: end\ndata: {}\n\n')
    );
  vi.stubGlobal('fetch', fetchMock);
  const onToken = vi.fn();
  await streamChatReply([{ role: 'user', content: 'Hi' }], { onToken });
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer fixture-user-token');
  expect(onToken).toHaveBeenCalledWith('Hello');
});

it('does not send an unauthenticated request when signed out', async () => {
  getSession.mockResolvedValue({ data: { session: null }, error: null });
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  await expect(
    streamChatReply([{ role: 'user', content: 'Hi' }], { onToken: vi.fn() })
  ).rejects.toThrow('Please sign in');
  expect(fetchMock).not.toHaveBeenCalled();
});

it('reports a rejected session instead of success', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response('{"error":"unauthorized"}', { status: 401 }))
  );
  await expect(
    streamChatReply([{ role: 'user', content: 'Hi' }], { onToken: vi.fn() })
  ).rejects.toThrow('authentication failed');
});
