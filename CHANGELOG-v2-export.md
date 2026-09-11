# v2.0.9 导出器修改记录（给 Kimi K3 / 其他协作 AI 同步用）

日期：2026-09-07
影响文件：`src/theme/exportV2.js`、`src/theme/themeModel.js`

## 1. 【根因级 bug，已修复】CSS 注释里的意外 `*/` 提前截断了整份浅色模式代码块

**位置**：`exportV2.js` 生成的 CSS 头部说明注释里有一句
`(--background/--card/--primary/… — what the .bg-*/.text-*/… utilities actually read...)`

`.bg-*/.text-*/…` 这段文字里连续出现了两次字面上的 `*/`。CSS 里 `*/` 就是"注释结束"，
所以这句话把本该延伸到后面的 `/** ... */` 文档注释提前腰斩了。截断点之后、到下一个 `}`
之前的所有内容——也就是紧跟着的整个 `:root:root { ... }`（浅色模式）代码块，上百行——
被浏览器解析成一条无效的选择器+内容，整块静默丢弃。

**这就是整晚"Dark 模式正常、Light 模式怎么改都不生效"的真正原因**——不是 token 映射、
不是选择器、不是特异度问题，是浅色模式那一整块 CSS 压根没被浏览器读到。深色模式的
`:root.dark { ... }` 排在这坨乱码后面，解析器已经恢复正常，所以一直是好的。

**修复**：把那句注释改写成 `.bg-*, .text-*, …`（用逗号分隔，不再有 `*` 紧跟 `/`）。

**给其他 AI 的提醒**：以后往生成的 CSS/JS 字符串里写自然语言说明时，绝对不能在注释文本里
出现字面的 `*/`（CSS 注释）或者在 JS 模板字符串里用反引号 `` ` ``（会提前结束模板字符串）。
这两类"文本内容意外触发语法边界"的错误，今晚一共踩了三次。

## 2. 【真 bug，已修复】`--syntax-operator` 默认值是不可解析的变量引用

**位置**：`themeModel.js` 第 88 行，`--kw-punct` 的默认兜底值原本是字符串
`'var(--color-text-3)'`。这个值在 Theme Station 自己的预览页面里能正常解析（因为预览
页面自己定义了 `--color-text-3`），但导出到 Cherry Studio 后，`--color-text-3` 这个变量名
根本不存在，标点符号/运算符的语法色因此完全失效（除非用户手动设置过 kwPunct）。

**修复**：改成直接用同一份文本三阶色的字面值（`text3`），现在导出的是真正可用的
`rgba(...)` 字面颜色，不再是无法解析的变量引用。

## 3. 【真结构差异，已加穿透修复】会话列表面板颜色

**发现方式**：直接翻 Cherry Studio 官方 GitHub 源码（`ChatAppShell.tsx` /
`ConversationShell.tsx` / `PageSidebar.tsx`）确认——真实 v2.0.9 里，会话列表面板
（`PageSidebar`）本身**没有自己的背景色 class**，是透明的，底下露出来的是它祖先容器
`ConversationShell.tsx` 里那一整块共享的 `bg-background`——跟聊天区是同一层背景。
只有侧边图标栏（`Sidebar.tsx` / `AppShell.tsx`）才用了独立的 `bg-sidebar`。

这不是导出器算错了，是这个版本的真实 UI 结构决定的：列表面板天生没有独立于聊天区的
背景色钩子。

**修复**：利用 `PageSidebar.tsx` 给面板包的 `data-resource-list-pane` 属性，加一条
穿透规则强制刷成 `--sidebar` 的颜色，让它符合 Theme Station 预览"列表面板 = 图标栏
同色，聊天区更浅"的设计意图：

```css
[data-resource-list-pane] {
  background-color: var(--sidebar) !important;
}
```

> ⚠️ **2026-09-10 更正**：这条规则本身没错，但不够——真实当前版本的 DOM 里，
> `[data-resource-list-pane]` 这层要么不存在、要么是透明的外层祖先，真正决定
> 肉眼看到什么颜色的是它内部**另一个**元素 `[data-ui="chat.topic-list"]`
> （`data-testid="resource-list-topic"`），这层直接套了 Tailwind 的 `bg-background`
> （跟聊天区同一个颜色），不透明地整个盖住外层。第 4、7 节里"已验证正确"的结论
> 是当时用旧版/不完整的 DOM 数据得出的，**是错的**。完整更正见第 9 节。

## 4. 已验证正确、无需再改的部分

跑真实 DOM 诊断脚本确认：`.markdown th` 选择器**确实命中真实表格表头元素**
（`matchesOurSelector: true`），背景色 `rgb(240,235,234)` = `#f0ebea`、文字色
`rgb(102,75,71)` = `#664b47`，跟导出的 `--table-header` / `--table-header-text`
逐字节一致。**表格表头这项是对的，不是 bug。**

