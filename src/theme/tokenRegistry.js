/**
 * THEME TOKEN REGISTRY — the single source of truth for every theme parameter.
 *
 * Everything reads from here:
 *   - the parameter editor (controls, groups, search, reset)
 *   - the Preview Area (CSS variables injected into the preview)
 *   - the CSS exporter (Layer 1 official vars + Layer 2 structural vars)
 *   - the CSS importer (reverse-mapping variable names back to state keys)
 *   - defaults (reset all / reset single / fresh preset)
 *   - the coverage matrix and token-coverage tests
 *
 * Official reference: CherryHQ/cherry-studio @ v1.9.12
 *   commit da0a11fdc43ab91e1d486f57663c61f6c747e69d (2026-07-03)
 *
 * `kind`:
 *   'official'   — a real Cherry Studio v1.9.12 CSS variable (color.css /
 *                  scrollbar.css / markdown.css / useUserTheme.ts).
 *   'extension'  — Theme Station structural augmentation variable or a pure
 *                  editor control that feeds an official variable.
 *
 * `exportVar`:
 *   true (default) — the token emits its `officialKey` CSS variable.
 *   false          — pure editor control; consumed by other tokens / structural CSS.
 *
 * Recipe types (resolved by src/theme/resolver.js):
 *   plain      → theme[themeKey + modeSuffix]
 *   alphaOf    → hexWithAlpha(plain, fixedAlpha)
 *   alphaKeyFn → hexWithAlpha(plain, alpha[mode])
 *   hexAlphaKey→ hexWithAlpha(plain, theme[alphaKey])
 *   rgbaKey    → rgba(plain, theme[alphaKey])
 *   alias      → `var(--other-key)`
 *   fixed      → constant string (NOT_APPLICABLE, still exported)
 *   fn         → custom resolver (theme, mode) => string
 */

export const OFFICIAL_REPO = 'https://github.com/CherryHQ/cherry-studio';
export const OFFICIAL_VERSION = 'v1.9.12';
export const OFFICIAL_COMMIT = 'da0a11fdc43ab91e1d486f57663c61f6c747e69d';
export const OFFICIAL_CHECK_DATE = '2026-08-22';

/* Editor group ids (ordered) — user-facing groups in the parameter panel */
export const GROUPS = [
  { id: 'foundations', label: { en: 'Foundations', zh: '基础色板' } },
  { id: 'window', label: { en: 'Window and Surfaces', zh: '窗口与表面' } },
  { id: 'sidebar', label: { en: 'Sidebar and Navigation', zh: '侧边栏与导航' } },
  { id: 'conversation', label: { en: 'Conversation List', zh: '会话列表' } },
  { id: 'chatbg', label: { en: 'Chat Background', zh: '聊天背景' } },
  { id: 'usermsg', label: { en: 'User Message', zh: '用户消息' } },
  { id: 'assistantmsg', label: { en: 'Assistant Message', zh: '助手消息' } },
  { id: 'typography', label: { en: 'Typography', zh: '排版' } },
  { id: 'inputarea', label: { en: 'Input Area', zh: '输入区' } },
  { id: 'controls', label: { en: 'Buttons and Controls', zh: '按钮与控件' } },
  { id: 'borders', label: { en: 'Borders and Dividers', zh: '边框与分隔线' } },
  { id: 'codemarkdown', label: { en: 'Code and Markdown', zh: '代码与 Markdown' } },
  { id: 'overlays', label: { en: 'Menus and Overlays', zh: '菜单与浮层' } },
  { id: 'status', label: { en: 'Status Colors', zh: '状态颜色' } },
  { id: 'settingsui', label: { en: 'Settings Interface', zh: '设置界面' } },
  { id: 'scrollbar', label: { en: 'Scrollbars', zh: '滚动条' } },
  { id: 'advanced', label: { en: 'Advanced', zh: '高级' } },
];

export const GROUP_MAP = Object.fromEntries(GROUPS.map((g) => [g.id, g]));

const official = (file, symbol, lineOrSymbol = '') => ({
  repository: OFFICIAL_REPO,
  file,
  lineOrSymbol: lineOrSymbol || symbol,
  commit: OFFICIAL_COMMIT,
  version: OFFICIAL_VERSION,
});

const station = (file, symbol) => ({
  repository: 'https://github.com/keltzeleo/kelismTheme-station-cherry',
  file,
  lineOrSymbol: symbol,
  commit: 'deepseek/theme-maker-ui-parity',
  version: 'V71',
});

export const PREVIEW_TARGETS = [
  'assistant-msg',
  'assistant-msg-text',
  'badge-error',
  'badge-info',
  'badge-success',
  'badge-warning',
  'blockquote',
  'body-text',
  'btn-default',
  'btn-destructive',
  'btn-icon',
  'btn-primary',
  'chat-area',
  'chat-header',
  'code-block',
  'code-copy',
  'code-header',
  'code-lang',
  'code-lines',
  'destructive',
  'disabled',
  'divider',
  'drawer',
  'dropdown',
  'dropdown-item',
  'focus',
  'fold-reason',
  'heading',
  'hover',
  'inline-code',
  'input-bar',
  'input-field',
  'input-placeholder',
  'input-tools',
  'link',
  'message-actions',
  'mini-window',
  'modal',
  'modal-body',
  'modal-title',
  'model-selector',
  'nav-hover-glow',
  'scrollbar',
  'selected',
  'send-btn',
  'settings-btn',
  'settings-desc',
  'settings-disabled',
  'settings-error',
  'settings-group',
  'settings-sidebar',
  'settings-title',
  'settings-warning',
  'sidebar-nav',
  'sidebar-topics',
  'status-bar',
  'table',
  'table-header',
  'table-row',
  'thinking-box',
  'thinking-text',
  'tool-card',
  'tool-status',
  'tooltip',
  'top-bar',
  'topic-item',
  'topic-item-active',
  'topic-menu',
  'topic-meta',
  'topic-title',
  'user-msg',
  'user-msg-text',
  'window',
];

