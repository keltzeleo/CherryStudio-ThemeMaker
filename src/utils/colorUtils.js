/**
 * colorUtils — the single color parsing / formatting pipeline.
 *
 * Every color value in the app (editor, preview, export, import, tests)
 * passes through these functions so HEX / RGB / RGBA / HSL / HSLA and
 * alpha handling are always normalized identically.
 */

/** Parse any supported CSS color into { r, g, b, a } (0-255 channels, 0-1 alpha). */
export const parseColor = (color) => {
  if (color === undefined || color === null) return { r: 0, g: 0, b: 0, a: 1 };
  const str = String(color).trim();

  // Hex: #rgb #rgba #rrggbb #rrggbbaa
  const hexMatch = str.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length === 6) hex += 'ff';
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: parseInt(hex.slice(6, 8), 16) / 255,
    };
  }

  // rgb() / rgba() with comma or space syntax
  const rgbMatch = str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/i);
  if (rgbMatch) {
    return {
      r: clampChannel(parseFloat(rgbMatch[1])),
      g: clampChannel(parseFloat(rgbMatch[2])),
      b: clampChannel(parseFloat(rgbMatch[3])),
      a: rgbMatch[4] === undefined ? 1 : parseAlpha(rgbMatch[4]),
    };
  }

  // hsl() / hsla()
  const hslMatch = str.match(/hsla?\(\s*([\d.]+)[,\s]+([\d.]+%)[,\s]+([\d.]+%)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/i);
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]);
    const s = parseFloat(hslMatch[2]) / 100;
    const l = parseFloat(hslMatch[3]) / 100;
    const a = hslMatch[4] === undefined ? 1 : parseAlpha(hslMatch[4]);
    const { r, g, b } = hslToRgb(h, s, l);
    return { r, g, b, a };
  }

  // css named colors (common subset)
  const named = NAMED_COLORS[str.toLowerCase()];
  if (named) return { r: named[0], g: named[1], b: named[2], a: 1 };

  return { r: 0, g: 0, b: 0, a: 1 };
};

const clampChannel = (v) => Math.max(0, Math.min(255, Math.round(v)));

const parseAlpha = (v) => {
  const s = String(v).trim();
  if (s.endsWith('%')) return Math.max(0, Math.min(1, parseFloat(s) / 100));
  return Math.max(0, Math.min(1, parseFloat(s)));
};

/** HSL → RGB (h in degrees, s/l 0-1). */
export const hslToRgb = (h, s, l) => {
  const hn = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((hn / 60) % 2 - 1));
  const m = l - c / 2;
  let r1; let g1; let b1;
  if (hn < 60) [r1, g1, b1] = [c, x, 0];
  else if (hn < 120) [r1, g1, b1] = [x, c, 0];
  else if (hn < 180) [r1, g1, b1] = [0, c, x];
  else if (hn < 240) [r1, g1, b1] = [0, x, c];
  else if (hn < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
};

/** RGB → HSL (h degrees, s/l 0-1). */
export const rgbToHsl = ({ r, g, b }) => {
  const rn = r / 255; const gn = g / 255; const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0; let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / d + 2);
    else h = 60 * ((rn - gn) / d + 4);
  }
  return { h: ((h % 360) + 360) % 360, s, l };
};

const hexByte = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
const alphaByte = (a) => hexByte(Math.max(0, Math.min(1, a)) * 255);

/** → #rrggbb (alpha dropped) */
export const toHex = (color) => {
  const { r, g, b } = parseColor(color);
  return `#${hexByte(r)}${hexByte(g)}${hexByte(b)}`;
};

/** → #rrggbbaa (8-digit hex, matching Cherry Studio official border format) */
export const toHexA = (color) => {
  const { r, g, b, a } = parseColor(color);
  return `#${hexByte(r)}${hexByte(g)}${hexByte(b)}${alphaByte(a)}`;
};

/** → rgba(r, g, b, a) */
export const toRgba = (color) => {
  const { r, g, b, a } = parseColor(color);
  return `rgba(${r}, ${g}, ${b}, ${roundAlpha(a)})`;
};

