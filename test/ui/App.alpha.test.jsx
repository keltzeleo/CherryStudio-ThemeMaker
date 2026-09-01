import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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

function norm(c) {
  const { r, g, b, a } = parseColor(c)
  return `rgba(${r},${g},${b},${Math.round(a * 100) / 100})`
}

function rowByLabel(label) {
  return [...document.querySelectorAll('#popover .prow')]
    .find(r => r.querySelector('.lb')?.textContent === label)
}

describe('selector 与预览的颜色 / alpha 一致性', () => {
  it('带透明度的变量在 selector 里显示 alpha 滑杆，且 chip 与预览 inline 变量一致', () => {
    render(<App />)
    fireEvent.click(document.querySelector('[data-zone="ai"]'), { clientX: 300, clientY: 200 })

    const row = rowByLabel('气泡底')
    expect(row).toBeTruthy()
    const alpha = row.querySelector('input[type="range"].alpha')
    expect(alpha).toBeTruthy()

    const inline = document.documentElement.style.getPropertyValue('--chat-background-ai')
    expect(norm(row.querySelector('.chip').style.backgroundColor)).toBe(norm(inline))
    expect(parseColor(inline).a).toBeLessThan(1)
  })

  it('var() 引用（--kw-name）在 selector 里解析成预览实际颜色并显示 alpha', () => {
    render(<App />)
    fireEvent.click(document.querySelector('.kwz[data-kw="name"]'), { clientX: 300, clientY: 200 })

    const row = rowByLabel('名称颜色')
    expect(row).toBeTruthy()
    // value 是 var(--color-text)，但 chip 应解析到真实文字色
    expect(row.querySelector('.val').textContent).toContain('var(')
    expect(row.querySelector('input[type="range"].alpha')).toBeTruthy()

    const textInline = document.documentElement.style.getPropertyValue('--color-text')
    expect(norm(row.querySelector('.chip').style.backgroundColor)).toBe(norm(textInline))
  })

  it('新建草案后 selector 色值仍与预览 inline 变量一致', () => {
    render(<App />)
    fireEvent.click(document.querySelector('.preset.own[data-name="kelMeow"]'))
    fireEvent.click(document.querySelector('[data-zone="ai"]'), { clientX: 300, clientY: 200 })
    fireEvent.click(screen.getByText('以此建立新的主题'))

    const row = rowByLabel('气泡底')
    expect(row).toBeTruthy()
    const inline = document.documentElement.style.getPropertyValue('--chat-background-ai')
    expect(norm(row.querySelector('.chip').style.backgroundColor)).toBe(norm(inline))

    const textRow = rowByLabel('助手文字')
    const textInline = document.documentElement.style.getPropertyValue('--color-text')
    expect(norm(textRow.querySelector('.chip').style.backgroundColor)).toBe(norm(textInline))
  })
})