**Blockquote 也确认是对的。** 用 DevTools Styles 面板直接看，我们的
`.markdown blockquote { ... !important }` 规则三条声明全部生效（无删除线），
Cherry 自己的同名规则、以及 `.text-muted-foreground` 都被正确压制（有删除线）。
之前觉得颜色"跟预期不一样"，是因为测试时实际生效的预设是配色方案为
`complementary`（互补色）的自建 "kelMeow"（2026-09-12 改名为 "honeyPaw"），
不是方案为 `analogous`（邻近色）的官方 "Kel Meow"（2026-09-12 改名为 "Apricat"）——
两者用同一个粉色 accent 算出来的引用文字色本来就不一样，
不是 bug，是不同预设间的正常差异。

## 5.【认知修正，已移除死代码】语法高亮（关键字/字符串/注释等）在两个界面都没有 CSS 钩子

之前判断"常规聊天区代码块走 highlight.js（`.hljs-*` class），只有独立 Shiki 代码
查看器摸不到"——**这个判断从一开始就是错的**。直接翻真实源码
（`CodeBlock.tsx` → `CodeBlockView.tsx` → `CodeViewer.tsx`）确认：只要代码块带
语言标签（几乎所有正常的代码围栏），不管是聊天区还是独立查看器，**全部走同一个
`CodeViewer` 组件**，内部用 `shiki/core` 的 `getReactStyleFromToken` 给每个 token
返回一个 React **内联 `style` 对象**，从来不经过任何 CSS class。

真实 DOM 诊断也印证了这点：`.hljs-keyword` 等七个 class 在真实代码块里**一个都
没找到**。

**处理**：删掉了 `exportV2.js` 里整段 `.markdown .hljs-*` 穿透规则和对应的六个
`--syntax-*` token（`v2Tokens()` 里），这些代码从来没匹配到过任何真实元素，是
纯粹的死代码。语法高亮颜色（关键字/字符串/注释/数字/函数名/运算符）**在 v2.0.9
里就是无法通过自定义 CSS 主题化，两个界面都不行**，只能等 Cherry 官方开放这个
钩子。代码块的**背景色**（`--code-block`）和**行内代码**颜色仍然是可以且已经
正确主题化的，不受影响。

## 6.【真结构差异，已加穿透修复】"思考框"（deep thinking / reasoning 展开框）之前完全没导出

**发现方式**：预览区（`zones.js`）里其实一直有一个独立的"思考框" zone，专属
`--local-thinking-bg` / `--local-thinking-border` / `--local-thinking-text` 三个
token（由 `colors.js` 的 `thinkingOf(accent, dark)` 按 accent 色相算出一套带
颜色倾向的浅色系，不是普通灰）。但 `exportV2.js` 里从头到尾**一次都没提到
"think"**——整个 zone 完全没有导出，是本轮审查漏掉的缺口。

翻真实源码 `ThinkingBlock.tsx` 确认：展开后的内容框用的是 Tailwind `bg-muted`
（通用灰背景，不是我们设计的带色调思考框），文字色是内联
`style="color:var(--muted-foreground)"`（同样是通用色，不是专属思考框文字色）。

