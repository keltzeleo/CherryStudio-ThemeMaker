import { isDark, textTiers, thinkingOf, linkHoverOf, harmonySurface } from '../utils/colors.js'
import { DEFAULT_GLOW } from './presets.js'

// Every CSS var the preview renders, snapshot/undo/redo tracks, and the
// exporter writes. buildVars() must emit EXACTLY this set — nothing more,
// nothing less — so "所见 == 所得" holds. The export-consistency test
// enforces this.
export const VAR_KEYS = [
  '--color-background', '--color-background-soft', '--color-background-mute',
  '--color-text', '--color-text-2', '--color-text-3',
  '--color-primary', '--color-primary-soft', '--color-primary-mute',
  '--color-link', '--color-link-hover',
  '--chat-background-ai', '--chat-background-user', '--chat-text-user',
  '--color-code-background',
  '--sidebar', '--sidebar-glow-1', '--sidebar-glow-2', '--sidebar-glow-3', '--sidebar-glow-4', '--sidebar-glow-5',
  '--table-header', '--table-header-text', '--table-border', '--table-radius', '--table-border-width', '--table-row-bg',
  '--scroll-width', '--scroll-thumb',
  '--kw-comment', '--kw-keyword', '--kw-string', '--kw-literal', '--kw-name', '--kw-punct',
  '--local-thinking-bg', '--local-thinking-border', '--local-thinking-text',
  '--local-input-bg', '--local-input-border',
  '--color-reference', '--color-reference-text', '--color-reference-background',
  '--color-hover', '--color-active', '--color-border', '--color-border-soft',
  '--color-inline-code-bg', '--color-inline-code-text',
]

// Plan selection: a preset stores `dark` and `light` plans; fall back to the
// preset object itself for single-mode legacy shapes.
export function presetPlan(p, modeKey) {
  const plan = (modeKey === 'light' && p.light) ? p.light : (p.dark || p)
  return p.scheme ? { ...plan, scheme: p.scheme } : plan
}

export function varsToPlan(o) {
  return {
    bg: o['--color-background'], soft: o['--color-background-soft'], mute: o['--color-background-mute'],
    accent: o['--color-primary'], link: o['--color-link'],
    ai: o['--chat-background-ai'], user: o['--chat-background-user'], userText: o['--chat-text-user'],
    text: o['--color-text'], text2: o['--color-text-2'], text3: o['--color-text-3'],
    hover: o['--color-hover'], active: o['--color-active'], border: o['--color-border'], borderSoft: o['--color-border-soft'],
    thinking: o['--local-thinking-bg'], thinkingBorder: o['--local-thinking-border'], thinkingText: o['--local-thinking-text'],
    inputBg: o['--local-input-bg'], inputBorder: o['--local-input-border'],
    reference: o['--color-reference'], referenceText: o['--color-reference-text'], referenceBg: o['--color-reference-background'],
    kwComment: o['--kw-comment'], kwKeyword: o['--kw-keyword'], kwString: o['--kw-string'],
    kwLiteral: o['--kw-literal'], kwName: o['--kw-name'], kwPunct: o['--kw-punct'],
    codeBg: o['--color-code-background'], sidebar: o['--sidebar'],
    inlineCodeBg: o['--color-inline-code-bg'], inlineCodeText: o['--color-inline-code-text'],
    tableHeader: o['--table-header'], tableHeaderText: o['--table-header-text'], tableBorder: o['--table-border'],
    tableRadius: o['--table-radius'], tableBorderWidth: o['--table-border-width'], tableRowBg: o['--table-row-bg'],
    scrollThumb: o['--scroll-thumb'], scrollWidth: o['--scroll-width'], linkHover: o['--color-link-hover'],
  }
}

