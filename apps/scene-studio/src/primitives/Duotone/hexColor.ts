// Shader uniforms want unit-range channels; accepts #rgb and #rrggbb.
export function parseHexColor(hex: string): {
  red: number;
  green: number;
  blue: number;
} {
  const digits = hex.replace('#', '');
  const expanded =
    digits.length === 3
      ? digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits;
  const value = Number.parseInt(expanded, 16);
  if (expanded.length !== 6 || Number.isNaN(value)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return {
    red: ((value >> 16) & 0xff) / 255,
    green: ((value >> 8) & 0xff) / 255,
    blue: (value & 0xff) / 255,
  };
}