**修复**：新增 `--thinking-bg` / `--thinking-border` / `--thinking-text` 三个
token，并加穿透规则（利用 `data-ui="part:message-reasoning"` 这个稳定属性 +
真实的 `.bg-muted` class 定位），外部样式表 `!important` 也能压过元素自带的内联
`color` 样式（作者 `!important` 优先级高于普通内联样式，这点也顺带验证成立）：

```css
[data-ui="part:message-reasoning"] .bg-muted {
  background-color: var(--thinking-bg) !important;
  border: 1px solid var(--thinking-border) !important;
  color: var(--thinking-text) !important;
}
```

## 7. 已验证正确、无需再改的部分（追加）

- **会话列表面板**：~~真实 DOM 里直接查 `[data-resource-list-pane]`，
  `backgroundColor: rgb(238,233,226)` = `#eee9e2`，跟当时预设导出的 `--sidebar`
  逐字节一致，`matches` 也确认规则命中。这项是对的。~~
  **2026-09-10 更正：上面这个结论是错的**，当时查的那层不是实际盖住画面的那层。
  真正生效的元素、以及最终修复，见第 9 节。
- **图标栏（最左侧窄条）背景是透明的（`rgba(0,0,0,0)`），这是 Mac 原生窗口的
  设计**：Cherry 在 Mac 上默认给图标栏用系统毛玻璃透明效果（源码里
  `isMacTransparentWindow ? 'bg-transparent' : 'bg-sidebar'`），不是我们主题没套上。
  如果想要图标栏也强制变成纯色跟列表面板一致，需要额外加一条穿透并放弃这个透明
  质感——**这个待用户决定要不要做，本轮先不动**。
- **Blockquote vs 表格表头"看起来一样"**：直接比对两者真实计算出的颜色值——
  blockquote `bg #f4f2f0 / text #706251`，表格表头 `bg #f0ebea / text #664b47`——
  两组值**并不相同**，只是同属一种低饱和暖褐色系（两者都是从同一个 accent 算出的
  近似色调），视觉上像但数值不同。跟导出的 `--reference*` / `--table-header*`
  逐字节比对，**两项都是对的，没有互相覆盖的问题**。

## 8. 之前已经合并进来、本轮之前就验证过的修复（供背景参考）

- `--resource-list-row-selected/-hover/-active` 映射（对齐预览 `.topic.on` 用
  `--color-primary-soft` 而不是近乎不可见的中性色）
- 新增 `--scrollbar-thumb` / `--scrollbar-thumb-hover`（之前完全没有导出）
- 引用块（blockquote）改成针对 `background-color` / `border-left-color` / `color`
  三个独立属性穿透，不用 border-left 简写，避免破坏宽度/样式
- 表格 `.markdown table` / `.markdown th` / `.markdown td` / 悬停行的选择器和变量
  改成跟 Cherry 真实 `Table.tsx` 对应
- `themeModel.js` 里表格圆角字段名从不存在的 `theme.borderRadius` 改成
  `theme.tableBorderRadius`
- `markdown-alert`（GitHub 风格 `[!NOTE]` 等提示块）加了双类名穿透，因为原生用
  `prefers-color-scheme` 跟系统主题走、不跟 App 自己的明暗切换（DevTools 已验证生效）

## 9. 2026-09-10 补充：系统性联动审查，修了一整类"改了没反应"的 bug

这一批不是零散小修，是用户指出"只要用户一改颜色，所有联动数值都要跟着一次过更新"
这个长期被忽略的要求后，回头系统排查出的一整类同源问题，外加两个只能靠真实 DOM
才能发现的选择器错位。全部改动仅涉及 `App.jsx`、`colors.js`、`exportV2.js`，
45 → 46 个 Node 测试、12 个 Vitest 测试全程保持通过，多数逐条用真实浏览器 /
真实 DOM 验证过。

