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

  it('改 accent（透过数值框）在"統一修改"开启时，另一模式的 user bubble 也跟着走', () => {
    render(<App />)
    fireEvent.click(document.querySelector('[data-zone="accent"]'), { clientX: 300, clientY: 200 })

    const row = rowByLabel('主色 Accent')
    const [rIn] = rgbaInputs(row)
    fireEvent.change(rIn, { target: { value: '60' } })

    fireEvent.click(document.querySelector('button[title="Light"]'))

    const lightUser = document.documentElement.style.getPropertyValue('--chat-background-user')
    const { r, a } = parseColor(lightUser)
    expect(r).toBe(60)
    expect(a).toBeCloseTo(0.045, 3)
  })

  it('关掉"統一修改"改 accent、再开回去：soft/mute/user bubble 都要用新 accent 重新算，不是把旧模式的 rgba 原样搬过去', () => {
    render(<App />)
    const syncCb = document.querySelector('.sync-toggle input')
    fireEvent.click(syncCb)
    expect(syncCb.checked).toBe(false)

    fireEvent.click(document.querySelector('[data-zone="accent"]'), { clientX: 300, clientY: 200 })
    const row = rowByLabel('主色 Accent')
    const [rIn] = rgbaInputs(row)
    fireEvent.change(rIn, { target: { value: '40' } })

    fireEvent.click(syncCb)
    expect(syncCb.checked).toBe(true)
    fireEvent.click(document.querySelector('button[title="Light"]'))

    const soft = parseColor(document.documentElement.style.getPropertyValue('--color-primary-soft'))
    const mute = parseColor(document.documentElement.style.getPropertyValue('--color-primary-mute'))
    const user = parseColor(document.documentElement.style.getPropertyValue('--chat-background-user'))
    expect(soft.r).toBe(40)
    expect(soft.a).toBeCloseTo(0.6, 3)
    expect(mute.r).toBe(40)
    expect(mute.a).toBeCloseTo(0.3, 3)
    expect(user.r).toBe(40)
    expect(user.a).toBeCloseTo(0.045, 3)
  })
})
