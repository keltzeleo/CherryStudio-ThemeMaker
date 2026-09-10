import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import App from '../../src/App.jsx'
import { parseColor } from '../../src/utils/colorUtils.js'

if (typeof window.requestAnimationFrame !== 'function') {
  window.requestAnimationFrame = cb => { cb(0); return 1 }
  window.cancelAnimationFrame = () => {}
}

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-mode')
  document.body.classList.remove('pick', 'has-draft')
})

function rowByLabel(label) {
  return [...document.querySelectorAll('#popover .prow')]
    .find(r => r.querySelector('.lb')?.textContent === label)
}

function rgbaInputs(row) {
  return [...row.querySelectorAll('input.rgbanum')]
}

describe('popover 色值行的 R/G/B/alpha 数值输入', () => {
  it('每个色值行有 4 个数值框，初始值跟随解析后的颜色（含 alpha）', () => {
    render(<App />)
    fireEvent.click(document.querySelector('[data-zone="ai"]'), { clientX: 300, clientY: 200 })

    const row = rowByLabel('气泡底')
    expect(row).toBeTruthy()
    const inline = document.documentElement.style.getPropertyValue('--chat-background-ai')
    const { r, g, b, a } = parseColor(inline)
    const [rIn, gIn, bIn, aIn] = rgbaInputs(row)
    expect([rIn, gIn, bIn, aIn].every(Boolean)).toBe(true)
    expect(rIn.value).toBe(String(r))
    expect(gIn.value).toBe(String(g))
    expect(bIn.value).toBe(String(b))
    expect(Number(aIn.value)).toBeCloseTo(a, 2)
  })

  it('改 R 数值框会即时写回预览 inline 变量', () => {
    render(<App />)
    fireEvent.click(document.querySelector('[data-zone="ai"]'), { clientX: 300, clientY: 200 })

    const row = rowByLabel('气泡底')
    const [rIn] = rgbaInputs(row)
    fireEvent.change(rIn, { target: { value: '10' } })

    const inline = document.documentElement.style.getPropertyValue('--chat-background-ai')
    expect(parseColor(inline).r).toBe(10)
  })

  it('R 超过 255、alpha 超过 1 都会被即时夹回合法范围，而不是写入越界值', () => {
    render(<App />)
    fireEvent.click(document.querySelector('[data-zone="ai"]'), { clientX: 300, clientY: 200 })

    const row = rowByLabel('气泡底')
    const [rIn, , , aIn] = rgbaInputs(row)

    fireEvent.change(rIn, { target: { value: '999' } })
    expect(parseColor(document.documentElement.style.getPropertyValue('--chat-background-ai')).r).toBe(255)

    fireEvent.change(aIn, { target: { value: '5' } })
    expect(parseColor(document.documentElement.style.getPropertyValue('--chat-background-ai')).a).toBe(1)
  })

  it('负数会被夹到 0', () => {
    render(<App />)
    fireEvent.click(document.querySelector('[data-zone="ai"]'), { clientX: 300, clientY: 200 })

    const row = rowByLabel('气泡底')
    const [rIn] = rgbaInputs(row)
    fireEvent.change(rIn, { target: { value: '-20' } })

    expect(parseColor(document.documentElement.style.getPropertyValue('--chat-background-ai')).r).toBe(0)
  })

  it('alpha 夹到 1 时颜色退回纯 hex（不再是 rgba 字符串）', () => {
    render(<App />)
    fireEvent.click(document.querySelector('[data-zone="ai"]'), { clientX: 300, clientY: 200 })

    const row = rowByLabel('气泡底')
    const [, , , aIn] = rgbaInputs(row)
    fireEvent.change(aIn, { target: { value: '1' } })

    expect(document.documentElement.style.getPropertyValue('--chat-background-ai')).toMatch(/^#/)
  })

  it('无 alpha 的实色字段（名称颜色）数值框 alpha 显示为 1，R/G/B 跟随 chip', () => {
    render(<App />)
    fireEvent.click(document.querySelector('.kwz[data-kw="name"]'), { clientX: 300, clientY: 200 })

    const row = rowByLabel('名称颜色')
    const inline = document.documentElement.style.getPropertyValue('--kw-name')
    const { r, g, b } = parseColor(inline)
    const [rIn, gIn, bIn, aIn] = rgbaInputs(row)
    expect(rIn.value).toBe(String(r))
    expect(gIn.value).toBe(String(g))
    expect(bIn.value).toBe(String(b))
    expect(Number(aIn.value)).toBe(1)
  })
})
