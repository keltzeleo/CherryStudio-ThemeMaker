/**
 * resolver — the single resolution path from theme state → CSS variable values.
 *
 * The Preview Area injects the exact same `buildThemeVars` output that the
 * exporter writes into `body[theme-mode="dark|light"]`. No separate color
 * approximations are allowed anywhere.
 */
import {
  hexWithAlpha, toHex, toHexA, rgbaString, parseColor, isColor,
} from '../utils/colorUtils.js';
import { TOKEN_REGISTRY } from './tokenRegistry.js';

const stateSuffix = (mode) => (mode === 'dark' ? 'Dark' : mode === 'light' ? 'Light' : mode);

const stateKey = (theme, baseKey, mode) => {
  const v = theme[baseKey + stateSuffix(mode)];
  if (v === undefined && theme[baseKey] !== undefined) return theme[baseKey];
  return v;
};

/** Read a raw theme state value (per-mode aware). */
export const readThemeValue = (theme, token, mode) => {
  if (token.valueMode === 'shared' || !token.themeKey) {
    // backward-compat: old saved themes stored some shared tokens per-mode
    return theme[token.themeKey] ?? theme[`${token.themeKey}Dark`] ?? theme[`${token.themeKey}Light`];
  }
  return stateKey(theme, token.themeKey, mode);
};

const alphaFor = (theme, token, mode) => {
  const ak = token.alphaKey;
  if (ak === undefined) return 1;
  const key = typeof ak === 'string' ? ak : ak[mode];
  return theme[key] ?? 1;
};

/** Per-mode border opacity, falling back to the shared value for legacy themes. */
const borderOpacityFor = (theme, mode) => {
  const sfx = stateSuffix(mode);
  return theme[`globalBorderOpacity${sfx}`] ?? theme.globalBorderOpacity ?? 0.098;
};

const FNS = {
  /** --color-group-background: official dark = background-soft, light = white */
  groupBackground: (theme, mode) => (mode === 'light' ? '#ffffff' : 'var(--color-background-soft)'),
  /** --color-border-soft: border at (borderOpacity × 0.64), per-mode */
  borderSoft: (theme, mode) => {
    const border = theme[`globalBorder${stateSuffix(mode)}`] ?? theme.globalBorder ?? '#ffffff';
    const op = Math.max(0, borderOpacityFor(theme, mode) * 0.64);
    return hexWithAlpha(border, op);
  },
  /** --color-border-mute: border at (borderOpacity × 0.2), per-mode */
  borderMute: (theme, mode) => {
    const border = theme[`globalBorder${stateSuffix(mode)}`] ?? theme.globalBorder ?? '#ffffff';
    const op = Math.max(0, borderOpacityFor(theme, mode) * 0.2);
    return hexWithAlpha(border, op);
  },
};

/** Resolve one token to its final CSS value for the given mode. */
export const resolveTokenValue = (theme, token, mode) => {
  const recipe = token.recipe;

  if (recipe) {
    switch (recipe.type) {
      case 'plain':
        return readThemeValue(theme, token, mode);
      case 'fixed': {
        if (recipe.valueByMode) return recipe.valueByMode[mode];
        return recipe.value;
      }
      case 'alias':
        return `var(${recipe.of})`;
      case 'alphaOf': {
        const base = readThemeValue(theme, token, mode) ?? token.defaultDark ?? token.defaultLight;
        return hexWithAlpha(base, recipe.alpha);
      }
      case 'alphaKeyFn': {
        const base = readThemeValue(theme, token, mode);
        return hexWithAlpha(base, recipe.alphas[mode]);
      }
      case 'hexAlphaKey': {
        const base = readThemeValue(theme, token, mode);
        return hexWithAlpha(base, alphaFor(theme, token, mode));
      }
      case 'rgbaKey': {
        const base = readThemeValue(theme, token, mode);
        return rgbaString(parseColor(base).r, parseColor(base).g, parseColor(base).b, alphaFor(theme, token, mode));
      }
      case 'fn':
        return FNS[recipe.fn](theme, mode);
      default:
        break;
    }
  }

  // Default: plain theme state value (per-mode aware), canonicalized
  const raw = readThemeValue(theme, token, mode);
  if (typeof raw === 'string' && isColor(raw)) {
    const { a } = parseColor(raw);
    return a < 1 ? toHexA(raw) : toHex(raw);
  }
  return raw;
};

/**
 * Build every CSS variable (Layer 1 official + Layer 2 extension) for a mode.
 * Used by BOTH the exporter and the Preview Area — guaranteed identical.
 */
export const buildThemeVars = (theme, mode) => {
  const vars = {};
  for (const token of TOKEN_REGISTRY) {
    if (token.exportVar === false) continue;
    if (!token.officialKey || !token.officialKey.startsWith('--')) continue;
    const value = resolveTokenValue(theme, token, mode);
    if (value === undefined || value === null) continue;
    vars[token.officialKey] = String(value);
  }
  return vars;
};

/**
 * Same as buildThemeVars but resolves `var(...)` aliases to their concrete
 * value, so tests and import can compare final colors.
 */
export const buildThemeVarsResolved = (theme, mode) => {
  const raw = buildThemeVars(theme, mode);
  const out = {};
  const resolve = (value, depth = 0) => {
    if (depth > 8) return value;
    if (typeof value === 'string' && value.startsWith('var(')) {
      const key = value.slice(4, -1).trim();
      if (!(key in raw)) return value;
      return resolve(raw[key], depth + 1);
    }
    return value;
  };
  for (const [k, v] of Object.entries(raw)) out[k] = resolve(v);
  return out;
};

/** Convenience: resolved value of a single official var. */
export const resolveOfficialVar = (theme, officialKey, mode) => {
  const token = TOKEN_REGISTRY.find((t) => t.officialKey === officialKey);
  if (!token) return undefined;
  const value = resolveTokenValue(theme, token, mode);
  if (typeof value === 'string' && value.startsWith('var(')) {
    return buildThemeVarsResolved(theme, mode)[officialKey];
  }
  return value;
};
