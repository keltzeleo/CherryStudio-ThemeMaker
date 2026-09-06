export function hexA(hex, a) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return hex
  const [r, g, b] = [m[1], m[2], m[3]].map(x => parseInt(x, 16))
  return `rgba(${r},${g},${b},${a})`
}

// 带透明度的颜色：hex 走 hexA；已是 rgba(...) 则重写其 alpha。
export function alphaOf(color, a) {
  const m = /^rgba?\(\s*(\d+)\s*[,\s/]\s*(\d+)\s*[,\s/]\s*(\d+)/.exec(color || '')
  if (m) return `rgba(${m[1]},${m[2]},${m[3]},${a})`
  return hexA(color, a)
}

export function toHex(v) {
  const m = /^#?([a-f\d]{6})$/i.exec(v)
  if (m) return '#' + m[1].toLowerCase()
  const rg = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(v)
  if (rg) return '#' + [1, 2, 3].map(i => (+rg[i].replace(/[^\d]/g, '')).toString(16).padStart(2, '0')).join('')
  return '#8c6a55'
}

export function darken(hex, f) {
  const c = toHex(hex).slice(1)
  const [r, g, b] = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16))
  return '#' + [r, g, b].map(x => Math.max(0, Math.round(x * (1 - f))).toString(16).padStart(2, '0')).join('')
}

export function isDark(hex) {
  const c = toHex(hex).slice(1)
  const [r, g, b] = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16))
  return (r + g + b) / 3 < 140
}

export function textTiers(bg) {
  // t2 / t3 必须与 t1 共享同一基色、只降透明度，否则预览的 --color-text-2/-3
  // 会与 resolver 从 --color-text-1 派生的官方 --color-text-2/-3 出现 RGB 偏差。
  return isDark(bg)
    ? { t1: 'rgba(255,255,245,0.9)', t2: 'rgba(255,255,245,0.6)', t3: 'rgba(255,255,245,0.38)' }
    : { t1: '#1b1b1f', t2: 'rgba(27,27,31,0.6)', t3: 'rgba(27,27,31,0.38)' }
}

// 思考框三色的「色调化」派生：底色与文字都是 accent 的降饱和同色相回声，
// 而非生硬的直接刷 accent —— 思考框成为整体配色的低沉点缀，而不是夺目的色块。
// dark：底色朝该色相的暗灰、文字向更灰淡（降饱和提亮）的版本；
// light：底色淡淡的米色系暖白、文字向更暗灰的版本。
export function thinkingOf(accent, dark) {
  const h = hexToHsl(accent)
  return dark
    ? {
        bg: hslToHex(h.h, Math.min(h.s, 10), 19),
        border: hslToHex(h.h, Math.min(h.s, 14), 30),
        text: hslToHex(h.h, Math.min(h.s, 24), 66),
      }
    : {
        bg: hslToHex(h.h, Math.min(h.s, 12), 96),
        border: hslToHex(h.h, Math.min(h.s, 16), 89),
        text: hslToHex(h.h, Math.min(h.s, 24), 36),
      }
}

// 四个「结构面」的和声配色：由 accent 做色相旋转，全体统一落入莫兰迪（低饱和）
// 灰调带，彼此呼应但互不相同（保持与背景的对比）。
//   表头 +60（邻色）、引用 +120（三元其二）、思考 +180（互补）、代码参数 +240（四元其四）
// 同一色相轮驱动全部面，因此它们天然和声；所有面饱和度都被钳到莫兰迪区间，杜绝
// 个别结构面「突然跳高饱和、脱离整体灰调」。所有值同时用于预览与导出，保证「所见==所得」。
// 各预设的和声方案：四张「结构面」分别做不同色相旋转，而非一律四元（+60/+120/+180/+240）。
// 每个方案给出一组 [表头, 引用, 思考, 代码参数] 的色相增量，并保证这四处彼此可区分、
// 又都落在莫兰迪（低饱和）灰调带里。所有值同时用于预览与导出，保证「所见==所得」。
const SCHEMES = {
  tetradic:      [60, 120, 180, 240],   // 经典四元（默认）
  analogous:     [20, 45, 70, 95],      // 邻近——同一色相带缓慢爬升，最温和
  monochrome:    [0, 0, 0, 0],          // 同色相——只靠明度/饱和区分，最克制
  complementary: [180, 240, 120, 60],   // 主面取互补的两极
  triadic:       [120, 240, 60, 180],   // 三足鼎立的两组交错
  splitComp:     [30, 150, 210, 90],    // 分裂互补——一对补色 + 两个邻色
  square:        [90, 180, 270, 0],     // 方阵四等分
}

// 把某个面在暗/亮两模式下译为具体的莫兰迪色（饱和度 ≤26，引用竖线用 20 稍作强调）。
function face(band, H, dark) {
  const at = (dH, s, l) => hslToHex((H + dH) % 360, s, l)
  switch (band) {
    case 'table':        return dark ? at(0, 16, 26) : at(0, 18, 93)
    case 'tableText':    return dark ? at(0, 16, 82) : at(0, 18, 34)
    case 'quoteBg':      return dark ? at(0, 14, 19) : at(0, 14, 95)
    case 'quoteLine':    return dark ? at(0, 20, 48) : at(0, 20, 42)
    case 'quoteText':    return dark ? at(0, 15, 78) : at(0, 16, 38)
    case 'thinkingBg':   return dark ? at(0, 12, 19) : at(0, 12, 96)
    case 'thinkingBorder': return dark ? at(0, 16, 30) : at(0, 16, 89)
    case 'thinkingText': return dark ? at(0, 24, 66) : at(0, 24, 36)
    case 'codeParam':    return dark ? at(0, 22, 72) : at(0, 22, 36)
  }
}

