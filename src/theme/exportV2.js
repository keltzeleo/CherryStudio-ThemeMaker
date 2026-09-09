/**
 * exportV2 — Cherry Studio v2.0.9 (Tailwind v4 + shadcn) exporter.
 *
 * v2.0.9 has a FOUR-layer token model (verified against the real renderer
 * bundle `client-*.css`):
 *   1. `--cs-*` — the design-token palette namespace (`--cs-background`,
 *      `--cs-card`, `--cs-primary`, `--cs-border`, `--cs-input`, …). The app
 *      defines these in `:root` (light) / `.dark` (dark).
 *   2. bare shadcn aliases (`--background`, `--card`, `--primary`,
 *      `--foreground`, `--muted`, `--border`, `--input`, `--ring`, `--sidebar`
 *      …) — the app maps them in `:root` / `.dark` as
 *      `--card: var(--cs-card)`, `--background: var(--cs-background)`, etc.
 *      **These bare aliases are what the component utilities ACTUALLY read:**
 *      `.bg-card { background-color: var(--card) }`,
 *      `.text-foreground { color: var(--foreground) }`,
 *      `.border-border { border-color: var(--border) }`, …
 *   3. `--color-*` — Tailwind v4 `@theme` declarations. The app declares ONLY
 *      `--color-primary: var(--primary)` and `--color-border: var(--border)`,
 *      and NO component reads `var(--color-primary)` / `var(--color-card)` /
 *      `var(--color-background)` … (0 usages in the bundle). This layer does
 *      NOT drive rendering in v2.0.9 — we emit it only for symmetry /
 *      forward-compat, so its values are literal but non-authoritative.
 *   4. Cherry product semantics (`--background-subtle`, `--link`, `--code-block`,
 *      `--reference`, `--highlight`, `--chat-user`, `--resource-list-row-*`) —
 *      the unprefixed product namespace.
 *
 * ACCENT (the critical path): the app maps `--primary: var(--cs-theme-primary)`
 * — NOT `--cs-primary`. It also defines `--cs-theme-primary: var(--cs-primary)`,
 * but the HOST writes `--cs-theme-primary` / `--cs-theme-primary-foreground`
 * INLINE on `<html>` (e.g. `rgb(0,185,107)`). Inline style beats every
 * stylesheet rule, so `--cs-theme-primary` stays green no matter what
 * `--cs-primary` we emit. The ONLY way to theme the accent is to emit the BARE
 * `--primary` (and `--primary-foreground`) as a LITERAL at boosted specificity
 * (`:root:root` / `:root.dark`, 0,2,0), which outranks the app's
 * `:root { --primary: var(--cs-theme-primary) }` (0,1,0). We still emit
 * `--cs-primary` so `--cs-*` consumers resolve to our accent when the host does
 * NOT inject an inline accent. We never declare the host-owned `--cs-theme-*`
 * ourselves.
 *
 * SPECIFICITY: the theme beats the app base via specificity, not source order
 * (the injection position is not guaranteed, and Cherry's custom-CSS setting
 * injects unlayered — outside the app's own cascade layers — so unlayered
 * normal declarations already outrank layered ones; the specificity boost
 * below is what settles the tie against the app's OWN unlayered `:root`
 * bridge rule, e.g. `:root { --primary: var(--cs-theme-primary) }`). `.dark`
 * sits ON `<html>` (the `:root` element), so we emit light as `:root:root`
 * and dark as `:root.dark` (both 0,2,0 > base 0,1,0); `:root:root` precedes
 * `:root.dark` so dark wins by source order inside our own file.
 *
 * REAL-MACHINE COVERAGE (verified against the app.asar bundle and the public
 * CherryHQ/cherry-studio source, not docs):
 *  - The user bubble follows `--chat-user` via a structural re-route: v2.0.9
 *    renders the user message as `[data-ui="chat.user-bubble-message"]` whose
 *    `.message-content-container` is Tailwind `bg-muted` (→ `--muted`), so the
 *    emitted `--chat-user` is NOT read there natively — we re-route it below.
 *    AI bubbles (`.message-assistant`) are natively transparent, no override
 *    needed.
 *  - The input bar `.inputbar-container` uses Tailwind `bg-card`/`border-border`
 *    (→ `--card`/`--border`), NOT `--input`/`--input-background` — re-routed
 *    below so the exported `--input*` tokens (otherwise unread) reach it.
 *  - Blockquote/table/th/td: verified against Cherry's real markdown.css and
 *    Table.tsx (see comments at each penetration rule below) — none of those
 *    surfaces expose an independently-editable hook, so we penetrate with our
 *    own dedicated tokens rather than fighting shared variables.
 *  - Code syntax highlighting: VERIFIED against the real `CodeBlock.tsx` /
 *    `CodeViewer.tsx` source — any fenced code block WITH a language tag
 *    (i.e. almost every real-world fence) renders through the same
 *    `CodeViewer` component in BOTH the regular chat markdown and the
 *    standalone artifact viewer. That component tokenizes with Shiki
 *    (`shiki/core`) and paints each token via `getReactStyleFromToken`,
 *    which returns a React inline `style` object — never a CSS class. There
 *    is no `.hljs-*` (or any other class-based) hook anywhere in this app;
 *    syntax token colors (keyword/string/comment/…) are NOT themeable via
 *    CSS in v2.0.9, full stop, in either surface. We do not attempt a
 *    penetration for this — there is genuinely nothing to attach it to.
 *  - `data-ui` is a MULTI-VALUE attribute (`data-ui="ui.sidebar ui.sidebar-list"`
 *    …); attribute selectors must use `~=` (e.g. `[data-ui~="ui.sidebar"]`), not
 *    `=`. The chat list is VIRTUALIZED — off-screen DOM is unmounted, so
 *    selectors must not assume every row/node is present in the DOM at once.
 *
 * We read EXACTLY the same `fieldsOf(buildVars(...))` values the preview area
 * renders, so 「所见 == 所得」 holds for v2 too.
 */
