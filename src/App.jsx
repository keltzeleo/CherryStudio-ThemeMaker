import { useEffect, useRef, useState } from 'react'
import { PRESETS, DEFAULT_GLOW } from './theme/presets.js'
import { ZONES, VAR_LINKS } from './theme/zones.js'
import { VAR_KEYS, varsToPlan, presetPlan, buildVars, buildPresetCss } from './theme/themeModel.js'
import { CHERRY_V1_TARGET, CHERRY_V2_TARGET } from './theme/exportV2.js'
import { linkHoverOf, convertColor, varKind, thinkingOf } from './utils/colors.js'
import { parseColor, roundAlpha, wcagContrast, toHex, rgbaWithAlpha } from './utils/colorUtils.js'

// 解析一个色值，得到纯 hex 与透明度；跟随 var(--x) 引用到真实颜色，
// 这样 selector 里显示的颜色才和预览逐像素一致（含 alpha）。
function resolveColor(value) {
  let s = value
  let guard = 0
  while (typeof s === 'string' && guard++ < 8) {
    const m = /^var\((--[\w-]+)\s*(?:,\s*([^)]*))?\)/.exec(s)
    if (!m) break
    const next = document.documentElement.style.getPropertyValue(m[1])
    if (!next) { s = m[2] ? m[2].trim() : '#000000'; break }
    s = next
  }
  return s
}