### 9.1【根因级 bug，已修复】`scheme`（配色方案）在 5 处调用点被静默丢弃

`harmonySurface(accent, mode, scheme)` 根据 `scheme`（`tetradic`/`analogous`/
`monochrome`/`complementary`/`triadic`/`splitComp`/`square`）算出表格表头、
引用块、思考框、代码参数名这几个"跟随 accent 色相联动"的颜色。问题是
`App.jsx` 里有 5 处独立的"从 preset 拿 plan"代码，全都是各自手写的
`p.dark || p` / `p.light || p` 这类临时拼法，只从 preset 顶层结构里拿
`dark`/`light` 字段，从来没把同层的 `scheme` 字段一起带上——`harmonySurface`
拿到 `undefined` 的 `scheme`，默默 fallback 成默认值 `'tetradic'`。

**影响面**：13 个预设里 12 个的表格表头/引用块/代码参数名颜色全部算错
（只有本来就用 `tetradic` 的 Ceramic 巧合看起来对）。

**发现方式**：Theme Station 自己预览区显示的引用色，跟直接拿同样的 accent+mode
调用 `harmonySurface()` 算出来的颜色对不上（浏览器里是偏绿的 `#5f8156`，
脚本里是偏棕的 `#816d56`）——证明不是数学算错，是实际运行路径没把 `scheme`
传进去。

**修复**：新增 `presetPlan(p, modeKey)` 作为唯一正确的"从 preset 取 plan"入口
（会带上 `scheme`），把 5 个调用点（`applyPreset`、`curVars` 初始化、挂载时的
`currentVars.current`、`initDraftBase()`、`currentPreset()`/`draftChipRows()`
里手动拼 plan 的地方）全部换成这个函数。冷启动首次渲染、以及之后实时改
accent，三个联动字段现在都跟 `harmonySurface()` 直接调用结果逐字节一致。

### 9.2【真 bug，已修复】改了 mode 无关的底色后，联动字段"改过一次就永久断链"

`--sidebar`、`--local-input-bg`、`--color-code-background`、
`--table-header(-text)`、`--color-reference*`、`--kw-name` 这些字段，设计上
应该"默认等于另一个字段的值，那个字段变了自己也跟着变"（比如
`--sidebar` 默认跟 `soft` 一样）。但只要这些字段被 `buildVars()` 计算过一次，
`varsToPlan()` 就会把当时算出来的字面值当成"用户显式设置的值"永久存进 plan
——哪怕用户根本没碰过这个字段，只改了它依赖的源字段（比如改了
`--color-background-soft`），这条"跟随"关系从那一刻起永远断掉，因为
plan 里已经有了一个写死的旧值。

**修复**：在 `setVal()` 里加"这个字段现在的值是不是还等于旧的默认推导值"
的判断——如果是，说明用户没手动碰过它，改源字段时就跟着重新推导；如果不是
（用户手动改过），就不动。同一套逻辑本来已经用在 accent → 思考框/表格表头/
引用块/代码参数名 这条链上（见 9.1 的 `applyAccentDependents` helper），这次
把它推广到了 soft/mute → sidebar/input-bg/code-background 这条链。

### 9.3【真 bug，已修复】深浅模式互转时，文字色被错误地按背景色的逻辑处理

`convertColor()` 按 `varKind()` 分类处理颜色转换，`panel` 这个分类专门处理
"背景类"变量，把亮度硬夹到 100（浅色模式）或 19（深色模式）——这对真正的背景色
是对的，但 `--table-header-text` / `--color-reference-text` 这两个其实是**文字色**
的变量之前也被归到了 `panel` 类，导致"统一修改"跨模式同步时这两个文字色被夹成
接近纯白/纯黑，而不是正常的文字色系。