import { parseColor, darkenHex, rgbaWithAlpha } from '../utils/colorUtils.js'

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
function v2Tokens(f) {
  const primary = f.primary
  const fg = foregroundOf(primary)
  const primaryHover = darkenHex(primary, 0.08)
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
    ['--color-primary-soft', rgbaWithAlpha(primary, 0.6)],
    ['--color-primary-mute', rgbaWithAlpha(primary, 0.3)],
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
    ['--cs-ghost-active', f.active],
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
    ['--highlight-accent', rgbaWithAlpha(primary, 0.3)],
    ['--chat-user', f.userBg],
    // Thinking box — VERIFIED against real ThinkingBlock.tsx: the expanded
    // content wrapped in [data-ui="part:message-reasoning"] uses Tailwind
    // bg-muted (a generic neutral, not our accent-tinted thinkingOf() design)
    // and an inline color: var(--muted-foreground) (also generic). We emit
    // our own dedicated hook and penetrate below so it matches the preview's
    // distinct thinking-box surface instead of the generic muted one.
    ['--thinking-bg', f.thinkBg],
    ['--thinking-border', f.thinkBorder],
    ['--thinking-text', f.thinkText],
    ['--table-header', f.tableHeader],
    ['--table-header-text', f.tableHeaderText],
    ['--table-border', f.tableBorder],
    ['--table-row-bg', f.tableRow],
    ['--table-row-hover', f.soft],
    // The preview's own CSS proves the mapping (App.css): `.topic:hover` uses
    // `--color-hover` (f.hover), `.topic.on` (the SELECTED conversation row)
    // uses `--color-primary-soft` (rgbaWithAlpha(primary, 0.6)) — an accent-tinted
    // highlight, not a neutral wash. Mapping `-selected` to f.hover/f.soft
    // (as before) produced a near-invisible 4–6% neutral tint that looked
    // indistinguishable from the unselected state.
    ['--resource-list-row-hover', f.hover],
    ['--resource-list-row-active', f.active],
    ['--resource-list-row-active-foreground', f.text],
    ['--resource-list-row-selected', rgbaWithAlpha(primary, 0.6)],
    ['--resource-list-row-selected-foreground', f.text],
    // Confirmed via live DOM: v2.0.9 scrollbars read bare `--scrollbar-thumb` /
    // `--scrollbar-thumb-hover` (Tailwind arbitrary-value `bg-[var(--scrollbar-thumb)]`
    // on every `[&::-webkit-scrollbar-thumb]` utility — topic list, message list,
    // composer, selector popovers). v1 used `--color-scrollbar-thumb*` (see
    // tokenRegistry's officialKey) — v2 renamed it, and this file never emitted
    // either form, so every scrollbar in the app was completely unthemed.
    ['--scrollbar-thumb', f.scrollThumb],
    ['--scrollbar-thumb-hover', f.scrollThumb],
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
  // reach `--primary: var(--cs-theme-primary)` — the bare alias the utilities
  // actually read). Because `.dark` is applied ON `<html>` (the `:root` element),
  // we boost specificity:
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
  const glowAlpha = (c, a) => rgbaWithAlpha(c, a)
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
 * @description: Tailwind v4 / shadcn v2.0.9 namespace. Emits the bare aliases
 * (--background/--card/--primary/… — what the .bg-*, .text-*, … utilities
 * actually read, and the only way to bypass the host's inline --cs-theme-primary) plus
 * the --cs-* palette and Cherry product semantics, all at boosted specificity
 * (:root:root light / :root.dark dark) so the theme wins regardless of injection
 * order. Adds the sidebar's .sidebar-theme --sidebar-* glow tokens. Values come
 * from the same buildVars resolution the Preview Area renders.
 */

${lightBlock}

${darkBlock}

/* ====== Signature sidebar glow (Theme Station) ======
   Boosted to html-qualified selectors (0,1,1 > 0,0,1) so this wins on
   specificity rather than relying on injection position, consistent with
   the rest of this file's "we beat the base via specificity, not source
   order" rule. */
html .sidebar-theme {
${glowTokens(true)}
}
html.dark .sidebar-theme {
${glowTokens(false)}
}
/* ====== Markdown penetrations (read the v2 product tokens above; the v2 base
   CSS hard-codes some surfaces, so we re-route them to our tokens + source
   order — later block, equal specificity → wins). ====== */
::selection { background-color: var(--primary) !important; color: var(--primary-foreground) !important; }

/* Input bar (v2 reads Tailwind bg-card/border-border on .inputbar-container,
   not --input/--input-background — re-route so the preview's input fields
   actually reach it). */
.inputbar-container {
  background-color: var(--input-background) !important;
  border-color: var(--input) !important;
}

/* Conversation list pane — the [data-resource-list-pane] wrapper below is
 * from an OLDER PageSidebar.tsx source read; it's an outer structural
 * ancestor that is (or was) transparent. VERIFIED against the real,
 * currently-installed app's live DOM (user-supplied, not source-guessed):
 * the actual opaque, topmost-painted layer is a DIFFERENT, inner element —
 * [data-ui="chat.topic-list"] (data-testid="resource-list-topic") — which
 * carries Tailwind's bg-background directly (the SAME surface the chat area
 * uses, painted solid, fully covering whatever the outer wrapper below
 * paints). That's the real reason this panel always looked chat-colored
 * regardless of the outer rule: this inner layer sits on top of it. Force
 * this one too — it's the one that actually determines what you see. */
[data-resource-list-pane] {
  background-color: var(--sidebar) !important;
}
[data-ui="chat.topic-list"] {
  background-color: var(--sidebar) !important;
}

/* Thinking box (ThinkingBlock.tsx) — VERIFIED against real source: the
 * expanded content div under [data-ui="part:message-reasoning"] uses
 * Tailwind bg-muted plus an inline color: var(--muted-foreground) — both
 * generic, not our accent-tinted thinkingOf() design. Re-route to our own
 * dedicated tokens; the stylesheet !important also wins over the element's
 * inline color style (author !important outranks inline normal styles). */
[data-ui="part:message-reasoning"] .bg-muted {
  background-color: var(--thinking-bg) !important;
  border: 1px solid var(--thinking-border) !important;
  color: var(--thinking-text) !important;
}

/* Chat code fences and the artifact code viewer alike render through
 * CodeViewer.tsx, which sets its root className to code-viewer in EVERY
 * branch (verified in source: one branch sets only code-viewer; the other
 * sets properties.class-or-'shiki' PLUS code-viewer — a bare shiki class
 * token only shows up in that second branch, when Shiki's own theme
 * registration didn't supply properties.class). shiki/tiptap/prose below
 * are kept as defensive fallbacks for surfaces we haven't independently
 * verified, not as the primary hook. */
.markdown pre, .tiptap pre, .shiki, .prose pre, .code-viewer {
  background-color: var(--code-block) !important;
  color: var(--foreground) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
}
.markdown pre code, .tiptap pre code, .prose pre code {
  background: transparent !important;
  color: var(--foreground) !important;
}
.markdown p code, .markdown li code, .markdown code:not(pre code), .tiptap code, .prose code:not(pre code) {
  background-color: var(--inline-code) !important;
  color: var(--inline-code-foreground) !important;
  border-radius: 6px !important;
}

/* Blockquote — VERIFIED against Cherry's real markdown.css (v2.0.12):
 * .markdown blockquote reads background-color: var(--markdown-content-background)
 * (shared with th/inline-code/kbd — do NOT redefine that var globally, it'd
 * recolor 7 unrelated surfaces), border-left: 2px solid var(--primary)
 * (accent-tied, no independent hook), color: var(--muted-foreground). None of
 * that is --reference* — those real tokens exist only for citation badges
 * (.markdown sup[data-citation]). Since the preview treats the quote family
 * as independently editable (not tied to accent/muted), we penetrate the
 * individual properties (never the border-left shorthand, so we don't
 * clobber its width/style) with our own --reference / --reference-foreground
 * hook — this also (correctly) re-colors citation badges the same way, since
 * those really do read --reference/--reference-foreground natively. */
.markdown blockquote {
  background-color: var(--reference-subtle) !important;
  border-left-color: var(--reference) !important;
  color: var(--reference-foreground) !important;
}

/* GitHub-style markdown alerts (> [!NOTE] etc.) — the app hard-codes their
   accent via prefers-color-scheme (follows the OS theme, not the app's own
   light/dark toggle), so we override unconditionally. Double class name
   boosts specificity over the app's single-class rule. We only have one
   accent color modeled (no separate success/warning/danger in the preview),
   so every alert kind maps to --primary; background/border reuse the tokens
   we already control. */
.markdown-alert.markdown-alert {
  --color-border-default: var(--border-subtle);
  --color-accent-fg: var(--primary);
  --color-accent-emphasis: var(--primary);
  --color-success-fg: var(--primary);
  --color-success-emphasis: var(--primary);
  --color-attention-fg: var(--primary);
  --color-attention-emphasis: var(--primary);
  --color-danger-fg: var(--primary);
  --color-danger-emphasis: var(--primary);
  --color-done-fg: var(--primary);
  --color-done-emphasis: var(--primary);
  background: var(--background-subtle);
  border-color: var(--border-subtle);
}

/* Table — VERIFIED against Cherry's real chat table renderer
 * (Table.tsx: table style="border: 0.5px solid var(--border)", cells use
 * Tailwind border-border-subtle + bg-muted on th; the legacy markdown.css
 * fallback path independently agrees: .markdown th reads
 * --markdown-content-background, .markdown th/td borders read
 * --markdown-border-color, row hover reads --markdown-hover-background).
 * None of those expose an independently-editable "table header" hook, so —
 * same rationale as the sidebar glow — we penetrate with our own dedicated
 * --table-* tokens rather than fighting shared variables. .markdown table
 * reaches the chat-table's <table> too: Table.tsx's table-wrapper div is a
 * plain DOM descendant of .markdown, not a separate document. */
.markdown table {
  border-color: var(--table-border) !important;
}
.markdown th {
  background-color: var(--table-header) !important;
  color: var(--table-header-text) !important;
  border-color: var(--table-border) !important;
}
.markdown td {
  background-color: var(--table-row-bg) !important;
  border-color: var(--table-border) !important;
}
.markdown tbody tr:hover > td {
  background-color: var(--table-row-hover) !important;
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

/* v2.0.9 renders EVERY fenced code block (regular chat markdown and the
   standalone artifact viewer alike) through the same Shiki-based CodeViewer
   component, which paints token colors via an INLINE style="color:…" per
   token — never a CSS class. The code block BACKGROUND above (--code-block)
   and inline-code color (--inline-code-foreground) are the only themeable
   surfaces here; syntax token colors are genuinely unthemeable via CSS in
   this version, in both surfaces. */
`
}
