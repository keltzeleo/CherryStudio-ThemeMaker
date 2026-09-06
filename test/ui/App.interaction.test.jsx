import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import App from '../../src/App.jsx'
import { buildPresetCss } from '../../src/theme/themeModel.js'
import { CHERRY_V1_TARGET, CHERRY_V2_TARGET } from '../../src/theme/exportV2.js'

if (typeof window.requestAnimationFrame !== 'function') {
  window.requestAnimationFrame = cb => { cb(0); return 1 }
  window.cancelAnimationFrame = () => {}
}

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-mode')
  document.body.classList.remove('pick', 'has-draft')
})

function pointer(type, target, props = {}) {
  const ev = new window.MouseEvent(type, { bubbles: true, cancelable: true, ...props })
  target.dispatchEvent(ev)
  return ev
}

describe('Theme Station 交互层', () => {
  it('渲染预览舞台与底部预设条', () => {
    render(<App />)
    expect(document.querySelector('.stage')).toBeTruthy()
    expect(document.getElementById('strip')).toBeTruthy()
    expect(document.querySelectorAll('.preset').length).toBeGreaterThan(0)
  })

  it('统一修改 toggle 切换开关并弹出 toast', () => {
    render(<App />)
    const cb = screen.getByRole('checkbox')
    expect(cb.checked).toBe(true)
    fireEvent.click(cb)
    expect(cb.checked).toBe(false)
    expect(document.getElementById('toast').textContent).toContain('已关闭统一修改')
    fireEvent.click(cb)
    expect(cb.checked).toBe(true)
    expect(document.getElementById('toast').textContent).toContain('已开启统一修改')
  })

  it('dark/light 切换更新 data-mode 与选中段', () => {
    render(<App />)
    const darkBtn = document.querySelector('.mode-seg[data-m="dark"]')
    const lightBtn = document.querySelector('.mode-seg[data-m="light"]')
    expect(darkBtn.classList.contains('on')).toBe(true)
    fireEvent.click(lightBtn)
    expect(document.documentElement.getAttribute('data-mode')).toBe('light')
    expect(lightBtn.classList.contains('on')).toBe(true)
    expect(darkBtn.classList.contains('on')).toBe(false)
  })

  it('导出目标切换：默认 1.9.12，点 v2 后选中且导出 v2 CSS', () => {
    render(<App />)
    const v1Btn = document.querySelector('.target-seg[data-t="' + CHERRY_V1_TARGET + '"]')
    const v2Btn = document.querySelector('.target-seg[data-t="' + CHERRY_V2_TARGET + '"]')
    expect(v1Btn.classList.contains('on')).toBe(true)
    expect(v2Btn.classList.contains('on')).toBe(false)
    fireEvent.click(v2Btn)
    expect(v2Btn.classList.contains('on')).toBe(true)
    expect(v1Btn.classList.contains('on')).toBe(false)
    // 导出目标与 buildPresetCss 的 v2 分组行为一致（干净切换：v1 分层 / v2 高特异度 :root:root+:root.dark）
    expect(buildPresetCss({ bg: '#2b2b2b' }, CHERRY_V2_TARGET)).toMatch(/^\s*:root:root \{/m)
    expect(buildPresetCss({ bg: '#2b2b2b' }, CHERRY_V1_TARGET)).toMatch(/body\[theme-mode="dark"\]/)
  })

  it('点击 .pz 区域打开 inspector 浮层，点击外部关闭', () => {
    render(<App />)
    expect(document.getElementById('popover')).toBeFalsy()
    fireEvent.click(document.querySelector('[data-zone="ai"]'), { clientX: 300, clientY: 200 })
    expect(document.getElementById('popover')).toBeTruthy()
    fireEvent.click(document.body)
    expect(document.getElementById('popover')).toBeFalsy()
  })

  it('拖动把手可上下移动底部条', () => {
    render(<App />)
    const grip = document.querySelector('.strip-grip')
    const strip = document.getElementById('strip')
    pointer('pointerdown', grip, { clientY: 100 })
    expect(strip.classList.contains('dragging')).toBe(true)
    pointer('pointermove', window, { clientY: 80 })
    expect(strip.style.bottom).toBe('36px')
    pointer('pointerup', window)
    expect(strip.classList.contains('dragging')).toBe(false)
  })

  it('undo/redo 在 inspector 中回退与前进一次改色', () => {
    render(<App />)
    const undo = document.getElementById('undobtn')
    const redo = document.getElementById('redobtn')
    const root = document.documentElement
    expect(undo.disabled).toBe(true)
    expect(redo.disabled).toBe(true)

    fireEvent.click(document.querySelector('[data-zone="ai"]'), { clientX: 300, clientY: 200 })
    const pick = () => document.querySelector('#popover input[type="color"]')

    fireEvent.input(pick(), { target: { value: '#ff0000' } })
    fireEvent.focusOut(pick())
    expect(root.style.getPropertyValue('--chat-background-ai')).toBe('rgba(255,0,0,0.05)')
    expect(undo.disabled).toBe(false)

    fireEvent.input(pick(), { target: { value: '#00ff00' } })
    fireEvent.focusOut(pick())
    expect(root.style.getPropertyValue('--chat-background-ai')).toBe('rgba(0,255,0,0.05)')

    fireEvent.click(undo)
    expect(root.style.getPropertyValue('--chat-background-ai')).toBe('rgba(255,0,0,0.05)')
    expect(redo.disabled).toBe(false)

    fireEvent.click(redo)
    expect(root.style.getPropertyValue('--chat-background-ai')).toBe('rgba(0,255,0,0.05)')
  })

  it('修改已保存的自建预设会弹出原地改 vs 新建，选择原地改', () => {
    render(<App />)
    fireEvent.click(document.querySelector('.preset.own[data-name="kelMeow"]'))
    fireEvent.click(document.querySelector('[data-zone="ai"]'), { clientX: 300, clientY: 200 })

    expect(document.getElementById('editChoiceMask')).toBeTruthy()
    expect(document.getElementById('editChoiceName').textContent).toBe('kelMeow')

    fireEvent.click(screen.getByText('直接改此预设'))
    expect(document.getElementById('editChoiceMask')).toBeFalsy()
    expect(document.getElementById('popover')).toBeTruthy()
    expect(document.getElementById('popover').textContent).toContain('直接写入此预设')
    expect(document.getElementById('draftcard')).toBeFalsy()
  })

  it('新建自建主题会生成带 v2 名称的草案卡', () => {
    render(<App />)
    fireEvent.click(document.querySelector('.preset.own[data-name="kelMeow"]'))
    fireEvent.click(document.querySelector('[data-zone="ai"]'), { clientX: 300, clientY: 200 })

    expect(document.getElementById('editChoiceMask')).toBeTruthy()
    fireEvent.click(screen.getByText('以此建立新的主题'))

    expect(document.getElementById('editChoiceMask')).toBeFalsy()
    expect(document.getElementById('draftcard')).toBeTruthy()
    expect(document.querySelector('#draftcard .dname').value).toBe('kelMeow v2')
    expect(document.getElementById('popover')).toBeTruthy()
    expect(document.getElementById('popover').textContent).toContain('生成「新预设」卡片')
  })
})
