/**
 * defaultTheme — the single set of default theme state values.
 *
 * Values here are the reset targets (Reset All / Reset Single) and the base
 * for fresh presets. Every key here corresponds to a token in tokenRegistry.js;
 * the token defaults are mirrored here as the *state* representation.
 */
import { TOKEN_REGISTRY } from './tokenRegistry.js';

/**
 * Build the default theme state from the registry:
 *  - per-mode color tokens with a themeKey  → { themeKey }Dark / { themeKey }Light
 *  - per-mode number tokens with a themeKey → { themeKey }Dark / { themeKey }Light
 *  - shared tokens                          → themeKey
 *  - alpha keys referenced by tokens        → default 1 (overridden below where needed)
 *  - array tokens                          → themeKey (array)
 */
const buildDefaultState = () => {
  const state = {};

  // A token writes state only when it is a *source* token:
  //  - no recipe (plain state-backed color/number/string)
  //  - rgbaKey / hexAlphaKey recipes where themeKey IS the source color
  // Derived tokens (alphaOf / alphaKeyFn / alias / fixed / fn) never write state.
  const isSourceToken = (t) =>
    !t.recipe || t.recipe.type === 'rgbaKey' || t.recipe.type === 'hexAlphaKey';

  for (const t of TOKEN_REGISTRY) {
    if (!isSourceToken(t)) continue;
    if (!t.themeKey) continue;

    if (t.valueMode === 'shared') {
      if (t.isArray) state[t.themeKey] = [...(t.defaultDark || [])];
      else state[t.themeKey] = t.defaultDark;
      continue;
    }

    // per-mode
    if (t.isArray) {
      state[t.themeKey] = [...(t.defaultDark || [])];
      continue;
    }
    state[`${t.themeKey}Dark`] = t.defaultDark;
    state[`${t.themeKey}Light`] = t.defaultLight;
  }

  return state;
};

export const baseDefaultTheme = {
  ...buildDefaultState(),

  // ── Engines / effects ────────────────────────────────────────────────
  primaryColor: '#E89975',
  blurAmount: 15,
  enableHoloGlass: false,
  enableLuminaMotion: false,
  enableBouncyHover: true,
  bgImage: '',
  enableRandomSidebarHover: true,
  sidebarHoverPalette: ['#E89975', '#7DD3FC', '#A78BFA', '#F472B6', '#34D399', '#FACC15'],
  sidebarHoverOpacity: 0.16,
  sidebarHoverGlowOpacity: 0.35,

  // ── Alpha values (per-mode) ──────────────────────────────────────────
  sidebarOpacity: 1,
  workspaceOpacity: 0,
  inputOpacityDark: 1, inputOpacityLight: 1,
  inputBorderOpacityDark: 0.1, inputBorderOpacityLight: 0.08,
  globalBorderOpacity: 0.098,
  globalBorderMuteOpacity: 0.05,
  tableHoverBgOpacity: 0.05,

  miniWindowBgOpacityDark: 0.7, miniWindowBgOpacityLight: 0.96,
  scrollbarThumbOpacityDark: 0.15, scrollbarThumbOpacityLight: 0.15,
  scrollbarHoverOpacityDark: 0.2, scrollbarHoverOpacityLight: 0.2,
  aiBubbleOpacityDark: 1, aiBubbleOpacityLight: 0.8,
  userBubbleOpacityDark: 0.08, userBubbleOpacityLight: 0.045,
  bubbleBorderOpacityDark: 0.15, bubbleBorderOpacityLight: 0.1,
  thinkingBgOpacityDark: 0.8, thinkingBgOpacityLight: 0.9,
  thinkingBorderOpacityDark: 0.3, thinkingBorderOpacityLight: 0.25,
  inlineCodeOpacityDark: 1, inlineCodeOpacityLight: 0.06,
  codeBgOpacityDark: 1, codeBgOpacityLight: 1,
  codeBorderOpacityDark: 0.5, codeBorderOpacityLight: 0.5,
  codeHeaderBgOpacityDark: 0.9, codeHeaderBgOpacityLight: 1,
  tableHeaderBgOpacityDark: 0.1, tableHeaderBgOpacityLight: 0.15,
  tableBorderOpacityDark: 0.15, tableBorderOpacityLight: 0.12,
  activeItemBgOpacityDark: 0.1, activeItemBgOpacityLight: 1,
  activeItemBorderOpacityDark: 0.25, activeItemBorderOpacityLight: 0.15,
  hoverItemBgOpacityDark: 0.05, hoverItemBgOpacityLight: 1,
  listItemOpacityDark: 0.1, listItemOpacityLight: 1,
  listItemHoverOpacityDark: 0.05, listItemHoverOpacityLight: 1,

  // ── Geometry ─────────────────────────────────────────────────────────
  borderRadius: 16,
  listItemBorderRadius: 10,
  tableBorderRadius: 8,
  scrollbarWidth: 6,
  scrollbarHeight: 6,
  scrollbarThumbRadius: 10,

  // ── Fonts ────────────────────────────────────────────────────────────
  userFontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  userCodeFontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",

  // ── Panels link mode (IA v2) — UI config, not exported as CSS ────────
  panelLinkMode: 'unified',
  panelTweakSidebar: 0,
  panelTweakWorkspace: 0,
  panelTweakCode: 0,
  panelTweakInput: 0,
  panelTweakMiniWindow: 0,
};

/* Registry tokens may declare alpha defaults we should surface in state */
const ALPHA_DEFAULTS = {
  globalBorderOpacity: 0.098,
  globalBorderMuteOpacity: 0.05,
  sidebarOpacity: 1,
  workspaceOpacity: 0,
  inputOpacityDark: 1, inputOpacityLight: 1,
  inputBorderOpacityDark: 0.1, inputBorderOpacityLight: 0.08,
  tableHoverBgOpacity: 0.05,
};

export const DEFAULT_THEME = baseDefaultTheme;

/** Reset a single theme key to its default value. */
export const defaultForKey = (key) => {
  if (key in ALPHA_DEFAULTS) return ALPHA_DEFAULTS[key];
  if (key in baseDefaultTheme) return baseDefaultTheme[key];
  const suffix = key.endsWith('Dark') ? 'Dark' : key.endsWith('Light') ? 'Light' : null;
  const base = suffix ? key.slice(0, -suffix.length) : key;
  const token = TOKEN_REGISTRY.find((t) => t.themeKey === base && t.valueMode === (suffix ? 'per-mode' : 'shared'));
  if (!token) return undefined;
  if (suffix === 'Dark' || !suffix) return token.defaultDark;
  return token.defaultLight;
};