**修复**：新增专门的 `panelText` 分类（亮度夹在 25–40 浅色 / 65–82 深色，跟真实
文字色的亮度范围一致），`varKind()` 里 `--table-header-text` /
`--color-reference-text` 改归到这一类。验证：深色模式 `#ff0000` 转浅色模式前是
`#ffffff`（错），修复后是 `#8a4242`（对）。

### 9.4【真 bug，已修复】对着自己当前正在编辑的预设点"复制 CSS"，吐出来的是编辑前的旧值

`copyPreset(name)` 不管你传进来的 `name` 是不是当前正在编辑、界面上已经改了颜色
的那个预设，一律先从 `presetsRef.current`（上次保存的旧数据）里找，找到就用旧的，
根本不看当前实际显示在画面上的颜色。用户编辑某个已保存预设的颜色后，直接点那个
预设自己的"复制 CSS"，导出的还是编辑前的颜色，编辑等于白改。

**修复**：先判断 `name` 是不是当前选中且正在编辑的预设，是的话直接用当前实时的
`curVars`，不去翻旧的保存数据。验证：把 kelMeow 的列表面板色从 `#efede7`
改成 `#8e9099`，同预设自己的复制 CSS 现在正确输出 `#8e9099`。

### 9.5【真结构差异，已加穿透修复】会话列表面板——更正第 3/7 节

用户提供了当前真实运行版本的完整 HTML DOM（不是翻源码猜的）：第 3 节里
`[data-resource-list-pane]` 这个属性在真实 DOM 里**根本不存在**，实际那层
不透明、真正决定画面颜色的元素是：

```html
<div data-resource-list-presentation="left-panel" ... class="... bg-background ..."
     data-ui="chat.topic-list" data-testid="resource-list-topic">
```

它直接套用 Tailwind 的 `bg-background`（跟聊天区同一个颜色 token），不透明地
盖住了外层。**修复**：加一条新规则一起命中这层，两条规则保留（`data-resource-list-pane`
万一在其他版本/状态下存在也不浪费）：

```css
[data-resource-list-pane] {
  background-color: var(--sidebar) !important;
}
[data-ui="chat.topic-list"] {
  background-color: var(--sidebar) !important;
}
```

**已在用户真实、当前安装的 Cherry Studio 里贴入验证，肉眼确认列表面板颜色
现在跟图标栏一致，不再跟聊天区一样。**

### 9.6【真结构差异，已加穿透修复】代码块背景选择器漏了最常见的那层

`CodeViewer.tsx` 源码里根元素 class 固定是 `code-viewer`（两个渲染分支都有），
但裸 `shiki` class 只在其中一个分支（Shiki 主题注册没提供 `properties.class`
时）才会附加上。原本的选择器 `.markdown pre, .tiptap pre, .shiki, .prose pre`
在另一个分支里可能完全打不中任何东西。**修复**：加上 `.code-viewer`，现在是
`.markdown pre, .tiptap pre, .shiki, .prose pre, .code-viewer`，覆盖两个分支。

## 10. 2026-09-12 补充：`body` 层重新定义了 Layer 4 变量，`:root` 那份传不下去

**位置**：`exportV2.js` 的 `v2Tokens`（拆成 `v2BaseTokens` + `v2CherryTokens`）、`buildV2Css`。

**现象**：quote block（`--reference`/`--reference-subtle`/`--reference-foreground`）跟
user 气泡底色（`--chat-user`）在暗色模式下颜色对不上导出的 CSS——即使反复确认过：注入的
`<style id="user-defined-custom-css">` 里变量值完全正确、Streamdown 选择器也确认命中、
DevTools Styles 面板也确认我们那条规则本身没被别的规则打败，实际算出来的颜色还是不对。

**根因**（用户本人在真实 Cherry Studio 里用 DevTools 沿着祖先链逐层排查找到的）：Cherry
Studio 自己的原生主题，直接在 `<body class="dark">` 这一层，也定义了一份这几个变量的原生
默认值。CSS 自定义属性靠继承传值——只要某个元素自己就有这个变量的声明，不管祖先层写得
多凶、`!important` 加多少层、specificity 多高，都传不下去，因为这根本不是"哪条规则赢"的
级联问题，是"body 自己已经有一份，不用问 `:root` 要"。`:root:root`/`:root.dark` 挂在
`<html>` 上，而实际内容都在 `<body>` 里面——只要 body 自己重新定义了同名变量，`:root`
那份无论如何都传不到 body 的任何子孙元素。

