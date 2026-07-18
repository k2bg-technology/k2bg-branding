import { describe, expect, it } from 'vitest';

import { parseHexColor } from './hexColor';

describe('parseHexColor', () => {
  it.each([
    { hex: '#000000', expected: { red: 0, green: 0, blue: 0 } },
    { hex: '#ffffff', expected: { red: 1, green: 1, blue: 1 } },
    { hex: '#ff8000', expected: { red: 1, green: 128 / 255, blue: 0 } },
  ])('parses $hex into unit channels', ({ hex, expected }) => {
    const color = parseHexColor(hex);

    expect(color.red).toBeCloseTo(expected.red);
    expect(color.green).toBeCloseTo(expected.green);
    expect(color.blue).toBeCloseTo(expected.blue);
  });

  it('expands the three-digit shorthand', () => {
    const color = parseHexColor('#f80');

    expect(color.red).toBeCloseTo(1);
    expect(color.green).toBeCloseTo(136 / 255);
    expect(color.blue).toBeCloseTo(0);
  });

  it('throws on a malformed value', () => {
    expect(() => parseHexColor('#12345')).toThrow('Invalid hex color');
  });
});