export function buildVars(plan, glow) {
  const s = plan || {}
  const dk = isDark(s.bg)
  const tt = textTiers(s.bg)
  const g = glow || DEFAULT_GLOW
  const harm = harmonySurface(s.accent, dk ? 'dark' : 'light', s.scheme)
  const text3 = s.text3 || tt.t3
  return {
    '--color-background': s.bg,
    '--color-background-soft': s.soft,
    '--color-background-mute': s.mute,
    '--color-text': s.text || tt.t1,
    '--color-text-2': s.text2 || tt.t2,
    '--color-text-3': text3,
    '--color-primary': s.accent,
    '--color-primary-soft': rgbaWithAlpha(s.accent, 0.6),
    '--color-primary-mute': rgbaWithAlpha(s.accent, 0.3),
    '--color-link': s.link,
    '--chat-background-ai': s.ai || (dk ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.03)'),
    '--chat-background-user': s.user || rgbaWithAlpha(s.accent, dk ? 0.08 : 0.045),
    '--chat-text-user': s.userText,
    '--color-code-background': s.codeBg || s.mute,
    '--color-inline-code-bg': s.inlineCodeBg || s.mute,
    '--color-inline-code-text': s.inlineCodeText || s.kwKeyword || (dk ? '#ff7b72' : '#d73a49'),
    '--sidebar': s.sidebar || s.soft,
    '--table-header': s.tableHeader || harm.table,
    '--table-row-bg': s.tableRowBg || (dk ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.02)'),
    '--local-thinking-bg': s.thinking || thinkingOf(s.accent, dk).bg,
    '--local-thinking-border': s.thinkingBorder || thinkingOf(s.accent, dk).border,
    '--local-thinking-text': s.thinkingText || thinkingOf(s.accent, dk).text,
    '--local-input-bg': s.inputBg || s.soft,
    '--local-input-border': s.inputBorder || s.border || (dk ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'),
    '--color-reference': s.reference || harm.quoteLine,
    '--color-reference-text': s.referenceText || harm.quoteText,
    '--color-reference-background': s.referenceBg || harm.quoteBg,
    '--kw-comment': s.kwComment || (dk ? '#7d8a8f' : '#6a737d'),
    '--kw-keyword': s.kwKeyword || (dk ? '#ff7b72' : '#d73a49'),
    '--kw-string': s.kwString || (dk ? '#a5d6ff' : '#0a3069'),
    '--kw-literal': s.kwLiteral || (dk ? '#d7ba7d' : '#9a6700'),
    '--kw-name': s.kwName || harm.codeParam,
    '--kw-punct': s.kwPunct || text3,
    '--color-hover': s.hover || (dk ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)'),
    '--color-active': s.active || rgbaWithAlpha(s.accent, dk ? 0.12 : 0.08),
    '--color-border': s.border || (dk ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'),
    '--color-border-soft': s.borderSoft || (dk ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)'),
    '--color-link-hover': s.linkHover || linkHoverOf(s.link, dk),
    '--table-border': s.tableBorder || s.border || (dk ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'),
    '--table-radius': s.tableRadius || '10px',
    '--table-border-width': s.tableBorderWidth || '1px',
    '--table-header-text': s.tableHeaderText || harm.tableText,
    '--scroll-thumb': s.scrollThumb || s.border || (dk ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'),
    '--scroll-width': s.scrollWidth || '10px',
    '--sidebar-glow-1': g[0],
    '--sidebar-glow-2': g[1],
    '--sidebar-glow-3': g[2],
    '--sidebar-glow-4': g[3],
    '--sidebar-glow-5': g[4],
  }
}

export function varsToCss(vars) {
  return Object.entries(vars)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `  ${k}:${v};`)
    .join('\n')
}

// ─────────────────────────────────────────────────────────────────────────
// Cherry Studio 真实运行时变量导出（Layer 1 官方变量 + Layer 2 结构扩展）
// ─────────────────────────────────────────────────────────────────────────
// 预览内部用一套变量名（--sidebar / --kw-* / --table-* / --scroll-* /
// --chat-background-ai …），但 Cherry Studio 运行时读的是官方 v1.9.12 变量
// 全集 + Theme Station 结构扩展（tokenRegistry.js）。导出走与「v72 3」权威
// 实现同一套 registry/resolver/exportCss，值来自 buildVars() 输出，保证
// 「所见 == 所得」，且输出的是 Cherry Studio 真实读取的分层 CSS。
import { buildExportCss } from './exportCss.js'
import { buildV2Css, CHERRY_V1_TARGET, CHERRY_V2_TARGET } from './exportV2.js'
import { baseDefaultTheme } from './defaultTheme.js'
import { parseColor, rgbaWithAlpha } from '../utils/colorUtils.js'

// 把一个 rgba/hex 颜色拆成 { hex, alpha }，用于把预览的最终 rgba 值还原为
// registry 的「纯色 + 透明度」两步表示，保证 resolver 重算后与预览逐字节一致。
function splitAlpha(color) {
  const { r, g, b, a } = parseColor(color)
  const hex = `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
  return { hex, alpha: a }
}

// 从 buildVars 的预览变量表抽取导出所需的字段（与预览同源）。
export function fieldsOf(v) {
  const glowBase = [
    v['--sidebar-glow-1'], v['--sidebar-glow-2'], v['--sidebar-glow-3'],
    v['--sidebar-glow-4'], v['--sidebar-glow-5'],
  ].filter(Boolean)
  const glow = glowBase.length ? Array.from({ length: 6 }, (_, i) => glowBase[i % glowBase.length]) : []
  return {
    bg: v['--color-background'], soft: v['--color-background-soft'], mute: v['--color-background-mute'],
    text: v['--color-text'], text2: v['--color-text-2'], text3: v['--color-text-3'],
    primary: v['--color-primary'], link: v['--color-link'],
    border: v['--color-border'], borderSoft: v['--color-border-soft'],
    hover: v['--color-hover'], active: v['--color-active'],
    sidebar: v['--sidebar'],
    userBg: v['--chat-background-user'], userText: v['--chat-text-user'],
    aiBg: v['--chat-background-ai'],
    codeBg: v['--color-code-background'], tableHeader: v['--table-header'],
    inlineCodeBg: v['--color-inline-code-bg'], inlineCodeText: v['--color-inline-code-text'],
    thinkBg: v['--local-thinking-bg'], thinkBorder: v['--local-thinking-border'], thinkText: v['--local-thinking-text'],
    inputBg: v['--local-input-bg'], inputBorder: v['--local-input-border'],
    ref: v['--color-reference'], refText: v['--color-reference-text'], refBg: v['--color-reference-background'],
    kwComment: v['--kw-comment'], kwKeyword: v['--kw-keyword'], kwString: v['--kw-string'],
    kwLiteral: v['--kw-literal'], kwName: v['--kw-name'], kwPunct: v['--kw-punct'],
    glow,
    linkHover: v['--color-link-hover'],
    tableBorder: v['--table-border'], tableRadius: v['--table-radius'],
    tableBorderWidth: v['--table-border-width'], tableHeaderText: v['--table-header-text'],
    tableRow: v['--table-row-bg'], tableRowHover: v['--table-row-hover'],
    scrollThumb: v['--scroll-thumb'], scrollWidth: v['--scroll-width'],
  }
}

// 预览变量 → registry 主题状态（与「v72 3」bridge.js 相同的映射）。
function themeFromFields(dk, lt) {
  const base = { ...baseDefaultTheme }
  const primary = dk.primary || base.primaryColor
  const userD = splitAlpha(dk.userBg || 'rgba(255,255,255,0.08)')
  const userL = splitAlpha(lt.userBg || 'rgba(0,0,0,0.045)')
  const aiD = splitAlpha(dk.aiBg || dk.soft)
  const aiL = splitAlpha(lt.aiBg || lt.soft)

  // 结构性颜色必须在导出中逐字节复现预览。registry 用「基准 hex + 独立 alpha」
  // （rgbaKey/hexAlphaKey recipe）建模这些 token，因此这里把预览色拆成 (hex, alpha)
  // 同时写入，否则 resolver 会重新套用默认 alpha，导致导出与预览不一致。
  const tableBorderD = splitAlpha(dk.tableBorder || dk.border)
  const tableBorderL = splitAlpha(lt.tableBorder || lt.border)
  const tableHeaderD = splitAlpha(dk.tableHeader || dk.mute)
  const tableHeaderL = splitAlpha(lt.tableHeader || lt.mute)
  const tableHoverD = splitAlpha(dk.tableRowHover || dk.soft)
  const tableHoverL = splitAlpha(lt.tableRowHover || lt.soft)
  const scrollThumbD = splitAlpha(dk.scrollThumb || dk.border)
  const scrollThumbL = splitAlpha(lt.scrollThumb || lt.border)
  const thinkD = splitAlpha(dk.thinkBg)
  const thinkL = splitAlpha(lt.thinkBg)
  const thinkBorderD = splitAlpha(dk.thinkBorder)
  const thinkBorderL = splitAlpha(lt.thinkBorder)
  // 输入栏：预览 .inputbar-inner 用 --color-background-soft 底 + --color-border 边。
  // 这里同样拆成 (hex, alpha)，否则 resolver 会用默认 opacity 重算，导致导出与
  // 预览（soft 底 / border 边）不一致。
  const inputBgD = splitAlpha(dk.inputBg || dk.soft || dk.mute)
  const inputBgL = splitAlpha(lt.inputBg || lt.soft || lt.mute)
  const inputBorderD = splitAlpha(dk.inputBorder || dk.border)
  const inputBorderL = splitAlpha(lt.inputBorder || lt.border)
  const globalBorderD = splitAlpha(dk.border)
  const globalBorderL = splitAlpha(lt.border)

  return {
    ...base,
    primaryColor: primary,

    globalBgDark: dk.bg,            globalBgLight: lt.bg,
    workspaceBgDark: dk.bg,         workspaceBgLight: lt.bg,

    globalTextColorDark: dk.text,   globalTextColorLight: lt.text,

    // 预览 --color-border 是完整颜色（含 alpha），registry 用「基准 hex + 独立
    // alpha」建模 --color-border，因此这里拆成 (hex, alpha) 逐字节复现，否则
    // resolver 会套用默认 0.098，丢失预览的边框透明度。
    globalBorderDark: globalBorderD.hex, globalBorderLight: globalBorderL.hex,
    globalBorderOpacityDark: globalBorderD.alpha, globalBorderOpacityLight: globalBorderL.alpha,
    globalBorderOpacity: Math.max(globalBorderD.alpha, globalBorderL.alpha),

    hoverColorDark: dk.hover,       hoverColorLight: lt.hover,
    activeColorDark: dk.active,     activeColorLight: lt.active,
    blackMuteDark: dk.mute,         blackMuteLight: lt.mute,

    sidebarBgDark: dk.soft,         sidebarBgLight: lt.soft,
    navbarBgDark: dk.sidebar,       navbarBgLight: lt.sidebar,

    aiBubbleBgDark: aiD.hex,        aiBubbleOpacityDark: aiD.alpha,
    aiBubbleBgLight: aiL.hex,       aiBubbleOpacityLight: aiL.alpha,
    aiTextColorDark: dk.text,       aiTextColorLight: lt.text,

    userBubbleBgDark: userD.hex,    userBubbleOpacityDark: userD.alpha,
    userBubbleBgLight: userL.hex,   userBubbleOpacityLight: userL.alpha,
    userTextColorDark: dk.userText, userTextColorLight: lt.userText,

    codeBgDark: dk.codeBg,          codeBgLight: lt.codeBg,
    codeHeaderBgDark: dk.mute,      codeHeaderBgLight: lt.mute,
    codeTextColorDark: dk.text,     codeTextColorLight: lt.text,
    codeKeywordColorDark: dk.kwKeyword, codeKeywordColorLight: lt.kwKeyword,
    codeFunctionColorDark: dk.kwName, codeFunctionColorLight: lt.kwName,
    codeStringColorDark: dk.kwString, codeStringColorLight: lt.kwString,
    codeCommentColorDark: dk.kwComment, codeCommentColorLight: lt.kwComment,
    codePunctuationColorDark: dk.kwPunct, codePunctuationColorLight: lt.kwPunct,

    tableHeaderBgDark: tableHeaderD.hex, tableHeaderBgLight: tableHeaderL.hex,
    tableHeaderBgOpacityDark: tableHeaderD.alpha, tableHeaderBgOpacityLight: tableHeaderL.alpha,
    tableHeaderTextDark: dk.tableHeaderText || dk.text, tableHeaderTextLight: lt.tableHeaderText || lt.text,
    tableBorderDark: tableBorderD.hex, tableBorderLight: tableBorderL.hex,
    tableBorderOpacityDark: tableBorderD.alpha, tableBorderOpacityLight: tableBorderL.alpha,
    tableHoverBgDark: tableHoverD.hex, tableHoverBgLight: tableHoverL.hex,
    tableHoverBgOpacity: Math.max(tableHoverD.alpha, tableHoverL.alpha),

    thinkingBgDark: thinkD.hex,     thinkingBgLight: thinkL.hex,
    thinkingBgOpacityDark: thinkD.alpha, thinkingBgOpacityLight: thinkL.alpha,
    thinkingBorderDark: thinkBorderD.hex, thinkingBorderLight: thinkBorderL.hex,
    thinkingBorderOpacityDark: thinkBorderD.alpha, thinkingBorderOpacityLight: thinkBorderL.alpha,
    thinkingTextDark: dk.thinkText, thinkingTextLight: lt.thinkText,

    referenceColorDark: dk.ref,     referenceColorLight: lt.ref,
    referenceTextDark: dk.refText,  referenceTextLight: lt.refText,
    referenceBgDark: dk.refBg,      referenceBgLight: lt.refBg,

    activeItemBgDark: primary,      activeItemBgLight: primary,
    activeItemBorderDark: primary,  activeItemBorderLight: primary,
    activeItemTextDark: primary,    activeItemTextLight: primary,
    hoverItemBgDark: primary,       hoverItemBgLight: primary,

    iconColorDark: dk.text2,        iconColorLight: lt.text2,

    linkColorDark: dk.link,         linkColorLight: lt.link,
    userLinkColorDark: dk.link,     userLinkColorLight: lt.link,

    inputBgDark: inputBgD.hex,      inputBgLight: inputBgL.hex,
    inputOpacityDark: inputBgD.alpha, inputOpacityLight: inputBgL.alpha,
    inputBorderDark: inputBorderD.hex, inputBorderLight: inputBorderL.hex,
    inputBorderOpacityDark: inputBorderD.alpha, inputBorderOpacityLight: inputBorderL.alpha,

    userLinkHoverColorDark: dk.linkHover || dk.link, userLinkHoverColorLight: lt.linkHover || lt.link,

    tableBorderRadius: parseInt(dk.tableRadius) || 8,

    scrollbarThumbDark: scrollThumbD.hex,  scrollbarThumbLight: scrollThumbL.hex,
    scrollbarThumbOpacityDark: scrollThumbD.alpha, scrollbarThumbOpacityLight: scrollThumbL.alpha,
    scrollbarWidth: parseInt(dk.scrollWidth) || 6,

    sidebarHoverPalette: dk.glow,
    enableRandomSidebarHover: true,
    sidebarHoverOpacity: 0.15,
    sidebarHoverGlowOpacity: 0.5,

    inlineCodeBgDark: dk.inlineCodeBg,      inlineCodeBgLight: lt.inlineCodeBg,
    inlineCodeColorDark: dk.inlineCodeText, inlineCodeColorLight: lt.inlineCodeText,
  }
}

// 导出一套完整的 Cherry Studio 主题 CSS（layered，官方选择器），值均来自
// buildVars()（与预览同源）。
// target === CHERRY_V2_TARGET 时走 v2.0.9 (Tailwind / shadcn) 命名空间；
// 默认 'v1.9.12' 保持原样（旧调用/测试零回归）。
export function buildPresetCss(p, target = CHERRY_V1_TARGET) {
  const glow = p.glow || DEFAULT_GLOW
  const dk = fieldsOf(buildVars(presetPlan(p, 'dark'), glow))
  const lt = fieldsOf(buildVars(presetPlan(p, 'light'), glow))
  const theme = themeFromFields(dk, lt)
  if (target === CHERRY_V2_TARGET) {
    return buildV2Css(dk, lt, { name: 'Theme Station V72', radius: Number(theme.tableBorderRadius) || 12 })
  }
  let css = buildExportCss(theme, { name: 'Theme Station V72' })

  const rowD = dk.tableRow, rowHD = dk.soft
  const rowL = lt.tableRow, rowHL = lt.soft
  const sbD = dk.sidebar, sbL = lt.sidebar
  css += `
/* Sidebar background (Theme Station — match preview --sidebar) */
body[theme-mode="dark"] #app-sidebar { background-color: ${sbD || 'var(--color-background-soft)'} !important; }
body[theme-mode="light"] #app-sidebar { background-color: ${sbL || 'var(--color-background-soft)'} !important; }
/* Table rows (Theme Station extension) */
body[theme-mode="dark"] .markdown table tbody td { background: ${rowD || 'transparent'} !important; }
body[theme-mode="dark"] .markdown table tbody tr:hover { background: ${rowHD || 'rgba(255,255,255,.05)'} !important; }
body[theme-mode="light"] .markdown table tbody td { background: ${rowL || 'transparent'} !important; }
body[theme-mode="light"] .markdown table tbody tr:hover { background: ${rowHL || 'rgba(0,0,0,.03)'} !important; }`
  return css
}
