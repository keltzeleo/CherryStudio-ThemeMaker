<div align="center">

[English](./README.md) · **简体中文**

# Theme Station

一个面向 [Cherry Studio](https://cherry-ai.com) 的**预览优先**主题编辑器。

<img width="1472" height="925" alt="Theme Station preview" src="https://github.com/user-attachments/assets/6b79c98c-3bd8-4525-b961-3d89a78785b8" />

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vite.dev)
[![Tests](https://img.shields.io/badge/tests-43%2F43%20passing-brightgreen.svg)](#-开发)

</div>

---

## 💡 为什么做这个

大多数主题编辑器本质上是一张表单：一侧是滑块和十六进制输入框，另一侧是一小块预览图，导出的时候只能寄望于两者是同步的。但它们经常不同步——预览显示一套效果，导出的 CSS 又是另一套。

Theme Station 干脆去掉了表单这一层。**编辑器本身就是真实的 Cherry Studio 界面。**你直接在真实界面上点击一个聊天气泡、一段代码块、一个表头，就会为这个具体的元素弹出对应的颜色选择器。导出的 CSS 是从你刚刚看到的同一份已解析状态直接生成的，而不是另起炉灶重建一遍。所见即所得，是结构上的保证，不是靠人工检查出来的。

---

## 🚶 使用流程

1. **选一个起点。** 从 dock 里选一个内置预设，或者直接从当前主题开始改。
2. **点哪改哪。** 预览里的每个元素——气泡、侧边栏、表格、代码块、链接——点击后都会弹出浮动的颜色选择器。拖动那一颗主色球，所有衍生色都会自动跟着变(具体算法见下面的[配色原理](#-配色原理))。
3. **明暗两种模式同时改。** 默认开启同步：改一个模式，另一个模式自动换算跟随。也可以在某次修改时单独关闭同步，让两种模式分道扬镳。
4. **保存或分叉。** 编辑已保存的预设会原地写回；分叉则会把它复制成一张新的浮动草稿卡（自动命名为 `<名字> v2`），在你决定保留之前不会动到原始预设。
5. **导出。** 把鼠标悬停在某个预设上，点击 **复制 CSS**——完整的分层 Cherry Studio 样式表会直接进入剪贴板，粘贴到 Cherry Studio 的自定义 CSS 里即可使用。

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

预览和导出的 CSS 调用的是同一个函数([`src/utils/colors.js`](./src/utils/colors.js) 里的 `harmonySurface`)，这也是两者不可能跑偏的原因。

---

## ✨ 功能

- 🖱️ **点哪改哪,改的是真实界面** —— 预览里的每个元素(气泡、侧边栏、表格、代码块、链接)点击后都会弹出自己的颜色选择器,不需要在一堆抽象标签和界面之间来回对照。
- 🎯 **主色优先的衍生机制** —— 一颗主色球通过色轮旋转驱动整体基调和四个结构面(见[配色原理](#-配色原理)),不用你一个个手调。
- 🌓 **明暗双模式同步** —— 默认开启:改一个模式,另一个自动换算跟随;也支持单次修改时关闭同步,让两种模式刻意分道扬镳。
- ↩️ **撤销 / 重做** —— 完整历史记录,`⌘Z` / `⌘⇧Z`。
- 📝 **非破坏性草稿** —— 原地编辑已保存的预设,或将其分叉成新的浮动草稿(`<名字> v2`),在你决定保留之前不会动到原始预设。
- ⌨️ **键盘无障碍** —— 预设支持 Tab 聚焦、`Space`/`Enter` 选中,无需鼠标。
- 📤 **真实 Cherry Studio 导出** —— 复制的是真正分层的样式表(`body[theme-mode="dark"/"light"]`、Layer 1 官方变量 + Layer 2 结构变量、样式穿透),而不是仅供预览使用的变量名。

---

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（打开 http://localhost:5173/）
npm run dev
```

> 建议使用 **Node 20+**。如果安装后出现 `vite: command not found`，运行一次 `npm install --include=dev` 即可——某些环境下的 `NODE_ENV=production` 会跳过 devDependencies 的安装。

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
<summary>个人预设(7 个)—— 想用的话同样可以直接分叉</summary>

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

## 🧱 开发

<details>
<summary><strong>命令</strong></summary>

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm test` | 导出一致性测试（Node 内置测试运行器） |
| `npm run test:ui` | 交互与 alpha 通道测试（Vitest + jsdom） |
| `npm run test:all` | 运行全部测试 |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | 代码检查 |

</details>

<details>
<summary><strong>测试 —— 43/43 全部通过</strong></summary>

- `test/export-consistency.test.js`（32 项）—— 锁定「导出 CSS 值与预览变量完全一致」这一不变量，包括思考框、表头、引用、代码块名背景的去饱和调和色。
- `test/ui/*.test.jsx`（11 项）—— 交互测试（点击改色、撤销/重做、草稿分叉）与 alpha 通道一致性。

</details>

<details>
<summary><strong>架构</strong></summary>

「所见」与「所得」之所以是同一个东西,而不是靠人工核对保持一致的两份拷贝,靠的是单一数据源:

```
src/
├── theme/
│   ├── tokenRegistry.js   # 官方 v1.9.12 + Layer 2 变量注册表
│   ├── resolver.js        # 状态 → CSS 变量（单一解析路径）
│   ├── exportCss.js       # 分层 Cherry Studio CSS 导出器
│   ├── themeModel.js      # 预览模型 + 与 resolver 的桥接
│   ├── presets.js         # 内置预设（明暗方案）
│   ├── zones.js           # 元素 → 变量的检查器映射
│   └── defaultTheme.js    # 重置目标
├── utils/
│   ├── colors.js          # hexA / textTiers / harmonySurface（莫兰迪去饱和）/ alpha 辅助函数
│   └── colorUtils.js      # parseColor / 颜色格式化
├── App.jsx                # 预览优先的 UI 与交互
├── App.css                # 明暗变量块与元素样式
└── main.jsx
```

实时预览和导出器读的是同一条路径——`resolver.js`；下游没有任何一处会独立地重建颜色状态，这正是导出一致性测试要守住的东西。

</details>

**技术栈：** [React](https://react.dev) 19 · [Vite](https://vite.dev) 8 · [Vitest](https://vitest.dev) + jsdom 用于 UI 测试 · Node 内置测试运行器用于导出一致性测试。

---

## 📜 许可

本项目采用 [MIT](./LICENSE) 许可 © 2026 Theme Station contributors。

本项目是为 Cherry Studio 打造的主题设计工具。Cherry Studio 是其所有者的商标，本项目与其无隶属或背书关系。
