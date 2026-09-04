<div align="center">

# Theme Station · V72

<img width="1472" height="925" alt="image" src="https://github.com/user-attachments/assets/6b79c98c-3bd8-4525-b961-3d89a78785b8" />


Click directly on a live interface preview to recolor every element.
What you see is **exactly** what gets exported as Cherry Studio CSS.

一个面向 [Cherry Studio](https://cherry-ai.com) 的「预览优先」主题编辑器——
在实时界面预览上直接点击调色，所见即所得，导出的就是真正的 Cherry Studio CSS。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vite.dev)
[![Tests](https://img.shields.io/badge/tests-43%2F43%20passing-brightgreen.svg)](#-tests--测试)

</div>

---

## 🖼️ Preview · 预览

<p align="center">
  <img src="theme-station-preview.png" alt="Theme Station V72 preview" width="100%" />
</p>

---

## ✨ Features · 功能

| Feature · 功能 | Description · 说明 |
| --- | --- |
| 🎯 **Preview-first** · 预览优先 | The whole window *is* a real Cherry Studio interface. Click any element — chat bubble, code block, table, sidebar, topic list, input bar — to open a floating color editor for it. |
| 🌓 **Dark ⇄ Light sync** · 明暗双模式 + 统一修改 | Switch modes instantly. Editing a color in one mode auto-converts and syncs to the other (on by default, per-element override available). |
| 🎨 **Accent-first** · 主色优先 | One accent ball drives the primary color; derived colors (thinking-box text, active states, glows) follow automatically. Structure faces (thinking box / table header / reference / code-name) are derived through a **Morandi-style desaturation** so they stay soft instead of turning into saturated accent clones. |
| ↩️ **Undo / Redo** · 撤销 / 重做 | Full history with `⌘Z` / `⌘⇧Z`. |
| 📝 **Floating drafts** · 草稿浮动卡 | Edit a saved preset *in place*, or fork a new theme (auto-named `<name> v2`). Drafts float outside the dock at +10% size to signal "not yet saved". |
| 🧊 **Frosted draggable dock** · 毛玻璃可拖拽 dock | The preset strip is a frosted-glass panel with a drag grip. |
| ♿ **Keyboard accessible** · 键盘无障碍 | Tab-focusable presets with `Space`/`Enter` to select, plus `⌘Z`/`⌘⇧Z` undo/redo — no mouse required. |
| 📤 **Real Cherry Studio export** · 真实导出 | Exports the layered V72 format — `body[theme-mode="dark"/"light"]`, Layer 1 official + Layer 2 structural variables, penetrations — not preview-only names. |

---

## 🎨 Presets · 预设

### Built-in · 内置预设

| Preset | Accent · 主色 |
| --- | --- |
| `Kel Meow` | `#E89975` |
| `Ceramic` | `#D98E63` |
| `Morandi` | `#A88B6B` |
| `Paper` | `#C97B4A` |
| `Moss` | `#8db578` |
| `Ocean` | `#6fb5d4` |

### Custom · 自建预设

| Preset | Accent · 主色 |
| --- | --- |
| `kelMeow` | `#cca83e` |
| `kelMorandi` | `#3e72cc` |
| `keltzeleo` | `#5acc3e` |
| `meoink` | `#cc3e72` |
| `meowMorandi` | `#893ecc` |
| `taiyangTze` | `#cc633e` |
| `tzeDimensions` | `#3eccad` |

---

## 🚀 Getting started · 快速开始

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (opens http://localhost:5173/)
npm run dev
```

> **Node 20+** is recommended. If you ever see `vite: command not found` after install, run `npm install --include=dev` once — an unusual `NODE_ENV=production` environment can skip dev dependencies.

---

## 📜 Scripts · 命令

| Command · 命令 | Description · 说明 |
| --- | --- |
| `npm run dev` | Start dev server · 启动开发服务器 |
| `npm test` | Export-consistency tests (Node runner) · 导出一致性测试 |
| `npm run test:ui` | Interaction / alpha tests (Vitest + jsdom) · 交互与 alpha 测试 |
| `npm run test:all` | Run everything · 运行全部测试 |
| `npm run build` | Production build to `dist/` · 构建 |
| `npm run preview` | Preview the production build · 预览构建产物 |
| `npm run lint` | ESLint · 代码检查 |

---

## ✅ Tests · 测试

**43/43 passing** — every edit is regression-checked.

- `test/export-consistency.test.js` · **32 tests** — locks the invariant that exported CSS values match the preview variables exactly (including the Morandi-style desaturated harmony surfaces for the thinking box / table header / reference / code-name backgrounds).
- `test/ui/*.test.jsx` · **11 tests** — interaction (click-to-edit, undo/redo, draft fork) and alpha-channel consistency.

---

## 🧱 Architecture · 架构

A single source of truth guarantees **what-you-see == what-you-export**:

```
src/
├── theme/
│   ├── tokenRegistry.js   # official v1.9.12 + Layer 2 token registry
│   ├── resolver.js        # state → CSS variables (single resolution path)
│   ├── exportCss.js       # layered Cherry Studio CSS exporter
│   ├── themeModel.js      # preview model + bridge to the resolver
│   ├── presets.js         # built-in presets (dark/light plans)
│   ├── zones.js           # element → variable inspector mapping
│   └── defaultTheme.js    # reset target
├── utils/
│   ├── colors.js          # hexA / textTiers / harmonySurface (Morandi desaturation) / alpha helpers
│   └── colorUtils.js      # parseColor / color formatting
├── App.jsx                # the preview-first UI + interactions
├── App.css                # dark/light variable blocks + element styles
└── main.jsx
```

---

## ⚙️ Tech stack · 技术栈

- [React](https://react.dev) 19
- [Vite](https://vite.dev) 8
- [Vitest](https://vitest.dev) + jsdom for UI tests
- Node built-in test runner (`node --test`) for export-consistency

---

## 📄 License · 许可

[MIT](./LICENSE) © 2026 Theme Station contributors.

This is a theme-designing tool built for Cherry Studio. Cherry Studio is a trademark of its respective owner; this project is not affiliated with or endorsed by it.

本项目采用 [MIT](./LICENSE) 许可。Cherry Studio 是其所有者的商标，本项目与其无隶属或背书关系。
