/**
 * exportCss — the only CSS exporter.
 *
 * Layer 1 emits every official Cherry Studio v1.9.12 variable.
 * Layer 2 emits Theme Station structural variables.
 * The structural rules (selectors) are static, values come from the same
 * `buildThemeVars` resolution used by the Preview Area.
 */
import { buildThemeVars } from './resolver.js';
import { TOKEN_REGISTRY, OFFICIAL_VERSION, OFFICIAL_COMMIT } from './tokenRegistry.js';
import { hexToRgbOnly, roundAlpha } from '../utils/colorUtils.js';

const OFFICIAL_ORDER_HINT = [
  '--color-white', '--color-white-soft', '--color-white-mute',
  '--color-black', '--color-black-soft', '--color-black-mute',
  '--color-gray-1', '--color-gray-2', '--color-gray-3',
  '--color-text-1', '--color-text-2', '--color-text-3',
  '--color-background', '--color-background-soft', '--color-background-mute', '--color-background-opacity',
  '--inner-glow-opacity',
  '--color-primary', '--color-primary-soft', '--color-primary-mute',
  '--color-text', '--color-text-secondary',
  '--color-icon', '--color-icon-white',
  '--color-border', '--color-border-soft', '--color-border-mute',
  '--color-error', '--color-link',
  '--color-code-background', '--color-inline-code-background', '--color-inline-code-text',
  '--color-hover', '--color-active',
  '--color-frame-border', '--color-group-background',
  '--color-reference', '--color-reference-text', '--color-reference-background',
  '--color-list-item', '--color-list-item-hover',
  '--modal-background',
  '--color-highlight', '--color-background-highlight', '--color-background-highlight-accent',
  '--navbar-background-mac', '--navbar-background',
  '--chat-background', '--chat-background-user', '--chat-background-assistant', '--chat-text-user',
  '--list-item-border-radius',
  '--color-status-success', '--color-status-error', '--color-status-warning',
  '--color-scrollbar-thumb', '--color-scrollbar-thumb-hover',
  '--scrollbar-width', '--scrollbar-height', '--scrollbar-thumb-radius',
  '--table-border-radius',
];

const rankOf = (key) => {
  const i = OFFICIAL_ORDER_HINT.indexOf(key);
  return i === -1 ? 9999 : i;
};

/**
 * Layer 1 block: official v1.9.12 variables, in official source order.
 */
const officialBlock = (theme, isDarkMode) => {
  const mode = isDarkMode ? 'dark' : 'light';
  const vars = buildThemeVars(theme, mode);
  const officialTokens = TOKEN_REGISTRY.filter(
    (t) => t.kind === 'official' && t.exportVar !== false && vars[t.officialKey] !== undefined,
  );
  officialTokens.sort((a, b) => rankOf(a.officialKey) - rankOf(b.officialKey));

  const lines = officialTokens.map((t) => {
    let value = vars[t.officialKey];
    if (t.unit && typeof value === 'number') value = `${value}${t.unit}`;
    return `  ${t.officialKey}: ${value} !important;`;
  });

  // Fixed official vars not in the registry (exported as-is)
  lines.push(`  --color-highlight: ${isDarkMode ? 'rgba(0,0,0,1)' : 'initial'} !important;`);

  // Scrollbar raw variants (official scrollbar.css)
  if (isDarkMode) {
    lines.push(`  --color-scrollbar-thumb-dark: ${vars['--color-scrollbar-thumb']} !important;`);
    lines.push(`  --color-scrollbar-thumb-dark-hover: ${vars['--color-scrollbar-thumb-hover']} !important;`);
  } else {
    lines.push(`  --color-scrollbar-thumb-light: ${vars['--color-scrollbar-thumb']} !important;`);
    lines.push(`  --color-scrollbar-thumb-light-hover: ${vars['--color-scrollbar-thumb-hover']} !important;`);
  }

  return lines.join('\n');
};

/**
 * Layer 2 block: Theme Station structural variables.
 */
const extensionBlock = (theme, isDarkMode) => {
  const mode = isDarkMode ? 'dark' : 'light';
  const vars = buildThemeVars(theme, mode);
  const extTokens = TOKEN_REGISTRY.filter(
    (t) => t.kind === 'extension' && t.exportVar !== false && t.officialKey.startsWith('--') && vars[t.officialKey] !== undefined,
  );
  return extTokens.map((t) => `  ${t.officialKey}: ${vars[t.officialKey]} !important;`).join('\n');
};

