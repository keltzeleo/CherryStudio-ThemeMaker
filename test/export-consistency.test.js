import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PRESETS, DEFAULT_GLOW } from '../src/theme/presets.js'
import { VAR_KEYS, buildVars, varsToPlan, buildPresetCss, presetPlan } from '../src/theme/themeModel.js'
import { convertColor, hexA, toHex } from '../src/utils/colors.js'
import { parseColor } from '../src/utils/colorUtils.js'

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
  for (const p of PRESETS) {
    for (const mode of ['dark', 'light']) {
      const vars = buildVars(presetPlan(p, mode), p.glow)
      const back = varsToPlan(vars)
      for (const k of ['bg', 'soft', 'mute', 'accent', 'link', 'ai', 'user', 'userText']) {
        assert.equal(back[k], presetPlan(p, mode)[k], `${p.name}/${mode}.${k}`)
      }
    }
  }
})

test('思考框文字默认跟随 accent（所见 == 所得 的关键联动）', () => {
  const plan = { bg: '#2b2b2b', accent: '#E89975' }
  const vars = buildVars(plan)
  assert.equal(vars['--local-thinking-text'], '#E89975')
})

test('统一修改：accent 在 dark/light 两模式保持同色', () => {
  const a = '#E89975'
  assert.equal(convertColor(a, 'accent', 'light'), a)
  assert.equal(convertColor(a, 'accent', 'dark'), a)
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

test('共享块包含 --primary / 字体 / 侧栏 hover 六色', () => {
  const css = buildPresetCss(PRESETS[0])
  assert.match(css, /--primary-color:\s*[^;]+;/)
  assert.match(css, /--font-family:\s*var\(--user-font-family\)/)
  assert.match(css, /--code-font-family:\s*var\(--user-code-font-family\)/)
  assert.match(css, /--sidebar-hover-1:/)
  assert.match(css, /--sidebar-hover-6:/)
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
    '--color-primary': '--color-primary',
    '--color-text-1': '--color-text',
    '--color-link': '--color-link',
    '--navbar-background': '--sidebar',
    '--chat-background-user': '--chat-background-user',
    '--chat-text-user': '--chat-text-user',
    '--color-code-background': '--color-code-background',
    '--color-reference': '--color-reference',
    '--color-reference-text': '--color-reference-text',
    '--color-reference-background': '--color-reference-background',
    '--local-thinking-text': '--local-thinking-text',
  }
  for (const p of PRESETS) {
    const css = buildPresetCss(p)
    for (const mode of ['dark', 'light']) {
      const src = buildVars(presetPlan(p, mode), p.glow)
      const block = mode === 'dark' ? { ...layer1(css, 'dark'), ...layer2(css, 'dark') }
        : { ...layer1(css, 'light'), ...layer2(css, 'light') }
      for (const [cherryName, previewName] of Object.entries(MAP)) {
        if (!(cherryName in block)) continue
        assert.equal(normColor(block[cherryName]), normColor(src[previewName]), `${p.name}/${mode} ${cherryName} 导出与预览不同源`)
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
  assert.equal(hexA('#E89975', 0.55), 'rgba(232,153,117,0.55)')
  assert.equal(toHex('#E89975'), '#e89975')
})
