import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useSnsShareInfo } from './useSnsShareInfo';

// Mock the document and window objects
const originalDocumentTitle = document.title;
const originalWindowLocation = window.location;

describe('useSnsShareInfo', () => {
  const mockTitle = 'Test Page Title';
  const mockUrl = 'https://example.com/test-page';

  beforeEach(() => {
    // Mock document.title
    Object.defineProperty(document, 'title', {
      configurable: true,
      value: mockTitle,
    });

    // Mock window.location
    delete window.location;
    window.location = {
      ...originalWindowLocation,
      href: mockUrl,
    } as Location;

    vi.resetAllMocks();
  });

  afterEach(() => {
    // Restore document.title
    Object.defineProperty(document, 'title', {
      configurable: true,
      value: originalDocumentTitle,
    });

    // Restore window.location
    window.location = originalWindowLocation;

    vi.clearAllMocks();
  });

  it('should return the current document title and full URL', () => {
    const { result } = renderHook(() => useSnsShareInfo());

    expect(result.current.title).toBe(mockTitle);
    expect(result.current.fullUrl).toBe(mockUrl);
  });

  it('should update state with document title and window location on mount', () => {
    // Test with different values
    const newTitle = 'New Page Title';
    const newUrl = 'https://example.com/new-page';

    // Update mocks
    Object.defineProperty(document, 'title', {
      configurable: true,
      value: newTitle,
    });

    delete window.location;
    window.location = {
      ...originalWindowLocation,
      href: newUrl,
    } as Location;

    const { result } = renderHook(() => useSnsShareInfo());

    expect(result.current.title).toBe(newTitle);
    expect(result.current.fullUrl).toBe(newUrl);
  });
});
