/**
 * exportV2 — Cherry Studio v2.0.9 (Tailwind / shadcn) exporter.
 *
 * v2.0.9 moved from the v1 `--color-*` namespace to a THREE-layer token model:
 *   1. a `--cs-*` palette namespace (`--cs-background`, `--cs-primary`,
 *      `--cs-card`, `--cs-border`, `--cs-sidebar`, `--cs-input`, `--cs-accent`,
 *      `--cs-muted`, `--cs-popover`, `--cs-foreground` …) — the single source of
 *      truth the app derives everything from;
 *   2. bare shadcn aliases (`--background`, `--card`, `--primary`, `--border` …)
 *      built as `var(--cs-*)`;
 *   3. Cherry product semantics (`--background-subtle`, `--link`, `--code-block`,
 *      `--reference`, `--highlight`, `--chat-user`, `--resource-list-row-*` …).
 * The host applies the accent through `--cs-theme-primary` /
 * `--cs-theme-primary-foreground` written INLINE on `<html>` (left untouched),
 * and dark mode is a `.dark` class on `<html>`/`<body>`.
 *
 * A custom theme MUST override layer 1 (`--cs-*`) so layers 2/3 pick it up,
 * AND write the bare aliases + product semantics directly so consumers reading
 * those tokens directly are themed too. Overriding ONLY the bare shadcn aliases
 * (as a naive theme would) leaves every `--cs-*`-backed surface at app
 * defaults, which is why coverage looks inconsistent.
 *
 * The theme competes with the app base purely by source order: our `:root` /
 * `.dark` blocks are emitted later than the app's own, so on equal specificity
 * they win. Because the app's `--primary` is `var(--cs-theme-primary)` and the
 * host writes `--cs-theme-primary*` INLINE on `<html>`, we must ALSO emit the
 * bare `--primary` / `--primary-foreground` directly (our later `:root` block
 * outranks the app's `:root { --primary: var(--cs-theme-primary) }`). We never
 * declare the host-owned `--cs-theme-primary*` ourselves.
 *
 * We read EXACTLY the same `fieldsOf(buildVars(...))` values the preview area
 * renders, so 「所见 == 所得」 holds for v2 too.
 */
import { parseColor } from '../utils/colorUtils.js'
import { hexA } from '../utils/colors.js'

export const CHERRY_V1_TARGET = 'v1.9.12'
export const CHERRY_V2_TARGET = 'v2.0.9'