/** hex color + opacity → #rrggbbaa (Cherry Studio official border format) */
export const hexWithAlpha = (hex, opacity) => {
  const { r, g, b } = parseColor(hex);
  return `#${hexByte(r)}${hexByte(g)}${hexByte(b)}${alphaByte(opacity)}`;
};

/** rgb channels (0-255) → #rrggbb */
export const rgbToHex = (r, g, b) => `#${hexByte(r)}${hexByte(g)}${hexByte(b)}`;

/**
 * color + fixed opacity → compact rgba(r,g,b,a) (no spaces).
 * Legacy Cherry export format — pinned byte-for-byte by export tests.
 */
export const rgbaWithAlpha = (color, a) => {
  const { r, g, b } = parseColor(color);
  return `rgba(${r},${g},${b},${a})`;
};

export const rgbaString = (r, g, b, a = 1) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${roundAlpha(a, 4)})`;

/** Back-compat aliases */
export const parseHex = (color) => parseColor(color);
export const hexToRgba = (color, alpha = 1) => {
  const { r, g, b } = parseColor(color);
  return rgbaString(r, g, b, alpha);
};
export const hexToRgbOnly = (color) => {
  const { r, g, b } = parseColor(color);
  return `${r}, ${g}, ${b}`;
};

/** Lighten toward white by `percent` (0-1). */
export const lightenHex = (hex, percent) => {
  const { r, g, b } = parseColor(hex);
  return `#${hexByte(r + (255 - r) * percent)}${hexByte(g + (255 - g) * percent)}${hexByte(b + (255 - b) * percent)}`;
};

/** Darken toward black by `percent` (0-1). */
export const darkenHex = (hex, percent) => {
  const { r, g, b } = parseColor(hex);
  return `#${hexByte(r * (1 - percent))}${hexByte(g * (1 - percent))}${hexByte(b * (1 - percent))}`;
};

const relLum = ({ r, g, b }) => {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

/** WCAG 2.x contrast ratio (1–21) between two colors. */
export const wcagContrast = (fg, bg) => {
  const a = relLum(parseColor(fg));
  const b = relLum(parseColor(bg));
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
};

/** Blend fg over bg with alpha (alpha composite). Returns #rrggbb. */
export const blendHex = (fg, bg, alpha = 1) => {
  const f = parseColor(fg);
  const b = parseColor(bg);
  const a = Math.max(0, Math.min(1, alpha));
  const mix = (x, y) => hexByte(x * a + y * (1 - a));
  return `#${mix(f.r, b.r)}${mix(f.g, b.g)}${mix(f.b, b.b)}`;
};

/** Round float to avoid 0.15000000000000002 style bugs */
export const roundAlpha = (val, decimals = 2) =>
  Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);

/** Whether a string looks like a CSS color (for import heuristics). */
export const isColor = (value) => {
  if (typeof value !== 'string') return false;
  const s = value.trim();
  if (s.startsWith('var(') || s === 'transparent' || s === 'initial' || s === 'inherit' || s === 'currentColor') return false;
  return /^#([0-9a-f]{3,8})$/i.test(s) || /^rgba?\(/i.test(s) || /^hsla?\(/i.test(s) || s in NAMED_COLORS;
};

/** True if value is a numeric string (for import heuristics). */
export const isNumeric = (value) => typeof value === 'number' || (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim()));

const NAMED_COLORS = {
  black: [0, 0, 0], white: [255, 255, 255], red: [255, 0, 0], green: [0, 128, 0],
  lime: [0, 255, 0], blue: [0, 0, 255], yellow: [255, 255, 0], cyan: [0, 255, 255],
  magenta: [255, 0, 255], silver: [192, 192, 192], gray: [128, 128, 128], grey: [128, 128, 128],
  maroon: [128, 0, 0], olive: [128, 128, 0], purple: [128, 0, 128], teal: [0, 128, 128],
  navy: [0, 0, 128], orange: [255, 165, 0],
};
