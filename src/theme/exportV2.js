/**
 * exportV2 — Cherry Studio v2.0.9 (Tailwind v4 + shadcn) exporter.
 *
 * v2.0.9 is a Tailwind v4 + shadcn app with a FOUR-layer token model:
 *   1. `--color-*` — shadcn / Tailwind v4 public contract (bg-primary →
 *      var(--color-primary), text-foreground → var(--color-foreground)). The
 *      generated theme.css binds these to `var(--cs-theme-primary)` / `--cs-*`.
 *      This is the layer the component utilities ACTUALLY read, so a theme that
 *      omits it has no visible effect.
 *   2. `--cs-*` — the design-token palette namespace (`--cs-background`,
 *      `--cs-primary`, `--cs-card`, `--cs-border`, `--cs-input`, …), the source
 *      of truth the generated mapping derives layers 1/3 from.
 *   3. bare shadcn aliases (`--background`, `--card`, `--primary`, `--border` …)
 *      — compatibility aliases left for pre-v2 code.
 *   4. Cherry product semantics (`--background-subtle`, `--link`, `--code-block`,
 *      `--reference`, `--highlight`, `--chat-user`, `--resource-list-row-*`) —
 *      the unprefixed product namespace. (v2.0.9 syntax highlighting is Shiki
 *      with inline-styled tokens, so there are NO `--syntax-*` tokens.)
 *
 * The host applies the accent through `--cs-theme-primary` / `--cs-theme-ring`
 * written INLINE on `<html>`. Because the generated `--color-primary: var(--cs-theme-primary)`
 * follows that inline var, overriding `--cs-primary` alone does NOT reach
 * `--color-primary` (the host's inline `--cs-theme-primary` shadows it). So a
 * custom theme MUST emit layer 1 `--color-*` with LITERAL values at boosted
 * specificity to bypass the host's inline accent. We never declare the
 * host-owned `--cs-theme-primary*` ourselves.
 *
 * The theme competes with the app base by boosting specificity, not source
 * order: the app's `:root` / `.dark` blocks are unlayered and our custom CSS
 * injection position is not guaranteed to be "after contract.css", so a plain
 * `:root` / `.dark` override (equal specificity) can silently lose. Since
 * `.dark` is applied on `<html>` (the `:root` element), we emit light overrides
 * as `:root:root` and dark overrides as `:root.dark` (both 0,2,0) so they beat
 * the base `:root` / `.dark` (0,1,0) by specificity and win regardless of where
 * the host injects us. Because the app's `--primary` is
 * `var(--cs-theme-primary)` and the host can write `--cs-theme-primary*`
 * INLINE on `<html>`, our later `:root:root` `--primary` literal outranks it by
 * specificity; we additionally emit the `--cs-*` sources (so the app's
 * `var(--cs-*)`-backed unprefixed tokens resolve to our values even when the
 * host does not set an inline accent). We never declare the host-owned
 * `--cs-theme-primary*` ourselves.
 *
 * We read EXACTLY the same `fieldsOf(buildVars(...))` values the preview area
 * renders, so 「所见 == 所得」 holds for v2 too.
 */
