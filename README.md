# Theme Station 🎨

**English** | [中文](#theme-station-中文)

<img width="1472" height="925" alt="Theme Station preview" src="https://github.com/user-attachments/assets/6b79c98c-3bd8-4525-b961-3d89a78785b8" />

A **preview-first** CSS theme editor for [Cherry Studio](https://cherry-ai.com).

Click directly on the live interface to recolor it — one accent ball drives the whole palette through real color-harmony math — then export a single stylesheet ready to paste into Cherry Studio's Custom CSS field.

> [!NOTE]
> **Unofficial project** — not affiliated with the Cherry Studio team.
> Built as a personal hobby project by someone who got tired of hand-picking 100+ hex values and wanted the preview and the export to be the same object. Use freely, fork freely.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vite.dev)
[![Tests](https://img.shields.io/badge/tests-43%2F43%20passing-brightgreen.svg)](#-development)

---

## ✨ Features

- 🖱️ **Click-to-edit, on the real UI** — **31 clickable zones** across bubbles, sidebar, tables, code blocks, and links each open their own color picker. What you click is what changes; there's no separate control panel to map back to the interface in your head.
- 🎯 **Accent-first color logic** — drag the one accent ball and four structural surfaces derive from it automatically by rotating around the color wheel (see [Color logic](#-color-logic)) instead of you hand-tuning every shade.
- 🌓 **Dark ⇄ light sync** — edit one mode and the other converts and follows, on by default, with a per-edit override when you want the two to diverge on purpose.
- ↩️ **Undo / redo** — full history via `⌘Z` / `⌘⇧Z`.
- 📝 **Non-destructive drafts** — edit a saved preset in place, or fork it into a new floating draft (`<name> v2`) that leaves the original untouched until you decide to keep it.
- 🧊 **Frosted, draggable dock** — the preset strip is a frosted-glass panel with a drag grip.
- ⌨️ **Keyboard accessible** — presets are Tab-focusable and selectable with `Space`/`Enter`; no mouse required.
- 📤 **Real Cherry Studio export** — **110 CSS custom properties**, the actual layered format (`body[theme-mode="dark"/"light"]`, Layer 1 official tokens + Layer 2 structural variables, penetrations), not preview-only variable names.

---

## 🎨 Color logic

One accent doesn't make a whole interface — it makes one dot on a color wheel. Theme Station turns that single dot into four structural surfaces by rotating around the wheel from the accent's hue, mixing several classic color-harmony relationships in one pass instead of committing to just one:

| Surface | Angle from accent | Relationship |
| --- | --- | --- |
| Table header | +60° | Analogous |
| Blockquote | +120° | Triadic |
| Thinking box | +180° | Complementary |
| Code parameter | +240° | Tetradic |

Every one of those four hues is then clamped into the same low-saturation "Morandi" band before it's used, so they still read as one coordinated, muted family rather than four independently-hued accents shouting over each other. The sidebar's 5-color glow, by contrast, is hand-tuned per preset rather than derived — it's decorative, not structural.

Both the preview and the exported CSS call the exact same function (`harmonySurface` in [`src/utils/colors.js`](./src/utils/colors.js)) for this, which is what makes the two impossible to drift apart.

---

## 🚀 Getting started

### Prerequisites
- Node.js 20+ (the repo pins `22` in [`.nvmrc`](./.nvmrc))
- npm

### Run locally

```bash
git clone https://github.com/keltzeleo/CherryStudio-ThemeMaker.git
cd CherryStudio-ThemeMaker
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

> [!TIP]
> If you see `vite: command not found` right after `npm install`, run `npm install --include=dev` once. An unusual `NODE_ENV=production` environment will skip devDependencies, which is where Vite lives.

### Build

```bash
npm run build
```

Output goes to `dist/` — deploy to any static host, or just keep using it locally.

---

## 🖌️ How to use the exported CSS in Cherry Studio

1. In Theme Station, design your theme, then hover a preset in the dock and click **Copy CSS**.
2. In Cherry Studio, go to **Settings → Appearance → Custom CSS**.
3. Paste the exported CSS and save.
4. The theme applies immediately — no restart needed.

---

## 🎨 Presets

**13 presets ship in the dock** — 6 built-in, plus 7 of the author's own, each with independently tuned dark and light variants.

### Built-in

| Preset | Accent |
| --- | --- |
| 🐾 `Kel Meow` | `#E89975` |
| 🏺 `Ceramic` | `#D98E63` |
| 🪨 `Morandi` | `#A88B6B` |
| 📄 `Paper` | `#C97B4A` |
| 🌿 `Moss` | `#8db578` |
| 🌊 `Ocean` | `#6fb5d4` |

<details>
<summary>Personal presets (7) — fork any of them the same way</summary>

| Preset | Accent |
| --- | --- |
| `kelMeow` | `#cca83e` |
| `kelMorandi` | `#3e72cc` |
| `keltzeleo` | `#5acc3e` |
| `meoink` | `#cc3e72` |
| `meowMorandi` | `#893ecc` |
| `taiyangTze` | `#cc633e` |
| `tzeDimensions` | `#3eccad` |

</details>

---

## 🧱 Project structure

```
src/
├── theme/
│   ├── tokenRegistry.js   # official v1.9.12 + Layer 2 token registry
│   ├── resolver.js        # state → CSS variables (single resolution path)
│   ├── exportCss.js       # layered Cherry Studio CSS exporter (110 variables)
│   ├── themeModel.js      # preview model + bridge to the resolver
│   ├── presets.js         # built-in presets (dark/light plans)
│   ├── zones.js           # element → variable inspector mapping (31 zones)
│   └── defaultTheme.js    # reset target
├── utils/
│   ├── colors.js          # hexA / textTiers / harmonySurface (hue-wheel derivation) / alpha helpers
│   └── colorUtils.js      # parseColor / color formatting
├── App.jsx                # the preview-first UI + interactions
├── App.css                # dark/light variable blocks + element styles
└── main.jsx
```

A single source of truth is what makes "what you see" and "what you export" the same object, not two things kept in sync by hand: both the live preview and the exporter read through `resolver.js`, so nothing downstream reconstructs color state independently.

---

## 🧪 Development

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm test` | Export-consistency tests (Node's built-in runner) |
| `npm run test:ui` | Interaction / alpha-channel tests (Vitest + jsdom) |
| `npm run test:all` | Run everything |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

**43/43 tests passing** — every edit is regression-checked.

- `test/export-consistency.test.js` (32 tests) — locks the invariant that exported CSS values match the preview variables exactly, including the desaturated harmony surfaces for the thinking box, table header, reference, and code-name backgrounds.
- `test/ui/*.test.jsx` (11 tests) — interaction (click-to-edit, undo/redo, draft fork) and alpha-channel consistency.

**Stack:** [React](https://react.dev) 19 · [Vite](https://vite.dev) 8 · [Vitest](https://vitest.dev) + jsdom for UI tests · Node's built-in test runner for export consistency.

---

## 🗺️ Version

Internally tracked as **V72** — the version number lives in commit history and [`ROADMAP.md`](./ROADMAP.md) (iteration log and what's planned next), not in the product name, since it's an implementation detail rather than something a user needs to know before trying the tool.

## 📜 License

[MIT](./LICENSE) © 2026 Theme Station contributors.

This is a theme-designing tool built for Cherry Studio. Cherry Studio is a trademark of its respective owner; this project is not affiliated with or endorsed by it.

<br>

---

# Theme Station 中文

[English](#theme-station-) | **中文**

<img width="1472" height="925" alt="Theme Station preview" src="https://github.com/user-attachments/assets/6b79c98c-3bd8-4525-b961-3d89a78785b8" />

一个面向 [Cherry Studio](https://cherry-ai.com) 的**预览优先** CSS 主题编辑器。

直接在真实界面上点击调色——一颗主色球通过真正的配色理论算法驱动整个调色板——然后导出一份可以直接粘贴进 Cherry Studio 自定义 CSS 栏的样式表。

> [!NOTE]
> **非官方项目** —— 与 Cherry Studio 团队无关。
> 纯粹是个人兴趣做的小工具，起因是受够了手动挑一百多个十六进制色值，也不想再让预览和导出各是各的。欢迎自由使用、自由 fork。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vite.dev)
[![Tests](https://img.shields.io/badge/tests-43%2F43%20passing-brightgreen.svg)](#-开发)

---

## ✨ 功能

- 🖱️ **点哪改哪，改的是真实界面** —— 界面里共有 **31 个可点击区域**，覆盖气泡、侧边栏、表格、代码块、链接，点击后都会弹出自己的颜色选择器。点哪里改哪里，不需要另外在一个控制面板里对照。
- 🎯 **主色优先的配色逻辑** —— 拖动那一颗主色球，四个结构面会通过色轮旋转自动推导出来（见[配色原理](#-配色原理)），不用你一个个手调。
- 🌓 **明暗双模式同步** —— 默认开启：改一个模式，另一个自动换算跟随；也支持单次修改时关闭同步，让两种模式刻意分道扬镳。
- ↩️ **撤销 / 重做** —— 完整历史记录，`⌘Z` / `⌘⇧Z`。
- 📝 **非破坏性草稿** —— 原地编辑已保存的预设，或将其分叉成新的浮动草稿（`<名字> v2`），在你决定保留之前不会动到原始预设。
- 🧊 **毛玻璃可拖拽 dock** —— 预设条是一块带拖拽把手的毛玻璃面板。
- ⌨️ **键盘无障碍** —— 预设支持 Tab 聚焦、`Space`/`Enter` 选中，无需鼠标。
- 📤 **真实 Cherry Studio 导出** —— **110 个 CSS 自定义属性**，真正分层的格式（`body[theme-mode="dark"/"light"]`、Layer 1 官方变量 + Layer 2 结构变量、样式穿透），而不是仅供预览使用的变量名。

---

## 🎨 配色原理

一颗主色球撑不起一整个界面的配色——它只是色轮上的一个点。Theme Station 从这颗主色的色相出发，围绕色轮旋转出四个不同角度，一次性用上好几种经典的配色关系，而不是死守某一种：

| 结构面 | 相对主色的角度 | 配色关系 |
| --- | --- | --- |
| 表头 | +60° | 邻近色（analogous） |
| 引用 | +120° | 三元色之一（triadic） |
| 思考框 | +180° | 互补色（complementary） |
| 代码参数 | +240° | 四元色之一（tetradic） |

这四个色相在使用前都会被压进同一条低饱和度的「莫兰迪」区间，所以即便角度各不相同，整体看起来仍然是柔和统一的一家人，而不是四种抢戏的高饱和色互相打架。侧边栏的 5 色发光效果则不一样，是每个预设手工调出来的装饰色，不走这套推导逻辑。

预览和导出的 CSS 调用的是同一个函数（[`src/utils/colors.js`](./src/utils/colors.js) 里的 `harmonySurface`），这也是两者不可能跑偏的原因。

---

## 🚀 快速开始

### 环境要求
- Node.js 20+（仓库在 [`.nvmrc`](./.nvmrc) 里锁定了 `22`）
- npm

### 本地运行

```bash
git clone https://github.com/keltzeleo/CherryStudio-ThemeMaker.git
cd CherryStudio-ThemeMaker
npm install
npm run dev
```

在浏览器打开 `http://localhost:5173`。

> [!TIP]
> 如果 `npm install` 之后出现 `vite: command not found`，运行一次 `npm install --include=dev` 即可。某些环境下的 `NODE_ENV=production` 会跳过 devDependencies 的安装，而 Vite 正好在里面。

### 构建

```bash
npm run build
```

输出在 `dist/` —— 可以部署到任意静态托管，也可以就在本地用。

---

## 🖌️ 如何在 Cherry Studio 中使用导出的 CSS

1. 在 Theme Station 里设计好主题，把鼠标悬停在某个预设上，点击 **复制 CSS**。
2. 在 Cherry Studio 里进入 **设置 → 外观 → 自定义 CSS**。
3. 粘贴导出的 CSS 并保存。
4. 主题立即生效 —— 无需重启。

---

## 🎨 预设

**dock 里一共有 13 个预设** —— 6 个内置 + 作者自用的 7 个，每个都单独调校了明暗两种版本。

### 内置预设

| 预设 | 主色 |
| --- | --- |
| 🐾 `Kel Meow` | `#E89975` |
| 🏺 `Ceramic` | `#D98E63` |
| 🪨 `Morandi` | `#A88B6B` |
| 📄 `Paper` | `#C97B4A` |
| 🌿 `Moss` | `#8db578` |
| 🌊 `Ocean` | `#6fb5d4` |

<details>
<summary>个人预设（7 个）—— 想用的话同样可以直接分叉</summary>

| 预设 | 主色 |
| --- | --- |
| `kelMeow` | `#cca83e` |
| `kelMorandi` | `#3e72cc` |
| `keltzeleo` | `#5acc3e` |
| `meoink` | `#cc3e72` |
| `meowMorandi` | `#893ecc` |
| `taiyangTze` | `#cc633e` |
| `tzeDimensions` | `#3eccad` |

</details>

---

## 🧱 项目结构

```
src/
├── theme/
│   ├── tokenRegistry.js   # 官方 v1.9.12 + Layer 2 变量注册表
│   ├── resolver.js        # 状态 → CSS 变量（单一解析路径）
│   ├── exportCss.js       # 分层 Cherry Studio CSS 导出器（110 个变量）
│   ├── themeModel.js      # 预览模型 + 与 resolver 的桥接
│   ├── presets.js         # 内置预设（明暗方案）
│   ├── zones.js           # 元素 → 变量的检查器映射（31 个区域）
│   └── defaultTheme.js    # 重置目标
├── utils/
│   ├── colors.js          # hexA / textTiers / harmonySurface（色轮推导）/ alpha 辅助函数
│   └── colorUtils.js      # parseColor / 颜色格式化
├── App.jsx                # 预览优先的 UI 与交互
├── App.css                # 明暗变量块与元素样式
└── main.jsx
```

「所见」与「所得」之所以是同一个东西，而不是靠人工核对保持一致的两份拷贝，靠的是单一数据源：实时预览和导出器读的是同一条路径 —— `resolver.js`，下游没有任何一处会独立地重建颜色状态。

---

## 🧪 开发

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm test` | 导出一致性测试（Node 内置测试运行器） |
| `npm run test:ui` | 交互与 alpha 通道测试（Vitest + jsdom） |
| `npm run test:all` | 运行全部测试 |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | 代码检查 |

**43/43 测试全部通过** —— 每次改动都经过回归测试。

- `test/export-consistency.test.js`（32 项）—— 锁定「导出 CSS 值与预览变量完全一致」这一不变量，包括思考框、表头、引用、代码块名背景的去饱和调和色。
- `test/ui/*.test.jsx`（11 项）—— 交互测试（点击改色、撤销/重做、草稿分叉）与 alpha 通道一致性。

**技术栈：** [React](https://react.dev) 19 · [Vite](https://vite.dev) 8 · [Vitest](https://vitest.dev) + jsdom 用于 UI 测试 · Node 内置测试运行器用于导出一致性测试。

---

## 🗺️ 版本

内部版本号为 **V72**，记录在提交历史和 [`ROADMAP.md`](./ROADMAP.md)（迭代日志与后续计划）里，而不是放进产品名——它是一个实现细节，不是用户上手前需要知道的东西。

## 📜 许可

本项目采用 [MIT](./LICENSE) 许可 © 2026 Theme Station contributors。

本项目是为 Cherry Studio 打造的主题设计工具。Cherry Studio 是其所有者的商标，本项目与其无隶属或背书关系。