// Replicate Cherry v2 `getForegroundColor` — relative luminance > 0.179 → black.
function relLuminance(r, g, b) {
  const norm = (c) => {
    const n = c / 255
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * norm(r) + 0.7152 * norm(g) + 0.0722 * norm(b)
}

function foregroundOf(color) {
  const { r, g, b } = parseColor(color)
  return relLuminance(r, g, b) > 0.179 ? '#000000' : '#FFFFFF'
}

// A single v2 token block. Keys with undefined values are skipped so the base
// keeps its own default (e.g. we deliberately do NOT emit --destructive).
function tokenBlock(selector, pairs) {
  const lines = []
  for (const [key, value] of pairs) {
    if (value === undefined || value === null || value === '') continue
    lines.push(`  ${key}: ${value};`)
  }
  return `${selector} {\n${lines.join('\n')}\n}`
}

// Map one mode's preview fields → the v2.0.9 token surface.
//
// v2.0.9 has a THREE-layer model:
//   1. `--cs-*` palette namespace (--cs-background/primary/border/card/sidebar/
//      input/accent/muted/popover/foreground…) — the SINGLE source of truth the
//      app derives everything from.
//   2. bare shadcn aliases built as `var(--cs-*)` (--background, --card, --primary…).
//   3. Cherry product semantics (--background-subtle, --link, --code-block,
//      --reference, --highlight, --chat-user, --resource-list-row-*…): the
//      unprefixed PUBLIC namespace. In the app's product.css these mostly read
//      `var(--cs-*)`, but `--code-block`/`--chat-user` are literal colors and
//      `--link`/`--highlight` read `--cs-blue-*`/`--cs-amber-*`. We emit them
//      unprefixed (never `--cs-link`/`--cs-code-block`/`--cs-chat-user`) so we
//      override the public aliases directly.
//
// A custom theme MUST override layer 1 (`--cs-*`) so layer 2/3 pick it up, AND
// the bare aliases + product semantics directly (so consumers reading them
// directly are themed too). Setting ONLY bare aliases (the old behaviour) leaks
// app defaults for any surface reading `--cs-*` → inconsistent coverage.
function v2Tokens(f) {
  const primary = f.primary
  const fg = foregroundOf(primary)
  return [
    // ── Layer 1 · `--cs-*` palette namespace (everything derives from this) ──
    ['--cs-background', f.bg],
    ['--cs-background-subtle', f.soft],
    ['--cs-foreground', f.text],
    ['--cs-muted-foreground', f.text3],
    ['--cs-foreground-tertiary', f.text3],
    ['--cs-foreground-disabled', f.text3],
    ['--cs-card', f.aiBg],
    ['--cs-card-foreground', f.text],
    ['--cs-popover', f.bg],
    ['--cs-popover-foreground', f.text],
    ['--cs-primary', primary],
    ['--cs-primary-foreground', fg],
    ['--cs-secondary', f.soft],
    ['--cs-secondary-hover', f.hover],
    ['--cs-secondary-active', f.active],
    ['--cs-secondary-foreground', f.text],
    ['--cs-muted', f.soft],
    ['--cs-accent', f.hover],
    ['--cs-accent-foreground', f.text],
    ['--cs-ghost-active', f.hover],
    ['--cs-border', f.border],
    ['--cs-border-subtle', f.borderSoft],
    ['--cs-border-strong', f.border],
    ['--cs-border-selected', f.active],
    ['--cs-input', f.inputBorder],
    ['--cs-ring', primary],
    ['--cs-sidebar', f.sidebar],
    ['--cs-sidebar-foreground', f.text],
    ['--cs-sidebar-primary', primary],
    ['--cs-sidebar-primary-foreground', fg],
    ['--cs-sidebar-accent', f.active],
    ['--cs-sidebar-accent-foreground', f.text],
    ['--cs-sidebar-border', f.border],
    ['--cs-sidebar-ring', primary],
    // ── Layer 2 · bare shadcn aliases (mirror the app's var(--cs-*) mapping) ──
    ['--background', f.bg],
    ['--foreground', f.text],
    ['--card', f.aiBg],
    ['--card-foreground', f.text],
    ['--popover', f.bg],
    ['--popover-foreground', f.text],
    ['--primary', primary],
    ['--primary-foreground', fg],
    ['--secondary', f.soft],
    ['--secondary-foreground', f.text],
    ['--muted', f.soft],
    ['--muted-foreground', f.text3],
    ['--accent', f.hover],
    ['--accent-foreground', f.text],
    ['--border', f.border],
    ['--input', f.inputBorder],
    ['--ring', primary],
    ['--sidebar', f.sidebar],
    ['--sidebar-foreground', f.text],
    ['--sidebar-primary', primary],
    ['--sidebar-primary-foreground', fg],
    ['--sidebar-accent', f.active],
    ['--sidebar-accent-foreground', f.text],
    ['--sidebar-border', f.border],
    ['--sidebar-ring', primary],
    // ── Layer 3 · Cherry product semantics (some read --cs-*, some literal) ──
    ['--background-subtle', f.soft],
    ['--border-subtle', f.borderSoft],
    ['--border-strong', f.border],
    ['--border-selected', f.active],
    ['--foreground-tertiary', f.text3],
    ['--foreground-disabled', f.text3],
    ['--link', f.link],
    ['--code-block', f.codeBg],
    ['--inline-code', f.inputBg],
    ['--inline-code-foreground', f.kwKeyword],
    ['--reference', f.ref],
    ['--reference-foreground', f.refText],
    ['--reference-subtle', f.refBg],
    ['--highlight', primary],
    ['--highlight-foreground', fg],
    ['--highlight-accent', hexA(primary, 0.3)],
    ['--chat-user', f.userBg],
    ['--resource-list-row-hover', f.soft],
    ['--resource-list-row-active', f.hover],
    ['--resource-list-row-active-foreground', f.text],
    ['--resource-list-row-selected', f.hover],
    ['--resource-list-row-selected-foreground', f.text],
  ]
}

/**
 * Full v2.0.9 Custom CSS.
 * @param dk - dark-mode preview fields (fieldsOf output)
 * @param lt - light-mode preview fields (fieldsOf output)
 * @param meta - { name, radius } (radius in px, mapped to the shadcn --radius unit)
 */
export function buildV2Css(dk, lt, meta = {}) {
  const radius = Number(meta.radius) || 12
  const name = meta.name || 'Theme Station'

  // `:root` (light) must precede `.dark` so dark wins on equal specificity.
  const lightBlock = tokenBlock(':root', [...v2Tokens(lt), ['--radius', `${radius}px`]])
  const darkBlock = tokenBlock('.dark', [...v2Tokens(dk), ['--radius', `${radius}px`]])

  // Signature sidebar glow (Theme Station). v2.0.9 (Tailwind/shadcn) renders the
  // ACTIVE sidebar item's indicator with a 4-step opacity hierarchy emitted on the
  // `.sidebar-theme` class applied to `[data-ui="ui.sidebar"]`:
  //   --sidebar-active-bg   → ActiveIndicator inset border fill
  //   --sidebar-active-border→ active ring/outline (before glows)
  //   --sidebar-glow-bg     → right-edge 6px-blur pill
  //   --sidebar-glow-line   → right-edge 2px-blur line
  // Default is emerald (light `.dark .sidebar-theme` = brighter). These are
  // regular `var(--...)` colors (not `rgb(r g b)`), so we emit accent-tinted
  // rgba directly on the same `.sidebar-theme` selector to win by source order.
  // There is NO per-slot nth-child hover rainbow in v2 — the glow belongs to the
  // selected item. We drive the whole glow from the accent so it matches preview.
  const accent = dk.primary || lt.primary
  const glowAlpha = (c, a) => hexA(c, a)
  const glowTokens = (light) => {
    const c = light ? (lt.primary || accent) : accent
    return [
      `  --sidebar-active-bg: ${glowAlpha(c, 0.08)};`,
      `  --sidebar-active-border: ${glowAlpha(c, 0.15)};`,
      `  --sidebar-glow-bg: ${glowAlpha(c, 0.25)};`,
      `  --sidebar-glow-line: ${glowAlpha(c, 0.5)};`,
    ].join('\n')
  }

  return `/**
 * @name: Cherry Studio Custom Theme (${name} - ${CHERRY_V2_TARGET})
 * @description: Tailwind / shadcn v2.0.9 namespace. Overrides the un-prefixed
 * component tokens on :root (light) and .dark (dark) plus the sidebar's
 * .sidebar-theme --sidebar-* glow tokens; leaves the host-owned
 * --cs-theme-primary* inline primitives untouched. Values come from the same
 * buildVars resolution the Preview Area renders.
 */

${lightBlock}

${darkBlock}

/* ====== Signature sidebar glow (Theme Station) ====== */
.sidebar-theme {
${glowTokens(true)}
}
.dark .sidebar-theme {
${glowTokens(false)}
}
/* ====== Stable markdown penetrations (read Theme Station v2 tokens) ====== */
::selection { background-color: var(--accent) !important; color: var(--accent-foreground) !important; }

.markdown pre, .tiptap pre, .shiki {
  background-color: var(--code-block) !important;
  color: var(--foreground) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
}
.markdown p code, .markdown li code, .markdown code:not(pre code), .tiptap code {
  background-color: var(--inline-code) !important;
  color: var(--inline-code-foreground) !important;
  border-radius: 6px !important;
}
.markdown blockquote, .markdown .markdown-alert {
  background-color: var(--reference-subtle) !important;
  border-left: 4px solid var(--reference) !important;
  color: var(--reference-foreground) !important;
}
.markdown table {
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
}
.markdown blockquote { border-left-color: var(--reference) !important; }

/* ====== Code / inline-code are hard-coded in the v2 base CSS; re-route
   them to our product tokens so syntax & inline spans follow the preview. ====== */
.markdown pre, .tiptap pre, .shiki, .prose pre {
  background-color: var(--code-block) !important;
  color: var(--foreground) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
}
.markdown p code:not(.hljs), .markdown li code:not(.hljs), .tiptap code {
  background-color: var(--inline-code) !important;
  color: var(--inline-code-foreground) !important;
  border-radius: 4px !important;
}
/* Chat bubbles: the user bubble is hard-coded --chat-user; re-route the
   AI/other surfaces to the content card tone so chat matches the preview. */
.user-message, .user-bubble, [data-user-message] {
  background-color: var(--chat-user) !important;
}
`
}
