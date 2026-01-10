import { describe, expect, it } from 'vitest';

import { getExtensionFromUrl } from './getExtensionFromUrl';

describe('getExtensionFromUrl', () => {
  it('should return file extension from URL', () => {
    expect(getExtensionFromUrl('http://example.com/file.jpg')).toBe('.jpg');
    expect(getExtensionFromUrl('https://example.com/path/document.pdf')).toBe(
      '.pdf'
    );
    expect(
      getExtensionFromUrl('https://example.com/image.png?query=param')
    ).toBe('.png');
  });

  it('should return empty string for URLs without extension', () => {
    expect(getExtensionFromUrl('http://example.com/path')).toBe('');
    expect(getExtensionFromUrl('https://example.com/')).toBe('');
  });

  it('should handle URLs with query parameters and fragments', () => {
    expect(
      getExtensionFromUrl('http://example.com/file.jpg?width=100&height=100')
    ).toBe('.jpg');
    expect(getExtensionFromUrl('https://example.com/document.pdf#page=1')).toBe(
      '.pdf'
    );
  });

  it('should handle URLs with dots in the path', () => {
    expect(getExtensionFromUrl('http://example.com/folder.name/file.txt')).toBe(
      '.txt'
    );
    expect(getExtensionFromUrl('https://api.example.com/v1.0/data')).toBe('');
  });
});