export const TOKEN_REGISTRY = [
  /* ═══════════════════════ Foundations ═══════════════════════ */
  {
    id: 'primaryColor', officialKey: '--color-primary', group: 'foundations', valueMode: 'shared',
    valueType: 'color', kind: 'official',
    label: { en: 'Primary / Accent Color', zh: '主色 / 强调色' },
    description: { en: 'Brand accent. Drives buttons, links, selection, focus rings and derived primary-soft/mute.', zh: '品牌强调色，驱动按钮、链接、选中态、焦点环及 primary-soft/mute 派生色。' },
    themeKey: 'primaryColor', defaultDark: '#E89975', defaultLight: '#E89975',
    previewTargets: ['btn-primary', 'send-btn', 'link', 'selected'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-primary'),
  },
  {
    id: 'primarySoft', officialKey: '--color-primary-soft', group: 'foundations', valueMode: 'shared',
    valueType: 'color', kind: 'official',
    label: { en: 'Primary Soft (60% alpha)', zh: '主色柔化（60% 透明度）' },
    description: { en: 'Derived: primary at 0.6 alpha (the exact alpha official useUserTheme applies).', zh: '派生值：主色 0.6 透明度（与官方 useUserTheme 完全一致）。' },
    themeKey: 'primaryColor', defaultDark: '#E8997599', defaultLight: '#E8997599',
    recipe: { type: 'alphaOf', alpha: 0.6 },
    previewTargets: ['btn-primary', 'selected', 'hover'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-primary-soft'),
  },
  {
    id: 'primaryMute', officialKey: '--color-primary-mute', group: 'foundations', valueMode: 'shared',
    valueType: 'color', kind: 'official',
    label: { en: 'Primary Mute (30% alpha)', zh: '主色淡出（30% 透明度）' },
    description: { en: 'Derived: primary at 0.3 alpha (the exact alpha official useUserTheme applies).', zh: '派生值：主色 0.3 透明度（与官方 useUserTheme 完全一致）。' },
    themeKey: 'primaryColor', defaultDark: '#E8997533', defaultLight: '#E8997533',
    recipe: { type: 'alphaOf', alpha: 0.2 },
    previewTargets: ['btn-default', 'table-header'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-primary-mute'),
  },
  {
    id: 'white', officialKey: '--color-white', group: 'foundations', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'White Base', zh: '白色基色' },
    description: { en: 'Base white used by icons-on-primary, white-soft and white-mute.', zh: '基础白色，供图标、white-soft 与 white-mute 使用。' },
    themeKey: 'whiteColor', defaultDark: '#ffffff', defaultLight: '#ffffff',
    previewTargets: ['window'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-white'),
  },
  {
    id: 'whiteSoft', officialKey: '--color-white-soft', group: 'foundations', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'White Soft', zh: '白色柔化' },
    description: { en: 'Light-mode soft surface (official dark rgba(255,255,255,0.8) / light rgba(0,0,0,0.04)).', zh: '浅色模式柔和表面（官方 dark rgba(255,255,255,0.8) / light rgba(0,0,0,0.04)）。' },
    themeKey: 'whiteSoft', defaultDark: 'rgba(255,255,255,0.8)', defaultLight: 'rgba(0,0,0,0.04)',
    previewTargets: ['window'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-white-soft'),
  },
  {
    id: 'whiteMute', officialKey: '--color-white-mute', group: 'foundations', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'White Mute', zh: '白色弱化' },
    description: { en: 'Light hover surface (official dark rgba(255,255,255,0.94) / light #eee).', zh: '浅色悬停表面（官方 dark rgba(255,255,255,0.94) / light #eee）。' },
    themeKey: 'whiteMute', defaultDark: 'rgba(255,255,255,0.94)', defaultLight: '#eeeeee',
    previewTargets: ['window'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-white-mute'),
  },
  {
    id: 'black', officialKey: '--color-black', group: 'foundations', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Black Base', zh: '黑色基色' },
    description: { en: 'Base black: window background in dark mode and primary text color in light mode.', zh: '基础黑色：深色模式窗口背景与浅色模式主文字。' },
    themeKey: 'blackColor', defaultDark: '#181818', defaultLight: '#1b1b1f',
    previewTargets: ['window', 'body-text'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-black'),
  },
  {
    id: 'blackSoft', officialKey: '--color-black-soft', group: 'foundations', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Black Soft', zh: '黑色柔化' },
    description: { en: 'Soft black surface (official #222222 dark / #262626 light).', zh: '柔和黑色表面（官方 dark #222222 / light #262626）。' },
    themeKey: 'blackSoft', defaultDark: '#222222', defaultLight: '#262626',
    previewTargets: ['window'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-black-soft'),
  },
  {
    id: 'blackMute', officialKey: '--color-black-mute', group: 'foundations', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Black Mute', zh: '黑色弱化' },
    description: { en: 'Mute black surface (official #333333 dark / #363636 light). Feeds --color-background-mute.', zh: '弱化黑色表面（官方 dark #333333 / light #363636），供 --color-background-mute 使用。' },
    themeKey: 'blackMute', defaultDark: '#333333', defaultLight: '#363636',
    previewTargets: ['window'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-black-mute'),
  },
  {
    id: 'gray1', officialKey: '--color-gray-1', group: 'foundations', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Gray 1 (strongest)', zh: '灰色 1（最深）' },
    description: { en: 'Ant Design derived gray scale (official #515c67 dark / #8e8e93 light).', zh: 'Ant Design 派生灰度（官方 dark #515c67 / light #8e8e93）。' },
    themeKey: 'gray1', defaultDark: '#515c67', defaultLight: '#8e8e93',
    previewTargets: ['disabled'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-gray-1'),
  },
  {
    id: 'gray2', officialKey: '--color-gray-2', group: 'foundations', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Gray 2', zh: '灰色 2' },
    description: { en: 'Ant Design derived gray scale (official #414853 dark / #aeaeb2 light).', zh: 'Ant Design 派生灰度（官方 dark #414853 / light #aeaeb2）。' },
    themeKey: 'gray2', defaultDark: '#414853', defaultLight: '#aeaeb2',
    previewTargets: ['disabled'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-gray-2'),
  },
  {
    id: 'gray3', officialKey: '--color-gray-3', group: 'foundations', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Gray 3 (softest)', zh: '灰色 3（最浅）' },
    description: { en: 'Ant Design derived gray scale (official #32363f dark / #c7c7cc light).', zh: 'Ant Design 派生灰度（官方 dark #32363f / light #c7c7cc）。' },
    themeKey: 'gray3', defaultDark: '#32363f', defaultLight: '#c7c7cc',
    previewTargets: ['disabled'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-gray-3'),
  },

  /* ═══════════════════════ Window and Surfaces ═══════════════════════ */
  {
    id: 'background', officialKey: '--color-background', group: 'window', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'App Window Background', zh: '应用窗口背景' },
    description: { en: 'The absolute window background (official --color-background).', zh: '应用窗口绝对背景（官方 --color-background）。' },
    themeKey: 'globalBg', defaultDark: '#2b2b2b', defaultLight: '#faf8f6',
    previewTargets: ['window', 'chat-area', 'settings-title'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-background'),
  },
  {
    id: 'backgroundSoft', officialKey: '--color-background-soft', group: 'window', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Soft Surface (Sidebar)', zh: '柔和表面（侧栏）' },
    description: { en: 'Soft surface; the exporter also binds the main sidebar / topic list to it via structural selectors.', zh: '柔和表面；导出器同时用结构选择器将主侧栏与会话列表绑定到该变量。' },
    themeKey: 'sidebarBg', defaultDark: '#303030', defaultLight: '#f4f4f4',
    previewTargets: ['sidebar-nav', 'sidebar-topics', 'settings-sidebar'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-background-soft'),
  },
  {
    id: 'backgroundMute', officialKey: '--color-background-mute', group: 'window', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Mute Surface', zh: '弱化表面' },
    description: { en: 'Even softer surface (official alias of black-mute).', zh: '更柔和的表面（官方为 black-mute 的别名）。' },
    recipe: { type: 'alias', of: '--color-black-mute' },
    defaultDark: '#333333', defaultLight: '#eeeeee',
    previewTargets: ['window'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-background-mute'),
  },
  {
    id: 'backgroundOpacity', officialKey: '--color-background-opacity', group: 'window', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Overlay Surface (opacity)', zh: '浮层表面（带透明度）' },
    description: { en: 'Translucent surface for dropdowns, drawers and the mini window.', zh: '下拉、抽屉与划词助手浮层的半透明表面。' },
    themeKey: 'miniWindowBg', alphaKey: { dark: 'miniWindowBgOpacityDark', light: 'miniWindowBgOpacityLight' },
    defaultDark: '#222222', defaultLight: '#F3F3F3',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['dropdown', 'modal', 'drawer', 'mini-window'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-background-opacity'),
  },
  {
    id: 'modalBg', officialKey: '--modal-background', group: 'window', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Modal Background', zh: '弹窗背景' },
    description: { en: 'Modal/dialog background (official #111111 dark / white light).', zh: '模态弹窗背景（官方 dark #111111 / light 白色）。' },
    themeKey: 'modalBg', defaultDark: '#111111', defaultLight: '#ffffff',
    previewTargets: ['modal', 'modal-body'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--modal-background'),
  },
  {
    id: 'frameBorder', officialKey: '--color-frame-border', group: 'window', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Window Frame Border', zh: '窗口边框' },
    description: { en: 'Window chrome / frame border (official #333 dark / #ddd light).', zh: '窗口边框（官方 dark #333 / light #ddd）。' },
    themeKey: 'frameBorder', defaultDark: '#333333', defaultLight: '#dddddd',
    previewTargets: ['window', 'top-bar'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-frame-border'),
  },
  {
    id: 'hoverColor', officialKey: '--color-hover', group: 'window', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Global Hover Surface', zh: '全局悬停表面' },
    description: { en: 'Generic hover background (official rgba(40,40,40,1) dark / white-mute light).', zh: '通用悬停背景（官方 dark rgba(40,40,40,1) / light white-mute）。' },
    themeKey: 'hoverColor', defaultDark: '#282828', defaultLight: '#eeeeee',
    previewTargets: ['btn-default', 'dropdown-item', 'settings-btn', 'topic-item'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-hover'),
  },
  {
    id: 'activeColor', officialKey: '--color-active', group: 'window', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Global Active Surface', zh: '全局激活表面' },
    description: { en: 'Generic active/pressed background (official rgba(55,55,55,1) dark / white-soft light).', zh: '通用按下背景（官方 dark rgba(55,55,55,1) / light white-soft）。' },
    themeKey: 'activeColor', defaultDark: '#373737', defaultLight: 'rgba(0,0,0,0.04)',
    previewTargets: ['btn-default', 'selected', 'input-field'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-active'),
  },
  {
    id: 'groupBackground', officialKey: '--color-group-background', group: 'window', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Group Background', zh: '分组背景' },
    description: { en: 'Grouped list background (official dark = background-soft alias, light = white).', zh: '分组列表背景（官方 dark 为 background-soft 别名，light 为白色）。' },
    recipe: { type: 'fn', fn: 'groupBackground' },
    defaultDark: 'var(--color-background-soft)', defaultLight: '#ffffff',
    previewTargets: ['sidebar-topics'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-group-background'),
  },

  /* ═══════════════════════ Sidebar and Navigation ═══════════════════════ */
  {
    id: 'navbarBg', officialKey: '--navbar-background', group: 'sidebar', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Navigation Bar Background', zh: '导航栏背景' },
    description: { en: 'The left navigation column background.', zh: '左侧导航栏背景。' },
    themeKey: 'sidebarBg', defaultDark: '#303030', defaultLight: '#f4f4f4',
    previewTargets: ['sidebar-nav'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--navbar-background'),
  },
  {
    id: 'navbarBgMac', officialKey: '--navbar-background-mac', group: 'sidebar', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Nav Bar (macOS, 55% alpha)', zh: '导航栏（macOS，55% 透明度）' },
    description: { en: 'macOS translucent navbar variant (official 0.55 alpha of the navbar color).', zh: 'macOS 半透明导航栏变体（官方为导航栏色的 0.55 透明度）。' },
    themeKey: 'sidebarBg', defaultDark: 'rgba(20,20,20,0.55)', defaultLight: 'rgba(255,255,255,0.55)',
    recipe: { type: 'alphaOf', alpha: 0.55 },
    previewTargets: ['sidebar-nav'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--navbar-background-mac'),
  },
  {
    id: 'sidebarOpacity', officialKey: '--ts-sidebar-opacity', group: 'sidebar', valueMode: 'shared',
    valueType: 'number', kind: 'extension', exportVar: false,
    label: { en: 'Sidebar Opacity', zh: '侧栏不透明度' },
    description: { en: 'Opacity applied to the sidebar surfaces in the preview and via backdrop-filter in exports.', zh: '预览中侧栏表面不透明度；导出时用于 backdrop-filter 效果。' },
    themeKey: 'sidebarOpacity', defaultDark: 1, defaultLight: 1,
    previewTargets: ['sidebar-nav', 'sidebar-topics'],
    officialSource: station('src/App.jsx', 'generateCssBlock'),
  },
  {
    id: 'navHoverGlow', officialKey: '--ts-nav-hover-glow', group: 'sidebar', valueMode: 'shared',
    valueType: 'boolean', kind: 'extension', exportVar: false,
    label: { en: 'Random Sidebar Hover Glow', zh: '导航栏随机悬停光晕' },
    description: { en: 'nth-child pseudo-random colored glow on the left navbar icons.', zh: '左侧导航栏图标 nth-child 伪随机彩色光晕。' },
    themeKey: 'enableRandomSidebarHover', defaultDark: true, defaultLight: true,
    previewTargets: ['sidebar-nav', 'nav-hover-glow'],
    officialSource: station('src/App.jsx', 'exportedCSS'),
  },
  {
    id: 'sidebarHoverPalette', officialKey: '--ts-nav-hover-palette', group: 'sidebar', valueMode: 'shared',
    valueType: 'color', kind: 'extension', exportVar: false, isArray: true, arrayLength: 6,
    label: { en: 'Nav Hover Glow Palette (6)', zh: '导航悬停光晕色板（6 色）' },
    description: { en: 'Six colors cycled by nth-child for the navbar hover glow.', zh: '导航栏悬停光晕按 nth-child 轮换的六种颜色。' },
    themeKey: 'sidebarHoverPalette', defaultDark: ['#E89975', '#7DD3FC', '#A78BFA', '#F472B6', '#34D399', '#FACC15'],
    defaultLight: ['#E89975', '#7DD3FC', '#A78BFA', '#F472B6', '#34D399', '#FACC15'],
    previewTargets: ['nav-hover-glow'],
    officialSource: station('src/App.jsx', 'exportedCSS'),
  },
  {
    id: 'sidebarHoverOpacity', officialKey: '--ts-nav-hover-opacity', group: 'sidebar', valueMode: 'shared',
    valueType: 'number', kind: 'extension', exportVar: false,
    label: { en: 'Nav Hover Glow Opacity', zh: '导航悬停光晕不透明度' },
    description: { en: 'Background opacity of the glow on hover.', zh: '悬停光晕背景不透明度。' },
    themeKey: 'sidebarHoverOpacity', defaultDark: 0.16, defaultLight: 0.16,
    previewTargets: ['nav-hover-glow'],
    officialSource: station('src/App.jsx', 'exportedCSS'),
  },
  {
    id: 'sidebarHoverGlowOpacity', officialKey: '--ts-nav-hover-glow-opacity', group: 'sidebar', valueMode: 'shared',
    valueType: 'number', kind: 'extension', exportVar: false,
    label: { en: 'Nav Hover Glow Intensity', zh: '导航悬停光晕强度' },
    description: { en: 'Box-shadow intensity of the glow on hover.', zh: '悬停光晕 box-shadow 强度。' },
    themeKey: 'sidebarHoverGlowOpacity', defaultDark: 0.35, defaultLight: 0.35,
    previewTargets: ['nav-hover-glow'],
    officialSource: station('src/App.jsx', 'exportedCSS'),
  },

  /* ═══════════════════════ Conversation List ═══════════════════════ */
  {
    id: 'listItem', officialKey: '--color-list-item', group: 'conversation', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'List Item Surface', zh: '列表项表面' },
    description: { en: 'Topic/list item base surface (official dark rgba(255,255,255,0.1) / light #fff).', zh: '会话列表项基础表面（官方 dark rgba(255,255,255,0.1) / light #fff）。' },
    themeKey: 'listItemColor', alphaKey: { dark: 'listItemOpacityDark', light: 'listItemOpacityLight' },
    defaultDark: '#ffffff', defaultLight: '#ffffff',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['topic-item', 'settings-sidebar'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-list-item'),
  },
  {
    id: 'listItemHover', officialKey: '--color-list-item-hover', group: 'conversation', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'List Item Hover Surface', zh: '列表项悬停表面' },
    description: { en: 'Topic/list item hover surface (official dark rgba(255,255,255,0.05) / light #fafafa).', zh: '会话列表项悬停表面（官方 dark rgba(255,255,255,0.05) / light #fafafa）。' },
    themeKey: 'listItemHoverColor', alphaKey: { dark: 'listItemHoverOpacityDark', light: 'listItemHoverOpacityLight' },
    defaultDark: '#ffffff', defaultLight: '#fafafa',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['topic-item', 'settings-sidebar'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-list-item-hover'),
  },
  {
    id: 'topicActiveBg', officialKey: '--theme-active-item-bg', group: 'conversation', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Active Topic Background', zh: '选中话题背景' },
    description: { en: 'Background of the selected topic row (theme-station structural var).', zh: '选中话题行的背景（扩展结构变量）。' },
    themeKey: 'activeItemBg', alphaKey: { dark: 'activeItemBgOpacityDark', light: 'activeItemBgOpacityLight' },
    defaultDark: '#ffffff', defaultLight: '#ffffff',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['topic-item-active'],
    officialSource: station('src/App.jsx', '--theme-active-item-bg'),
  },
  {
    id: 'topicActiveBorder', officialKey: '--theme-active-item-border', group: 'conversation', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Active Topic Indicator', zh: '选中话题指示条' },
    description: { en: 'Border/indicator of the selected topic row (theme-station structural var).', zh: '选中话题行的边框指示条（扩展结构变量）。' },
    themeKey: 'activeItemBorder', alphaKey: { dark: 'activeItemBorderOpacityDark', light: 'activeItemBorderOpacityLight' },
    defaultDark: '#ffffff', defaultLight: '#000000',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['topic-item-active'],
    officialSource: station('src/App.jsx', '--theme-active-item-border'),
  },
  {
    id: 'topicActiveText', officialKey: '--theme-active-item-text', group: 'conversation', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Active Topic Accent Text', zh: '选中话题强调文字' },
    description: { en: 'Accent text color inside the selected topic row.', zh: '选中话题行内强调文字颜色。' },
    themeKey: 'activeItemText', defaultDark: '#f0f0f0', defaultLight: '#1b1b1f',
    previewTargets: ['topic-item-active', 'topic-menu'],
    officialSource: station('src/App.jsx', '--theme-active-item-text'),
  },
  {
    id: 'topicActiveTitle', officialKey: '--theme-topic-active-title-text', group: 'conversation', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Active Topic Title Text', zh: '选中话题标题文字' },
    description: { en: 'Title text color of the selected topic.', zh: '选中话题的标题文字颜色。' },
    themeKey: 'topicActiveTitleText', defaultDark: '#F0F0F0', defaultLight: '#1b1b1f',
    previewTargets: ['topic-title'],
    officialSource: station('src/App.jsx', '--theme-topic-active-title-text'),
  },
  {
    id: 'topicActiveMeta', officialKey: '--theme-topic-active-meta-text', group: 'conversation', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Active Topic Meta Text', zh: '选中话题日期文字' },
    description: { en: 'Date/time text color of the selected topic.', zh: '选中话题的日期时间文字颜色。' },
    themeKey: 'topicActiveMetaText', defaultDark: '#ffffff', defaultLight: '#1b1b1f',
    previewTargets: ['topic-meta'],
    officialSource: station('src/App.jsx', '--theme-topic-active-meta-text'),
  },
  {
    id: 'topicActiveMenu', officialKey: '--theme-topic-active-menu-text', group: 'conversation', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Active Topic Menu Icon', zh: '选中话题菜单图标' },
    description: { en: 'More-menu icon color of the selected topic.', zh: '选中话题更多菜单图标颜色。' },
    themeKey: 'topicActiveMenuText', defaultDark: '#ffffff61', defaultLight: '#00000061',
    previewTargets: ['topic-menu'],
    officialSource: station('src/App.jsx', '--theme-topic-active-menu-text'),
  },
  {
    id: 'topicHoverBg', officialKey: '--theme-hover-item-bg', group: 'conversation', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Topic Hover Background', zh: '话题悬停背景' },
    description: { en: 'Hover background of topic/list rows (theme-station structural var).', zh: '话题与列表行的悬停背景（扩展结构变量）。' },
    themeKey: 'hoverItemBg', alphaKey: { dark: 'hoverItemBgOpacityDark', light: 'hoverItemBgOpacityLight' },
    defaultDark: '#ffffff', defaultLight: '#fafafa',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['topic-item'],
    officialSource: station('src/App.jsx', '--theme-hover-item-bg'),
  },

  /* ═══════════════════════ Chat Background ═══════════════════════ */
  {
    id: 'chatBackground', officialKey: '--chat-background', group: 'chatbg', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Chat Canvas Background', zh: '聊天画布背景' },
    description: { en: 'Official value is transparent — the workspace surface shows through. Exported as-is.', zh: '官方为 transparent，露出工作区表面。按原样导出。' },
    recipe: { type: 'fixed', value: 'transparent' },
    defaultDark: 'transparent', defaultLight: 'transparent',
    previewTargets: ['chat-area'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--chat-background'),
  },
  {
    id: 'workspaceBg', officialKey: '--content-bgcolor', group: 'chatbg', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Canvas Tint (optional)', zh: '画布着色（可选）' },
    description: { en: 'Optional translucent tint over the window background. Default is transparent (official: messages sit on --color-background).', zh: '叠加在窗口背景上的可选半透明着色。默认为透明（官方：消息区直接坐落在 --color-background 上）。' },
    themeKey: 'workspaceBg', alphaKey: { dark: 'workspaceOpacity', light: 'workspaceOpacity' },
    defaultDark: '#2d2e2d', defaultLight: '#faf8f6',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['chat-area'],
    officialSource: station('src/App.jsx', '--content-bgcolor'),
  },
  {
    id: 'chatBackgroundUser', officialKey: '--chat-background-user', group: 'chatbg', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'User Message Surface', zh: '用户消息表面' },
    description: { en: 'Official user-message bubble background (dark rgba(255,255,255,0.08) / light rgba(0,0,0,0.045)).', zh: '官方用户消息气泡背景（dark rgba(255,255,255,0.08) / light rgba(0,0,0,0.045)）。' },
    themeKey: 'userBubbleBg', alphaKey: { dark: 'userBubbleOpacityDark', light: 'userBubbleOpacityLight' },
    defaultDark: '#ffffff', defaultLight: '#000000',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['user-msg'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--chat-background-user'),
  },
  {
    id: 'chatBackgroundAssistant', officialKey: '--chat-background-assistant', group: 'chatbg', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Assistant Message Surface', zh: '助手消息表面' },
    description: { en: 'Official value is transparent — assistant bubbles inherit the canvas. Exported as-is.', zh: '官方为 transparent，助手气泡继承画布。按原样导出。' },
    recipe: { type: 'fixed', value: 'transparent' },
    defaultDark: 'transparent', defaultLight: 'transparent',
    previewTargets: ['assistant-msg'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--chat-background-assistant'),
  },
  {
    id: 'chatTextUser', officialKey: '--chat-text-user', group: 'chatbg', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'User Message Text', zh: '用户消息文字' },
    description: { en: 'Text color inside user messages (official dark: var(--color-black)).', zh: '用户消息内文字颜色（官方 dark 为 var(--color-black)）。' },
    themeKey: 'userTextColor', defaultDark: '#F0F0F0', defaultLight: '#1b1b1f',
    previewTargets: ['user-msg-text'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--chat-text-user'),
  },

  /* ═══════════════════════ User Message ═══════════════════════ */
  {
    id: 'userBubbleBg', officialKey: '--ts-user-bubble-bg', group: 'usermsg', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension', exportVar: false,
    label: { en: 'User Bubble Color', zh: '用户气泡颜色' },
    description: { en: 'Raw color of the user bubble (feeds official --chat-background-user).', zh: '用户气泡原始颜色（供官方 --chat-background-user 使用）。' },
    themeKey: 'userBubbleBg', alphaKey: { dark: 'userBubbleOpacityDark', light: 'userBubbleOpacityLight' },
    defaultDark: '#ffffff', defaultLight: '#000000',
    previewTargets: ['user-msg'],
    officialSource: station('src/App.jsx', '--chat-background-user'),
  },
  {
    id: 'userBubbleOpacity', officialKey: '--ts-user-bubble-opacity', group: 'usermsg', valueMode: 'per-mode',
    valueType: 'number', kind: 'extension', exportVar: false,
    label: { en: 'User Bubble Opacity', zh: '用户气泡不透明度' },
    description: { en: 'Opacity of the user bubble surface.', zh: '用户气泡表面不透明度。' },
    themeKey: 'userBubbleOpacity', defaultDark: 1, defaultLight: 0.045,
    previewTargets: ['user-msg'],
    officialSource: station('src/App.jsx', 'generateCssBlock'),
  },
  {
    id: 'userMsgText', officialKey: '--ts-user-msg-text', group: 'usermsg', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension', exportVar: false,
    label: { en: 'User Bubble Text', zh: '用户气泡文字' },
    description: { en: 'Text color inside the user bubble (feeds official --chat-text-user).', zh: '用户气泡内文字颜色（供官方 --chat-text-user 使用）。' },
    themeKey: 'userTextColor', defaultDark: '#F0F0F0', defaultLight: '#1b1b1f',
    previewTargets: ['user-msg-text'],
    officialSource: station('src/App.jsx', 'generateCssBlock'),
  },
  {
    id: 'userLink', officialKey: '--ant-color-link', group: 'usermsg', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'User Bubble Link', zh: '用户气泡链接' },
    description: { en: 'Link color inside the user bubble (Ant Design --ant-color-link; split from the AI hyperlink --color-link).', zh: '用户气泡内链接颜色（Ant Design --ant-color-link；从 AI 超链接 --color-link 拆出）。' },
    themeKey: 'userLinkColor', defaultDark: '#1668dc', defaultLight: '#1677ff',
    previewTargets: ['user-msg'],
    officialSource: station('src/theme/tokenRegistry.js', '--ant-color-link'),
  },
  {
    id: 'userLinkHover', officialKey: '--ant-color-link-hover', group: 'usermsg', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'User Bubble Link Hover', zh: '用户气泡链接悬停' },
    description: { en: 'Hover color of user bubble links (Ant Design --ant-color-link-hover).', zh: '用户气泡链接悬停颜色（Ant Design --ant-color-link-hover）。' },
    themeKey: 'userLinkHoverColor', defaultDark: '#3c89e8', defaultLight: '#4096ff',
    previewTargets: ['user-msg'],
    officialSource: station('src/theme/tokenRegistry.js', '--ant-color-link-hover'),
  },

  /* ═══════════════════════ Assistant Message ═══════════════════════ */
  {
    id: 'aiBubbleBg', officialKey: '--local-ai-bubble-bg', group: 'assistantmsg', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Assistant Bubble Color', zh: '助手气泡颜色' },
    description: { en: 'Raw color of the assistant bubble (extension; official assistant surface is transparent).', zh: '助手气泡原始颜色（扩展；官方助手表面为透明）。' },
    themeKey: 'aiBubbleBg', alphaKey: { dark: 'aiBubbleOpacityDark', light: 'aiBubbleOpacityLight' },
    defaultDark: '#2d2e2d', defaultLight: '#ffffff',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['assistant-msg'],
    officialSource: station('src/App.jsx', '--local-ai-bubble-bg'),
  },
  {
    id: 'aiBubbleOpacity', officialKey: '--ts-ai-bubble-opacity', group: 'assistantmsg', valueMode: 'per-mode',
    valueType: 'number', kind: 'extension', exportVar: false,
    label: { en: 'Assistant Bubble Opacity', zh: '助手气泡不透明度' },
    description: { en: 'Opacity of the assistant bubble surface.', zh: '助手气泡表面不透明度。' },
    themeKey: 'aiBubbleOpacity', defaultDark: 1, defaultLight: 0.8,
    previewTargets: ['assistant-msg'],
    officialSource: station('src/App.jsx', 'generateCssBlock'),
  },
  {
    id: 'aiMsgText', officialKey: '--local-ai-text-color', group: 'assistantmsg', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Assistant Bubble Text', zh: '助手气泡文字' },
    description: { en: 'Text color inside the assistant bubble.', zh: '助手气泡内文字颜色。' },
    themeKey: 'aiTextColor', defaultDark: '#F0F0F0', defaultLight: '#1b1b1f',
    previewTargets: ['assistant-msg-text', 'body-text'],
    officialSource: station('src/App.jsx', '--local-ai-text-color'),
  },
  {
    id: 'bubbleBorder', officialKey: '--local-bubble-border', group: 'assistantmsg', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Message Bubble Border', zh: '消息气泡边框' },
    description: { en: 'Border of user and assistant bubbles (extension; official v1.9.12 ships no bubble border).', zh: '用户与助手气泡边框（扩展；官方 v1.9.12 无气泡边框）。' },
    themeKey: 'bubbleBorder', alphaKey: { dark: 'bubbleBorderOpacityDark', light: 'bubbleBorderOpacityLight' },
    defaultDark: '#ffffff', defaultLight: '#1b1b1f',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['user-msg', 'assistant-msg', 'tool-card'],
    officialSource: station('src/App.jsx', '--local-bubble-border'),
  },
  {
    id: 'bubbleRadius', officialKey: '--ts-bubble-radius', group: 'assistantmsg', valueMode: 'shared',
    valueType: 'number', kind: 'extension', exportVar: false,
    label: { en: 'Message Bubble Radius', zh: '消息气泡圆角' },
    description: { en: 'Border radius applied to bubbles, code blocks and cards.', zh: '气泡、代码块与卡片的圆角。' },
    themeKey: 'borderRadius', defaultDark: 16, defaultLight: 16,
    previewTargets: ['user-msg', 'assistant-msg', 'code-block', 'input-bar'],
    officialSource: station('src/App.jsx', 'exportedCSS'),
  },
  {
    id: 'thinkingBg', officialKey: '--local-thinking-bg', group: 'assistantmsg', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Thinking Box Background', zh: '思考框背景' },
    description: { en: 'Background of the collapsed reasoning (thinking) box.', zh: '折叠推理（思考）框背景。' },
    themeKey: 'thinkingBg', alphaKey: { dark: 'thinkingBgOpacityDark', light: 'thinkingBgOpacityLight' },
    defaultDark: '#222222', defaultLight: '#f3f3f3',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['thinking-box', 'fold-reason'],
    officialSource: station('src/App.jsx', '--local-thinking-bg'),
  },
  {
    id: 'thinkingBorder', officialKey: '--local-thinking-border', group: 'assistantmsg', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Thinking Box Border', zh: '思考框边框' },
    description: { en: 'Border of the reasoning box.', zh: '思考框边框。' },
    themeKey: 'thinkingBorder', alphaKey: { dark: 'thinkingBorderOpacityDark', light: 'thinkingBorderOpacityLight' },
    defaultDark: '#E89975', defaultLight: '#E89975',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['thinking-box'],
    officialSource: station('src/App.jsx', '--local-thinking-border'),
  },
  {
    id: 'thinkingText', officialKey: '--local-thinking-text', group: 'assistantmsg', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Thinking Box Text', zh: '思考框文字' },
    description: { en: 'Text color of the reasoning box header and body.', zh: '思考框标题与正文文字颜色。' },
    themeKey: 'thinkingText', defaultDark: '#ea928a', defaultLight: '#7c1b13',
    previewTargets: ['thinking-text'],
    officialSource: station('src/App.jsx', '--local-thinking-text'),
  },

  /* ═══════════════════════ Typography ═══════════════════════ */
  {
    id: 'text1', officialKey: '--color-text-1', group: 'typography', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Primary Text', zh: '主要文字' },
    description: { en: 'Primary text color (official --color-text-1).', zh: '主要文字颜色（官方 --color-text-1）。' },
    themeKey: 'globalTextColor', defaultDark: '#F0F0F0', defaultLight: '#1b1b1f',
    previewTargets: ['body-text', 'heading', 'settings-title', 'topic-title'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-text-1'),
  },
  {
    id: 'text', officialKey: '--color-text', group: 'typography', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Body Text (alias)', zh: '正文（别名）' },
    description: { en: 'Alias of text-1 (official --color-text: var(--color-text-1)).', zh: 'text-1 的别名（官方 --color-text: var(--color-text-1)）。' },
    recipe: { type: 'alias', of: '--color-text-1' },
    defaultDark: 'var(--color-text-1)', defaultLight: 'var(--color-text-1)',
    previewTargets: ['body-text'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-text'),
  },
  {
    id: 'text2', officialKey: '--color-text-2', group: 'typography', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Secondary Text (60% alpha)', zh: '次要文字（60% 透明度）' },
    description: { en: 'Secondary text; derived from text-1 at 0.6 alpha (official dark/light both 0.6).', zh: '次要文字，由 text-1 以 0.6 透明度派生（官方 dark/light 均为 0.6）。' },
    themeKey: 'globalTextColor', defaultDark: 'rgba(235,235,245,0.6)', defaultLight: 'rgba(0,0,0,0.6)',
    recipe: { type: 'alphaOf', alpha: 0.6 },
    previewTargets: ['topic-meta', 'settings-desc', 'chat-header'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-text-2'),
  },
  {
    id: 'text3', officialKey: '--color-text-3', group: 'typography', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Tertiary Text (38% alpha)', zh: '三级文字（38% 透明度）' },
    description: { en: 'Tertiary/placeholder text; derived from text-1 at 0.38 alpha (official).', zh: '三级/占位文字，由 text-1 以 0.38 透明度派生（官方）。' },
    themeKey: 'globalTextColor', defaultDark: 'rgba(235,235,245,0.38)', defaultLight: 'rgba(0,0,0,0.38)',
    recipe: { type: 'alphaOf', alpha: 0.38 },
    previewTargets: ['input-placeholder', 'settings-desc'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-text-3'),
  },
  {
    id: 'textSecondary', officialKey: '--color-text-secondary', group: 'typography', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Secondary Text Variant', zh: '次要文字变体' },
    description: { en: 'Secondary text variant (official 0.7 alpha dark / 0.75 alpha light).', zh: '次要文字变体（官方 dark 0.7 / light 0.75 透明度）。' },
    themeKey: 'globalTextColor', defaultDark: 'rgba(235,235,245,0.7)', defaultLight: 'rgba(0,0,0,0.75)',
    recipe: { type: 'alphaKeyFn', alphas: { dark: 0.7, light: 0.75 } },
    previewTargets: ['topic-meta', 'chat-header'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-text-secondary'),
  },
  {
    id: 'icon', officialKey: '--color-icon', group: 'typography', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Icon Color', zh: '图标颜色' },
    description: { en: 'Default icon color (official #ffffff99 dark / #00000099 light).', zh: '默认图标颜色（官方 dark #ffffff99 / light #00000099）。' },
    themeKey: 'iconColor', defaultDark: '#ffffff99', defaultLight: '#00000099',
    previewTargets: ['sidebar-nav', 'message-actions', 'settings-btn'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-icon'),
  },
  {
    id: 'iconWhite', officialKey: '--color-icon-white', group: 'typography', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Icon on Primary', zh: '主色上的图标' },
    description: { en: 'Icon color on primary surfaces (official #ffffff dark / #000000 light).', zh: '主色表面上的图标颜色（官方 dark #ffffff / light #000000）。' },
    recipe: { type: 'fixed', valueByMode: { dark: '#ffffff', light: '#000000' } },
    defaultDark: '#ffffff', defaultLight: '#000000',
    previewTargets: ['send-btn'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-icon-white'),
  },
  {
    id: 'link', officialKey: '--color-link', group: 'typography', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Hyperlink Color', zh: '超链接颜色' },
    description: { en: 'Hyperlink color (official #338cff dark / #1677ff light).', zh: '超链接颜色（官方 dark #338cff / light #1677ff）。' },
    themeKey: 'linkColor', defaultDark: '#338cff', defaultLight: '#1677ff',
    previewTargets: ['link'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-link'),
  },
  {
    id: 'userFont', officialKey: '--user-font-family', group: 'typography', valueMode: 'shared',
    valueType: 'string', kind: 'official', editorHidden: true,
    label: { en: 'UI Font Family', zh: '界面字体' },
    description: { en: 'Font family injected via --user-font-family (official useUserTheme).', zh: '通过 --user-font-family 注入的界面字体（官方 useUserTheme）。' },
    themeKey: 'userFontFamily', defaultDark: 'Inter, system-ui, -apple-system, sans-serif',
    defaultLight: 'Inter, system-ui, -apple-system, sans-serif',
    previewTargets: ['body-text'],
    officialSource: official('src/renderer/src/hooks/useUserTheme.ts', '--user-font-family'),
  },
  {
    id: 'codeFont', officialKey: '--user-code-font-family', group: 'typography', valueMode: 'shared',
    valueType: 'string', kind: 'official', editorHidden: true,
    label: { en: 'Code Font Family', zh: '代码字体' },
    description: { en: 'Code font family injected via --user-code-font-family (official useUserTheme).', zh: '通过 --user-code-font-family 注入的代码字体（官方 useUserTheme）。' },
    themeKey: 'userCodeFontFamily', defaultDark: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
    defaultLight: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
    previewTargets: ['code-block'],
    officialSource: official('src/renderer/src/hooks/useUserTheme.ts', '--user-code-font-family'),
  },

  /* ═══════════════════════ Input Area ═══════════════════════ */
  {
    id: 'inputBg', officialKey: '--local-input-bg', group: 'inputarea', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Input Bar Background', zh: '输入栏背景' },
    description: { en: 'Background of the chat input bar (extension; applied via structural selectors).', zh: '聊天输入栏背景（扩展；通过结构选择器应用）。' },
    themeKey: 'inputBg', alphaKey: { dark: 'inputOpacity', light: 'inputOpacity' },
    defaultDark: '#3d3d3a', defaultLight: '#ffffff',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['input-bar'],
    officialSource: station('src/App.jsx', '--local-input-bg'),
  },
  {
    id: 'inputBorder', officialKey: '--local-input-border', group: 'inputarea', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Input Bar Border', zh: '输入栏边框' },
    description: { en: 'Border of the chat input bar (extension).', zh: '聊天输入栏边框（扩展）。' },
    themeKey: 'inputBorder', alphaKey: { dark: 'inputBorderOpacity', light: 'inputBorderOpacity' },
    defaultDark: '#5e5d59', defaultLight: '#87867f',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['input-bar'],
    officialSource: station('src/App.jsx', '--local-input-border'),
  },
  {
    id: 'inputPlaceholder', officialKey: '--ts-input-placeholder', group: 'inputarea', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Input Placeholder Text', zh: '输入占位文字' },
    description: { en: 'Placeholder text color of the input bar.', zh: '输入栏占位文字颜色。' },
    themeKey: 'globalTextColor', defaultDark: 'rgba(235,235,245,0.38)', defaultLight: 'rgba(0,0,0,0.38)',
    recipe: { type: 'alphaOf', alpha: 0.38 },
    previewTargets: ['input-placeholder'],
    officialSource: station('src/App.jsx', 'generateCssBlock'),
  },

  /* ═══════════════════════ Buttons and Controls ═══════════════════════ */
  {
    id: 'btnPrimaryBg', officialKey: '--ts-btn-primary-bg', group: 'controls', valueMode: 'shared',
    valueType: 'color', kind: 'extension',
    label: { en: 'Primary Button Background', zh: '主按钮背景' },
    description: { en: 'Primary buttons use --color-primary; this keeps the mapping explicit for previews.', zh: '主按钮使用 --color-primary；此变量仅为预览保持映射显式化。' },
    recipe: { type: 'alias', of: '--color-primary' },
    defaultDark: 'var(--color-primary)', defaultLight: 'var(--color-primary)',
    previewTargets: ['btn-primary', 'send-btn'],
    officialSource: station('src/App.jsx', 'exportedCSS'),
  },
  {
    id: 'btnPrimaryText', officialKey: '--ts-btn-primary-text', group: 'controls', valueMode: 'shared',
    valueType: 'color', kind: 'extension',
    label: { en: 'Primary Button Text', zh: '主按钮文字' },
    description: { en: 'Text on primary buttons (official --color-icon-white).', zh: '主按钮上的文字（官方 --color-icon-white）。' },
    recipe: { type: 'alias', of: '--color-icon-white' },
    defaultDark: 'var(--color-icon-white)', defaultLight: 'var(--color-icon-white)',
    previewTargets: ['btn-primary', 'send-btn'],
    officialSource: station('src/App.jsx', 'exportedCSS'),
  },
  {
    id: 'destructive', officialKey: '--color-destructive', group: 'controls', valueMode: 'shared',
    valueType: 'color', kind: 'official',
    label: { en: 'Destructive Action Color', zh: '危险操作颜色' },
    description: { en: 'Destructive actions (delete etc.) — resolved from the status error color.', zh: '危险操作（删除等）— 由状态错误色解析。' },
    themeKey: 'statusError', defaultDark: '#ff4d50', defaultLight: '#ff4d50',
    previewTargets: ['btn-destructive'],
    officialSource: official('src/renderer/src/assets/styles/tailwind.css', '--color-destructive'),
  },

  /* ═══════════════════════ Borders and Dividers ═══════════════════════ */
  {
    id: 'border', officialKey: '--color-border', group: 'borders', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Border (primary)', zh: '边框（主要）' },
    description: { en: 'Primary border color; derived from the border base color at globalBorderOpacity.', zh: '主要边框色；由边框基色按 globalBorderOpacity 派生。' },
    themeKey: 'globalBorder', alphaKey: { dark: 'globalBorderOpacity', light: 'globalBorderOpacity' },
    defaultDark: '#ffffff', defaultLight: '#000000',
    recipe: { type: 'hexAlphaKey' },
    previewTargets: ['divider', 'input-bar', 'table', 'tool-card', 'dropdown'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-border'),
  },
  {
    id: 'borderSoft', officialKey: '--color-border-soft', group: 'borders', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Border Soft', zh: '弱化边框' },
    description: { en: 'Softer border; derived as border opacity × 0.64 (official #10 ratio).', zh: '更弱化的边框；按边框不透明度 ×0.64（官方 #10 比例）派生。' },
    recipe: { type: 'fn', fn: 'borderSoft' },
    defaultDark: '#ffffff10', defaultLight: '#00000010',
    previewTargets: ['divider', 'code-header'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-border-soft'),
  },
  {
    id: 'borderMute', officialKey: '--color-border-mute', group: 'borders', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Border Mute', zh: '最弱边框' },
    description: { en: 'Almost invisible border; derived as border opacity × 0.2 (official #05 ratio).', zh: '几乎不可见的边框；按边框不透明度 ×0.2（官方 #05 比例）派生。' },
    recipe: { type: 'fn', fn: 'borderMute' },
    defaultDark: '#ffffff05', defaultLight: '#00000005',
    previewTargets: ['divider'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-border-mute'),
  },
  {
    id: 'borderOpacity', officialKey: '--ts-border-opacity', group: 'borders', valueMode: 'shared',
    valueType: 'number', kind: 'extension', exportVar: false,
    label: { en: 'Border Opacity', zh: '边框不透明度' },
    description: { en: 'Alpha of the primary border; border-soft and border-mute derive from it.', zh: '主要边框的透明度；border-soft 与 border-mute 由它派生。' },
    themeKey: 'globalBorderOpacity', defaultDark: 0.098, defaultLight: 0.098,
    previewTargets: ['divider', 'table', 'tool-card'],
    officialSource: station('src/App.jsx', 'generateCssBlock'),
  },

  /* ═══════════════════════ Code and Markdown ═══════════════════════ */
  {
    id: 'codeBg', officialKey: '--color-code-background', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Code Block Background', zh: '代码块背景' },
    description: { en: 'Code block background (official #323232 dark / #e3e3e3 light).', zh: '代码块背景（官方 dark #323232 / light #e3e3e3）。' },
    themeKey: 'codeBg', alphaKey: { dark: 'codeBgOpacityDark', light: 'codeBgOpacityLight' },
    defaultDark: '#323232', defaultLight: '#e3e3e3',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['code-block'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-code-background'),
  },
  {
    id: 'codeText', officialKey: '--color-code-text', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Code Text', zh: '代码文字' },
    description: { en: 'Default code text color (theme-station structural var).', zh: '默认代码文字颜色（扩展结构变量）。' },
    themeKey: 'codeTextColor', defaultDark: '#d4d4d4', defaultLight: '#24292e',
    previewTargets: ['code-block'],
    officialSource: station('src/App.jsx', '--color-code-text'),
  },
  {
    id: 'codeBorder', officialKey: '--theme-code-border', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Code Block Border', zh: '代码块边框' },
    description: { en: 'Border of code blocks (theme-station structural var).', zh: '代码块边框（扩展结构变量）。' },
    themeKey: 'codeBorder', alphaKey: { dark: 'codeBorderOpacityDark', light: 'codeBorderOpacityLight' },
    defaultDark: '#5e5d59', defaultLight: '#d1d5db',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['code-block'],
    officialSource: station('src/App.jsx', '--theme-code-border'),
  },
  {
    id: 'inlineCodeBg', officialKey: '--color-inline-code-background', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Inline Code Background', zh: '行内代码背景' },
    description: { en: 'Inline code tag background (official #323232 dark / rgba(0,0,0,0.06) light).', zh: '行内代码标签背景（官方 dark #323232 / light rgba(0,0,0,0.06)）。' },
    themeKey: 'inlineCodeBg', alphaKey: { dark: 'inlineCodeOpacityDark', light: 'inlineCodeOpacityLight' },
    defaultDark: '#323232', defaultLight: '#000000',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['inline-code'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-inline-code-background'),
  },
  {
    id: 'inlineCodeText', officialKey: '--color-inline-code-text', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Inline Code Text', zh: '行内代码文字' },
    description: { en: 'Inline code text color (official rgb(218,97,92) dark / rgba(235,87,87) light).', zh: '行内代码文字颜色（官方 dark rgb(218,97,92) / light rgba(235,87,87)）。' },
    themeKey: 'inlineCodeColor', defaultDark: '#da615c', defaultLight: '#da615c',
    previewTargets: ['inline-code'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-inline-code-text'),
  },
  {
    id: 'codeHeaderBg', officialKey: '--theme-code-header-bg', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Code Header Background', zh: '代码头部背景' },
    description: { en: 'Code block header strip background (theme-station structural var).', zh: '代码块头部栏背景（扩展结构变量）。' },
    themeKey: 'codeHeaderBg', alphaKey: { dark: 'codeHeaderBgOpacityDark', light: 'codeHeaderBgOpacityLight' },
    defaultDark: '#1f201f', defaultLight: '#d8d8d8',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['code-header'],
    officialSource: station('src/App.jsx', '--theme-code-header-bg'),
  },
  {
    id: 'codeHeaderText', officialKey: '--theme-code-header-text', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Code Header Text', zh: '代码头部文字' },
    description: { en: 'Code block header text color (theme-station structural var).', zh: '代码块头部文字颜色（扩展结构变量）。' },
    themeKey: 'codeHeaderText', defaultDark: '#b8bcc8', defaultLight: '#586069',
    previewTargets: ['code-header', 'code-copy'],
    officialSource: station('src/App.jsx', '--theme-code-header-text'),
  },
  {
    id: 'codeLang', officialKey: '--theme-code-language-text', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Code Language Label', zh: '代码语言标签' },
    description: { en: 'Language label text in the code header (theme-station structural var).', zh: '代码头部语言标签文字（扩展结构变量）。' },
    themeKey: 'codeLanguageText', defaultDark: '#ea928a', defaultLight: '#d73a49',
    previewTargets: ['code-lang'],
    officialSource: station('src/App.jsx', '--theme-code-language-text'),
  },
  {
    id: 'codeLineNumber', officialKey: '--theme-code-line-number', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Code Line Numbers', zh: '代码行号' },
    description: { en: 'Line number color in code blocks (theme-station structural var).', zh: '代码块行号颜色（扩展结构变量）。' },
    themeKey: 'codeLineNumberColor', defaultDark: '#6e7681', defaultLight: '#57606a',
    previewTargets: ['code-lines'],
    officialSource: station('src/App.jsx', '--theme-code-line-number'),
  },
  {
    id: 'codeSelection', officialKey: '--theme-code-selection', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Code Selection Background', zh: '代码选区背景' },
    description: { en: 'Selection background inside code blocks (theme-station structural var).', zh: '代码块内选区背景（扩展结构变量）。' },
    themeKey: 'codeSelectionBg', defaultDark: '#3a3d41', defaultLight: '#c8e1ff',
    previewTargets: ['code-block'],
    officialSource: station('src/App.jsx', '--theme-code-selection'),
  },
  {
    id: 'codeKeyword', officialKey: '--code-keyword-color', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Syntax: Keyword', zh: '语法：关键字' },
    description: { en: 'Syntax token color for keywords.', zh: '关键字的语法高亮颜色。' },
    themeKey: 'codeKeywordColor', defaultDark: '#E89975', defaultLight: '#d73a49',
    previewTargets: ['code-block'],
    officialSource: station('src/App.jsx', '--code-keyword-color'),
  },
  {
    id: 'codeFunction', officialKey: '--code-function-color', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Syntax: Function', zh: '语法：函数' },
    description: { en: 'Syntax token color for functions.', zh: '函数的语法高亮颜色。' },
    themeKey: 'codeFunctionColor', defaultDark: '#B8BCC8', defaultLight: '#6f42c1',
    previewTargets: ['code-block'],
    officialSource: station('src/App.jsx', '--code-function-color'),
  },
  {
    id: 'codeString', officialKey: '--code-string-color', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Syntax: String', zh: '语法：字符串' },
    description: { en: 'Syntax token color for strings.', zh: '字符串的语法高亮颜色。' },
    themeKey: 'codeStringColor', defaultDark: '#F4A68A', defaultLight: '#032f62',
    previewTargets: ['code-block'],
    officialSource: station('src/App.jsx', '--code-string-color'),
  },
  {
    id: 'codeComment', officialKey: '--code-comment-color', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Syntax: Comment', zh: '语法：注释' },
    description: { en: 'Syntax token color for comments.', zh: '注释的语法高亮颜色。' },
    themeKey: 'codeCommentColor', defaultDark: '#6e7681', defaultLight: '#6a737d',
    previewTargets: ['code-block'],
    officialSource: station('src/App.jsx', '--code-comment-color'),
  },
  {
    id: 'codePunctuation', officialKey: '--code-punctuation-color', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Syntax: Punctuation', zh: '语法：标点' },
    description: { en: 'Syntax token color for punctuation/operators.', zh: '标点与运算符的语法高亮颜色。' },
    themeKey: 'codePunctuationColor', defaultDark: '#d4d4d4', defaultLight: '#24292e',
    previewTargets: ['code-block'],
    officialSource: station('src/App.jsx', '--code-punctuation-color'),
  },
  {
    id: 'tableBorder', officialKey: '--local-table-border', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Markdown Table Border', zh: '表格边框' },
    description: { en: 'Border of markdown tables (theme-station structural var).', zh: 'Markdown 表格边框（扩展结构变量）。' },
    themeKey: 'tableBorder', alphaKey: { dark: 'tableBorderOpacityDark', light: 'tableBorderOpacityLight' },
    defaultDark: '#ffffff', defaultLight: '#1b1b1f',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['table', 'table-header'],
    officialSource: station('src/App.jsx', '--local-table-border'),
  },
  {
    id: 'tableHeader', officialKey: '--local-table-header-bg', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Markdown Table Header', zh: '表格表头' },
    description: { en: 'Header background of markdown tables (theme-station structural var).', zh: 'Markdown 表格表头背景（扩展结构变量）。' },
    themeKey: 'tableHeaderBg', alphaKey: { dark: 'tableHeaderBgOpacityDark', light: 'tableHeaderBgOpacityLight' },
    defaultDark: '#E89975', defaultLight: '#E89975',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['table-header'],
    officialSource: station('src/App.jsx', '--local-table-header-bg'),
  },
  {
    id: 'tableHover', officialKey: '--local-table-hover-bg', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Markdown Table Row Hover', zh: '表格行悬停' },
    description: { en: 'Row hover background of markdown tables (theme-station structural var).', zh: 'Markdown 表格行悬停背景（扩展结构变量）。' },
    themeKey: 'tableHoverBg', alphaKey: { dark: 'tableHoverBgOpacity', light: 'tableHoverBgOpacity' },
    defaultDark: '#E89975', defaultLight: '#E89975',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['table-row'],
    officialSource: station('src/App.jsx', '--local-table-hover-bg'),
  },
  {
    id: 'tableRadius', officialKey: '--table-border-radius', group: 'codemarkdown', valueMode: 'shared',
    valueType: 'number', kind: 'official', unit: 'px',
    label: { en: 'Table Border Radius', zh: '表格圆角' },
    description: { en: 'Markdown table border radius (official 8px, markdown.css).', zh: 'Markdown 表格圆角（官方 8px，markdown.css）。' },
    themeKey: 'tableBorderRadius', defaultDark: 8, defaultLight: 8,
    previewTargets: ['table'],
    officialSource: official('src/renderer/src/assets/styles/markdown.css', '--table-border-radius'),
  },
  {
    id: 'reference', officialKey: '--color-reference', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Reference Border', zh: '引用边框' },
    description: { en: 'Reference/citation block border (official #404040 dark / #cfe1ff light).', zh: '引用块边框（官方 dark #404040 / light #cfe1ff）。' },
    themeKey: 'referenceColor', defaultDark: '#404040', defaultLight: '#cfe1ff',
    previewTargets: ['blockquote'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-reference'),
  },
  {
    id: 'referenceText', officialKey: '--color-reference-text', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Reference Text', zh: '引用文字' },
    description: { en: 'Reference/citation text (official #ffffff dark / #000000 light).', zh: '引用文字（官方 dark #ffffff / light #000000）。' },
    themeKey: 'referenceText', defaultDark: '#ffffff', defaultLight: '#000000',
    previewTargets: ['blockquote'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-reference-text'),
  },
  {
    id: 'referenceBg', officialKey: '--color-reference-background', group: 'codemarkdown', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Reference Background', zh: '引用背景' },
    description: { en: 'Reference/citation background (official #0b0e12 dark / #f1f7ff light).', zh: '引用背景（官方 dark #0b0e12 / light #f1f7ff）。' },
    themeKey: 'referenceBg', defaultDark: '#0b0e12', defaultLight: '#f1f7ff',
    previewTargets: ['blockquote'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-reference-background'),
  },

  /* ═══════════════════════ Menus and Overlays ═══════════════════════ */
  {
    id: 'innerGlow', officialKey: '--inner-glow-opacity', group: 'overlays', valueMode: 'per-mode',
    valueType: 'number', kind: 'official',
    label: { en: 'Inner Glow Opacity', zh: '内发光不透明度' },
    description: { en: 'Glassmorphism inner glow strength inside dropdowns (official 0.3 dark / 0.1 light).', zh: '下拉层内毛玻璃内发光强度（官方 dark 0.3 / light 0.1）。' },
    themeKey: 'innerGlowOpacity', defaultDark: 0.3, defaultLight: 0.1,
    previewTargets: ['dropdown', 'modal'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--inner-glow-opacity'),
  },
  {
    id: 'blurAmount', officialKey: '--ts-blur-amount', group: 'overlays', valueMode: 'shared',
    valueType: 'number', kind: 'extension', exportVar: false,
    label: { en: 'Glass Blur Amount', zh: '毛玻璃模糊量' },
    description: { en: 'backdrop-filter blur radius applied to sidebar, overlays and the input bar (extension).', zh: '应用于侧栏、浮层与输入栏的 backdrop-filter 模糊半径（扩展）。' },
    themeKey: 'blurAmount', defaultDark: 15, defaultLight: 15,
    previewTargets: ['dropdown', 'sidebar-nav', 'input-bar'],
    officialSource: station('src/App.jsx', 'exportedCSS'),
  },

  /* ═══════════════════════ Status Colors ═══════════════════════ */
  {
    id: 'error', officialKey: '--color-error', group: 'status', valueMode: 'shared',
    valueType: 'color', kind: 'official',
    label: { en: 'Error Color', zh: '错误颜色' },
    description: { en: 'Error color (official #ff4d50).', zh: '错误颜色（官方 #ff4d50）。' },
    themeKey: 'errorColor', defaultDark: '#ff4d50', defaultLight: '#ff4d50',
    previewTargets: ['badge-error', 'settings-error', 'btn-destructive'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-error'),
  },
  {
    id: 'statusSuccess', officialKey: '--color-status-success', group: 'status', valueMode: 'shared',
    valueType: 'color', kind: 'official',
    label: { en: 'Status: Success', zh: '状态：成功' },
    description: { en: 'Success status color (official green).', zh: '成功状态颜色（官方 green）。' },
    themeKey: 'statusSuccess', defaultDark: '#00b96b', defaultLight: '#00b96b',
    previewTargets: ['badge-success', 'tool-status'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-status-success'),
  },
  {
    id: 'statusWarning', officialKey: '--color-status-warning', group: 'status', valueMode: 'shared',
    valueType: 'color', kind: 'official',
    label: { en: 'Status: Warning', zh: '状态：警告' },
    description: { en: 'Warning status color (official #faad14).', zh: '警告状态颜色（官方 #faad14）。' },
    themeKey: 'statusWarning', defaultDark: '#faad14', defaultLight: '#faad14',
    previewTargets: ['badge-warning', 'settings-warning'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-status-warning'),
  },
  {
    id: 'statusError', officialKey: '--color-status-error', group: 'status', valueMode: 'shared',
    valueType: 'color', kind: 'official',
    label: { en: 'Status: Error', zh: '状态：错误' },
    description: { en: 'Error status color (official alias of --color-error).', zh: '错误状态颜色（官方为 --color-error 的别名）。' },
    recipe: { type: 'alias', of: '--color-error' },
    defaultDark: 'var(--color-error)', defaultLight: 'var(--color-error)',
    previewTargets: ['badge-error'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-status-error'),
  },
  {
    id: 'highlight', officialKey: '--color-background-highlight', group: 'status', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Search Highlight', zh: '搜索高亮' },
    description: { en: 'Search-match highlight (official dark rgba(255,255,0,0.9) / light 0.5).', zh: '搜索匹配高亮（官方 dark rgba(255,255,0,0.9) / light 0.5）。' },
    themeKey: 'highlightBg', defaultDark: 'rgba(255,255,0,0.9)', defaultLight: 'rgba(255,255,0,0.5)',
    previewTargets: ['body-text'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-background-highlight'),
  },
  {
    id: 'highlightAccent', officialKey: '--color-background-highlight-accent', group: 'status', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Search Highlight Accent', zh: '搜索高亮强调' },
    description: { en: 'Accent search highlight (official dark rgba(255,150,50,0.9) / light 0.5).', zh: '强调搜索高亮（官方 dark rgba(255,150,50,0.9) / light 0.5）。' },
    themeKey: 'highlightAccent', defaultDark: 'rgba(255,150,50,0.9)', defaultLight: 'rgba(255,150,50,0.5)',
    previewTargets: ['body-text'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--color-background-highlight-accent'),
  },

  /* ═══════════════════════ Settings Interface ═══════════════════════ */
  {
    id: 'settingsGroupBg', officialKey: '--ts-settings-group-bg', group: 'settingsui', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Settings Group Surface', zh: '设置分组表面' },
    description: { en: 'Settings group card surface (extension; resolved from the workspace surface).', zh: '设置分组卡片表面（扩展；由工作区表面解析）。' },
    themeKey: 'workspaceBg', alphaKey: { dark: 'workspaceOpacity', light: 'workspaceOpacity' },
    defaultDark: '#2d2e2d', defaultLight: '#faf8f6',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['settings-group'],
    officialSource: station('src/App.jsx', 'exportedCSS'),
  },

  /* ═══════════════════════ Scrollbars ═══════════════════════ */
  {
    id: 'scrollbarThumb', officialKey: '--color-scrollbar-thumb', group: 'scrollbar', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Scrollbar Thumb', zh: '滚动条滑块' },
    description: { en: 'Scrollbar thumb (official dark rgba(255,255,255,0.15) / light rgba(0,0,0,0.15)).', zh: '滚动条滑块（官方 dark rgba(255,255,255,0.15) / light rgba(0,0,0,0.15)）。' },
    themeKey: 'scrollbarThumb', alphaKey: { dark: 'scrollbarThumbOpacityDark', light: 'scrollbarThumbOpacityLight' },
    defaultDark: '#ffffff', defaultLight: '#000000',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['scrollbar'],
    officialSource: official('src/renderer/src/assets/styles/scrollbar.css', '--color-scrollbar-thumb'),
  },
  {
    id: 'scrollbarThumbHover', officialKey: '--color-scrollbar-thumb-hover', group: 'scrollbar', valueMode: 'per-mode',
    valueType: 'color', kind: 'official',
    label: { en: 'Scrollbar Thumb Hover', zh: '滚动条滑块悬停' },
    description: { en: 'Scrollbar thumb hover (official dark rgba(255,255,255,0.2) / light rgba(0,0,0,0.2)).', zh: '滚动条滑块悬停（官方 dark rgba(255,255,255,0.2) / light rgba(0,0,0,0.2)）。' },
    themeKey: 'scrollbarHover', alphaKey: { dark: 'scrollbarHoverOpacityDark', light: 'scrollbarHoverOpacityLight' },
    defaultDark: '#ffffff', defaultLight: '#000000',
    recipe: { type: 'rgbaKey' },
    previewTargets: ['scrollbar'],
    officialSource: official('src/renderer/src/assets/styles/scrollbar.css', '--color-scrollbar-thumb-hover'),
  },
  {
    id: 'scrollbarWidth', officialKey: '--scrollbar-width', group: 'scrollbar', valueMode: 'shared',
    valueType: 'number', kind: 'official', unit: 'px',
    label: { en: 'Scrollbar Width', zh: '滚动条宽度' },
    description: { en: 'Scrollbar width (official 6px).', zh: '滚动条宽度（官方 6px）。' },
    themeKey: 'scrollbarWidth', defaultDark: 6, defaultLight: 6,
    previewTargets: ['scrollbar'],
    officialSource: official('src/renderer/src/assets/styles/scrollbar.css', '--scrollbar-width'),
  },
  {
    id: 'scrollbarRadius', officialKey: '--scrollbar-thumb-radius', group: 'scrollbar', valueMode: 'shared',
    valueType: 'number', kind: 'official', unit: 'px',
    label: { en: 'Scrollbar Thumb Radius', zh: '滚动条滑块圆角' },
    description: { en: 'Scrollbar thumb radius (official 10px).', zh: '滚动条滑块圆角（官方 10px）。' },
    themeKey: 'scrollbarThumbRadius', defaultDark: 10, defaultLight: 10,
    previewTargets: ['scrollbar'],
    officialSource: official('src/renderer/src/assets/styles/scrollbar.css', '--scrollbar-thumb-radius'),
  },
  {
    id: 'selectionHighlight', officialKey: '--ts-selection-bg', group: 'advanced', valueMode: 'per-mode',
    valueType: 'color', kind: 'extension',
    label: { en: 'Text Selection', zh: '选中文字' },
    description: { en: 'Background of selected text (::selection).', zh: '选中文字的背景高亮（::selection）。' },
    themeKey: 'selectionBg', defaultDark: 'rgba(59,130,246,0.32)', defaultLight: 'rgba(59,130,246,0.22)',
    previewTargets: ['body-text'],
    officialSource: station('src/theme/tokenRegistry.js', '--ts-selection-bg'),
  },

  /* ═══════════════════════ Advanced ═══════════════════════ */
  {
    id: 'listItemRadius', officialKey: '--list-item-border-radius', group: 'advanced', valueMode: 'shared',
    valueType: 'number', kind: 'official', unit: 'px',
    label: { en: 'List Item Border Radius', zh: '列表项圆角' },
    description: { en: 'List/topic item radius (official 10px; 20px when navbar-position=left).', zh: '列表/话题项圆角（官方 10px；navbar-position=left 时为 20px）。' },
    themeKey: 'listItemBorderRadius', defaultDark: 10, defaultLight: 10,
    previewTargets: ['topic-item', 'settings-sidebar'],
    officialSource: official('src/renderer/src/assets/styles/color.css', '--list-item-border-radius'),
  },
  {
    id: 'scrollbarHeight', officialKey: '--scrollbar-height', group: 'advanced', valueMode: 'shared',
    valueType: 'number', kind: 'official', unit: 'px',
    label: { en: 'Scrollbar Height', zh: '滚动条高度' },
    description: { en: 'Horizontal scrollbar height (official 6px).', zh: '横向滚动条高度（官方 6px）。' },
    themeKey: 'scrollbarHeight', defaultDark: 6, defaultLight: 6,
    previewTargets: ['scrollbar'],
    officialSource: official('src/renderer/src/assets/styles/scrollbar.css', '--scrollbar-height'),
  },
  {
    id: 'enableBouncyHover', officialKey: '--ts-effect-bouncy', group: 'advanced', valueMode: 'shared',
    valueType: 'boolean', kind: 'extension', exportVar: false,
    label: { en: 'Bouncy Bubble Hover', zh: 'Q 弹气泡悬停' },
    description: { en: 'Bouncy transform on message hover (extension effect).', zh: '消息悬停 Q 弹形变（扩展特效）。' },
    themeKey: 'enableBouncyHover', defaultDark: true, defaultLight: true,
    previewTargets: ['user-msg', 'assistant-msg'],
    officialSource: station('src/App.jsx', 'exportedCSS'),
  },
  {
    id: 'enableHoloGlass', officialKey: '--ts-effect-holo', group: 'advanced', valueMode: 'shared',
    valueType: 'boolean', kind: 'extension', exportVar: false,
    label: { en: 'HoloGlass Animated Border', zh: 'HoloGlass 流光边框' },
    description: { en: 'Animated gradient border on the input bar (extension effect).', zh: '输入栏流光渐变边框（扩展特效）。' },
    themeKey: 'enableHoloGlass', defaultDark: false, defaultLight: false,
    previewTargets: ['input-bar'],
    officialSource: station('src/App.jsx', 'exportedCSS'),
  },
  {
    id: 'enableLuminaMotion', officialKey: '--ts-effect-lumina', group: 'advanced', valueMode: 'shared',
    valueType: 'boolean', kind: 'extension', exportVar: false,
    label: { en: 'Lumina Message Motion', zh: 'Lumina 消息动画' },
    description: { en: 'Message entrance animation (extension effect).', zh: '消息入场动画（扩展特效）。' },
    themeKey: 'enableLuminaMotion', defaultDark: false, defaultLight: false,
    previewTargets: ['assistant-msg'],
    officialSource: station('src/App.jsx', 'exportedCSS'),
  },
  {
    id: 'bgImage', officialKey: '--ts-bg-image', group: 'advanced', valueMode: 'shared',
    valueType: 'string', kind: 'extension', exportVar: false,
    label: { en: 'Global Background Image URL', zh: '全局背景图 URL' },
    description: { en: 'Optional background image painted behind the whole app (extension).', zh: '可选的全局背景图（扩展）。' },
    themeKey: 'bgImage', defaultDark: '', defaultLight: '',
    previewTargets: ['window'],
    officialSource: station('src/App.jsx', 'bgImage'),
  },
];

/* Map by id */
export const TOKEN_MAP = Object.fromEntries(TOKEN_REGISTRY.map((t) => [t.id, t]));

/* Official variables from v1.9.12 that are fixed / not editable (exported as-is). */
export const OFFICIAL_FIXED = [
  { officialKey: '--chat-background', note: 'fixed transparent (official)' },
  { officialKey: '--chat-background-assistant', note: 'fixed transparent (official)' },
  { officialKey: '--color-icon-white', note: 'mode-fixed white/black (official)' },
  { officialKey: '--color-highlight', note: 'dark: rgba(0,0,0,1), light: initial (official)' },
  { officialKey: '--color-gray-1', note: 'Ant derived gray scale' },
  { officialKey: '--color-gray-2', note: 'Ant derived gray scale' },
  { officialKey: '--color-gray-3', note: 'Ant derived gray scale' },
];

/* Layout constants from official responsive.css — not part of the theming surface. */
export const LAYOUT_CONSTANTS = [
  { officialKey: '--navbar-height', value: '44px', note: 'layout constant (official responsive.css)' },
  { officialKey: '--sidebar-width', value: '50px', note: 'layout constant (official responsive.css)' },
  { officialKey: '--status-bar-height', value: '40px', note: 'layout constant (official responsive.css)' },
  { officialKey: '--input-bar-height', value: '100px', note: 'layout constant (official responsive.css)' },
  { officialKey: '--topic-list-width', value: '275px', note: 'layout constant (official responsive.css)' },
  { officialKey: '--settings-width', value: '250px', note: 'layout constant (official responsive.css)' },
  { officialKey: '--assistants-width', value: '275px', note: 'layout constant (official responsive.css)' },
];

/**
 * Coverage matrix: every official v1.9.12 variable → status.
 * Status: COMPLETE | MISSING | NOT_APPLICABLE | METHOD_DEPENDENT
 */
export const buildCoverageMatrix = () => {
  const rows = [];
  const seen = new Set();

  for (const token of TOKEN_REGISTRY) {
    if (token.kind !== 'official') continue;
    if (seen.has(token.officialKey)) continue;
    seen.add(token.officialKey);
    const status = token.recipe && token.recipe.type === 'fixed' ? 'NOT_APPLICABLE' : 'COMPLETE';
    rows.push({
      officialKey: token.officialKey,
      tokenId: token.id,
      editorControl: token.valueType,
      previewTargets: token.previewTargets.join(', '),
      exportField: token.officialKey,
      defaultDark: formatDefault(token.defaultDark),
      defaultLight: formatDefault(token.defaultLight),
      status,
      source: token.officialSource.symbol,
    });
  }

  for (const f of OFFICIAL_FIXED) {
    if (seen.has(f.officialKey)) continue;
    seen.add(f.officialKey);
    rows.push({
      officialKey: f.officialKey, tokenId: '', editorControl: 'fixed',
      previewTargets: '', exportField: f.officialKey,
      defaultDark: '—', defaultLight: '—', status: 'NOT_APPLICABLE', source: f.note,
    });
  }

  // Scrollbar raw variants are emitted per mode from the same theme params
  const scrollbarRaw = [
    { key: '--color-scrollbar-thumb-dark', dark: 'var(--color-scrollbar-thumb)', light: '—' },
    { key: '--color-scrollbar-thumb-dark-hover', dark: 'var(--color-scrollbar-thumb-hover)', light: '—' },
    { key: '--color-scrollbar-thumb-light', dark: '—', light: 'var(--color-scrollbar-thumb)' },
    { key: '--color-scrollbar-thumb-light-hover', dark: '—', light: 'var(--color-scrollbar-thumb-hover)' },
  ];
  for (const r of scrollbarRaw) {
    if (seen.has(r.key)) continue;
    seen.add(r.key);
    rows.push({
      officialKey: r.key, tokenId: 'scrollbarThumb', editorControl: 'derived',
      previewTargets: 'scrollbar', exportField: r.key,
      defaultDark: r.dark, defaultLight: r.light, status: 'COMPLETE',
      source: 'src/renderer/src/assets/styles/scrollbar.css',
    });
  }

  for (const c of LAYOUT_CONSTANTS) {
    if (seen.has(c.officialKey)) continue;
    seen.add(c.officialKey);
    rows.push({
      officialKey: c.officialKey, tokenId: '', editorControl: 'none',
      previewTargets: '', exportField: c.officialKey,
      defaultDark: c.value, defaultLight: c.value, status: 'NOT_APPLICABLE', source: c.note,
    });
  }

  return rows;
};

const formatDefault = (v) => (Array.isArray(v) ? v.join(', ') : v === undefined ? '—' : String(v));

export const coverageStats = () => {
  const rows = buildCoverageMatrix();
  const statusCounts = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  return {
    total: rows.length,
    complete: statusCounts.COMPLETE || 0,
    notApplicable: statusCounts.NOT_APPLICABLE || 0,
    missing: statusCounts.MISSING || 0,
    methodDependent: statusCounts.METHOD_DEPENDENT || 0,
  };
};

export const getTokensByGroup = (groupId) => TOKEN_REGISTRY.filter((t) => t.group === groupId);

export const searchTokens = (query, lang = 'en') => {
  const q = query.trim().toLowerCase();
  const base = TOKEN_REGISTRY.filter((t) => !t.editorHidden);
  if (!q) return base;
  return base.filter((t) => {
    const label = t.label[lang] || t.label.en;
    const desc = t.description[lang] || t.description.en;
    return (
      label.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q) ||
      t.officialKey.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  });
};

/**
 * Editor layers — the IA v2 4-tab mental model (Palette → Panels →
 * List & Chat → Extra). Each tab folds its granular groups (collapsed by
 * default) so the editor stays calm instead of showing all 17 groups at once.
 */
export const LAYERS = [
  { id: 'palette', label: { en: 'Palette', zh: '配色' }, groups: ['foundations', 'status'] },
  { id: 'panels', label: { en: 'Panels', zh: '面板' }, groups: ['window', 'sidebar', 'chatbg', 'inputarea', 'overlays'] },
  { id: 'list-chat', label: { en: 'List & Chat', zh: '列表与会话' }, groups: ['conversation', 'usermsg', 'assistantmsg', 'typography', 'codemarkdown'] },
  { id: 'extra', label: { en: 'Extra', zh: '细节' }, groups: ['controls', 'borders', 'settingsui', 'scrollbar', 'advanced'] },
];
