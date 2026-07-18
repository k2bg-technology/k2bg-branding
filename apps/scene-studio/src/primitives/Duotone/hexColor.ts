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
  // parseInt would silently accept strings that merely start with hex
  // digits, so validate the whole value first.
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const value = Number.parseInt(expanded, 16);

  return {
    red: ((value >> 16) & 0xff) / 255,
    green: ((value >> 8) & 0xff) / 255,
    blue: (value & 0xff) / 255,
  };
}