/**
 * Full exported CSS for Cherry Studio's "Custom CSS" field.
 */
export const buildExportCss = (theme, meta = {}) => {
  const primary = theme.primaryColor || '#E89975';
  const sbHover = (theme.sidebarHoverPalette || []).length >= 6
    ? theme.sidebarHoverPalette
    : ['#E89975', '#7DD3FC', '#A78BFA', '#F472B6', '#34D399', '#FACC15'];
  const blur = Number(theme.blurAmount) || 0;
  const radius = Number(theme.borderRadius) || 16;
  const tableRadius = typeof theme.tableBorderRadius === 'number' ? theme.tableBorderRadius : 8;
  const listRadius = typeof theme.listItemBorderRadius === 'number' ? theme.listItemBorderRadius : 10;

  return `/**
 * @name: Cherry Studio Custom Theme (${meta.name || 'Theme Station'} - V71)
 * @description: Layer 1 = official Cherry Studio ${OFFICIAL_VERSION} variables (commit ${OFFICIAL_COMMIT.slice(0, 7)}). Layer 2 = Theme Station structural extensions.
 */

body[theme-mode="dark"] {
${officialBlock(theme, true)}
}

body[theme-mode="light"] {
${officialBlock(theme, false)}
}

/* ====== Shared Root: Legacy Aliases + Layer 2 Sidebar Hover ====== */
body[theme-mode] {
  --primary-color: ${primary} !important;
  --primary: ${primary} !important;
  --font-family: var(--user-font-family), Ubuntu, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Roboto, Oxygen, Cantarell, 'Open Sans', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji' !important;
  --code-font-family: var(--user-code-font-family), 'Cascadia Code', 'Fira Code', 'Consolas', Menlo, Courier, monospace !important;

  ${theme.enableRandomSidebarHover ? `
  --sidebar-hover-1: ${hexToRgbOnly(sbHover[0])};
  --sidebar-hover-2: ${hexToRgbOnly(sbHover[1])};
  --sidebar-hover-3: ${hexToRgbOnly(sbHover[2])};
  --sidebar-hover-4: ${hexToRgbOnly(sbHover[3])};
  --sidebar-hover-5: ${hexToRgbOnly(sbHover[4])};
  --sidebar-hover-6: ${hexToRgbOnly(sbHover[5])};
  ` : ''}
}

/* ====== Layer 2 — Theme Station structural variables ====== */
body[theme-mode="dark"] {
${extensionBlock(theme, true)}
}

body[theme-mode="light"] {
${extensionBlock(theme, false)}
}

/* ====== Base penetrations ====== */
[class^='PageContainer'], [class^='MainContainer'], #chat, [class^='SettingGroup'], [class^='AgentCardContainer'] {
  background-color: transparent !important;
}

/* ====== Text selection ====== */
::selection { background-color: var(--ts-selection-bg) !important; }

#app-sidebar, .home-tabs, ul[class^="SettingMenus"], div[class^="KnowledgeSideNav"], [class^="LeftContainer"], div[class^="SideNav"], [class*="AgentsGroupList"] {
  background-color: var(--color-background-soft) !important;
}

/* ====== Safe Active Highlights ====== */
#app-sidebar .active { background-color: transparent !important; }
#app-sidebar .active svg {
  color: var(--theme-active-item-text) !important;
  filter: drop-shadow(0 0 10px var(--theme-active-item-bg));
}
#app-sidebar .opened-minapp, #app-sidebar [data-rfd-draggable-id] > .ant-dropdown-trigger {
  background-color: transparent !important;
  box-shadow: none !important;
}
#app-sidebar .opened-minapp .ant-avatar {
  box-shadow: 0 0 15px var(--theme-active-item-bg), 0 0 0 2px var(--theme-active-item-border) !important;
}

.home-tabs [class*='active'],
.home-tabs [class*='selected'],
.home-tabs [aria-selected='true'],
.home-tabs [data-active='true'],
.home-tabs [data-state='active'] {
  background-color: var(--theme-active-item-bg) !important;
  border-right: 3px solid var(--theme-active-item-border) !important;
  border-radius: 12px !important;
}
.home-tabs [class*='active'] [title],
.home-tabs [class*='selected'] [title],
.home-tabs [aria-selected='true'] [title],
.home-tabs [data-active='true'] [title],
.home-tabs [data-state='active'] [title] {
  color: var(--theme-topic-active-title-text) !important;
}
.home-tabs [class*='active'] .time, .home-tabs [class*='active'] time, .home-tabs [class*='active'] [class*='Time'], .home-tabs [class*='active'] [class*='Date'], .home-tabs [aria-selected='true'] .time, .home-tabs [aria-selected='true'] time {
  color: var(--theme-topic-active-meta-text) !important;
}
.home-tabs [class*='active'] .menu, .home-tabs [class*='active'] .menu svg, .home-tabs [class*='active'] [class*='Menu'] svg, .home-tabs [aria-selected='true'] .menu, .home-tabs [aria-selected='true'] .menu svg {
  color: var(--theme-topic-active-menu-text) !important;
  stroke: var(--theme-topic-active-menu-text) !important;
}

.ant-dropdown-menu-item-selected, .ant-select-item-option-selected, .ant-menu-item-selected {
  background-color: var(--theme-active-item-bg) !important;
  color: var(--theme-active-item-text) !important;
}

/* ====== Sidebar Random Hover ====== */
${theme.enableRandomSidebarHover ? `
#app-sidebar [aria-describedby]:nth-child(6n+1), #app-sidebar [data-rfd-draggable-id]:nth-child(6n+1) { --_hover-random: var(--sidebar-hover-1); }
#app-sidebar [aria-describedby]:nth-child(6n+2), #app-sidebar [data-rfd-draggable-id]:nth-child(6n+2) { --_hover-random: var(--sidebar-hover-2); }
#app-sidebar [aria-describedby]:nth-child(6n+3), #app-sidebar [data-rfd-draggable-id]:nth-child(6n+3) { --_hover-random: var(--sidebar-hover-3); }
#app-sidebar [aria-describedby]:nth-child(6n+4), #app-sidebar [data-rfd-draggable-id]:nth-child(6n+4) { --_hover-random: var(--sidebar-hover-4); }
#app-sidebar [aria-describedby]:nth-child(6n+5), #app-sidebar [data-rfd-draggable-id]:nth-child(6n+5) { --_hover-random: var(--sidebar-hover-5); }
#app-sidebar [aria-describedby]:nth-child(6n+6), #app-sidebar [data-rfd-draggable-id]:nth-child(6n+6) { --_hover-random: var(--sidebar-hover-6); }
#app-sidebar [aria-describedby] > div { border-radius: 9999px !important; }
#app-sidebar [aria-describedby] > div:not(.active):hover {
  background-color: rgba(var(--_hover-random), ${roundAlpha(theme.sidebarHoverOpacity)}) !important;
  box-shadow: 0 0 15px rgba(var(--_hover-random), ${roundAlpha(theme.sidebarHoverGlowOpacity)}) !important;
  transform: translateY(-1px);
  transition: all 0.2s ease !important;
}
#app-sidebar [aria-describedby] > div:not(.active):hover svg {
  color: rgb(var(--_hover-random)) !important;
  stroke: rgb(var(--_hover-random)) !important;
  filter: drop-shadow(0 0 8px rgba(var(--_hover-random), ${roundAlpha(theme.sidebarHoverGlowOpacity)}));
  transform: scale(1.1);
  transition: all 0.2s ease !important;
}
#app-sidebar [data-rfd-draggable-id] > .ant-dropdown-trigger:not(.opened-minapp):hover {
  background-color: transparent !important;
  box-shadow: none !important;
}
#app-sidebar [data-rfd-draggable-id] > .ant-dropdown-trigger:not(.opened-minapp):hover .ant-avatar {
  box-shadow: 0 0 15px rgba(var(--_hover-random), ${roundAlpha(theme.sidebarHoverGlowOpacity)}), 0 0 0 2px rgb(var(--_hover-random)) !important;
  transform: translateY(-2px);
  transition: all 0.2s ease !important;
}
` : ''}

/* ====== Structure & Glass ====== */
#content-container { background-color: var(--color-background) !important; }
#messages, .minapp-drawer .ant-drawer-body, .ant-layout-content, div[class^="SettingContainer"] { background-color: var(--content-bgcolor) !important; }

${blur > 0 ? `
#app-sidebar, .KnowledgeSideNav, [class^="LeftContainer-"], #content-container, .inputbar-container, div[class^="ProviderListContainer"], .minapp-drawer .ant-drawer-content, .ant-dropdown-menu, .ant-popover-inner {
  backdrop-filter: blur(${blur}px) !important;
  -webkit-backdrop-filter: blur(${blur}px) !important;
}
` : ''}

${theme.enableLuminaMotion ? `
@keyframes messagePop { 0% { opacity: 0; transform: translateY(-10px) rotateX(-16deg) scale(0.92); filter: blur(32px); } 100% { opacity: 1; transform: translateY(0) rotateX(0deg) scale(1); filter: blur(0px); } }
.message-content-container { animation: messagePop 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
` : ''}

/* ====== Bubbles & Collapse ====== */
.message-assistant .message-content-container, .message-user .message-content-container {
  border-radius: ${radius}px !important;
  border: 1px solid var(--local-bubble-border) !important;
  padding: 16px 20px !important;
  ${theme.enableBouncyHover ? `transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);` : ''}
}
${theme.enableBouncyHover ? `.message-content-container:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); }` : ''}

.message-assistant .message-content-container { background-color: var(--local-ai-bubble-bg, transparent) !important; }
.message-user .message-content-container { background-color: var(--chat-background-user) !important; }
.message-assistant .markdown { color: var(--local-ai-text-color) !important; }
.message-user .markdown { color: var(--chat-text-user) !important; }
.message-user .markdown a, .message-user .tiptap a { color: var(--ant-color-link) !important; }
.message-user .markdown a:hover, .message-user .tiptap a:hover { color: var(--ant-color-link-hover) !important; }
.message-assistant .markdown p, .message-assistant .markdown li, .message-assistant .markdown h1, .message-assistant .markdown h2, .message-assistant .markdown h3 { color: inherit !important; }
.message-user .markdown p, .message-user .markdown li, .message-user .markdown h1, .message-user .markdown h2, .message-user .markdown h3 { color: inherit !important; }

.ant-collapse { border: none !important; background-color: transparent !important; }
.ant-collapse > .ant-collapse-item { background-color: var(--local-thinking-bg) !important; border: 1px solid var(--local-thinking-border) !important; border-radius: ${radius}px !important; }
.ant-collapse-header { color: var(--local-thinking-text) !important; }
.ant-collapse-content { border-top: 1px solid var(--local-thinking-border) !important; background-color: transparent !important; color: var(--local-thinking-text) !important; }

/* ====== Tables ====== */
[class^='ProviderListContainer'], [class^='ProviderListContainer'] .ant-list { background-color: transparent !important; }
[class^='ProviderListContainer'] .ant-list-item, [class^='ModelList'] .ant-list-item { background-color: rgba(var(--primary), 0.03) !important; border-bottom: 1px solid var(--color-border) !important; }

.markdown .table-wrapper { border-radius: ${radius}px !important; }
.markdown .table-toolbar [role='button'], .markdown .table-toolbar button { background-color: var(--color-background-opacity) !important; border: 1px solid var(--color-border) !important; color: var(--color-text-2) !important; }
.markdown .table-toolbar [role='button']:hover, .markdown .table-toolbar button:hover { background-color: var(--theme-hover-item-bg) !important; color: var(--color-primary) !important; }

.markdown table { border: 1px solid var(--local-table-border) !important; border-radius: ${tableRadius}px !important; }
.markdown table th { background-color: var(--local-table-header-bg) !important; border-bottom: 1px solid var(--local-table-border) !important; color: var(--local-table-header-text) !important; }
.markdown table td { color: var(--color-text-2) !important; border-bottom: 1px solid var(--local-table-border) !important; transition: background-color 0.2s ease; }
.markdown table tr:hover td { background-color: var(--local-table-hover-bg) !important; }

.markdown strong { color: inherit !important; }
.markdown ul li::marker, .markdown ol li::marker { color: var(--color-primary) !important; }
.markdown blockquote { border-left-color: var(--color-primary) !important; background-color: var(--color-primary-soft) !important; }

/* ====== Overlays & Inputs ====== */
.ant-select-dropdown, .ant-modal-content, .ant-popover-inner, .ant-dropdown-menu { background-color: var(--color-background-opacity) !important; border: 1px solid var(--color-border) !important; border-radius: ${radius}px !important; }

#inputbar, .inputbar-container { background: var(--local-input-bg) !important; border: 1px solid var(--local-input-border) !important; border-radius: 20px !important; transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease !important; }
#inputbar:focus-within, .inputbar-container:focus-within { transform: scale(1.01); box-shadow: 0 8px 24px -8px var(--color-primary-soft); border-color: var(--color-primary) !important; }
#inputbar input, #inputbar textarea { color: var(--color-text-1) !important; }
#inputbar input::placeholder, #inputbar textarea::placeholder { color: var(--color-text-3) !important; }

${theme.enableHoloGlass ? `
@keyframes gradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
#inputbar::before, .inputbar-container::before {
  content: ''; position: absolute; inset: -1.5px; border-radius: inherit; padding: 1.5px;
  background: linear-gradient(to right, ${primary}, #0078D4, ${primary});
  background-size: 200% 200%; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; -webkit-mask-composite: xor;
  animation: gradientFlow 4s linear infinite; opacity: 0; transition: all 0.4s ease-in-out; pointer-events: none; z-index: -1;
}
#inputbar:focus-within::before, .inputbar-container:focus-within::before { opacity: 1; }
` : ''}

/* ====== Code Syntax Native Engine ====== */
.markdown p code, .markdown li code, .markdown code:not(pre code), .tiptap code {
  background-color: var(--color-inline-code-background) !important;
  color: var(--color-inline-code-text) !important;
  border-radius: 5px !important;
}
.markdown pre, .tiptap pre {
  background-color: var(--color-code-background) !important;
  color: var(--color-code-text) !important;
  border: 1px solid var(--theme-code-border) !important;
  border-radius: ${radius}px !important;
}
.markdown pre code, .tiptap pre code {
  background: transparent !important; color: var(--color-code-text) !important; font-family: var(--code-font-family) !important;
}
.shiki, .shiki code, .markdown .shiki, .tiptap .shiki, .markdown pre .hljs, .markdown pre code.hljs {
  background: var(--color-code-background) !important; color: var(--color-code-text) !important;
}
.cm-editor, .cm-editor .cm-scroller, .cm-editor .cm-content {
  background-color: var(--color-code-background) !important; color: var(--color-code-text) !important;
}
.code-block-wrapper .code-block-header {
  background-color: var(--theme-code-header-bg) !important; color: var(--theme-code-header-text) !important;
  border: 1px solid var(--color-border-soft) !important; border-radius: 8px !important; padding: 2px 6px !important;
}
.markdown .hljs-keyword, .markdown .hljs-built_in, .markdown .hljs-type, .tiptap .hljs-keyword, .tiptap .hljs-built_in, .tiptap .hljs-type, .cm-keyword { color: var(--code-keyword-color) !important; }
.markdown .hljs-string, .markdown .hljs-attr, .markdown .hljs-template-variable, .tiptap .hljs-string, .tiptap .hljs-attr, .tiptap .hljs-template-variable, .cm-string { color: var(--code-string-color) !important; }
.markdown .hljs-title, .markdown .hljs-function, .markdown .hljs-title.function_, .tiptap .hljs-title, .tiptap .hljs-function, .tiptap .hljs-title.function_, .cm-variable, .cm-def, .cm-property { color: var(--code-function-color) !important; }
.markdown .hljs-comment, .markdown .hljs-quote, .tiptap .hljs-comment, .tiptap .hljs-quote, .cm-comment { color: var(--code-comment-color) !important; font-style: italic !important; }
.markdown .hljs-punctuation, .markdown .hljs-symbol, .markdown .hljs-operator, .tiptap .hljs-punctuation, .tiptap .hljs-symbol, .tiptap .hljs-operator, .cm-operator { color: var(--code-punctuation-color) !important; }
.markdown pre ::selection, .tiptap pre ::selection, .cm-editor ::selection { background-color: var(--theme-code-selection) !important; }

/* ====== Reference / Citation (official vars) ====== */
.markdown .markdown-alert, .markdown blockquote {
  background-color: var(--color-reference-background) !important;
  border-left: 4px solid var(--color-reference) !important;
  color: var(--color-reference-text) !important;
}

/* ====== List item radius (official) ====== */
.home-tabs [class*='item'], .home-tabs [class*='Item'], .ant-list-item {
  border-radius: ${listRadius}px !important;
}
`;
};

/** Export the JSON config (same registry-backed theme state). */
export const buildExportJson = (theme) => JSON.stringify(theme, null, 2);