function hexOf(color) {
  const { r, g, b } = parseColor(color)
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function alphaOf(color) {
  return parseColor(color).a
}

// 用给定透明度合成最终颜色：不透明用纯 hex，带透明用 rgba。
function withAlpha(color, alpha) {
  if (alpha >= 1) return hexOf(color)
  const { r, g, b } = parseColor(color)
  return `rgba(${r},${g},${b},${roundAlpha(alpha)})`
}

function randomOf(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function Kw({ kw, children }) {
  return <span className="kwz pz" data-kw={kw} data-zone={'kw' + kw}>{children}</span>
}

const CODE_LINES = [
  <Kw kw="comment" key="l0">// Theme preview — syntax colors</Kw>, '\n',
  <Kw kw="keyword" key="l1a">import</Kw>, ' ', <Kw kw="name" key="l1b">useState</Kw>, ' ', <Kw kw="keyword" key="l1c">from</Kw>, ' ', <Kw kw="string" key="l1d">'react'</Kw>, <Kw kw="punct" key="l1e">;</Kw>, '\n',
  <Kw kw="keyword" key="l2a">const</Kw>, ' ', <Kw kw="name" key="l2b">THEME</Kw>, ' ', <Kw kw="punct" key="l2c">=</Kw>, ' ', <Kw kw="string" key="l2d">'V72'</Kw>, <Kw kw="punct" key="l2e">;</Kw>, '\n',
  <Kw kw="keyword" key="l3a">export</Kw>, ' ', <Kw kw="keyword" key="l3b">const</Kw>, ' ', <Kw kw="name" key="l3c">config</Kw>, ' ', <Kw kw="punct" key="l3d">=</Kw>, ' ', <Kw kw="punct" key="l3e">{'{'}</Kw>, '\n',
  '  ', <Kw kw="name" key="l4a">primary</Kw>, <Kw kw="punct" key="l4b">:</Kw>, ' ', <Kw kw="string" key="l4c">'#E89975'</Kw>, <Kw kw="punct" key="l4d">,</Kw>, '\n',
  '  ', <Kw kw="name" key="l5a">darkMode</Kw>, <Kw kw="punct" key="l5b">:</Kw>, ' ', <Kw kw="literal" key="l5c">true</Kw>, <Kw kw="punct" key="l5d">,</Kw>, '\n',
  '  ', <Kw kw="name" key="l6a">opacity</Kw>, <Kw kw="punct" key="l6b">:</Kw>, ' ', <Kw kw="literal" key="l6c">0.85</Kw>, <Kw kw="punct" key="l6d">,</Kw>, '\n',
  '  ', <Kw kw="name" key="l7a">name</Kw>, <Kw kw="punct" key="l7b">:</Kw>, ' ', <Kw kw="literal" key="l7c">null</Kw>, <Kw kw="punct" key="l7d">,</Kw>, '\n',
  <Kw kw="punct" key="l8a">{'};'}</Kw>, '\n',
  <Kw kw="keyword" key="l9a">async</Kw>, ' ', <Kw kw="keyword" key="l9b">function</Kw>, ' ', <Kw kw="name" key="l9c">apply</Kw>, <Kw kw="punct" key="l9d">(</Kw>, <Kw kw="name" key="l9e">name</Kw>, <Kw kw="punct" key="l9f">)</Kw>, ' ', <Kw kw="punct" key="l9g">{'{'}</Kw>, '\n',
  '  ', <Kw kw="keyword" key="l10a">const</Kw>, ' ', <Kw kw="name" key="l10b">res</Kw>, ' ', <Kw kw="punct" key="l10c">=</Kw>, ' ', <Kw kw="keyword" key="l10d">await</Kw>, ' ', <Kw kw="name" key="l10e">fetch</Kw>, <Kw kw="punct" key="l10f">(</Kw>, <Kw kw="string" key="l10g">`/theme/${name}`</Kw>, <Kw kw="punct" key="l10h">)</Kw>, <Kw kw="punct" key="l10i">;</Kw>, '\n',
  '  ', <Kw kw="keyword" key="l11a">if</Kw>, ' ', <Kw kw="punct" key="l11b">(</Kw>, <Kw kw="punct" key="l11c">!</Kw>, <Kw kw="name" key="l11d">res</Kw>, <Kw kw="punct" key="l11e">.</Kw>, <Kw kw="name" key="l11f">ok</Kw>, <Kw kw="punct" key="l11g">)</Kw>, ' ', <Kw kw="keyword" key="l11h">return</Kw>, ' ', <Kw kw="literal" key="l11i">false</Kw>, <Kw kw="punct" key="l11j">;</Kw>, '\n',
  '  ', <Kw kw="keyword" key="l12a">return</Kw>, ' ', <Kw kw="name" key="l12b">res</Kw>, <Kw kw="punct" key="l12c">.</Kw>, <Kw kw="name" key="l12d">json</Kw>, <Kw kw="punct" key="l12e">()</Kw>, '\n',
  <Kw kw="punct" key="l13a">{'}'}</Kw>, '\n',
  <Kw kw="comment" key="l14">// string · literal · comment · name · keyword · punct — all editable</Kw>,
]

function ColorRow({ part, value, onChange, onCommit }) {
  const resolved = resolveColor(value)
  const hex = hexOf(resolved)
  const alpha = alphaOf(resolved)
  const hasAlpha = alpha < 1
  return (
    <div className="prow" key={part.v}>
      <span className="chip" style={{ '--c': resolved }} />
      <span className="lb">{part.label}</span>
      <span className="val">{value}</span>
      <input type="color" value={hex} title={part.label}
        onInput={e => onChange(withAlpha(e.target.value, alpha))}
        onBlur={onCommit} />
      {hasAlpha && (
        <input type="range" className="alpha" min="0" max="1" step="0.01" value={alpha}
          title={part.label + ' 透明度'}
          onInput={e => onChange(withAlpha(hex, parseFloat(e.target.value)))}
          onBlur={onCommit} />
      )}
    </div>
  )
}

function RangeRow({ part, value, onChange, onCommit }) {
  return (
    <div className="prow" key={part.v}>
      <span className="lb">{part.label}</span>
      <input type="range" min={part.min} max={part.max} step={part.step || 1} value={value} title={part.label}
        onInput={e => onChange(e.target.value)}
        onBlur={onCommit} />
      <span className="val">{value}{part.unit || ''}</span>
    </div>
  )
}

function App() {
  const [mode, setMode] = useState('dark')
  const [exportTarget, setExportTarget] = useState(CHERRY_V1_TARGET)
  const [selName, setSelName] = useState('Kel Meow')
  const [presets, setPresets] = useState(PRESETS)
  const [draft, setDraft] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [popover, setPopover] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [editChoiceMask, setEditChoiceMask] = useState(false)
  const [editChoiceName, setEditChoiceName] = useState('')
  const [leaveMask, setLeaveMask] = useState(false)
  const [leaveNameMode, setLeaveNameMode] = useState(false)
  const [leaveNameVal, setLeaveNameVal] = useState('')
  const [tableHl, setTableHl] = useState(false)
  const [sync, setSync] = useState(true)
  const [inPlace, setInPlace] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [pageStr, setPageStr] = useState('1')
  const [, setTick] = useState(0)

  const currentVars = useRef({})
  const [curVars, setCurVars] = useState(() => buildVars(PRESETS[0].dark || PRESETS[0], PRESETS[0].glow))
  const presetsRef = useRef(PRESETS)
  const selNameRef = useRef('Kel Meow')
  const modeRef = useRef('dark')
  const exportTargetRef = useRef(CHERRY_V1_TARGET)
  const draftRef = useRef(false)
  const syncRef = useRef(true)
  const baseRef = useRef(null)
  const modeSnapshotsRef = useRef({ dark: null, light: null })
  const [snaps, setSnaps] = useState({ dark: null, light: null })
  const syncSnapState = () => setSnaps({ dark: modeSnapshotsRef.current.dark, light: modeSnapshotsRef.current.light })
  const inPlaceRef = useRef(false)
  const editChoiceRef = useRef(null)
  const editChoicePendingRef = useRef(null)
  const pendingLeaveRef = useRef(null)
  const historyRef = useRef([])
  const hposRef = useRef(-1)
  const selElRef = useRef(null)
  const toastTimer = useRef(null)
  const stripRef = useRef(null)
  const dragRef = useRef(null)
  const popoverRef = useRef(null)
  const drawerLeaveTimer = useRef(null)
  const leaveNameInputRef = useRef(null)
  const accentInputRef = useRef(null)

  useEffect(() => { presetsRef.current = presets })
  useEffect(() => { selNameRef.current = selName })
  useEffect(() => { modeRef.current = mode })
  useEffect(() => { exportTargetRef.current = exportTarget })
  useEffect(() => { draftRef.current = draft })
  useEffect(() => { syncRef.current = sync })
  useEffect(() => { inPlaceRef.current = inPlace })

  const cssVar = k => currentVars.current[k] ?? ''

  // 统一修改：改当前模式颜色时，按转换规则写入另一模式的快照（切过去即生效）
  const ensureOtherSnapshot = () => {
    const other = modeRef.current === 'dark' ? 'light' : 'dark'
    if (modeSnapshotsRef.current[other]) return modeSnapshotsRef.current[other]
    const p = presetsRef.current.find(x => x.name === selNameRef.current)
    const plan = (p && presetPlan(p, other)) || null
    // 另一模式优先用该模式自己的预设配色铺底，避免被当前模式污染
    modeSnapshotsRef.current[other] = plan
      ? buildVars(plan, p?.glow)
      : { ...(baseRef.current || snapCurrentVars()) }
    syncSnapState()
    return modeSnapshotsRef.current[other]
  }

  const syncToOtherMode = (cssVarName, newValue, kind) => {
    if (!syncRef.current) return
    const other = modeRef.current === 'dark' ? 'light' : 'dark'
    const tgt = ensureOtherSnapshot()
    tgt[cssVarName] = convertColor(newValue, kind, other)
    if (kind === 'accent') {
      const newAccent = convertColor(newValue, kind, other)
      tgt['--local-thinking-bg'] = thinkingOf(newAccent, other === 'dark').bg
      tgt['--local-thinking-border'] = thinkingOf(newAccent, other === 'dark').border
      tgt['--local-thinking-text'] = thinkingOf(newAccent, other === 'dark').text
      tgt['--color-active'] = rgbaWithAlpha(newAccent, other === 'dark' ? 0.12 : 0.08)
      tgt['--color-primary-mute'] = rgbaWithAlpha(newAccent, 0.3)
      tgt['--color-primary-soft'] = rgbaWithAlpha(newAccent, 0.6)
    }
    syncSnapState()
  }

  const onSyncChange = checked => {
    setSync(checked)
    syncRef.current = checked
    if (checked && baseRef.current !== null) {
      const cur = modeRef.current
      const other = cur === 'dark' ? 'light' : 'dark'
      const tgt = ensureOtherSnapshot()
      const curSnap = snapCurrentVars()
      const SYNC_KEYS = ['--color-primary', '--color-background', '--color-background-soft',
        '--chat-background-user', '--chat-text-user', '--chat-background-ai', '--color-code-background', '--local-input-bg']
      SYNC_KEYS.forEach(v => { if (curSnap[v]) tgt[v] = convertColor(curSnap[v], varKind(v), other) })
      if (curSnap['--color-primary']) {
        tgt['--local-thinking-bg'] = thinkingOf(curSnap['--color-primary'], other === 'dark').bg
        tgt['--local-thinking-border'] = thinkingOf(curSnap['--color-primary'], other === 'dark').border
        tgt['--local-thinking-text'] = thinkingOf(curSnap['--color-primary'], other === 'dark').text
        tgt['--color-active'] = rgbaWithAlpha(curSnap['--color-primary'], other === 'dark' ? 0.12 : 0.08)
      }
      syncSnapState()
      toast('已开启统一修改 · 当前配色已同步另一模式')
    } else {
      toast(checked ? '已开启统一修改' : '已关闭统一修改（两模式独立）')
    }
  }

  const writeVars = o => {
    const r = document.documentElement
    Object.entries(o).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      r.style.setProperty(k, v)
      currentVars.current[k] = v
    })
    const statePatch = { ...o }
    if (o['--color-primary']) {
      const s = rgbaWithAlpha(o['--color-primary'], 0.6)
      const m = rgbaWithAlpha(o['--color-primary'], 0.3)
      r.style.setProperty('--color-primary-soft', s)
      r.style.setProperty('--color-primary-mute', m)
      currentVars.current['--color-primary-soft'] = s
      currentVars.current['--color-primary-mute'] = m
      statePatch['--color-primary-soft'] = s
      statePatch['--color-primary-mute'] = m
    }
    setCurVars(prev => ({ ...prev, ...statePatch }))
  }

  const setVar = (k, v) => {
    writeVars({ [k]: v })
  }

  const applyPreset = p => writeVars(buildVars(presetPlan(p, modeRef.current), p.glow))

  const snapCurrentVars = () => {
    const o = {}
    VAR_KEYS.forEach(k => { o[k] = cssVar(k) })
    return o
  }

  const snapshotColors = () => varsToPlan(currentVars.current)

  const draftChipRows = () => {
    if (!draft) return null
    const darkVars = mode === 'dark' ? curVars : (snaps.dark || buildVars(varsToPlan(curVars), DEFAULT_GLOW))
    const lightVars = mode === 'light' ? curVars : (snaps.light || buildVars(varsToPlan(curVars), DEFAULT_GLOW))
    return {
      dark: swatchRow(varsToPlan(darkVars)),
      light: swatchRow(varsToPlan(lightVars)),
    }
  }

  const currentPreset = name => {
    const cur = snapshotColors()
    const selP = presetsRef.current.find(x => x.name === selNameRef.current)
    const snapOther = modeSnapshotsRef.current && (mode === 'dark' ? modeSnapshotsRef.current.light : modeSnapshotsRef.current.dark)
    const otherDark = snapOther ? varsToPlan(snapOther) : (selP?.dark || cur)
    const otherLight = snapOther ? varsToPlan(snapOther) : (selP?.light || cur)
    return {
      name: name || draftName || `我的主题 ${presets.length + 1}`,
      cert: '自建', own: true, glow: DEFAULT_GLOW.map((_, i) => cssVar('--sidebar-glow-' + (i + 1))),
      dark: mode === 'dark' ? cur : otherDark,
      light: mode === 'light' ? cur : otherLight,
    }
  }

  const getVal = p => {
    if (p.kind === 'range') { const n = parseFloat(curVars[p.v]); return isNaN(n) ? p.def : n }
    if (p.v === '--color-link-hover') return curVars[p.v] || linkHoverOf(curVars['--color-link'] || '', mode === 'dark')
    let v = curVars[p.v]
    if (!v && p.v === '--table-border') v = curVars['--color-border']
    return v
  }

  const setVal = (p, val) => {
    if (p.v === '--color-link-hover') { setVar(p.v, val); syncToOtherMode(p.v, val, varKind(p.v)); return }
    if (p.v === '--color-primary') {
      const hex = toHex(val)
      const prevAccent = cssVar('--color-primary')
      const curDark = modeRef.current === 'dark'
      setVar('--color-primary', hex)
      if (prevAccent && cssVar('--local-thinking-text') === thinkingOf(prevAccent, curDark).text) {
        setVar('--local-thinking-bg', thinkingOf(hex, curDark).bg)
        setVar('--local-thinking-border', thinkingOf(hex, curDark).border)
        setVar('--local-thinking-text', thinkingOf(hex, curDark).text)
      }
      syncToOtherMode('--color-primary', hex, 'accent')
      return
    }
    setVar(p.v, p.kind === 'range' ? val + (p.unit || '') : val)
    if (p.kind !== 'range') syncToOtherMode(p.v, val, varKind(p.v))
  }

  const toast = m => {
    setToastMsg(m)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 1500)
  }

  const syncHistoryState = () => {
    setCanUndo(hposRef.current > 0)
    setCanRedo(hposRef.current >= 0 && hposRef.current < historyRef.current.length - 1)
  }

  const commitInPlace = () => {
    if (!inPlaceRef.current) return
    const name = selNameRef.current
    const p = presetsRef.current.find(x => x.name === name)
    if (!p) return
    const upd = { ...p }
    const cur = modeRef.current
    const other = cur === 'dark' ? 'light' : 'dark'
    const otherSnap = modeSnapshotsRef.current[other]
    if (cur === 'dark') {
      upd.dark = snapshotColors()
      if (otherSnap) upd.light = varsToPlan(otherSnap)
    } else {
      upd.light = snapshotColors()
      if (otherSnap) upd.dark = varsToPlan(otherSnap)
    }
    setPresets(ps => ps.map(x => (x.name === name ? upd : x)))
  }

  const initDraftBase = () => {
    if (baseRef.current !== null) return
    baseRef.current = snapCurrentVars()
    const p = presetsRef.current.find(x => x.name === selNameRef.current)
    if (p && (p.dark || p.light)) {
      modeSnapshotsRef.current.dark = buildVars(p.dark || p, p.glow)
      modeSnapshotsRef.current.light = buildVars(p.light || p, p.glow)
    } else {
      modeSnapshotsRef.current = { dark: null, light: null }
    }
    syncSnapState()
    if (!inPlaceRef.current) setDraft(true)
  }

  const beginHistory = () => {
    initDraftBase()
    if (historyRef.current.length === 0) { historyRef.current = [baseRef.current]; hposRef.current = 0 }
    syncHistoryState()
  }

  const commitHistory = () => {
    historyRef.current = historyRef.current.slice(0, hposRef.current + 1)
    historyRef.current.push(snapCurrentVars())
    hposRef.current = historyRef.current.length - 1
    syncHistoryState()
    commitInPlace()
  }

  const resetHistory = () => { historyRef.current = []; hposRef.current = -1; syncHistoryState() }

  const undo = () => {
    if (hposRef.current <= 0) return
    hposRef.current--
    writeVars(historyRef.current[hposRef.current])
    setTick(t => t + 1)
    syncHistoryState()
    commitInPlace()
    toast('已撤销')
  }

  const redo = () => {
    if (hposRef.current >= historyRef.current.length - 1) return
    hposRef.current++
    writeVars(historyRef.current[hposRef.current])
    setTick(t => t + 1)
    syncHistoryState()
    commitInPlace()
    toast('已重做')
  }

  const cancelDraft = () => {
    if (baseRef.current === null) return
    modeSnapshotsRef.current = { dark: null, light: null }
    writeVars(baseRef.current)
    syncSnapState()
    setDraft(false)
    inPlaceRef.current = false
    setInPlace(false)
    baseRef.current = null
    resetHistory()
  }

  const uniqueName = base => {
    const names = new Set(presetsRef.current.map(x => x.name))
    if (!names.has(base)) return base
    let i = 2
    while (names.has(`${base} ${i}`)) i++
    return `${base} ${i}`
  }

  const saveDraft = name => {
    const finalName = uniqueName(name)
    const p = currentPreset(finalName)
    setPresets(ps => [p, ...ps])
    setSelName(p.name)
    selNameRef.current = p.name
    setDraft(false)
    inPlaceRef.current = false
    setInPlace(false)
    baseRef.current = null
    resetHistory()
    toast(`已保存预设 · ${p.name}`)
  }

  const guardLeaveDraft = onProceed => {
    if (!draft) { if (onProceed) onProceed(); return }
    pendingLeaveRef.current = onProceed
    setLeaveMask(true)
  }

  const dismissLeave = () => {
    setLeaveMask(false)
    setLeaveNameMode(false)
    pendingLeaveRef.current = null
  }

  const doLeaveDiscard = () => {
    cancelDraft()
    const f = pendingLeaveRef.current
    dismissLeave()
    if (f) f()
  }

  const showLeaveName = () => {
    setLeaveNameMode(true)
    setLeaveNameVal(draftName || `我的主题 ${presets.length + 1}`)
  }

  const hideLeaveName = () => setLeaveNameMode(false)

  const doLeaveSave = () => {
    const name = leaveNameVal.trim() || `我的主题 ${presets.length + 1}`
    saveDraft(name)
    const f = pendingLeaveRef.current
    dismissLeave()
    if (f) f()
  }

  const delPreset = name => {
    const idx = presetsRef.current.findIndex(x => x.name === name)
    if (idx < 0) return
    const wasSel = selNameRef.current === name
    const next = [...presetsRef.current]
    next.splice(idx, 1)
    setPresets(next)
    if (wasSel) {
      const p = next[0]
      setSelName(p ? p.name : null)
      selNameRef.current = p ? p.name : null
      if (p) applyPreset(p)
    }
    toast('已删除预设')
  }

  const selectPreset = name => {
    modeSnapshotsRef.current = { dark: null, light: null }
    syncSnapState()
    setSelName(name)
    selNameRef.current = name
  }

  const setModeTo = m => {
    const cur = modeRef.current
    if (cur === m) return
    modeSnapshotsRef.current[cur] = snapCurrentVars()
    syncSnapState()
    modeRef.current = m
    setMode(m)
    document.documentElement.setAttribute('data-mode', m)
    if (modeSnapshotsRef.current[m]) {
      writeVars(modeSnapshotsRef.current[m])
    } else {
      const p = presetsRef.current.find(x => x.name === selNameRef.current) || presetsRef.current[0]
      if (p) applyPreset(p)
    }
    setTick(t => t + 1)
    toast(m === 'dark' ? '已切到 Dark' : '已切到 Light')
  }

  const startEdit = afterFn => {
    if (baseRef.current === null) {
      const selP = presetsRef.current.find(x => x.name === selNameRef.current)
      if (selP && selP.own && editChoiceRef.current === null) {
        setEditChoiceName(selP.name)
        setEditChoiceMask(true)
        editChoicePendingRef.current = afterFn
        return false
      }
    }
    return true
  }

  const chooseEditInPlace = () => {
    editChoiceRef.current = 'edit'
    inPlaceRef.current = true
    setInPlace(true)
    setEditChoiceMask(false)
    const fn = editChoicePendingRef.current
    editChoicePendingRef.current = null
    if (fn) fn()
    editChoiceRef.current = null
  }

  const chooseNewDraft = () => {
    editChoiceRef.current = 'new'
    inPlaceRef.current = false
    setInPlace(false)
    setEditChoiceMask(false)
    setDraftName(`${editChoiceName} v2`)
    initDraftBase()
    const fn = editChoicePendingRef.current
    editChoicePendingRef.current = null
    if (fn) fn()
    editChoiceRef.current = null
  }

  const onAccentBallChange = v => {
    if (!startEdit(() => onAccentBallChange(v))) return
    initDraftBase()
    const prevAccent = cssVar('--color-primary')
    const curDark = modeRef.current === 'dark'
    setVar('--color-primary', v)
    setVar('--color-active', rgbaWithAlpha(v, modeRef.current === 'dark' ? 0.12 : 0.08))
    if (prevAccent && cssVar('--local-thinking-text') === thinkingOf(prevAccent, curDark).text) {
      setVar('--local-thinking-bg', thinkingOf(v, curDark).bg)
      setVar('--local-thinking-border', thinkingOf(v, curDark).border)
      setVar('--local-thinking-text', thinkingOf(v, curDark).text)
    }
    syncToOtherMode('--color-primary', v, 'accent')
    setTick(t => t + 1)
    commitHistory()
    toast('主色已更新' + (syncRef.current ? ' · 已同步另一模式' : ''))
  }

  const copyPreset = name => {
    // Copying the CURRENTLY ACTIVE preset must reflect any live, unsaved edits —
    // presetsRef.current still holds the last-SAVED snapshot, which goes stale
    // the moment you tweak a color without explicitly saving it back. Only a
    // different (not currently loaded) preset can safely be read from storage.
    const isActive = name === selNameRef.current
    const p = isActive ? null : presetsRef.current.find(x => x.name === name)
    const css = p ? buildPresetCss(p, exportTarget) : buildPresetCss(currentPreset(name), exportTarget)
    copyText(css).then(ok => toast(ok ? '已复制完整 Cherry Studio CSS' : '复制失败，请手动复制'))
  }

  const getZone = t => {
    const el = t.closest('.pz')
    if (!el) return null
    const zone = ZONES[el.dataset.zone]
    if (!zone) return null
    return { el, zone, id: el.dataset.zone }
  }

  const positionPopover = (x, y) => {
    const box = popoverRef.current
    if (!box) return
    box.style.left = '0px'
    box.style.top = '0px'
    const r = box.getBoundingClientRect()
    let L = x + 12, T = y + 12
    if (L + r.width > window.innerWidth - 12) L = x - r.width - 12
    if (T + r.height > window.innerHeight - 12) T = Math.max(12, y - r.height - 12)
    box.style.left = Math.max(12, L) + 'px'
    box.style.top = Math.max(12, T) + 'px'
  }

  const openPopover = (hit, x, y) => {
    if (baseRef.current === null) {
      const selP = presetsRef.current.find(p => p.name === selNameRef.current)
      if (selP && selP.own && editChoiceRef.current === null) {
        setEditChoiceName(selP.name)
        setEditChoiceMask(true)
        editChoicePendingRef.current = () => openPopover(hit, x, y)
        return
      }
    }
    if (selElRef.current) selElRef.current.classList.remove('pick-sel')
    selElRef.current = hit.el
    hit.el.classList.add('pick-sel')
    beginHistory()
    setPopover({ id: hit.id, x, y })
  }

  const closePopover = () => {
    setPopover(null)
    if (selElRef.current) {
      selElRef.current.classList.remove('pick-sel')
      selElRef.current = null
    }
  }

  const clearLinks = () => document.querySelectorAll('.pz-link').forEach(el => el.classList.remove('pz-link'))

  const onPresetClick = e => {
    const del = e.target.closest('.del')
    if (del) { e.stopPropagation(); delPreset(del.closest('.preset').dataset.name); return }
    const cp = e.target.closest('.copycss')
    if (cp) {
      const vis = parseFloat(getComputedStyle(cp).opacity) > 0.5
      if (vis) { e.stopPropagation(); e.preventDefault(); copyPreset(cp.closest('.preset').dataset.name); return }
    }
    if (e.target.closest('input')) return
    const card = e.target.closest('.preset')
    if (!card) return
    if (card.id === 'draftcard') return
    const name = card.dataset.name
    const p = presetsRef.current.find(x => x.name === name)
    if (!p) return
    guardLeaveDraft(() => { selectPreset(name); applyPreset(p); toast(`已切换到预设 · ${p.name}`) })
  }

  const onStripPointerDown = e => {
    if (e.target.closest('.preset') || e.target.closest('.preset-drawer') || e.target.closest('.mode-seg') || e.target.closest('.mode-toggle') || e.target.closest('.sync-toggle') || e.target.closest('input') || e.target.closest('button')) return
    const strip = stripRef.current
    if (!strip) return
    dragRef.current = { dragging: true, startY: e.clientY, startBottom: parseInt(getComputedStyle(strip).bottom) || 16 }
    strip.classList.add('dragging')
    e.preventDefault()
    const onMove = ev => {
      const d = dragRef.current
      if (!d || !d.dragging) return
      const dy = d.startY - ev.clientY
      const newBottom = Math.max(0, Math.min(window.innerHeight - 100, d.startBottom + dy))
      strip.style.bottom = newBottom + 'px'
    }
    const onEnd = () => {
      dragRef.current = null
      strip.classList.remove('dragging')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onEnd)
    window.addEventListener('pointercancel', onEnd)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', 'dark')
    document.body.classList.add('pick')
    currentVars.current = buildVars(PRESETS[0].dark || PRESETS[0], PRESETS[0].glow)
    Object.entries(currentVars.current).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      document.documentElement.style.setProperty(k, v)
    })
    return () => { document.body.classList.remove('pick') }
  }, [])

  useEffect(() => { document.body.classList.toggle('has-draft', draft) }, [draft])

  useEffect(() => { document.documentElement.setAttribute('data-mode', mode) }, [mode])

  useEffect(() => {
    function onClickCapture(e) {
      if (e.target.closest('.preset-strip')) return
      const hit = getZone(e.target)
      if (hit) {
        const isAccentInput = !!e.target.closest('.accent-ball input[type="color"]')
        e.stopPropagation()
        if (!isAccentInput) e.preventDefault()
        if (popoverRef.current && selElRef.current === hit.el) closePopover()
        else openPopover(hit, e.clientX, e.clientY)
      } else if (!e.target.closest('#popover')) {
        closePopover()
      }
    }
    function onMouseOver(e) {
      clearLinks()
      const t = e.target.closest('.pz')
      if (!t) return
      const zone = ZONES[t.dataset.zone]
      if (!zone) return
      const vars = new Set()
      zone.parts.forEach(p => vars.add(p.v))
      ;(zone.more || []).forEach(p => vars.add(p.v))
      vars.forEach(v => { (VAR_LINKS[v] || []).forEach(zid => { document.querySelectorAll(ZONES[zid].sel).forEach(el => el.classList.add('pz-link')) }) })
    }
    function onKey(e) {
      const t = e.target
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
      if (!typing && (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undo() }
      else if (!typing && (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); redo() }
      else if (e.key === 'Escape') closePopover()
    }
    function onBefore(e) {
      if (draftRef.current) { e.preventDefault(); e.returnValue = '' }
    }
    document.addEventListener('click', onClickCapture, true)
    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('keydown', onKey)
    window.addEventListener('beforeunload', onBefore)
    return () => {
      document.removeEventListener('click', onClickCapture, true)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('beforeunload', onBefore)
    }
  }, [])

  useEffect(() => {
    if (popover && popoverRef.current) positionPopover(popover.x, popover.y)
  }, [popover])

  useEffect(() => {
    if (!drawerOpen) return
    function onDocDown(e) {
      if (e.target.closest('.preset-drawer') || e.target.closest('.preset-strip')) return
      setDrawerOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('mousedown', onDocDown, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown, true)
      document.removeEventListener('keydown', onKey)
      clearTimeout(drawerLeaveTimer.current)
    }
  }, [drawerOpen])

  useEffect(() => {
    if (leaveNameMode && leaveNameInputRef.current) {
      leaveNameInputRef.current.focus()
      leaveNameInputRef.current.select()
    }
  }, [leaveNameMode])

  const partRow = (p, key) => p.kind === 'range'
    ? <RangeRow key={key} part={p} value={getVal(p)} onChange={v => { setVal(p, v); setTick(t => t + 1) }} onCommit={commitHistory} />
    : <ColorRow key={key} part={p} value={getVal(p)} onChange={v => { setVal(p, v); setTick(t => t + 1) }} onCommit={commitHistory} />

  const swatchRow = s => (
    <span className="swrow">{[s.bg, s.accent, s.ai, s.user].map((c, i) => <i key={i} style={{ background: c }} />)}</span>
  )

  const presetCard = p => (
    <div key={p.name} className={'preset' + (p.own ? ' own' : '') + (p.name === selName ? ' on' : '')} data-name={p.name} role="button" tabIndex={0}>
      <span className="swatches">{swatchRow(p.dark)}{swatchRow(p.light)}</span>
      <span className="nm">{p.name}</span>
      <span className="badge">{p.cert}</span>
      {p.own && <span className="del" title="删除" onClick={e => { e.stopPropagation(); delPreset(p.name) }}>✕</span>}
      <span className="copycss">复制 CSS</span>
    </div>
  )

  // 主题多时的展开抽屉：搜索 + 网格 + 分页
  const PAGE_SIZE = 24
  const q = search.trim().toLowerCase()
  const filtered = q
    ? presets.filter(p => (p.name && p.name.toLowerCase().includes(q)) || (p.cert && p.cert.toLowerCase().includes(q)))
    : presets
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const curPage = Math.min(page, totalPages - 1)
  const pageItems = filtered.slice(curPage * PAGE_SIZE, curPage * PAGE_SIZE + PAGE_SIZE)

  const commitPage = () => {
    let n = parseInt(pageStr, 10)
    if (isNaN(n)) n = curPage + 1
    n = Math.max(1, Math.min(totalPages, n))
    setPage(n - 1)
    setPageStr(String(n))
  }

  const prevPage = () => { if (curPage > 0) { setPage(curPage - 1); setPageStr(String(curPage)) } }
  const nextPage = () => { if (curPage < totalPages - 1) { setPage(curPage + 1); setPageStr(String(curPage + 2)) } }

  const toggleDrawer = () => {
    if (drawerOpen) { setDrawerOpen(false); return }
    setSearch('')
    setPage(0)
    setPageStr('1')
    setDrawerOpen(true)
  }

  const onDrawerMouseEnter = () => clearTimeout(drawerLeaveTimer.current)
  const onDrawerMouseLeave = e => {
    const to = e.relatedTarget
    if (to && to.closest && (to.closest('.preset-drawer') || to.closest('.preset-strip'))) return
    clearTimeout(drawerLeaveTimer.current)
    drawerLeaveTimer.current = setTimeout(() => setDrawerOpen(false), 240)
  }

  const onDrawerClick = e => {
    const del = e.target.closest('.del')
    if (del) { e.stopPropagation(); delPreset(del.closest('.preset').dataset.name); return }
    const cp = e.target.closest('.copycss')
    if (cp) {
      const vis = parseFloat(getComputedStyle(cp).opacity) > 0.5
      if (vis) { e.stopPropagation(); e.preventDefault(); copyPreset(cp.closest('.preset').dataset.name); return }
    }
    if (e.target.closest('input')) return
    const card = e.target.closest('.preset')
    if (!card) return
    const name = card.dataset.name
    const p = presetsRef.current.find(x => x.name === name)
    if (!p) return
    guardLeaveDraft(() => { selectPreset(name); applyPreset(p); setDrawerOpen(false); toast(`已切换到预设 · ${p.name}`) })
  }

  const onPresetKeyDown = e => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    if (e.target.closest('input')) return
    const card = e.target.closest('.preset')
    if (!card || card.id === 'draftcard') return
    const name = card.dataset.name
    const p = presetsRef.current.find(x => x.name === name)
    if (!p) return
    e.preventDefault()
    const inDrawer = !!e.currentTarget.closest('.preset-drawer')
    guardLeaveDraft(() => { selectPreset(name); applyPreset(p); if (inDrawer) setDrawerOpen(false); toast(`已切换到预设 · ${p.name}`) })
  }

  const popoverZone = popover ? ZONES[popover.id] : null

  let popoverParts = []
  let popoverMore = []
  let popoverLinked = []
  let popoverHint = null
  if (popoverZone) {
    popoverParts = popoverZone.parts
    popoverMore = popoverZone.more || []
    const vset = new Set(popoverParts.map(p => p.v))
    const linked = []
    vset.forEach(v => { (VAR_LINKS[v] || []).forEach(zid => { if (zid !== popover.id && !linked.includes(zid)) linked.push(zid) }) })
    popoverLinked = linked
    popoverHint = popoverZone.parts.find(p => p.hint)
  }

  const accentContrast = (() => {
    const fg = curVars['--color-primary'] || '#8c6a55'
    const bg = curVars['--color-background'] || '#141414'
    const ratio = wcagContrast(fg, bg)
    const tier = ratio >= 4.5 ? 'pass' : ratio >= 3 ? 'ok' : 'fail'
    const text = ratio >= 4.5 ? 'AA' : ratio >= 3 ? '大字' : '低'
    return { ratio, tier, text }
  })()

  return (
    <>
      <div className="stage">
        <header className="topbar">
          <div className="brand">keltzeleo · Cherry<em>Studio</em> · Theme<em>Station</em> <span className="brand-theme">· {selName}</span></div>
          <div className="spacer"></div>
          <button className="iconbtn" id="undobtn" title="撤销 (⌘Z)" disabled={!canUndo} onClick={undo}>
            <svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg>
          </button>
          <button className="iconbtn" id="redobtn" title="重做 (⌘⇧Z)" disabled={!canRedo} onClick={redo}>
            <svg viewBox="0 0 24 24"><path d="M15 14l5-5-5-5" /><path d="M20 9H10a6 6 0 0 0 0 12h3" /></svg>
          </button>
          <button className="iconbtn" data-key="random" title="随机配色" onClick={() => {
            const p = randomOf(presetsRef.current)
            guardLeaveDraft(() => { selectPreset(p.name); applyPreset(p); toast('随机配色 · ' + p.name) })
          }}>
            <svg viewBox="0 0 24 24"><path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="M15 15l6 6" /><path d="M4 4l5 5" /></svg>
          </button>
        </header>

        <main className="canvas">
          <aside className="rail pz" data-zone="rail">
            <div className="slot on pz" data-zone="railicon1"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h7" /></svg></div>
            <div className="slot pz" data-zone="railicon2"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 5v2M12 17v2M5 12H3M21 12h-2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" /></svg></div>
            <div className="slot pz" data-zone="railicon3"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /><path d="M4 9h16M9 9v11" /></svg></div>
            <div className="slot pz" data-zone="railicon4"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg></div>
            <div className="slot pz" data-zone="railicon5"><svg viewBox="0 0 24 24"><path d="M21 21l-4.3-4.3" /><circle cx="11" cy="11" r="7" /></svg></div>
          </aside>

          <div className="tray">
            <nav className="topics pz" data-zone="list">
              <h4>会话</h4>
              <div className="topic on pz" data-zone="topicon"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>Design System Review<span className="dot"></span></div>
              <div className="topic hover pz" data-zone="topichov"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>配色调研笔记</div>
              <div className="topic norm pz" data-zone="topic"><svg viewBox="0 0 24 24"><path d="M12 20l-8-8a4 4 0 0 1 8-5 4 4 0 0 1 8 5l-8 8Z" /></svg>主题迭代记录</div>
              <div className="topic"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18" /></svg>前端配色思路</div>
              <div className="topic"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2" /><path d="M15 20a6 6 0 0 0-12 0M16 11a3 3 0 1 0-2-5.2M21 20a5 5 0 0 0-4-4.9" /></svg>色板实验</div>
            </nav>

            <section className="chat">
              <div className="chathead pz" data-zone="chatbg">
                <div className="name">Design System Review</div>
                <span className="meta">·</span><span className="meta">AI 助手</span>
                <div className="spacer"></div>
              </div>

              <div className="stream pz" data-zone="chatbg" id="stream">
                <div className="msg ai" data-inspect="ai">
                  <div className="avatar"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" /><path d="M9 10h6M9 14h6" /></svg></div>
                  <div className="bubble pz" data-zone="ai">
                    <p>好的，我来帮你整理这套 theme 的结构。核心原则是：<strong>先定整体气质，再定表面，最后是内容细节。</strong></p>
                    <div className="think pz" data-zone="think">
                      <div className="th"><svg viewBox="0 0 24 24"><path d="M9 18l-6 3 2-7L1 6l6 2 5-5 3 5 7-2-4 7 4 7-7-2-5 5z" /></svg>深度思考</div>
                      <div>用户要的是「换色工具」，体验必须是所见即所得。预览应该可信、是主角，而不是被控件挤到一边。要把颜色控制从常驻面板里解放出来。</div>
                    </div>
                    <div className="code">
                      <div className="ch pz" data-zone="codehead"><svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z" /><path d="m9 10-2 2 2 2M15 10l2 2-2 2" /></svg>theme.palette.js</div>
                      <pre className="pz" data-zone="codebody">{CODE_LINES}</pre>
                    </div>
                    <div className="quote pz" data-zone="quote">好的设计应该是「一眼可信」，而不是「需要解释」——用户信任它，才敢放心改。</div>
                    <div className={'tablewrap pz' + (tableHl ? ' table-hl' : '')} data-zone="table">
                      <span className="tcorner tl" onMouseEnter={() => setTableHl(true)} onMouseLeave={() => setTableHl(false)}></span>
                      <span className="tcorner tr" onMouseEnter={() => setTableHl(true)} onMouseLeave={() => setTableHl(false)}></span>
                      <span className="tcorner bl" onMouseEnter={() => setTableHl(true)} onMouseLeave={() => setTableHl(false)}></span>
                      <span className="tcorner br" onMouseEnter={() => setTableHl(true)} onMouseLeave={() => setTableHl(false)}></span>
                      <table>
                        <thead><tr>
                          <th className="pz" data-zone="thead"><span className="thtxt pz" data-zone="theadtext">层级</span></th>
                          <th className="pz" data-zone="thead"><span className="thtxt pz" data-zone="theadtext">变量</span></th>
                          <th className="pz" data-zone="thead"><span className="thtxt pz" data-zone="theadtext">用途</span></th>
                        </tr></thead>
                        <tbody>
                          <tr><td className="pz" data-zone="td">Window</td><td className="pz" data-zone="td">--color-background</td><td className="pz" data-zone="td">应用底</td></tr>
                          <tr><td className="pz" data-zone="td">Surface</td><td className="pz" data-zone="td">--color-background-soft</td><td className="pz" data-zone="td">侧栏 / 会话列表</td></tr>
                          <tr><td className="pz" data-zone="td">Link</td><td className="pz" data-zone="td">--color-link</td><td className="pz" data-zone="td">超链接 / 附件链接</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="msg user" data-inspect="user">
                  <div className="avatar"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg></div>
                  <div className="bubble pz" data-zone="user">
                    <p>好，那我们把「预览优先」这一版做出来。这是一个很长很长、长到会自动转成链接的参考文本，点它能直接打开：</p>
                    <p>你可以参考这个文档 <a href="#" className="pz" data-zone="link" onClick={e => e.preventDefault()}>https://dub.sh/palette-ref/a-path-quite-long-enough-to-wrap/design?from=clipboard&id=2026-08</a> 来决定链接的配色。</p>
                    <div className="attach">
                      <svg className="ficon" viewBox="0 0 24 24"><path d="M14 3v6h6" /><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" /></svg>
                      <span className="fname pz" data-zone="link">2026-08-12 剪切板文件.txt</span>
                      <span className="fname" style={{ color: 'var(--color-text-3)' }}>·</span>
                      <span style={{ color: 'var(--color-text-3)' }}>12 KB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inputbar pz" data-zone="inputbar">
                <div className="inputbar-inner">
                  <svg className="inputbar-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
                  <span className="inputbar-placeholder">输入消息...</span>
                </div>
                <button className="inputbar-send">
                  <svg viewBox="0 0 24 24"><path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9Z" /></svg>
                </button>
              </div>
              <div className="scrolly pz" data-zone="scrollbar" title="滚动条"><span className="sthumb"></span></div>
            </section>
          </div>
        </main>
      </div>

      <button className="accent-ball pz" data-zone="accent" title="主色 Accent · 点我改主色" onClick={() => accentInputRef.current && accentInputRef.current.click()}>
        <span className="accent-ball-inner">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
          <span className="accent-ball-label">ACCENT</span>
        </span>
        <input type="color" id="accentBallInput" ref={accentInputRef}
          onInput={e => onAccentBallChange(e.target.value)}
          onChange={e => onAccentBallChange(e.target.value)} />
      </button>

      <div className="accent-contrast" title="主色 vs 背景的 WCAG 对比度">
        <span className={'ac-ratio ac-' + accentContrast.tier}>{accentContrast.ratio}</span>
        <span className="ac-status" title={accentContrast.text}>{accentContrast.text}</span>
      </div>

      <div className="preset-strip" id="strip" ref={stripRef}
        onPointerDown={onStripPointerDown}>
        <span className="strip-grip" title="拖动此条" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></span>
        <div className="preset-scroll" id="presets" onClick={onPresetClick} onKeyDown={onPresetKeyDown}>
          {presets.map(presetCard)}
        </div>
        <button className={'expand-btn' + (drawerOpen ? ' on' : '')} id="expandBtn" title={drawerOpen ? '收起全部主题' : '展开全部主题'} onClick={toggleDrawer}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
        </button>
        {draft && draftChipRows() && (
          <div className="preset draftcard" id="draftcard">
            <span className="drafttag">新主题草案</span>
            <span className="swatches">{draftChipRows().dark}{draftChipRows().light}</span>
            <div className="draftrow">
              <input className="dname" placeholder="命名" value={draftName} onChange={e => setDraftName(e.target.value)} onClick={e => e.stopPropagation()} />
              <span className="dbtn cancel" title="取消" onClick={e => { e.stopPropagation(); cancelDraft() }}>✕</span>
              <span className="dbtn save" title="保存" onClick={e => { e.stopPropagation(); saveDraft(draftName.trim() || `我的主题 ${presets.length + 1}`) }}>✓</span>
            </div>
          </div>
        )}
        <div className="vert"></div>
        <label className="sync-toggle" id="syncToggle">
          <input type="checkbox" checked={sync} onChange={e => onSyncChange(e.target.checked)} />
          <span className="sync-track"><span className="sync-thumb"></span></span>
          <span className="sync-label">统一修改</span>
          <span className="sync-help" tabIndex={0} aria-label="统一修改说明">
            ?
            <span className="sync-help-tip">开启：改一个模式会自动同步 dark / light 两版<br />关闭：另一模式保持当前颜色不受影响</span>
          </span>
        </label>
        <div className="mode-toggle" id="modeToggle">
          <button className={'mode-seg' + (mode === 'dark' ? ' on' : '')} data-m="dark" title="Dark" onClick={() => setModeTo('dark')}>
            <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" /></svg>
          </button>
          <button className={'mode-seg' + (mode === 'light' ? ' on' : '')} data-m="light" title="Light" onClick={() => setModeTo('light')}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
          </button>
        </div>
        <div className="target-toggle" id="targetToggle" title="导出目标版本">
          <button className={'target-seg' + (exportTarget === CHERRY_V1_TARGET ? ' on' : '')} data-t={CHERRY_V1_TARGET} onClick={() => setExportTarget(CHERRY_V1_TARGET)}>1.9.12</button>
          <button className={'target-seg' + (exportTarget === CHERRY_V2_TARGET ? ' on' : '')} data-t={CHERRY_V2_TARGET} onClick={() => setExportTarget(CHERRY_V2_TARGET)}>v2</button>
        </div>
        {drawerOpen && (
          <div className="preset-drawer" id="presetDrawer" onMouseEnter={onDrawerMouseEnter} onMouseLeave={onDrawerMouseLeave}>
            <div className="drawer-head">
              <input className="drawer-search" placeholder="搜索主题名称 / 分类…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); setPageStr('1') }} />
              <span className="drawer-count">{filtered.length} 个主题</span>
            </div>
            <div className="drawer-grid" onClick={onDrawerClick} onKeyDown={onPresetKeyDown}>
              {pageItems.map(presetCard)}
              {pageItems.length === 0 && <div className="drawer-empty">没有匹配的主题</div>}
            </div>
            <div className="drawer-pager">
              <button onClick={prevPage} disabled={curPage <= 0} title="上一页">‹</button>
              <input className="drawer-page" value={pageStr} title="页码"
                onChange={e => setPageStr(e.target.value)}
                onBlur={commitPage}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitPage() } }} />
              <span className="tot">/ {totalPages}</span>
              <button onClick={nextPage} disabled={curPage >= totalPages - 1} title="下一页">›</button>
            </div>
          </div>
        )}
      </div>

      <div className="inspector" id="inspector"></div>

      {popoverZone && (
        <div ref={popoverRef} className={'popover show' + (draft ? ' draft' : '')} id="popover">
          <div className="ph">
            <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            <span className="t">{popoverZone.note}</span><span className="gid">{popoverParts.length} 项</span>
          </div>
          <div className="pop-focus">
            <div className="plabel">聚焦</div>
            {partRow(popoverParts[0], popoverParts[0].v)}
          </div>
          {popoverParts.slice(1).length > 0 && (
            <div className="pop-rel">
              <div className="plabel">相关</div>
              {popoverParts.slice(1).map(p => partRow(p, p.v))}
            </div>
          )}
          {(popoverMore.length > 0 || popoverLinked.length > 0) && (
            <details className="pop-more">
              <summary><span className="arw">▶</span>更多{popoverLinked.length ? ' · 改这里会联动' : ''}</summary>
              {popoverMore.map(p => partRow(p, p.v))}
              {popoverLinked.length > 0 && (
                <div className="pnote" style={{ border: 'none', margin: '2px 0 0', padding: '2px 0 0' }}>联动区域：{popoverLinked.map(zid => ZONES[zid].note).join('、')}</div>
              )}
            </details>
          )}
          <div className="pnote">{inPlace ? '改动会直接写入此预设' : '改了会生成「新预设」卡片'} · 点 ✓ 保存 / ✕ 取消{popoverHint ? <><br />{popoverHint.hint}</> : null}</div>
        </div>
      )}

      <div className={'toast' + (toastMsg ? ' show' : '')} id="toast">{toastMsg}</div>

      {editChoiceMask && (
        <div className="dlg-mask show" id="editChoiceMask">
          <div className="dlg" role="dialog" aria-modal="true">
            <div className="dlg-t"><svg viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>修改已保存的预设</div>
            <div className="dlg-d">你正在修改已保存的预设「<span id="editChoiceName">{editChoiceName}</span>」。要直接改这个预设，还是基于它新建一个主题？</div>
            <div className="dlg-actions">
              <button className="dlg-btn" onClick={chooseEditInPlace}>直接改此预设</button>
              <button className="dlg-btn primary" onClick={chooseNewDraft}>以此建立新的主题</button>
            </div>
          </div>
        </div>
      )}

      {leaveMask && (
        <div className="dlg-mask show" id="leaveMask" onClick={e => { if (e.target.id === 'leaveMask') dismissLeave() }}>
          <div className="dlg" role="dialog" aria-modal="true" aria-labelledby="leaveTitle">
            <div className="dlg-t" id="leaveTitle"><svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>有未保存的配色</div>
            <div className="dlg-d">当前改动还没保存。切换预设或离开会丢失这些配色，是否先处理？</div>
            <div className={'dlg-actions' + (leaveNameMode ? ' hide' : '')} id="dlgActionsWrap">
              <button className="dlg-btn danger" id="dlgDiscard" onClick={doLeaveDiscard}>丢弃</button>
              <button className="dlg-btn" id="dlgCancel" onClick={dismissLeave}>取消</button>
              <button className="dlg-btn primary" id="dlgSave" onClick={showLeaveName}>保存为预设</button>
            </div>
            <div className={'dlg-name' + (leaveNameMode ? ' show' : '')} id="dlgNameRow">
              <input ref={leaveNameInputRef} id="dlgNameInput" placeholder="输入预设名称" maxLength={24}
                value={leaveNameVal} onChange={e => setLeaveNameVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doLeaveSave() } }} />
              <span className="dbtn cancel" id="dlgNameCancel" title="返回" onClick={hideLeaveName}>✕</span>
              <span className="dbtn save" id="dlgNameSave" title="保存" onClick={doLeaveSave}>✓</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function fallbackCopy(t) {
  const ta = document.createElement('textarea')
  ta.value = t
  ta.style.position = 'fixed'
  ta.style.top = '0'
  ta.style.left = '0'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  let ok
  try { ok = document.execCommand('copy') } catch { ok = false }
  ta.remove()
  return !!ok
}

async function copyText(t) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try { await navigator.clipboard.writeText(t); return true } catch { return fallbackCopy(t) }
  }
  return fallbackCopy(t)
}

export default App
