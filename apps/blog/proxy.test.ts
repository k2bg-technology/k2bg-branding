import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { proxy } from './proxy';

const { mockGetSessionCookie } = vi.hoisted(() => ({
  mockGetSessionCookie: vi.fn(),
}));

vi.mock('better-auth/cookies', () => ({
  getSessionCookie: mockGetSessionCookie,
}));

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when the session cookie is absent', () => {
    mockGetSessionCookie.mockReturnValue(null);
    const request = new NextRequest(new URL('http://localhost/settings'));

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/login');
  });

  it('allows the request when the session cookie is present', () => {
    mockGetSessionCookie.mockReturnValue('session-token');
    const request = new NextRequest(new URL('http://localhost/settings'));

    const response = proxy(request);

    expect(response.headers.get('location')).toBeNull();
  });
});
