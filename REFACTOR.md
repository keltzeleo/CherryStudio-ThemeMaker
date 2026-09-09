# REFACTOR — Theme Station 架构收敛计划

> 目标不是「代码更干净」，而是让 **本工具真正会遇到的未来变化** 变得便宜：
> 下游导出目标（Cherry v1.9.12 → v2.0.9 → 未来版本 / 别的 app）会不断换 token 模型。
> future-proof 的唯一硬标准：**加一个新导出目标 = 加一份声明式 profile，而不是再手写一个 exporter。**

基线：`node --test test/export-consistency.test.js test/export-v2.test.js` → **45/45 绿**（无需安装依赖）。
每一步都必须保持这条绿线；装好依赖后再叠加 vitest UI 测试。

---

## 诊断：为什么现在不 future-proof

整个 app 从中间劈成 **两台并行的主题引擎**，各自都声称自己是唯一真源：

| | 引擎 A（规范） | 引擎 B（遗留） |
|---|---|---|
| 入口 | `tokenRegistry.js`（147 token，recipe 驱动） | `themeModel.js`（手写 `VAR_KEYS` ~50） |
| 计算 | `resolver.js` → `colorUtils.js` | `buildVars(plan,glow)` → `colors.js` |
| 用在 | **导出** | **预览 / 撤销重做 / 快照**（App.jsx 全程） |
| 颜色数学 | 完整、规范（s/l 0–1） | 糙（`toHex` 失败静默返回 `#8c6a55`；s/l 0–100；不认 named/hsl/短 hex） |

两台引擎算的是同一批 CSS 变量，靠 **人肉编码 + export-consistency 测试** 硬掰到相等。
证据：`themeModel.js` 里满是「这里必须拆成 (hex,alpha) 两步存，否则 resolver 重算会套默认 alpha 导致导出≠预览」这类警告注释。
`resolver.js` 开头写着「预览与导出共用同一条路径」——但 App 的预览用的是 `buildVars`，这句承诺只兑现了导出一半。

**代价**：每加一个 token / 改一条规则要改两处；两边错位 = 预览与导出对不上；状态与 bundle 都偏肥（与之前 daemon 413 同根）。

---

## 目标架构（六层）

1. **颜色数学：只留 `colorUtils.js`。** 删掉 colors.js 的糙重复（`hexA/toHex/darken/alphaOf/hexToHsl/hslToHex`），统一到 colorUtils 约定（s/l 0–1）。禁止 `#8c6a55` 这类静默错误默认——要么显式失败，要么返回 null。

2. **语义派生进 registry，不再是旁挂模块。** `textTiers / thinkingOf / harmonySurface / linkHoverOf / convertColor` 变成 resolver 的 recipe 类型或 registry 声明的派生，全部建在 colorUtils 上。→ 预览与导出用**同一条派生路径**，那些「手动同步否则漂移」的注释从结构上消失。**这是收敛的核心。**

3. **一台引擎。** tokenRegistry（SSOT）+ resolver。退役 themeModel 的 `buildVars/VAR_KEYS/plan` 作为「预览独立引擎」的身份；预览改从 `buildThemeVars`(resolver) 渲染——正是 resolver.js 已经承诺的。`plan` 形态保留为**预设的序列化/快照格式**，经**一个 adapter** 转成 registry 状态，而不是平行引擎。数据流：`plan(预设 I/O) → theme state → resolver → vars（预览与导出共用）`。

4. **导出目标 = 声明式 profile（真正的 future-proof）。** 建 `src/theme/targets/`，每个目标是一份描述符：发哪些 officialKey、分层方式（v2 的四层 `--cs-*` / bare / `--color-*` / product）、选择器规则、alpha 格式（`#rrggbbaa` vs `rgba`）。单一 `emit(target, resolvedVars)` 遍历描述符产出 CSS。**加 Cherry v2.1 / 新 app = 加一份描述符，零新 exporter 代码。**

5. **版本化 theme schema + 迁移链。** 保存的主题打 `schemaVersion`，建 `src/theme/migrations/`；旧文件加载时前向迁移，resolver 里散落的 `?? legacy` 回退全部收敛到迁移层。未来加/改 token = 写一条迁移，而不是埋雷。

6. **App 拆分。** 主题状态 → `useThemeReducer`（27 个 useState → 1 个 reducer，顺带把手写快照 ref 换成干净的 undo/redo）；预览变量 → `useMemo(buildThemeVars, [theme, mode])`（当前 0 个 useMemo，几乎每次 render 重算 147 token）；编辑面板 / 预览 / 代码样例各自成组件。表面积变小 = 序列化负载变小。

---

## 执行顺序（strangler，永不破绿）

自底向上，每步独立可发布、跑完测试才算完成。

- **Step 0 — 基线绿**：✅ 45/45。
- **Step 1 — 统一颜色数学**：语义函数改建在 colorUtils 约定上；删糙重复；重定向 App.jsx / exportV2.js / themeModel.js 的调用点。护栏：export-consistency 必须逐字节不变。**风险点**：单位约定（0–100 vs 0–1）与舍入，需显式处理，不是纯改名。
- **Step 2 — 语义派生上升为 recipe**：预览与导出自此共享一条派生。删除手动同步注释。
- **Step 3 — 预览改走 resolver**：退役 buildVars 引擎；plan 降为预设 I/O，经单一 adapter 接入。App 约 10 处 buildVars 调用点逐个迁移，全程测试护航。
- **Step 4 — 导出目标描述符化**：把 exportCss(v1) / exportV2(v2) 重写成两份描述符 + 一个 emitter。现有测试已钉死两种输出 → 天然护栏。顺带把 `exportCss` 更名 `exportV1`，把 `CHERRY_V1_TARGET/CHERRY_V2_TARGET` 从 exportV2 挪到中性模块。
- **Step 5 — 版本化 schema + 迁移**。
- **Step 6 — App.jsx 拆分**（reducer / useMemo / 组件化）。

任一步之后停下，都是一个更好且可用的工具——这就是「过程」层面的 future-proof。

---

## 诚实的边界

future-proof ≠ 预测一切。本设计只把**你真正会遇到的变化**变便宜：新下游版本（→ Step 4 描述符）、新增 token（→ Step 5 迁移）、UI 生长（→ Step 6）。它不预解决「转去做一个完全不同的问题」——那种事没有架构能预防。

## 在哪里执行

- Step 1–2：纯 JS、测试护栏、开销小 → 可在 chat 里直接改并验绿。
- Step 3–6：动 App.jsx + UI 测试、迭代次数多 → 在 Claude Code（本机、每步跑全套含 vitest）里做最干净也最省。
