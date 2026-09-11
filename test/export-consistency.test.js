import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PRESETS, DEFAULT_GLOW } from '../src/theme/presets.js'
import { VAR_KEYS, buildVars, varsToPlan, buildPresetCss, presetPlan } from '../src/theme/themeModel.js'
import { convertColor, linkHoverOf, varKind, thinkingOf } from '../src/utils/colors.js'
import { parseColor, hexToRgbOnly, wcagContrast, toHex, rgbaWithAlpha } from '../src/utils/colorUtils.js'

// 把任意 CSS 颜色归一化成统一的 rgba(r,g,b,a)，用于跨「预览格式 vs 官方
// resolver 格式」的颜色等价比较（大小写 / 空格 / rgba vs hex 都视为同色）。
function normColor(v) {
  if (typeof v !== 'string') return v
  const s = v.trim()
  if (/^#([0-9a-f]{3,8})$/i.test(s) || /^rgba?\(/i.test(s) || /^hsla?\(/i.test(s)) {
    const { r, g, b, a } = parseColor(s)
    const aa = Math.round(a * 100) / 100
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${aa})`
  }
  return s
}

// ─────────────────────────────────────────────────────────────────────────
// 导出一致性测试：验证「所见 == 所得」。
// 核心不变量：预览（buildVars）与导出（buildPresetCss）读的是同一个
// source of truth，两者永远不可能分叉；且导出必须是 Cherry Studio 官方
// 运行时真实读取的分层 CSS —— body[theme-mode="dark"] / body[theme-mode="light"]
// 官方变量全集 + body[theme-mode] 共享块 + Layer 2 结构扩展 + 结构穿透选择器，
// 绝不再是扁平 :root / [theme-mode='light'] 自造格式。
// ─────────────────────────────────────────────────────────────────────────

// 按顺序抓取 css 里所有 `body[theme-mode="X"] { ... }` 块（第 0 块是 Layer 1
// 官方变量块，后续块是共享块 / Layer 2 扩展块）。
function blocksByMode(css, mode) {
  const re = new RegExp(`body\\[theme-mode="${mode}"\\]\\s*\\{`, 'g')
  const out = []
  let m
  while ((m = re.exec(css))) {
    const start = m.index + m[0].length
    const end = css.indexOf('}', start)
    out.push(css.slice(start, end))
  }
  return out
}

// 从一段 CSS 文本里提取 `--var:value` 映射。
function parseCssVars(text) {
  const out = {}
  for (const m of text.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].replace(/\s*!important\s*$/i, '').trim()
  return out
}

function layer1(css, mode) {
  return parseCssVars(blocksByMode(css, mode)[0] || '')
}

function layer2(css, mode) {
  return parseCssVars(blocksByMode(css, mode)[1] || '')
}

test('buildVars 输出 == VAR_KEYS（不多不少，杜绝快照/导出丢色）', () => {
  const keys = Object.keys(buildVars({ bg: '#2b2b2b' }, DEFAULT_GLOW)).sort()
  assert.deepEqual(keys, [...VAR_KEYS].sort())
})

test('buildVars 永不产出 undefined / 空串 / null', () => {
  for (const p of PRESETS) {
    for (const mode of ['dark', 'light']) {
      const vars = buildVars(presetPlan(p, mode), p.glow)
      for (const [k, v] of Object.entries(vars)) {
        assert.ok(v !== undefined && v !== null && v !== '', `${p.name}/${mode} ${k} 缺值`)
      }
    }
  }
})

test('round-trip：预览变量在 varsToPlan/buildVars 间无损', () => {
  // user 不在这份清单里：它现在跟 thinking/active/table 一样是「没设就跟 accent
  // 走默认公式」的字段（ThemeStation-UX-Design-Doc.md「User bubble bg = accent
  // 的低 alpha 派生」），未设置时 buildVars 算出的具体值本就不等于源数据里的
  // undefined，往返不再是恒等。
  for (const p of PRESETS) {
    for (const mode of ['dark', 'light']) {
      const vars = buildVars(presetPlan(p, mode), p.glow)
      const back = varsToPlan(vars)
      for (const k of ['bg', 'soft', 'mute', 'accent', 'link', 'ai', 'userText']) {
        assert.equal(back[k], presetPlan(p, mode)[k], `${p.name}/${mode}.${k}`)
      }
    }
  }
})

test('思考框文字/底/边默认来自 accent 的色调化派生（莫兰迪式降饱和，所见 == 所得 的关键联动）', () => {
  const plan = { bg: '#2b2b2b', accent: '#E89975' }
  const vars = buildVars(plan)
  // 默认不再是生硬刷 accent，而是 accent 的降饱和同色相回声明 (dark) 三件套。
  assert.equal(vars['--local-thinking-text'], thinkingOf('#E89975', true).text)
  assert.equal(vars['--local-thinking-bg'], thinkingOf('#E89975', true).bg)
  assert.equal(vars['--local-thinking-border'], thinkingOf('#E89975', true).border)
  // 与 accent 保持同色相、但更灰淡 —— 不相等（不是纯 accent）
  assert.notEqual(vars['--local-thinking-text'], '#E89975')
  assert.notEqual(vars['--local-thinking-bg'], plan.bg)
})

test('User bubble bg 默认是 accent 的低 alpha 派生（ThemeStation-UX-Design-Doc.md 族2 规则），未设置 user 才生效', () => {
  const dk = buildVars({ bg: '#2b2b2b', accent: '#E89975' }, undefined)
  const lt = buildVars({ bg: '#faf8f6', accent: '#E89975' }, undefined)
  assert.equal(dk['--chat-background-user'], rgbaWithAlpha('#E89975', 0.08))
  assert.equal(lt['--chat-background-user'], rgbaWithAlpha('#E89975', 0.045))
  // 显式设置 user 时优先于默认公式（自建 preset 手动调过的不能被盖掉）。
  const custom = buildVars({ bg: '#2b2b2b', accent: '#E89975', user: 'rgba(1,2,3,.5)' }, undefined)
  assert.equal(custom['--chat-background-user'], 'rgba(1,2,3,.5)')
  // Apricat 本身不再手动设 user，验证它确实吃到这条默认公式。
  const km = PRESETS.find(p => p.name === 'Apricat')
  assert.equal(km.dark.user, undefined)
  assert.equal(buildVars(presetPlan(km, 'dark'), km.glow)['--chat-background-user'], rgbaWithAlpha(km.dark.accent, 0.08))
})

test('统一修改：accent 在 dark/light 两模式保持同色', () => {
  const a = '#E89975'
  assert.equal(convertColor(a, 'accent', 'light'), a)
  assert.equal(convertColor(a, 'accent', 'dark'), a)
})

test('统一修改：链接跨模式只平移明度，不被 panel 规则洗白', () => {
  // varKind 必须把 --color-link 归到 link，而非默认 panel（panel 会把亮色洗成 #ffffff）
  assert.equal(varKind('--color-link'), 'link')
  assert.equal(varKind('--color-link-hover'), 'link')
  // 暗色链接 #6a9fd8 → 亮色应压暗且保留色相/饱和度（不是 #ffffff）
  const lightLink = convertColor('#6a9fd8', 'link', 'light')
  assert.notEqual(lightLink, '#ffffff')
  const { r: lr, g: lg, b: lb } = parseColor(lightLink)
  const { r: dr, g: dg, b: db } = parseColor('#6a9fd8')
  assert.ok(lr < dr && lg < dg && lb < db, `亮色链接应压暗，得到 ${lightLink}`)
  // 亮色链接 #2e6fb8 → 暗色应提亮
  const darkLink = convertColor('#2e6fb8', 'link', 'dark')
  const { r: hr, g: hg, b: hb } = parseColor(darkLink)
  const { r: pr, g: pg, b: pb } = parseColor('#2e6fb8')
  assert.ok(hr > pr && hg > pg && hb > pb, `暗色链接应提亮，得到 ${darkLink}`)
})

test('导出是分层 Cherry Studio CSS（非扁平 :root / [theme-mode=light]）', () => {
  const css = buildPresetCss(PRESETS[0])
  assert.match(css, /body\[theme-mode="dark"\]/)
  assert.match(css, /body\[theme-mode="light"\]/)
  assert.match(css, /body\[theme-mode\]\s*\{/)
  assert.ok(!css.includes(':root{'), '不得出现扁平 :root 块')
  assert.ok(!css.includes("[theme-mode='light']{"), '不得出现旧式扁平亮色块')
  assert.ok(!css.includes('[data-mode='), '不得泄漏预览专用 [data-mode] 选择器')
})

test('导出头正确（@name Cherry Studio Custom Theme）', () => {
  const css = buildPresetCss(PRESETS[0])
  assert.match(css, /@name:\s*Cherry Studio Custom Theme \(Theme Station V72 - V71\)/)
})

test('导出包含官方变量全集的关键成员', () => {
  const dark = layer1(buildPresetCss(PRESETS[0]), 'dark')
  const required = [
    '--color-primary', '--color-background', '--color-background-soft', '--color-background-mute',
    '--color-text-1', '--color-text-2', '--color-text-3', '--color-text',
    '--color-border', '--color-border-soft', '--color-link',
    '--color-code-background', '--color-inline-code-background', '--color-inline-code-text',
    '--color-hover', '--color-active', '--color-reference', '--color-reference-text', '--color-reference-background',
    '--navbar-background-mac', '--navbar-background',
    '--chat-background', '--chat-background-user', '--chat-background-assistant', '--chat-text-user',
    '--color-scrollbar-thumb', '--color-scrollbar-thumb-hover',
  ]
  for (const k of required) assert.ok(k in dark, `官方变量 ${k} 应出现在 dark 官方块`)
})

test('导出暗色块：assistant 气泡为 transparent、user 气泡颜色与预览一致', () => {
  const css = buildPresetCss(PRESETS[0])
  const dark = layer1(css, 'dark')
  assert.equal(dark['--chat-background-assistant'], 'transparent')
  const src = buildVars(presetPlan(PRESETS[0], 'dark'), PRESETS[0].glow)
  assert.equal(normColor(dark['--chat-background-user']), normColor(src['--chat-background-user']))
})

test('Layer 2 结构扩展变量存在于导出（侧栏/表格/思考/语法/激活）', () => {
  const css = buildPresetCss(PRESETS[0])
  const extDark = layer2(css, 'dark')
  const extKeys = [
    '--local-thinking-bg', '--local-thinking-border', '--local-thinking-text',
    '--local-ai-bubble-bg', '--local-ai-text-color', '--local-bubble-border',
    '--local-table-border', '--local-table-header-bg', '--local-table-hover-bg',
    '--theme-active-item-bg', '--theme-active-item-text', '--theme-active-item-border', '--theme-hover-item-bg',
    '--code-keyword-color', '--code-function-color', '--code-string-color', '--code-comment-color', '--code-punctuation-color',
    '--local-input-bg', '--local-input-border', '--theme-code-border', '--theme-code-header-bg',
  ]
  for (const k of extKeys) assert.ok(k in extDark, `Layer 2 扩展变量 ${k} 应出现在扩展块`)
})

test('共享块包含 --primary / 侧栏 hover 六色，且不覆盖字体（跟随 Cherry 自身设置）', () => {
  const css = buildPresetCss(PRESETS[0])
  assert.match(css, /--primary-color:\s*[^;]+;/)
  assert.match(css, /--sidebar-hover-1:/)
  assert.match(css, /--sidebar-hover-6:/)
  assert.ok(!/--font-family:\s*var\(--user-font-family\)/.test(css), '不应导出 --font-family 覆盖 Cherry 字体')
  assert.ok(!/--code-font-family:\s*var\(--user-code-font-family\)/.test(css), '不应导出 --code-font-family')
})

test('dark/light 背景色不同（mode 切换有效）', () => {
  const css = buildPresetCss(PRESETS[0])
  const darkBg = layer1(css, 'dark')['--color-background']
  const lightBg = layer1(css, 'light')['--color-background']
  assert.ok(darkBg && lightBg && darkBg !== lightBg, `dark=${darkBg} light=${lightBg}`)
})

test('导出值 == 预览 buildVars 输出（所见 == 所得，官方名 ↔ 预览名同源）', () => {
  const MAP = {
    '--color-background': '--color-background',
    '--color-background-soft': '--color-background-soft',
    '--color-text-1': '--color-text',
    '--color-link': '--color-link',
    '--color-hover': '--color-hover',
    '--color-active': '--color-active',
    '--color-border': '--color-border',
    '--navbar-background': '--sidebar',
    '--chat-background-user': '--chat-background-user',
    '--chat-text-user': '--chat-text-user',
    '--color-code-background': '--color-code-background',
    '--color-reference': '--color-reference',
    '--color-reference-text': '--color-reference-text',
    '--color-reference-background': '--color-reference-background',
    '--local-thinking-text': '--local-thinking-text',
  }
  // --color-primary/-soft/-mute are `valueMode: 'shared'` in tokenRegistry.js —
  // verified against the real official source (color.css): v1.9.12 genuinely
  // declares ONE `--color-primary` for both modes (see the un-scoped
  // `body[theme-mode] { --primary: ...; --primary-color: ...; }` block in
  // exportCss.js), not a dark/light pair. themeFromFields() feeds it from
  // `dk.primary` only. For the 12 presets whose light/dark accent are equal
  // this is indistinguishable from a per-mode value; tealDrift is the
  // first preset with a deliberately different light accent (per the user's
  // hand-tuned design — v2.0.9 supports this via `:root:root`/`:root.dark`,
  // v1.9.12 structurally cannot), so these three are checked against dark's
  // value specifically instead of "whichever mode we're in".
  const SHARED_FROM_DARK = ['--color-primary', '--color-primary-soft', '--color-primary-mute']
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    const darkPreview = buildVars(presetPlan(p, 'dark'), p.glow)
    for (const mode of ['dark', 'light']) {
      const src = buildVars(presetPlan(p, mode), p.glow)
      const block = mode === 'dark' ? { ...layer1(css, 'dark'), ...layer2(css, 'dark') }
        : { ...layer1(css, 'light'), ...layer2(css, 'light') }
      for (const [cherryName, previewName] of Object.entries(MAP)) {
        if (!(cherryName in block)) continue
        assert.equal(normColor(block[cherryName]), normColor(src[previewName]), `${p.name}/${mode} ${cherryName} 导出与预览不同源`)
      }
      for (const cherryName of SHARED_FROM_DARK) {
        if (!(cherryName in block)) continue
        assert.equal(normColor(block[cherryName]), normColor(darkPreview[cherryName]), `${p.name}/${mode} ${cherryName}（v1.9.12 全局共享，应恒等于 dark 值）`)
      }
    }
  }
})

test('导出包含结构穿透选择器（侧栏 / 内容区 / 气泡）', () => {
  const css = buildPresetCss(PRESETS[0])
  assert.match(css, /#app-sidebar/)
  assert.match(css, /#content-container/)
  assert.match(css, /\.message-assistant \.message-content-container/)
  assert.match(css, /\.message-user \.message-content-container/)
})

test('导出追加侧栏与表格行背景覆盖（预览 --sidebar / --table-row-bg）', () => {
  const css = buildPresetCss(PRESETS[0])
  assert.match(css, /body\[theme-mode="dark"\] #app-sidebar/)
  assert.match(css, /body\[theme-mode="light"\] #app-sidebar/)
  assert.match(css, /\.markdown table tbody td/)
})

test('用户气泡链接 --ant-color-link 跟随预览 --color-link（附件链接所见 == 所得）', () => {
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    for (const mode of ['dark', 'light']) {
      const src = buildVars(presetPlan(p, mode), p.glow)
      const block = mode === 'dark' ? { ...layer1(css, 'dark'), ...layer2(css, 'dark') }
        : { ...layer1(css, 'light'), ...layer2(css, 'light') }
      if (!('--ant-color-link' in block)) continue
      assert.equal(normColor(block['--ant-color-link']), normColor(src['--color-link']),
        `${p.name}/${mode} --ant-color-link 应等于 --color-link`)
    }
  }
})

test('导出值均为合法颜色/合法 CSS 值（无 undefined/NaN）', () => {
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    for (const mode of ['dark', 'light']) {
      const all = { ...layer1(css, mode), ...layer2(css, mode) }
      for (const [k, v] of Object.entries(all)) {
        assert.ok(v.length > 0, `${p.name}/${mode} ${k} 为空`)
        assert.ok(!v.includes('undefined') && !v.includes('NaN'), `${p.name}/${mode} ${k} 含非法值 ${v}`)
      }
    }
  }
})

test('所有预设均能导出为完整分层 CSS（>20KB）', () => {
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    assert.ok(css.length > 20000, `${p.name} 导出长度 ${css.length}`)
  }
})

test('hexA 生成合法的 rgba（alpha-hex 边框格式，与 Cherry 官方一致）', () => {
  assert.equal(rgbaWithAlpha('#E89975', 0.55), 'rgba(232,153,117,0.55)')
  assert.equal(toHex('#E89975'), '#e89975')
})

test('结构性颜色逐字节复现预览（表头底/表头文字/表格边框/滚动条滑块）', () => {
  const MAP = {
    '--local-table-header-bg': '--table-header',
    '--local-table-header-text': '--table-header-text',
    '--local-table-border': '--table-border',
    '--color-scrollbar-thumb': '--scroll-thumb',
  }
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    for (const mode of ['dark', 'light']) {
      const src = buildVars(presetPlan(p, mode), p.glow)
      const block = mode === 'dark' ? { ...layer1(css, 'dark'), ...layer2(css, 'dark') }
        : { ...layer1(css, 'light'), ...layer2(css, 'light') }
      for (const [cherryName, previewName] of Object.entries(MAP)) {
        if (!(cherryName in block)) continue
        assert.equal(normColor(block[cherryName]), normColor(src[previewName]),
          `${p.name}/${mode} ${cherryName} 应等于预览 ${previewName}`)
      }
    }
  }
})

test('表格行悬停不再误用主色 accent', () => {
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    for (const mode of ['dark', 'light']) {
      const hover = layer2(css, mode)['--local-table-hover-bg']
      const primary = buildVars(presetPlan(p, mode), p.glow)['--color-primary']
      assert.notEqual(normColor(hover), normColor(primary), `${p.name}/${mode} 行悬停不应等于主色`)
    }
  }
})

test('导航栏分离：--navbar-background 跟随 --sidebar，mac 变体是它的 0.55 alpha', () => {
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    for (const mode of ['dark', 'light']) {
      const src = buildVars(presetPlan(p, mode), p.glow)
      const block = mode === 'dark' ? { ...layer1(css, 'dark'), ...layer2(css, 'dark') }
        : { ...layer1(css, 'light'), ...layer2(css, 'light') }
      const nav = block['--navbar-background']
      const mac = block['--navbar-background-mac']
      assert.equal(normColor(nav), normColor(src['--sidebar']), `${p.name}/${mode} 导航栏应等于侧栏`)
      const a = parseColor(nav)
      const b = parseColor(mac)
      assert.equal(b.r, a.r, `${p.name}/${mode} mac 红通道`)
      assert.equal(b.g, a.g, `${p.name}/${mode} mac 绿通道`)
      assert.equal(b.b, a.b, `${p.name}/${mode} mac 蓝通道`)
      assert.equal(Math.round(b.a * 100) / 100, 0.55, `${p.name}/${mode} mac 应为 0.55 alpha`)
    }
  }
})

test('输入栏背景跟随预览 soft、边框跟随预览 border（输入框所见 == 所得）', () => {
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    for (const mode of ['dark', 'light']) {
      const src = buildVars(presetPlan(p, mode), p.glow)
      const block = mode === 'dark' ? { ...layer1(css, 'dark'), ...layer2(css, 'dark') }
        : { ...layer1(css, 'light'), ...layer2(css, 'light') }
      // 输入框底 == 预览 --color-background-soft（字节一致）
      assert.equal(normColor(block['--local-input-bg']), normColor(src['--color-background-soft']),
        `${p.name}/${mode} 输入框底应等于 soft`)
      // 输入框边框 == 预览 --color-border（逐字节一致）
      assert.equal(normColor(block['--local-input-border']), normColor(src['--color-border']),
        `${p.name}/${mode} 输入框边框应等于 border`)
    }
  }
})

test('表格单元格文字使用 text-2（与预览 .tablewrap tbody td 一致）', () => {
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    assert.match(css, /\.markdown table td \{[^}]*color: var\(--color-text-2\)/, `${p.name} 表格 td 应使用 --color-text-2`)
  }
})

test('primary-soft/mute 派生 alpha 与官方 useUserTheme 一致（0.6 / 0.3）', () => {
  for (const p of PRESETS) {
    const dark = layer1(buildPresetCss(p), 'dark')
    assert.equal(Math.round(parseColor(dark['--color-primary-soft']).a * 100) / 100, 0.6, `${p.name} primary-soft alpha`)
    assert.equal(Math.round(parseColor(dark['--color-primary-mute']).a * 100) / 100, 0.3, `${p.name} primary-mute alpha`)
  }
})

test('--color-black-mute 跟随预设 mute（--color-background-mute 别名）', () => {
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    for (const mode of ['dark', 'light']) {
      const block = layer1(css, mode)
      const src = buildVars(presetPlan(p, mode), p.glow)
      assert.equal(normColor(block['--color-black-mute']), normColor(src['--color-background-mute']),
        `${p.name}/${mode} black-mute 应等于预览 mute`)
    }
  }
})

test('代码函数色跟随 --kw-name（名称/函数，非 link）', () => {
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    for (const mode of ['dark', 'light']) {
      const src = buildVars(presetPlan(p, mode), p.glow)
      const block = mode === 'dark' ? { ...layer1(css, 'dark'), ...layer2(css, 'dark') }
        : { ...layer1(css, 'light'), ...layer2(css, 'light') }
      assert.equal(block['--code-function-color'], src['--kw-name'],
        `${p.name}/${mode} 代码函数色应等于预览 --kw-name`)
      assert.notEqual(normColor(block['--code-function-color']), normColor(src['--color-link']),
        `${p.name}/${mode} 代码函数色不应等于 link`)
    }
  }
})

test('导出 --sidebar-hover-* 全部源自预设 glow 色板（第 6 色循环回第 1 色，无硬编码杂色）', () => {
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    const hover = {}
    for (const m of css.matchAll(/--sidebar-hover-(\d):\s*([^;]+);/g)) hover[Number(m[1])] = m[2].trim()
    const base = p.glow && p.glow.length ? p.glow : DEFAULT_GLOW
    for (let i = 1; i <= 5; i++) {
      assert.equal(hover[i], hexToRgbOnly(base[i - 1]), `${p.name} --sidebar-hover-${i} 应等于 glow[${i - 1}]`)
    }
    assert.equal(hover[6], hexToRgbOnly(base[0]), `${p.name} --sidebar-hover-6 应循环回 glow[0]，不得掺入硬编码杂色`)
  }
})

test('自定义 border alpha 被逐字节保留（--color-border）', () => {
  const p = {
    name: 'custom-border',
    dark: { bg: '#2b2b2b', accent: '#E89975', link: '#338cff', border: 'rgba(255,0,0,0.5)' },
    light: { bg: '#faf8f6', accent: '#E89975', link: '#1677ff', border: 'rgba(0,0,255,0.3)' },
  }
  const css = buildPresetCss(p)
  const darkBorder = layer1(css, 'dark')['--color-border']
  const lightBorder = layer1(css, 'light')['--color-border']
  assert.equal(Math.round(parseColor(darkBorder).a * 100) / 100, 0.5, 'dark border alpha 0.5')
  assert.equal(Math.round(parseColor(lightBorder).a * 100) / 100, 0.3, 'light border alpha 0.3')
  assert.equal(parseColor(darkBorder).r, 255, 'dark border 红通道')
  assert.equal(parseColor(lightBorder).b, 255, 'light border 蓝通道')
})

test('border-soft/mute 跟随各自模式的 border 透明度（非共享 max）', () => {
  const p = {
    name: 'asym-border',
    dark: { bg: '#2b2b2b', accent: '#E89975', link: '#338cff', border: 'rgba(255,255,255,0.2)' },
    light: { bg: '#faf8f6', accent: '#E89975', link: '#1677ff', border: 'rgba(0,0,0,0.05)' },
  }
  const css = buildPresetCss(p)
  const dark = layer1(css, 'dark')
  const light = layer1(css, 'light')
  // dark soft = 0.2 × 0.64 → #ffffff21；light soft = 0.05 × 0.64 → #00000008
  // （若误用共享 max=0.2，light soft 会错成 #00000021）
  assert.equal(dark['--color-border-soft'], '#ffffff21', 'dark soft')
  assert.equal(light['--color-border-soft'], '#00000008', 'light soft')
  assert.equal(dark['--color-border-mute'], '#ffffff0a', 'dark mute')
  assert.equal(light['--color-border-mute'], '#00000003', 'light mute')
})

test('链接 hover 提升对比度：暗色提亮、亮色压暗（WCAG 方向，不反白淡出）', () => {
  const chan = (c) => { const { r, g, b } = parseColor(c); return [r, g, b] }
  for (const p of PRESETS) {
    for (const mode of ['dark', 'light']) {
      const src = buildVars(presetPlan(p, mode), p.glow)
      const link = chan(src['--color-link'])
      const hover = chan(src['--color-link-hover'])
      if (mode === 'dark') {
        for (let i = 0; i < 3; i++) assert.ok(hover[i] >= link[i], `${p.name}/dark 链接 hover 应提亮通道${i}（${link}→${hover}）`)
      } else {
        for (let i = 0; i < 3; i++) assert.ok(hover[i] <= link[i], `${p.name}/light 链接 hover 应压暗通道${i}（${link}→${hover}）`)
      }
    }
  }
  // 显式单测：亮色主题下 #1677ff hover 必须压暗（旧实现反白成 #4995ff，掉出 WCAG AA）
  const darkHover = linkHoverOf('#1677ff', false)
  assert.notEqual(darkHover, '#4995ff', '亮色 hover 不应再向白靠')
  const [hr, hg, hb] = chan(darkHover)
  assert.ok(hr <= 22 && hg <= 119 && hb <= 255, `亮色 hover 应整体压暗，得到 ${darkHover}`)
})

test('wcagContrast 计算 WCAG 2.x 对比度', () => {
  // 黑字白底 / 白字黑底 均为 21:1
  assert.equal(wcagContrast('#000000', '#ffffff'), 21)
  assert.equal(wcagContrast('#ffffff', '#000000'), 21)
  // 同色为 1:1
  assert.equal(wcagContrast('#808080', '#808080'), 1)
  // 已知经典对：纯蓝 #0000ff 在白底 ~8.59:1；#767676 灰 ~4.54:1（AA）
  assert.equal(wcagContrast('#0000ff', '#ffffff'), 8.59)
  assert.equal(wcagContrast('#767676', '#ffffff'), 4.54)
  // 支持 rgba / 透明度混合 -> 先合成到底色再算
  assert.ok(wcagContrast('rgba(0,0,0,0.5)', '#ffffff') > wcagContrast('#000000', '#ffffff') / 2)
})
