import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PRESETS } from '../src/theme/presets.js'
import { buildPresetCss, buildVars, presetPlan } from '../src/theme/themeModel.js'
import { CHERRY_V1_TARGET, CHERRY_V2_TARGET } from '../src/theme/exportV2.js'
import { parseColor } from '../src/utils/colorUtils.js'

// 跨「预览格式 vs v2 token 值」的颜色等价比较（大小写 / 空格 / rgba vs hex 视为同色）。
function normColor(v) {
  if (typeof v !== 'string') return v
  const s = v.trim()
  if (/^#([0-9a-f]{3,8})$/i.test(s) || /^rgba?\(/i.test(s) || /^hsla?\(/i.test(s)) {
    const { r, g, b, a } = parseColor(s)
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${Math.round(a * 100) / 100})`
  }
  return s
}

function extractBlock(css, selector) {
  const re = new RegExp(`(^|\\n)\\s*${selector}\\s*\\{`, 'g')
  const m = re.exec(css)
  if (!m) return null
  const start = m.index + m[0].length
  const end = css.indexOf('}', start)
  return css.slice(start, end)
}

function parseVars(text) {
  const out = {}
  for (const m of text.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim()
  return out
}

const v2 = (p) => buildPresetCss(p, CHERRY_V2_TARGET)

test('CHERRY_V1 保持默认，CHERRY_V2 常量正确', () => {
  assert.equal(CHERRY_V1_TARGET, 'v1.9.12')
  assert.equal(CHERRY_V2_TARGET, 'v2.0.9')
  // 默认（不传 target）仍是 v1 分层格式
  assert.match(buildPresetCss(PRESETS[0]), /body\[theme-mode="dark"\]/)
})

test('v2 导出用的是 Tailwind / shadcn 命名空间（:root / .dark），不是 v1 body[theme-mode]', () => {
  const css = v2(PRESETS[0])
  assert.match(css, /^\s*:root \{/m)
  assert.match(css, /^\s*\.dark \{/m)
  assert.ok(!css.includes('body[theme-mode'), '不得出现 v1 官方选择器')
  assert.ok(!/--color-[a-z-]+/.test(css), '不得泄漏 v1 --color-* 变量')
  assert.ok(!css.includes('--chat-background-user'), '不得泄漏 v1 chat 变量')
  assert.ok(!css.includes('--content-bgcolor'), '不得泄漏 v1 幽灵变量 --content-bgcolor')
  assert.ok(!css.includes('--chat-background-ai'), '不得泄漏预览专用 --chat-background-ai')
})

test('v2 导出不触碰宿主持有的 --cs-theme-primary*（不与之冲突）', () => {
  const css = v2(PRESETS[0])
  assert.ok(!/--cs-theme-primary\s*:/.test(css), '主题不得声明宿主拥有的 --cs-theme-primary*')
})

test('v2 完整包含 shadcn 官方 + Cherry product 语义 token（dark/light 两块都有）', () => {
  const css = v2(PRESETS[0])
  const root = parseVars(extractBlock(css, ':root') || '')
  const dark = parseVars(extractBlock(css, '.dark') || '')
  const shadcn = [
    '--background', '--foreground', '--card', '--card-foreground',
    '--popover', '--popover-foreground', '--sidebar', '--sidebar-foreground',
    '--primary', '--primary-foreground', '--secondary', '--secondary-foreground',
    '--muted', '--muted-foreground', '--accent', '--accent-foreground',
    '--border', '--input', '--ring', '--radius',
  ]
  const product = [
    '--background-subtle', '--border-strong', '--link',
    '--code-block', '--inline-code', '--inline-code-foreground',
    '--reference', '--reference-foreground', '--reference-subtle',
    '--highlight', '--highlight-accent', '--chat-user',
    '--syntax-keyword', '--syntax-string', '--syntax-literal',
    '--syntax-function', '--syntax-comment', '--syntax-punctuation',
  ]
  for (const k of [...shadcn, ...product]) {
    assert.ok(k in root, `light :root 缺 ${k}`)
    assert.ok(k in dark, `dark .dark 缺 ${k}`)
  }
})

test('v2 输出 v2.0.9 的 --cs-* palette 命名空间（layer 1，全覆盖的关键），dark/light 都有且与预览同源', () => {
  const css = v2(PRESETS[0])
  const root = parseVars(extractBlock(css, ':root') || '')
  const dark = parseVars(extractBlock(css, '.dark') || '')
  const palette = [
    '--cs-background', '--cs-background-subtle', '--cs-foreground',
    '--cs-muted-foreground', '--cs-foreground-tertiary', '--cs-foreground-disabled',
    '--cs-card', '--cs-card-foreground', '--cs-popover', '--cs-popover-foreground',
    '--cs-primary', '--cs-primary-foreground',
    '--cs-secondary', '--cs-secondary-hover', '--cs-secondary-active', '--cs-secondary-foreground',
    '--cs-muted', '--cs-accent', '--cs-accent-foreground', '--cs-ghost-active',
    '--cs-border', '--cs-border-subtle', '--cs-border-strong', '--cs-border-selected',
    '--cs-input', '--cs-ring',
    '--cs-sidebar', '--cs-sidebar-foreground', '--cs-sidebar-primary',
    '--cs-sidebar-primary-foreground', '--cs-sidebar-accent', '--cs-sidebar-accent-foreground',
    '--cs-sidebar-border', '--cs-sidebar-ring',
  ]
  for (const k of palette) {
    assert.ok(k in root, `light :root 缺 ${k}`)
    assert.ok(k in dark, `dark .dark 缺 ${k}`)
  }
  assert.ok(!/--cs-theme-primary\s*:/.test(css), '主题不得声明宿主持有的 --cs-theme-primary*')
  const srcD = buildVars(presetPlan(PRESETS[0], 'dark'), PRESETS[0].glow)
  const srcL = buildVars(presetPlan(PRESETS[0], 'light'), PRESETS[0].glow)
  assert.equal(normColor(dark['--cs-background']), normColor(srcD['--color-background']), 'cs-background dark')
  assert.equal(normColor(root['--cs-background']), normColor(srcL['--color-background']), 'cs-background light')
  assert.equal(normColor(dark['--cs-primary']), normColor(srcD['--color-primary']), 'cs-primary dark')
  assert.equal(normColor(root['--cs-primary']), normColor(srcL['--color-primary']), 'cs-primary light')
  assert.equal(normColor(dark['--cs-sidebar']), normColor(srcD['--sidebar']), 'cs-sidebar dark')
  assert.equal(normColor(root['--cs-sidebar']), normColor(srcL['--sidebar']), 'cs-sidebar light')
  // --card 是「卡片/输入栏底」(bg-card)，必须是 不透明 的 soft 表面，不能用近乎全透明的 AI 气泡
  // 染色 (f.aiBg, 3-5% alpha) —— 否则输入栏/卡片看起来半透明、发灰。预览输入栏底正好是 soft。
  assert.equal(normColor(dark['--cs-card']), normColor(srcD['--color-background-soft']), 'cs-card dark = soft')
  assert.equal(normColor(root['--cs-card']), normColor(srcL['--color-background-soft']), 'cs-card light = soft')
  assert.equal(normColor(dark['--card']), normColor(srcD['--color-background-soft']), 'card dark = soft')
  assert.equal(normColor(root['--card']), normColor(srcL['--color-background-soft']), 'card light = soft')
  assert.equal(normColor(dark['--cs-border']), normColor(srcD['--color-border']), 'cs-border dark')
  assert.equal(normColor(root['--cs-border']), normColor(srcL['--color-border']), 'cs-border light')
})

test('v2 dark/light 背景、border、chat-user、link、primary 各不相同且与预览同源', () => {
  for (const p of PRESETS) {
    const css = v2(p)
    const root = parseVars(extractBlock(css, ':root') || '')
    const dark = parseVars(extractBlock(css, '.dark') || '')
    const srcD = buildVars(presetPlan(p, 'dark'), p.glow)
    const srcL = buildVars(presetPlan(p, 'light'), p.glow)
    for (const [mode, src, block] of [['dark', srcD, dark], ['light', srcL, root]]) {
      assert.equal(normColor(block['--background']), normColor(src['--color-background']), `${p.name}/${mode} background`)
      assert.equal(normColor(block['--border']), normColor(src['--color-border']), `${p.name}/${mode} border`)
      assert.equal(normColor(block['--link']), normColor(src['--color-link']), `${p.name}/${mode} link`)
      assert.equal(normColor(block['--chat-user']), normColor(src['--chat-background-user']), `${p.name}/${mode} chat-user`)
      assert.equal(normColor(block['--primary']), normColor(src['--color-primary']), `${p.name}/${mode} primary`)
    }
    // dark/light 背景必须不同
    const bgD = normColor(dark['--background']); const bgL = normColor(root['--background'])
    assert.notEqual(bgD, bgL, `${p.name} dark=light 背景不应相同`)
  }
})

test('v2 --primary-foreground 遵循 Cherry 相对亮度阈值（>0.179 → #000）', () => {
  const lumin = (c) => {
    const { r, g, b } = parseColor(c)
    const norm = (x) => { const n = x / 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4) }
    return 0.2126 * norm(r) + 0.7152 * norm(g) + 0.0722 * norm(b)
  }
  for (const p of PRESETS) {
    const css = v2(p)
    const root = parseVars(extractBlock(css, ':root') || '')
    const dark = parseVars(extractBlock(css, '.dark') || '')
    for (const [mode, block] of [['dark', dark], ['light', root]]) {
      const accent = block['--primary']
      const expect = lumin(accent) > 0.179 ? '#000000' : '#FFFFFF'
      assert.equal(block['--primary-foreground'], expect, `${p.name}/${mode} primary-foreground=${block['--primary-foreground']} accent=${accent}`)
    }
  }
})

test('v2 导出 .dark 块排在 :root 之后（等特异度下暗色获胜）', () => {
  const css = v2(PRESETS[0])
  assert.ok(css.indexOf(':root') < css.indexOf('.dark'), '.dark 必须出现在 :root 之后')
})

test('v2 每预设 dark/light 两块都有 --sidebar 且跟随预览 --sidebar', () => {
  for (const p of PRESETS) {
    const css = v2(p)
    const root = parseVars(extractBlock(css, ':root') || '')
    const dark = parseVars(extractBlock(css, '.dark') || '')
    const srcD = buildVars(presetPlan(p, 'dark'), p.glow)
    const srcL = buildVars(presetPlan(p, 'light'), p.glow)
    assert.equal(normColor(dark['--sidebar']), normColor(srcD['--sidebar']), `${p.name}/dark sidebar`)
    assert.equal(normColor(root['--sidebar']), normColor(srcL['--sidebar']), `${p.name}/light sidebar`)
  }
})

test('v2 --inline-code 取自预览 muted 底（非 inputBg），hljs 语法块存在且绑定 --syntax-*', () => {
  for (const p of PRESETS) {
    const css = v2(p)
    const root = parseVars(extractBlock(css, ':root') || '')
    const dark = parseVars(extractBlock(css, '.dark') || '')
    const srcD = buildVars(presetPlan(p, 'dark'), p.glow)
    const srcL = buildVars(presetPlan(p, 'light'), p.glow)
    // inline-code 是行内 code 的底 → 预览的 --color-background-mute，而非输入栏底
    assert.equal(normColor(dark['--inline-code']), normColor(srcD['--color-background-mute']), `${p.name}/dark inline-code`)
    assert.equal(normColor(root['--inline-code']), normColor(srcL['--color-background-mute']), `${p.name}/light inline-code`)
    // 语法 token 与预览同源
    const pairs = [
      ['--syntax-keyword', '--kw-keyword'], ['--syntax-string', '--kw-string'],
      ['--syntax-literal', '--kw-literal'], ['--syntax-function', '--kw-name'],
      ['--syntax-comment', '--kw-comment'],
    ]
    for (const [v2k, pk] of pairs) {
      assert.equal(normColor(dark[v2k]), normColor(srcD[pk]), `${p.name}/dark ${v2k}`)
      assert.equal(normColor(root[v2k]), normColor(srcL[pk]), `${p.name}/light ${v2k}`)
    }
    // 标点 token 的 v1 默认值是 var(--color-text-3)；v2 导出必须解析成真实颜色，
    // 否则会把 v1 --color-* 变量泄漏进 v2 命名空间并吞掉 base 缺省。
    assert.equal(dark['--syntax-punctuation'], normColor(srcD['--color-text-3']), `${p.name}/dark 标点已解析`)
    assert.equal(root['--syntax-punctuation'], normColor(srcL['--color-text-3']), `${p.name}/light 标点已解析`)
    // hljs 语法块实际存在
    assert.match(css, /\.hljs-keyword/, `${p.name} 缺 hljs-keyword 规则`)
    assert.match(css, /var\(--syntax-keyword\)/, `${p.name} 语法块未绑定 --syntax-keyword`)
  }
})

test('v2 导出保留标志性 sidebar glow（.sidebar-theme 四阶 opacity，跟随 accent）', () => {
  const TOKENS = ['--sidebar-active-bg', '--sidebar-active-border', '--sidebar-glow-bg', '--sidebar-glow-line']
  // 默认 .dark .sidebar-theme = 更亮的 accent 一档；:root/.dark 两块都应有
  for (const p of PRESETS) {
    const css = v2(p)
    // light 块
    const ltBlock = extractBlock(css, '.sidebar-theme')
    const dkBlock = extractBlock(css, '.dark .sidebar-theme')
    assert.ok(ltBlock, `${p.name} 缺 .sidebar-theme glow 块`)
    assert.ok(dkBlock, `${p.name} 缺 .dark .sidebar-theme glow 块`)
    const ltVars = parseVars(ltBlock || '')
    const dkVars = parseVars(dkBlock || '')
    for (const k of TOKENS) {
      assert.ok(k in ltVars, `${p.name} light 缺 ${k}`)
      assert.ok(k in dkVars, `${p.name} dark 缺 ${k}`)
    }
    // glow 取自预览 accent（--color-primary）的 RGB，alpha 依次 0.08/0.15/0.25/0.5
    const srcD = buildVars(presetPlan(p, 'dark'), p.glow)
    const srcL = buildVars(presetPlan(p, 'light'), p.glow)
    const alphas = [0.08, 0.15, 0.25, 0.5]
    TOKENS.forEach((k, i) => {
      const darkAcc = srcD['--color-primary']
      const { r, g, b } = parseColor(darkAcc)
      assert.equal(dkVars[k], `rgba(${r},${g},${b},${alphas[i]})`, `${p.name} dark ${k}`)
      const lightAcc = srcL['--color-primary']
      const { r: lr, g: lg, b: lb } = parseColor(lightAcc)
      assert.equal(ltVars[k], `rgba(${lr},${lg},${lb},${alphas[i]})`, `${p.name} light ${k}`)
    })
    // 不再出现 v1 的多色 nth-child / --_hover-random / --sidebar-hover-* 残留
    assert.ok(!/--sidebar-hover-\d+/.test(css), `${p.name} 不应残留 v1 --sidebar-hover-*`)
    assert.ok(!css.includes('--_hover-random'), `${p.name} 不应残留 v1 --_hover-random`)
    assert.ok(!css.includes('nth-child(6n+'), `${p.name} 不应残留 v1 nth-child 循环`)
    assert.ok(!css.includes('[aria-describedby]'), `${p.name} 不应残留 v1 [aria-describedby]`)
    assert.ok(!css.includes('[data-rfd-draggable-id]'), `${p.name} 不应残留 v1 [data-rfd-draggable-id]`)
  }
})