用同样的方法核对过其它变量层级，确认只有 Layer 4（"Cherry product semantics"：
`--reference*`、`--chat-user`、`--link`、`--code-block`、`--thinking-*`、`--table-*` 等）
会被这样劫持；Layer 1–3（`--color-*`、`--cs-*`、裸 shadcn 别名）在 `:root` 跟 `body`
两层读出来完全一致，不受影响。

**修复**：`v2Tokens` 拆成 `v2BaseTokens`（Layer 1–3，行为不变）+ `v2CherryTokens`
（Layer 4）。`buildV2Css` 在原本挂在 `:root:root`/`:root.dark` 的完整输出之外，新增两块
只含 Layer 4、且每条声明都带 `!important` 的 `body`/`body.dark` 重新声明（新增的
`tokenBlockImportant`），让 body 自己的继承链从我们的值开始，不用去问传不到的 `:root`。

已用 DevTools 逐层追踪确认修复前后的差异（真实值：body 层原本读到
`--reference-subtle: #0b0e12`，`html` 层是对的 `#374341`），也用模拟同款遮蔽规则的隔离
测试验证过新代码能反制它，最后在用户真实、当前安装的 Cherry Studio 里重新套用导出的
CSS 后肉眼 + DevTools 双重验证：`html`/`body` 两层七个变量（含三个不受影响的作对照）
全部一致。

## 结论：本轮排查的所有问题都已解决或确认无 bug

到这里，从 09-07 到 09-10 两轮排查提出的每一项都有了明确结论：

| 项目 | 结论 |
|---|---|
| Light 模式 accent 完全不生效 | 已修复（1. 注释 `*/` 提前截断 bug） |
| 语法标点色导出成不可用的变量引用 | 已修复（2） |
| 表格表头颜色 | 确认本来就是对的（4） |
| Blockquote 颜色 | 确认本来就是对的（4、7） |
| 语法高亮（关键字/字符串/注释…） | 确认 v2.0.9 架构限制，两个界面都做不到，已移除死代码（5） |
| 思考框颜色完全没导出 | 已修复（6，新增 zone） |
| 图标栏透明 | Mac 原生设计，非 bug（7），仍悬而未决要不要放弃这个质感 |
| markdown-alert（NOTE/WARNING） | 确认已生效（8） |
| 表格表头/引用块/思考框/代码参数名 12/13 预设算错 | 已修复（9.1，`scheme` 丢失 bug） |
| sidebar/input-bg/code-background 改一次后断链 | 已修复（9.2） |
| 表格表头文字色/引用文字色跨模式转换被夹成纯白/纯黑 | 已修复（9.3，新增 `panelText`） |
| 编辑中的预设点自己的"复制 CSS"吐旧值 | 已修复（9.4） |
| **会话列表面板颜色跟聊天区一样** | **已修复（9.5，更正第 3/7 节的错误结论），已在真实 App 里肉眼验证** |
| 代码块背景选择器漏掉一个渲染分支 | 已修复（9.6） |
| Quote block / user 气泡底色暗色模式颜色不对，变量本身/选择器/规则胜负都确认没问题 | 已修复（10，`body` 层遮蔽了 Layer 4 变量），已在真实 App 里 DevTools 验证 |

**唯一还悬而未决、需要用户自己决定的一点**：图标栏要不要放弃 Mac 原生透明质感、
强制刷成跟列表面板一样的纯色。其余全部已修复，且关键项（列表面板）已在用户
真实、当前安装的 Cherry Studio 里肉眼验证生效，不只是 Theme Station 自己的预览。
