// 语义派生层（REFACTOR Step 1）：本文件不再对外提供任何颜色数学，
// 解析统一走 colorUtils.parseColor（支持 named/hsl/短 hex，无静默默认）。
// HSL 换算保留一对私有复刻函数（legacyHsl / legacyHslToHex，见下注释），
// 仅为保持导出字节与重构前逐位一致。Step 2 会把本文件的派生升入
// tokenRegistry/resolver 成为 recipe，届时这层兼容代码与导出字节一起重新定标。
import { parseColor, rgbToHex } from './colorUtils.js'

// ── 字节兼容层 ─────────────────────────────────────────────────────────
// 语义派生的 HSL 数学沿用旧实现的浮点运算顺序（s/l ×100 → 变换 → ÷100
// 的往返 + q/p 公式），而不是 colorUtils 的 c/x/m 公式：两者数学等价，但
// 浮点路径不同会在 Math.round(x*255) 的 .5 边界翻动 1 LSB（实测
// #404c59→#404d59、#62a4ff→#63a4ff 等 4 处）。导出字节被测试与
// REFACTOR 护栏钉死，故保留这层复刻；待 Step 2 派生升入 resolver 时
// 与导出一起按 colorUtils 公式重新定标（0–1 约定由此进入）。
const legacyHsl = (color) => {
  const { r, g, b } = parseColor(color)
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break
      case gn: h = (bn - rn) / d + 2; break
      default: h = (rn - gn) / d + 4; break
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

const legacyHslToHex = (h, s, l) => {
  const hn = h / 360, sn = s / 100, ln = l / 100
  let r, g, b
  if (sn === 0) { r = g = b = ln }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
    const p = 2 * ln - q
    r = hue2rgb(p, q, hn + 1 / 3); g = hue2rgb(p, q, hn); b = hue2rgb(p, q, hn - 1 / 3)
  }
  return rgbToHex(r * 255, g * 255, b * 255)
}

export function isDark(hex) {
  const { r, g, b } = parseColor(hex)
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
  const { h, s } = legacyHsl(accent)
  return dark
    ? {
        bg: legacyHslToHex(h, Math.min(s, 10), 19),
        border: legacyHslToHex(h, Math.min(s, 14), 30),
        text: legacyHslToHex(h, Math.min(s, 24), 66),
      }
    : {
        bg: legacyHslToHex(h, Math.min(s, 12), 96),
        border: legacyHslToHex(h, Math.min(s, 16), 89),
        text: legacyHslToHex(h, Math.min(s, 24), 36),
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
  const at = (dH, s, l) => legacyHslToHex((H + dH) % 360, s, l)
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
  const H = legacyHsl(accent).h
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
  const { r, g, b } = parseColor(hex)
  // Hover 必须提升与背景的对比度，而不是一味向白靠：暗色主题背景深 → 提亮链接，
  // 亮色主题背景浅 → 压暗链接。若只在亮色主题下也向白靠，链接 hover 会跌破 WCAG
  // AA（例如 #1677ff → #4995ff 在纯白底上从 4.1:1 掉到 3.0:1）。
  const shift = dark ? (x) => x + (255 - x) * 0.22 : (x) => x * (1 - 0.22)
  return rgbToHex(shift(r), shift(g), shift(b))
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
    return TEXT_TIERS[toMode]?.['t' + tier] || hex
  }
  if (!hex || !hex.startsWith('#')) return hex
  const { h, s, l } = legacyHsl(hex)
  const toLight = (toMode === 'light')
  switch (kind) {
    case 'accent':
      // 统一修改默认值：accent 在 dark/light 两模式保持同色（与预设一致）
      return hex
    case 'bg':
      return toLight
        ? legacyHslToHex(h, Math.min(s, 12), 96)
        : legacyHslToHex(h, Math.min(s, 10), 17)
    case 'panel':
      return toLight
        ? legacyHslToHex(h, Math.min(s, 10), 100)
        : legacyHslToHex(h, Math.min(s, 8), 19)
    case 'link':
      // 链接与 accent 同属「彩色」类，跨模式只做明度平移、保留色相与饱和度：
      // 暗色主题链接更亮 → 亮色主题需压暗，反之提亮，而不是像 panel 那样洗白。
      return legacyHslToHex(h, Math.max(55, s), toLight ? Math.max(35, l - 16) : Math.min(72, l + 16))
    case 'syntax':
      return legacyHslToHex(h, s, toLight ? Math.max(30, l - 20) : Math.min(75, l + 15))
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
