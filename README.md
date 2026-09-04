<div align="center">

**English** · [简体中文](./README.zh-CN.md)

# Theme Station

A **preview-first** theme editor for [Cherry Studio](https://cherry-ai.com).

<img width="1472" height="925" alt="Theme Station preview" src="https://github.com/user-attachments/assets/6b79c98c-3bd8-4525-b961-3d89a78785b8" />

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vite.dev)
[![Tests](https://img.shields.io/badge/tests-43%2F43%20passing-brightgreen.svg)](#-development)

</div>

---

## 💡 Why this exists

Most theme editors are a form: sliders and hex inputs on one side, a small preview on the other, and an export step that hopes the two stayed in sync. They drift — the preview shows one thing, the exported CSS ships another.

Theme Station skips the form. **The editor *is* the real Cherry Studio interface.** You click a chat bubble, a code block, a table header, directly in the live UI, and a color picker opens for exactly that surface. The CSS you export is generated from the same resolved state you were just looking at — not a parallel reconstruction of it. What you see is what you get, by construction, not by discipline.

---

## 🚶 How it works

1. **Pick a starting point.** Choose a built-in preset from the dock, or start from the current theme.
2. **Click anything to recolor it.** Every element in the preview — bubbles, sidebar, tables, code blocks, links — opens a floating picker on click. Drag the single accent ball and everything derived from it follows automatically (see [Color logic](#-color-logic) below).
3. **Work in both modes at once.** Dark and light are synced by default — edit one, the other converts and follows. Turn sync off per-edit if you want the two modes to diverge.
4. **Save or fork.** Editing a saved preset writes back in place. Forking copies it into a new floating draft (named `<name> v2`) without touching the original, until you decide to keep it.
5. **Export.** Hover a preset and hit **Copy CSS** — the full, layered Cherry Studio stylesheet goes straight to your clipboard, ready to paste into Cherry Studio's custom CSS.

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

## ✨ Features

- 🖱️ **Click-to-edit, on the real UI** — every surface in the preview (bubbles, sidebar, tables, code blocks, links) opens its own color picker on click. No sidebar of abstract labels to map back to the interface in your head.
- 🎯 **Accent-first derivation** — one accent ball drives the primary color and four structural surfaces via hue-wheel rotation (see [Color logic](#-color-logic)), instead of you hand-picking every shade.
- 🌓 **Dark ⇄ light sync** — edit one mode and the other converts and follows, on by default, with a per-edit override when you want the two to diverge on purpose.
- ↩️ **Undo / redo** — full history via `⌘Z` / `⌘⇧Z`.
- 📝 **Non-destructive drafts** — edit a saved preset in place, or fork it into a new floating draft (`<name> v2`) that leaves the original untouched until you decide to keep it.
- ⌨️ **Keyboard accessible** — presets are Tab-focusable and selectable with `Space`/`Enter`; no mouse required.
- 📤 **Real Cherry Studio export** — copies the actual layered stylesheet (`body[theme-mode="dark"/"light"]`, Layer 1 official tokens + Layer 2 structural variables, penetrations), not preview-only variable names.

---

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (opens http://localhost:5173/)
npm run dev
```

> **Node 20+** is recommended. If you see `vite: command not found` after install, run `npm install --include=dev` once — an unusual `NODE_ENV=production` environment can skip dev dependencies.

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

## 🧱 Development

<details>
<summary><strong>Scripts</strong></summary>

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm test` | Export-consistency tests (Node's built-in runner) |
| `npm run test:ui` | Interaction / alpha-channel tests (Vitest + jsdom) |
| `npm run test:all` | Run everything |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

</details>

<details>
<summary><strong>Tests — 43/43 passing</strong></summary>

- `test/export-consistency.test.js` (32 tests) — locks the invariant that exported CSS values match the preview variables exactly, including the desaturated harmony surfaces for the thinking box, table header, reference, and code-name backgrounds.
- `test/ui/*.test.jsx` (11 tests) — interaction (click-to-edit, undo/redo, draft fork) and alpha-channel consistency.

</details>

<details>
<summary><strong>Architecture</strong></summary>

A single source of truth is what makes "what you see" and "what you export" the same object, not two things kept in sync by hand:

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

Both the live preview and the exporter read through `resolver.js` — nothing downstream reconstructs color state independently, which is what the export-consistency tests exist to guard.

</details>

**Stack:** [React](https://react.dev) 19 · [Vite](https://vite.dev) 8 · [Vitest](https://vitest.dev) + jsdom for UI tests · Node's built-in test runner for export consistency.

---

## 📜 License

[MIT](./LICENSE) © 2026 Theme Station contributors.

This is a theme-designing tool built for Cherry Studio. Cherry Studio is a trademark of its respective owner; this project is not affiliated with or endorsed by it.
