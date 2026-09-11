# Theme Station V72 — 迭代計劃日誌

> 當前定稿：v72「預覽優先」主題編輯器（功能無缺，30/30 測試全綠）。
> 這份日誌記錄「已完成」與「待迭代」兩類項目，作為後續每次改動的依據。

---

## 一、當前狀態

- 測試：`npm run test:all` → 30/30（19 導出一致性 + 11 交互）
- 構建：`npm run build` 通過
- 代碼檢查：`npm run lint` 通過
- 乾淨存檔：`theme-station-react.zip`（已排除 `node_modules/`、`dist/`、`.DS_Store`、`*.artifact.json`）

---

## 二、已完成（鎖定，勿回退）

| 功能 | 說明 |
|---|---|
| 預覽優先全屏 | 整個視窗即真實 Cherry Studio 介面，控制元件浮於其上，無左側面板 |
| 明暗切換 | 太陽圖示亮色段選中時為白色 |
| 統一修改（sync） | 改一模式，另一模式換算同步；預設為開 |
| Accent 球 | 雙大圓內小圓點圖示，拖色即改主色 |
| Popover 點擊改色 | 點任意預覽元素開色編輯器，Esc / 點外部關閉 |
| Undo / Redo | Ctrl+Z / Ctrl+Shift+Z，100 步歷史；輸入框內不觸發 |
| 原地改 vs fork v2 | 「直接改此預設」原地寫回；「以此建立新的主題」複製新 draft（預設名 `原名 v2`，名字未鎖死） |
| 浮動 draft 卡 | dock 外，+10% 尺寸，代表「尚未加入」 |
| 毛玻璃 dock | 半透明模糊背景，三橫杆 grip 可拖 |
| 真實 Cherry Studio 匯出 | V72 layered CSS：`body[theme-mode="dark"/"light"]` + shared root + Layer 2 + 結構穿透 |
| 思考框文字 | 預設跟隨 accent，可手動改（`--local-thinking-text`） |
| 表格行底 | `--table-row-bg` 已補並接入 inspector |
| 附件連結色 | `--ant-color-link(-hover)` 接線到 preview `--color-link(-hover)` |
| Alpha 一致性 | preview / selector / 匯出三者含 alpha 完全對齊 |
| 8 個自建 preset | honeyPaw、steelMist、willowMint、berryMeow、violetPurr、sunClay、tealDrift、tangerine chachor（各自專屬 light/dark） |

---

## 三、待迭代（按優先級排序）

### P0 — 穩固性（建議下版先做）

1. **移植原型版對齊測試**：把 `theme-station-github.zip` 內 5 個可移植檔案改寫到本專案 API（`PRESETS`/`buildVars`），鎖死「逐 preset / 逐元素 / 逐 alpha」對齊，避免再靠人工檢查。
   - `export-consistency`、`color-conversion`、`preview-export-match`、`cs-compatibility`、`preset-alignment`

2. **導出改「讀真實渲染 DOM」**：把原型 `bridge.js` 的 `__TS_readModeVars` 思路接進 React 版，讓匯出從渲染態派生，而非並行重建，從根上消除「預覽/導出分叉」。

### P1 — 功能增強（v73 候選）

| 項目 | 工作量 | 備註 |
|---|---|---|
| Ctrl+S 存 draft | 低 | 加一個 keydown 分支呼叫現有 `saveDraft` |
| 複製單個顏色值 | 低 | popover 內按鈕 + `navigator.clipboard` + 既有 toast |
| 重置到 preset 原始 | 低 | `PRESETS` 是源頭，一鍵重放 |
| 導出 JSON | 中 | `varsToPlan` + `JSON.stringify` + blob 下載 |
| Preset 搜尋 | 中 | `PRESETS.filter` + input，純視圖層 |
| 最近使用顏色 | 中 | localStorage 陣列 + popover swatch |
| 導入既有 CSS | 高 | 需 `resolver` 逆函數，處理不完整 CSS 回填與 alpha 正規化 |

### P1 補充（2026-09-10 對話中提出，尚未動工）

| 項目 | 狀態 | 備註 |
|---|---|---|
| Popover 數值輸入框 | 待做 | 色塊旁邊加 R/G/B/alpha 數字輸入，取代純拖色域；校驗 RGB ≤255、alpha ≤1.0，超界報錯 |
| 順藤摸瓜排查 | 待做 | 系統性找「看起來可點、實際沒接上真實 DOM／CSS」的元素，比照 inline-code 那次的排查方式 |
| Popover 拖拽 | 構想中，未拍板 | popover 標題列的三橫杆目前純裝飾，跟 dock 用的是同一個 SVG grip 圖示；若真的做成可拖拽，行為要跟現有 `positionPopover(x,y)` 的自動定位協調（比如切換 zone 時要不要保留上次拖的位置） |
| Oatmilk / Duskstone / Sagemist（原 Ceramic / Morandi / Paper）的 accent | 待決定 | 這三個內建 preset 的 accent 在某次加 v2.0.9 導出功能的 commit（322a686）裡被順手換掉，跟 Kel Meow（現 Apricat）同一批「未經確認的改動」；2026-09-12 改名時沿用的仍是這個未確認的 accent 值，所以新名字也可能要在復原之後重新想一次；目前保留現狀，等使用者要不要也復原 |

### P2 — 打磨（非必須）

- 原地編輯模式的「一鍵還原」進行中狀態條（目前只能逐次 undo）
- 匯出層過濾預覽裝飾變數（如 `--sidebar-glow-*`，Cherry Studio 不讀）
- 偏淺 accent 在亮色模式的自動降暗規則（會動到 shared token，需先權衡）

---

## 四、已確認「不做」

- **不刪 6 個內建 preset**（Apricat、Oatmilk、Duskstone、Sagemist、Fernleaf、Skyglass，2026-09-12 前名為 Kel Meow、Ceramic、Morandi、Paper、Moss、Ocean）——它們與自建 preset 不重複。
- **不追「包體積 / 依賴數」**——對單人設計工具非真實短板（React 稅可接受）。

---

## 五、每次改動的驗證流程

```bash
cd theme-station-react
npm run test:all   # 30/30 全綠
npm run build      # 構建通過
npm run lint       # 代碼檢查通過
```

> 環境提醒：若出現 `vite: command not found`，先跑 `npm install --include=dev`（本機 `NODE_ENV=production` 會跳過 devDependencies）。