export function harmonySurface(accent, mode, scheme = 'tetradic') {
  const H = hexToHsl(accent).h
  const dark = mode === 'dark'
  const [t, q, n, c] = SCHEMES[scheme] || SCHEMES.tetradic
  return {
    table:        face('table', H + t, dark),
    tableText:    face('tableText', H + t, dark),
    quoteBg:      face('quoteBg', H + q, dark),
    quoteLine:    face('quoteLine', H + q, dark),
    quoteText:    face('quoteText', H + q, dark),
    thinkingBg:   face('thinkingBg', H + n, dark),
    thinkingBorder: face('thinkingBorder', H + n, dark),
    thinkingText: face('thinkingText', H + n, dark),
    codeParam:    face('codeParam', H + c, dark),
  }
}

export function linkHoverOf(hex, dark) {
  const c = toHex(hex).slice(1)
  const [r, g, b] = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16))
  // Hover 必须提升与背景的对比度，而不是一味向白靠：暗色主题背景深 → 提亮链接，
  // 亮色主题背景浅 → 压暗链接。若只在亮色主题下也向白靠，链接 hover 会跌破 WCAG
  // AA（例如 #1677ff → #4995ff 在纯白底上从 4.1:1 掉到 3.0:1）。
  const shift = dark ? (x) => x + (255 - x) * 0.22 : (x) => x * (1 - 0.22)
  return '#' + [r, g, b].map(x => Math.round(shift(x)).toString(16).padStart(2, '0')).join('')
}

export function hexToHsl(hex) {
  const c = toHex(hex).slice(1)
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 }
  else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

export function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100
  let r, g, b
  if (s === 0) { r = g = b = l }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3)
  }
  return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
}

// 文字档位：按 alpha 识别 t1/t2/t3。文字必须与背景分层共享基色、只降透明度，
// 所以跨模式转换不能丢 alpha——直接命中目标模式的同档位（t1 全不透明 / t2 / t3）。
// toMode: 'dark' | 'light'
const TEXT_TIERS = {
  dark: { t1: 'rgba(255,255,245,0.9)', t2: 'rgba(255,255,245,0.6)', t3: 'rgba(255,255,245,0.38)' },
  light: { t1: '#1b1b1f', t2: 'rgba(27,27,31,0.6)', t3: 'rgba(27,27,31,0.38)' },
}
function textTierOf(color) {
  const m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\)/.exec(color || '')
  if (!m) return 1 // 纯 hex（light t1）或无 alpha → 视为 t1
  const a = m[4] === undefined ? 1 : parseFloat(m[4])
  if (a >= 0.75) return 1
  if (a >= 0.5) return 2
  return 3
}

// Convert one color from a mode's value to the target mode's equivalent.
// kind: 'accent' | 'bg' | 'text' | 'panel' | 'syntax'
export function convertColor(hex, kind, toMode) {
  if (kind === 'text') {
    // rgba 文字档位必须先于 # 短路处理，否则暗色 t2/t3（rgba）会被原样写进亮色。
    const tier = textTierOf(hex)
    const key = (toMode === 'light') ? 't' + tier : 't' + tier
    return TEXT_TIERS[toMode]?.[key] || hex
  }
  if (!hex || !hex.startsWith('#')) return hex
  const hsl = hexToHsl(hex)
  const toLight = (toMode === 'light')
  switch (kind) {
    case 'accent':
      // 统一修改默认值：accent 在 dark/light 两模式保持同色（与预设一致）
      return hex
    case 'bg':
      return toLight
        ? hslToHex(hsl.h, Math.min(hsl.s, 12), 96)
        : hslToHex(hsl.h, Math.min(hsl.s, 10), 17)
    case 'panel':
      return toLight
        ? hslToHex(hsl.h, Math.min(hsl.s, 10), 100)
        : hslToHex(hsl.h, Math.min(hsl.s, 8), 19)
    case 'link':
      // 链接与 accent 同属「彩色」类，跨模式只做明度平移、保留色相与饱和度：
      // 暗色主题链接更亮 → 亮色主题需压暗，反之提亮，而不是像 panel 那样洗白。
      return hslToHex(hsl.h, Math.max(55, hsl.s), toLight ? Math.max(35, hsl.l - 16) : Math.min(72, hsl.l + 16))
    case 'syntax':
      return hslToHex(hsl.h, hsl.s, toLight ? Math.max(30, hsl.l - 20) : Math.min(75, hsl.l + 15))
    default:
      return hex
  }
}

// Map a CSS var to its conversion kind for sync.
export function varKind(v) {
  if (v === '--color-primary') return 'accent'
  if (v === '--color-link' || v === '--color-link-hover') return 'link'
  if (v === '--color-background' || v === '--color-background-soft' || v === '--color-background-mute' || v === '--sidebar' || v === '--local-input-bg') return 'bg'
  if (v.startsWith('--chat-background') || v === '--color-code-background' || v === '--table-header' || v === '--table-row-bg' || v === '--local-thinking-bg' || v === '--local-input-border') return 'panel'
  if (v.startsWith('--color-text') || v === '--chat-text-user' || v === '--local-thinking-text') return 'text'
  if (v.startsWith('--kw-')) return 'syntax'
  return 'panel'
}
