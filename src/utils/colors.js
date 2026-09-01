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
  return isDark(bg)
    ? { t1: 'rgba(255,255,245,0.9)', t2: 'rgba(235,235,245,0.6)', t3: 'rgba(235,235,245,0.38)' }
    : { t1: '#1b1b1f', t2: 'rgba(0,0,0,0.6)', t3: 'rgba(0,0,0,0.38)' }
}

export function linkHoverOf(hex) {
  const c = toHex(hex).slice(1)
  const [r, g, b] = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16))
  return '#' + [r, g, b].map(x => Math.round(x + (255 - x) * 0.22).toString(16).padStart(2, '0')).join('')
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

// Convert one color from a mode's value to the target mode's equivalent.
// kind: 'accent' | 'bg' | 'text' | 'panel' | 'syntax'
export function convertColor(hex, kind, toMode) {
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
    case 'text':
      return toLight ? '#1b1b1f' : 'rgba(255,255,245,0.9)'
    case 'syntax':
      return hslToHex(hsl.h, hsl.s, toLight ? Math.max(30, hsl.l - 20) : Math.min(75, hsl.l + 15))
    default:
      return hex
  }
}

// Map a CSS var to its conversion kind for sync.
export function varKind(v) {
  if (v === '--color-primary') return 'accent'
  if (v === '--color-background' || v === '--color-background-soft' || v === '--color-background-mute' || v === '--sidebar') return 'bg'
  if (v.startsWith('--chat-background') || v === '--color-code-background' || v === '--table-header' || v === '--table-row-bg' || v === '--local-thinking-bg') return 'panel'
  if (v.startsWith('--color-text') || v === '--chat-text-user' || v === '--local-thinking-text') return 'text'
  if (v.startsWith('--kw-')) return 'syntax'
  return 'panel'
}
