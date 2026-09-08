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

test('v2 导出用 Tailwind / shadcn 命名空间且用高特异度选择器（:root:root / :root.dark），不是 v1 body[theme-mode]', () => {
  const css = v2(PRESETS[0])
  assert.match(css, /^\s*:root:root \{/m)
  assert.match(css, /^\s*:root\.dark \{/m)
  assert.ok(!css.includes('body[theme-mode'), '不得出现 v1 官方选择器')
  assert.ok(!/^:root \{/m.test(css), '不得出现 0,1,0 的裸 :root 块（可能被宿主覆盖）')
  assert.ok(!/^\.dark \{/m.test(css), '不得出现 0,1,0 的裸 .dark 块（可能被宿主覆盖）')
  assert.ok(!/--color-text(?:-2|-3)?\s*:/.test(css), '不得泄漏 v1 --color-text 系列变量')
  assert.ok(!css.includes('--chat-background-user'), '不得泄漏 v1 chat 变量')
  assert.ok(!css.includes('--content-bgcolor'), '不得泄漏 v1 幽灵变量 --content-bgcolor')
  assert.ok(!css.includes('--chat-background-ai'), '不得泄漏预览专用 --chat-background-ai')
  assert.ok(!/--color-background-(?:soft|mute|deep)\s*:/.test(css), '不得泄漏 v1 --color-background-{soft,mute,deep}（v2 用 --color-background/--color-card）')
  assert.ok(!/--color-black-mute\s*:/.test(css), '不得泄漏 v1 --color-black-mute')
})

test('v2 导出不触碰宿主持有的 --cs-theme-primary*（不与之冲突）', () => {
  const css = v2(PRESETS[0])
  assert.ok(!/--cs-theme-primary\s*:/.test(css), '主题不得声明宿主拥有的 --cs-theme-primary*')
})

test('v2 导出包含 --color-* 公共契约层（Tailwind v4 / shadcn 组件实际读取），值来自预览，这是「贴了才有效」的关键', () => {
  const css = v2(PRESETS[0])
  const root = parseVars(extractBlock(css, ':root:root') || '')
  const dark = parseVars(extractBlock(css, ':root.dark') || '')
  const contract = [
    '--color-background', '--color-background-subtle', '--color-foreground',
    '--color-foreground-secondary', '--color-foreground-muted', '--color-card',
    '--color-card-foreground', '--color-popover', '--color-popover-foreground',
    '--color-primary', '--color-primary-foreground', '--color-primary-hover',
    '--color-primary-soft', '--color-primary-mute',
    '--color-secondary', '--color-secondary-foreground', '--color-secondary-hover',
    '--color-secondary-active', '--color-muted', '--color-muted-foreground',
    '--color-accent', '--color-accent-foreground',
    '--color-ghost-hover', '--color-ghost-active',
    '--color-border', '--color-border-subtle', '--color-border-hover', '--color-border-active',
    '--color-frame-border', '--color-input', '--color-input-background', '--color-ring',
    '--color-sidebar', '--color-sidebar-foreground', '--color-sidebar-primary',
    '--color-sidebar-primary-foreground', '--color-sidebar-accent',
    '--color-sidebar-accent-foreground', '--color-sidebar-border', '--color-sidebar-ring',
  ]
  for (const k of contract) {
    assert.ok(k in root, `light :root 缺 ${k}`)
    assert.ok(k in dark, `dark .dark 缺 ${k}`)
  }
  // 与预览同源
  const srcD = buildVars(presetPlan(PRESETS[0], 'dark'), PRESETS[0].glow)
  const srcL = buildVars(presetPlan(PRESETS[0], 'light'), PRESETS[0].glow)
  assert.equal(normColor(dark['--color-primary']), normColor(srcD['--color-primary']), 'color-primary dark')
  assert.equal(normColor(root['--color-primary']), normColor(srcL['--color-primary']), 'color-primary light')
  assert.equal(normColor(dark['--color-background']), normColor(srcD['--color-background']), 'color-background dark')
  assert.equal(normColor(root['--color-background']), normColor(srcL['--color-background']), 'color-background light')
  assert.equal(normColor(dark['--color-input-background']), normColor(srcD['--local-input-bg']), 'color-input-background dark = 预览输入栏底')
  assert.equal(normColor(root['--color-input-background']), normColor(srcL['--local-input-bg']), 'color-input-background light = 预览输入栏底')
  // 输入栏底必须是不透明软表面（不是 near-transparent AI 气泡染色），否则输入栏半透明/发灰
  const { a: aD } = parseColor(dark['--color-input-background'])
  const { a: aL } = parseColor(root['--color-input-background'])
  assert.ok(aD > 0.5, `dark 输入栏底 alpha 应 >0.5，实际 ${aD}`)
  assert.ok(aL > 0.5, `light 输入栏底 alpha 应 >0.5，实际 ${aL}`)
})

test('v2 完整包含 shadcn 官方 + Cherry product 语义 token（dark/light 两块都有）', () => {
  const css = v2(PRESETS[0])
  const root = parseVars(extractBlock(css, ':root:root') || '')
  const dark = parseVars(extractBlock(css, ':root.dark') || '')
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
  ]
  for (const k of [...shadcn, ...product]) {
    assert.ok(k in root, `light :root 缺 ${k}`)
    assert.ok(k in dark, `dark .dark 缺 ${k}`)
  }
})

test('v2 输出 v2.0.9 的 --cs-* palette 命名空间（layer 1，全覆盖的关键），dark/light 都有且与预览同源', () => {
  const css = v2(PRESETS[0])
  const root = parseVars(extractBlock(css, ':root:root') || '')
  const dark = parseVars(extractBlock(css, ':root.dark') || '')
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
    const root = parseVars(extractBlock(css, ':root:root') || '')
    const dark = parseVars(extractBlock(css, ':root.dark') || '')
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
    const root = parseVars(extractBlock(css, ':root:root') || '')
    const dark = parseVars(extractBlock(css, ':root.dark') || '')
    for (const [mode, block] of [['dark', dark], ['light', root]]) {
      const accent = block['--primary']
      const expect = lumin(accent) > 0.179 ? '#000000' : '#FFFFFF'
      assert.equal(block['--primary-foreground'], expect, `${p.name}/${mode} primary-foreground=${block['--primary-foreground']} accent=${accent}`)
    }
  }
})

test('v2 导出暗色块（:root.dark）排在亮色块（:root:root）之后（同特异度下暗色获胜）', () => {
  const css = v2(PRESETS[0])
  assert.ok(css.indexOf(':root:root') < css.indexOf(':root.dark'), ':root.dark 必须出现在 :root:root 之后')
})

test('v2 每预设 dark/light 两块都有 --sidebar 且跟随预览 --sidebar', () => {
  for (const p of PRESETS) {
    const css = v2(p)
    const root = parseVars(extractBlock(css, ':root:root') || '')
    const dark = parseVars(extractBlock(css, ':root.dark') || '')
    const srcD = buildVars(presetPlan(p, 'dark'), p.glow)
    const srcL = buildVars(presetPlan(p, 'light'), p.glow)
    assert.equal(normColor(dark['--sidebar']), normColor(srcD['--sidebar']), `${p.name}/dark sidebar`)
    assert.equal(normColor(root['--sidebar']), normColor(srcL['--sidebar']), `${p.name}/light sidebar`)
  }
})

test('v2 --inline-code 取自预览 muted 底（非 inputBg）；语法高亮（Shiki 内联 style）在两个界面都没有 CSS 钩子，不发 --syntax-*/.hljs-*', () => {
  for (const p of PRESETS) {
    const css = v2(p)
    const root = parseVars(extractBlock(css, ':root:root') || '')
    const dark = parseVars(extractBlock(css, ':root.dark') || '')
    const srcD = buildVars(presetPlan(p, 'dark'), p.glow)
    const srcL = buildVars(presetPlan(p, 'light'), p.glow)
    // inline-code 是行内 code 的底 → 预览的 --color-background-mute，而非输入栏底
    assert.equal(normColor(dark['--inline-code']), normColor(srcD['--color-background-mute']), `${p.name}/dark inline-code`)
    assert.equal(normColor(root['--inline-code']), normColor(srcL['--color-background-mute']), `${p.name}/light inline-code`)
    // inline-code 文字色与预览 keyword 同源（v2 真实 token --inline-code-foreground）
    assert.equal(normColor(dark['--inline-code-foreground']), normColor(srcD['--kw-keyword']), `${p.name}/dark inline-code-foreground`)
    assert.equal(normColor(root['--inline-code-foreground']), normColor(srcL['--kw-keyword']), `${p.name}/light inline-code-foreground`)
    // VERIFIED against real CodeBlock.tsx/CodeViewer.tsx source: every fenced
    // code block (chat markdown AND the standalone artifact viewer) renders
    // through the same Shiki-based CodeViewer, painting tokens via inline
    // style="color:…" — never a class. There is no --syntax-* token and no
    // .hljs-* selector to emit; both would be dead weight.
    assert.ok(!('--syntax-keyword' in dark), `${p.name} 不应输出 --syntax-keyword token`)
    assert.ok(!('--syntax-operator' in dark), `${p.name} 不应输出 --syntax-operator token`)
    assert.doesNotMatch(css, /\.hljs-keyword/, `${p.name} 不应输出 hljs-keyword 穿透`)
    // 代码块底仍通过 --code-block + .shiki / .markdown pre 绑定，这个是真实生效的
    assert.match(css, /\.shiki/, `${p.name} 缺 .shiki 代码块规则`)
    assert.match(css, /\.markdown pre/, `${p.name} 缺 markdown 代码块结构选择器`)
  }
})

test('v2 用户气泡默认布局（bg-muted）由结构选择器重定向到 --chat-user', () => {
  for (const p of PRESETS) {
    const css = v2(p)
    assert.match(css, /\[data-ui="chat\.user-bubble-message"\] \.message-content-container/, `${p.name} 缺用户气泡结构选择器`)
    assert.match(css, /background-color: var\(--chat-user\) !important/, `${p.name} 用户气泡未绑定 --chat-user`)
  }
})

test('v2 导出保留标志性 sidebar glow（.sidebar-theme 四阶 opacity，跟随 accent）', () => {
  const TOKENS = ['--sidebar-active-bg', '--sidebar-active-border', '--sidebar-glow-bg', '--sidebar-glow-line']
  // 默认 .dark .sidebar-theme = 更亮的 accent 一档；:root/.dark 两块都应有
  for (const p of PRESETS) {
    const css = v2(p)
    // light 块
    const ltBlock = extractBlock(css, 'html .sidebar-theme')
    const dkBlock = extractBlock(css, 'html.dark .sidebar-theme')
    assert.ok(ltBlock, `${p.name} 缺 html .sidebar-theme glow 块`)
    assert.ok(dkBlock, `${p.name} 缺 html.dark .sidebar-theme glow 块`)
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