import { parseColor } from '../utils/colorUtils.js'
import { hexA, darken } from '../utils/colors.js'

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
// v2.0.9 has a FOUR-layer model:
//   1. `--color-*` public contract (what Tailwind v4 / shadcn utilities read).
//   2. `--cs-*` palette namespace (--cs-background/primary/border/card/sidebar/
//      input/accent/muted/popover/foreground…) — the SINGLE source of truth the
//      app derives the other layers from.
//   3. bare shadcn aliases built as `var(--cs-*)` (--background, --card, --primary…).
//   4. Cherry product semantics (--background-subtle, --link, --code-block,
//      --reference, --highlight, --chat-user, --resource-list-row-*…): the
//      unprefixed PUBLIC namespace. In the app's product.css these mostly read
//      `var(--cs-*)`, but `--code-block`/`--chat-user` are literal colors and
//      `--link`/`--highlight` read `--cs-blue-*`/`--cs-amber-*`. We emit them
//      unprefixed (never `--cs-link`/`--cs-code-block`/`--cs-chat-user`) so we
//      override the public aliases directly.
//
// A custom theme MUST override layer 2 (`--cs-*`) so layers 3/4 pick it up, AND
// the bare aliases + product semantics directly (so consumers reading them
// directly are themed too). Setting ONLY bare aliases (the old behaviour) leaks
// app defaults for any surface reading `--cs-*` → inconsistent coverage.
//
// CRITICAL for v2.0.9: the app is Tailwind v4 + shadcn. Its components style via
// `--color-*` public contract tokens (bg-primary → var(--color-primary),
// bg-card → var(--color-card), text-foreground → var(--color-foreground) …), and
// the generated theme.css wires those as `--color-primary: var(--cs-theme-primary)`
// etc. The host writes `--cs-theme-primary*` INLINE on <html>, so an override of
// `--cs-primary` alone does NOT reach `--color-primary` (it is shadowed by the
// host's inline `--cs-theme-primary` var the generated mapping follows). Therefore
// we ALSO emit the `--color-*` layer with LITERAL values at boosted specificity
// (:root:root / :root.dark) so the shadcn utilities the app actually renders with
// resolve to our colors regardless of the host's inline accent. Skipping this layer
// is the #1 reason a pasted theme "has no effect".
function v2Tokens(f) {
  const primary = f.primary
  const fg = foregroundOf(primary)
  const primaryHover = darken(primary, 0.08)
  return [
    // ── Layer 1 · `--color-*` public contract (shadcn / Tailwind v4 utilities) ──
    ['--color-background', f.bg],
    ['--color-background-subtle', f.soft],
    ['--color-foreground', f.text],
    ['--color-foreground-secondary', f.text2],
    ['--color-foreground-muted', f.text3],
    ['--color-card', f.soft],
    ['--color-card-foreground', f.text],
    ['--color-popover', f.bg],
    ['--color-popover-foreground', f.text],
    ['--color-primary', primary],
    ['--color-primary-foreground', fg],
    ['--color-primary-hover', primaryHover],
    ['--color-primary-soft', hexA(primary, 0.6)],
    ['--color-primary-mute', hexA(primary, 0.3)],
    ['--color-secondary', f.soft],
    ['--color-secondary-foreground', f.text],
    ['--color-secondary-hover', f.hover],
    ['--color-secondary-active', f.active],
    ['--color-muted', f.soft],
    ['--color-muted-foreground', f.text3],
    ['--color-accent', f.hover],
    ['--color-accent-foreground', f.text],
    ['--color-ghost-hover', f.hover],
    ['--color-ghost-active', f.active],
    ['--color-border', f.border],
    ['--color-border-subtle', f.borderSoft],
    ['--color-border-hover', f.active],
    ['--color-border-active', f.active],
    ['--color-frame-border', f.border],
    ['--color-input', f.inputBorder],
    ['--color-input-background', f.inputBg],
    ['--color-ring', primary],
    ['--color-sidebar', f.sidebar],
    ['--color-sidebar-foreground', f.text],
    ['--color-sidebar-primary', primary],
    ['--color-sidebar-primary-foreground', fg],
    ['--color-sidebar-accent', f.active],
    ['--color-sidebar-accent-foreground', f.text],
    ['--color-sidebar-border', f.border],
    ['--color-sidebar-ring', primary],
    // ── Layer 2 · `--cs-*` palette namespace (design-token source of truth) ──
    ['--cs-background', f.bg],
    ['--cs-background-subtle', f.soft],
    ['--cs-foreground', f.text],
    ['--cs-muted-foreground', f.text3],
    ['--cs-foreground-tertiary', f.text3],
    ['--cs-foreground-disabled', f.text3],
    ['--cs-card', f.soft],
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
    ['--cs-input-background', f.inputBg],
    ['--cs-ring', primary],
    ['--cs-sidebar', f.sidebar],
    ['--cs-sidebar-foreground', f.text],
    ['--cs-sidebar-primary', primary],
    ['--cs-sidebar-primary-foreground', fg],
    ['--cs-sidebar-accent', f.active],
    ['--cs-sidebar-accent-foreground', f.text],
    ['--cs-sidebar-border', f.border],
    ['--cs-sidebar-ring', primary],
    // ── Layer 3 · bare shadcn aliases (mirror the app's var(--cs-*) mapping) ──
    ['--background', f.bg],
    ['--foreground', f.text],
    ['--card', f.soft],
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
    ['--input-background', f.inputBg],
    ['--ring', primary],
    ['--sidebar', f.sidebar],
    ['--sidebar-foreground', f.text],
    ['--sidebar-primary', primary],
    ['--sidebar-primary-foreground', fg],
    ['--sidebar-accent', f.active],
    ['--sidebar-accent-foreground', f.text],
    ['--sidebar-border', f.border],
    ['--sidebar-ring', primary],
    // ── Layer 4 · Cherry product semantics (some read --cs-*, some literal) ──
    ['--background-subtle', f.soft],
    ['--border-subtle', f.borderSoft],
    ['--border-strong', f.border],
    ['--border-selected', f.active],
    ['--foreground-tertiary', f.text3],
    ['--foreground-disabled', f.text3],
    ['--link', f.link],
    ['--code-block', f.codeBg],
    ['--inline-code', f.mute],
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

  // We emit EVERY token layer with boosted specificity so the theme wins
  // regardless of injection order AND of the host's inline `--cs-theme-primary*`
  // (which would otherwise shadow a plain `--cs-primary` override before it can
  // reach the generated `--color-primary: var(--cs-theme-primary)`). Because
  // `.dark` is applied ON `<html>` (the `:root` element), we boost specificity:
  //   light → `:root:root`  (0,2,0)
  //   dark  → `:root.dark`  (0,2,0)  (html.dark)
  // both outrank the base `:root` / `.dark` (0,1,0). `:root:root` (light)
  // precedes `:root.dark` (dark); equal specificity, so source order makes dark
  // win inside our own file.
  const lightBlock = tokenBlock(':root:root', [...v2Tokens(lt), ['--radius', `${radius}px`]])
  const darkBlock = tokenBlock(':root.dark', [...v2Tokens(dk), ['--radius', `${radius}px`]])

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
 * @description: Tailwind v4 / shadcn v2.0.9 namespace. Emits the --color-*
 * public contract (what shadcn utilities actually read, bypassing the host's
 * inline --cs-theme-primary*) plus the --cs-* palette, bare aliases and Cherry
 * product semantics, all at boosted specificity (:root:root light / :root.dark
 * dark) so the theme wins regardless of injection order. Adds the sidebar's
 * .sidebar-theme --sidebar-* glow tokens. Values come from the same buildVars
 * resolution the Preview Area renders.
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
/* ====== Markdown penetrations (read the v2 product tokens above; the v2 base
   CSS hard-codes some surfaces, so we re-route them to our tokens + source
   order — later block, equal specificity → wins). ====== */
::selection { background-color: var(--accent) !important; color: var(--accent-foreground) !important; }

[data-ui="chat.markdown"] pre, .markdown pre, .tiptap pre, .shiki, .prose pre {
  background-color: var(--code-block) !important;
  color: var(--foreground) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
}
[data-ui="chat.markdown"] pre code, .markdown pre code, .tiptap pre code, .prose pre code {
  background: transparent !important;
  color: var(--foreground) !important;
}
[data-ui="chat.markdown"] code:not(pre code), .markdown p code, .markdown li code, .markdown code:not(pre code), .tiptap code, .prose code:not(pre code) {
  background-color: var(--inline-code) !important;
  color: var(--inline-code-foreground) !important;
  border-radius: 6px !important;
}
[data-ui="chat.markdown"] blockquote, .markdown blockquote, .markdown .markdown-alert {
  background-color: var(--reference-subtle) !important;
  border-left: 4px solid var(--reference) !important;
  color: var(--reference-foreground) !important;
}
.markdown blockquote { border-left-color: var(--reference) !important; }
[data-ui="chat.markdown"] table, .markdown table {
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
}

/* ====== User bubble (v2 default layout) ======
   v2.0.9 renders the user message as [data-ui="chat.user-bubble-message"] whose
   .message-content-container carries Tailwind bg-muted (→ --muted); the
   --chat-user token is only read by the legacy .bubble.messages-container
   layout. Override the default layout so the user bubble follows the user's
   chosen --chat-user regardless of layout. */
[data-ui="chat.user-bubble-message"] .message-content-container {
  background-color: var(--chat-user) !important;
}

/* v2.0.9 syntax highlighting is Shiki (bundled themes), which styles token
   colors with INLINE style="color:…" — there are no --syntax-* tokens and
   no highlight.js token classes. The code block BACKGROUND above (--code-block)
   and inline-code color (--inline-code-foreground) are the only themeable code
   surfaces; token colors are intentionally left to the Shiki theme. */
`
}
