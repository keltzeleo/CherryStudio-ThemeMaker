# Theme Station · V72

> A **preview-first** theme designer for [Cherry Studio](https://cherry-ai.com). Design a custom theme by clicking directly on a live interface preview — what you see is exactly what gets exported as Cherry Studio CSS.

> 一个面向 [Cherry Studio](https://cherry-ai.com) 的「预览优先」主题编辑器。直接在实时界面预览上点击调色，所见即所得，导出的就是真正的 Cherry Studio CSS。

---

## ✨ Features · 功能

- **Preview-first editing · 预览优先** — the entire window *is* a real Cherry Studio interface. Click any element (chat bubble, code block, table, sidebar, topic list, input bar…) to open a floating color editor for that element.
- **Dark ⇄ Light with unified sync · 明暗双模式 + 统一修改** — switch modes instantly; editing a color in one mode can auto-convert and sync to the other (on by default, per-element override still available).
- **Accent-first workflow · 主色优先** — one accent ball drives the primary color; derived colors (thinking-box text, active states, glows) follow the accent automatically.
- **Undo / Redo · 撤销 / 重做** — full history (⌘Z / ⌘⇧Z).
- **Draft as a floating card · 草稿浮动卡** — edit a saved preset *in place*, or fork a new theme (auto-named `<name> v2`); drafts float outside the dock at +10% size to signal "not yet saved".
- **Frosted, draggable dock · 毛玻璃可拖拽 dock** — the preset strip is a frosted-glass panel with a drag grip.
- **Real Cherry Studio export · 真实导出** — exports the layered V72 format (`body[theme-mode="dark"/"light"]`, Layer 1 official + Layer 2 structural variables, penetrations), not preview-only names.

## 🎨 Built-in presets · 内置预设

`Kel Meow` · `Ceramic` · `Morandi` · `Paper` · `Moss` · `Ocean`

## 🚀 Getting started · 快速开始

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (opens http://localhost:5173/)
npm run dev
```

> Node 20+ is recommended. If you ever see `vite: command not found` after install, run `npm install --include=dev` once (an unusual `NODE_ENV=production` environment can skip dev dependencies).

## 📜 Scripts · 命令

| Command | Description · 说明 |
| --- | --- |
| `npm run dev` | Start dev server · 启动开发服务器 |
| `npm test` | Run export-consistency tests · 导出一致性测试 |
| `npm run build` | Production build to `dist/` · 构建 |
| `npm run lint` | ESLint · 代码检查 |
| `npm run preview` | Preview the production build · 预览构建产物 |

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
│   ├── colors.js          # hexA / textTiers / alpha helpers
│   └── colorUtils.js      # parseColor / color formatting
├── App.jsx                # the preview-first UI + interactions
├── App.css                # dark/light variable blocks + element styles
└── main.jsx
```

`test/export-consistency.test.js` locks the invariant that exported CSS values match the preview variables exactly — every edit is regression-checked.

## ⚙️ Tech stack · 技术栈

- [React](https://react.dev) 19
- [Vite](https://vite.dev) 8
- Node built-in test runner (`node --test`)

## 📄 License · 许可

[MIT](./LICENSE). This is a theme-designing tool built for Cherry Studio. Cherry Studio is a trademark of its respective owner; this project is not affiliated with or endorsed by it.

本项目采用 [MIT](./LICENSE) 许可。Cherry Studio 是其所有者的商标，本项目与其无隶属或背书关系。
<<<<<<< HEAD
# CherryStudio-ThemeMaker
# CherryStudio-ThemeMaker
=======
>>>>>>> parent of f4f46b6 (first commit)
# CherryStudio-ThemeMaker
