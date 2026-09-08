export const ZONES = {
  list:     { sel:'.topics',                 note:'会话列表底 · list panel', parts:[{label:'列表底',kind:'bg',v:'--color-background-soft'}], more:[{label:'次级文字',kind:'text',v:'--color-text-2'}] },
  topic:    { sel:'.topic.norm',             note:'会话 · 普通态',          parts:[{label:'普通文字',kind:'text',v:'--color-text-2'}] },
  topicon:  { sel:'.topic.on',               note:'会话 · 选中态',          parts:[
                {label:'选中底',kind:'bg',v:'--color-primary-soft'},
                {label:'选中文字',kind:'text',v:'--color-text'},
              ]},
  topichov: { sel:'.topic.hover',            note:'会话 · 悬停态',          parts:[{label:'悬停底',kind:'bg',v:'--color-hover'}] },
  rail:     { sel:'.rail',                   note:'侧边图标栏',             parts:[
                {label:'侧栏底',kind:'bg',v:'--sidebar'},
                {label:'图标 1 发光',kind:'bg',v:'--sidebar-glow-1'},
                {label:'图标 2 发光',kind:'bg',v:'--sidebar-glow-2'},
                {label:'图标 3 发光',kind:'bg',v:'--sidebar-glow-3'},
                {label:'图标 4 发光',kind:'bg',v:'--sidebar-glow-4'},
                {label:'图标 5 发光',kind:'bg',v:'--sidebar-glow-5'},
              ], more:[{label:'图标默认色',kind:'text',v:'--color-text-2'},{label:'图标选中色',kind:'text',v:'--color-primary'}] },
  railicon1:{ sel:'.rail .slot:nth-child(1)',note:'侧栏图标 1 · 发光色',    parts:[
                {label:'图标 1 发光',kind:'bg',v:'--sidebar-glow-1'},
                {label:'图标 2 发光',kind:'bg',v:'--sidebar-glow-2'},
                {label:'图标 3 发光',kind:'bg',v:'--sidebar-glow-3'},
                {label:'图标 4 发光',kind:'bg',v:'--sidebar-glow-4'},
                {label:'图标 5 发光',kind:'bg',v:'--sidebar-glow-5'},
              ], more:[{label:'图标默认色',kind:'text',v:'--color-text-2'},{label:'图标选中色',kind:'text',v:'--color-primary'}] },
  railicon2:{ sel:'.rail .slot:nth-child(2)',note:'侧栏图标 2 · 发光色',    parts:[
                {label:'图标 2 发光',kind:'bg',v:'--sidebar-glow-2'},
                {label:'图标 1 发光',kind:'bg',v:'--sidebar-glow-1'},
                {label:'图标 3 发光',kind:'bg',v:'--sidebar-glow-3'},
                {label:'图标 4 发光',kind:'bg',v:'--sidebar-glow-4'},
                {label:'图标 5 发光',kind:'bg',v:'--sidebar-glow-5'},
              ], more:[{label:'图标默认色',kind:'text',v:'--color-text-2'},{label:'图标选中色',kind:'text',v:'--color-primary'}] },
  railicon3:{ sel:'.rail .slot:nth-child(3)',note:'侧栏图标 3 · 发光色',    parts:[
                {label:'图标 3 发光',kind:'bg',v:'--sidebar-glow-3'},
                {label:'图标 1 发光',kind:'bg',v:'--sidebar-glow-1'},
                {label:'图标 2 发光',kind:'bg',v:'--sidebar-glow-2'},
                {label:'图标 4 发光',kind:'bg',v:'--sidebar-glow-4'},
                {label:'图标 5 发光',kind:'bg',v:'--sidebar-glow-5'},
              ], more:[{label:'图标默认色',kind:'text',v:'--color-text-2'},{label:'图标选中色',kind:'text',v:'--color-primary'}] },
  railicon4:{ sel:'.rail .slot:nth-child(4)',note:'侧栏图标 4 · 发光色',    parts:[
                {label:'图标 4 发光',kind:'bg',v:'--sidebar-glow-4'},
                {label:'图标 1 发光',kind:'bg',v:'--sidebar-glow-1'},
                {label:'图标 2 发光',kind:'bg',v:'--sidebar-glow-2'},
                {label:'图标 3 发光',kind:'bg',v:'--sidebar-glow-3'},
                {label:'图标 5 发光',kind:'bg',v:'--sidebar-glow-5'},
              ], more:[{label:'图标默认色',kind:'text',v:'--color-text-2'},{label:'图标选中色',kind:'text',v:'--color-primary'}] },
  railicon5:{ sel:'.rail .slot:nth-child(5)',note:'侧栏图标 5 · 发光色',    parts:[
                {label:'图标 5 发光',kind:'bg',v:'--sidebar-glow-5'},
                {label:'图标 1 发光',kind:'bg',v:'--sidebar-glow-1'},
                {label:'图标 2 发光',kind:'bg',v:'--sidebar-glow-2'},
                {label:'图标 3 发光',kind:'bg',v:'--sidebar-glow-3'},
                {label:'图标 4 发光',kind:'bg',v:'--sidebar-glow-4'},
              ], more:[{label:'图标默认色',kind:'text',v:'--color-text-2'},{label:'图标选中色',kind:'text',v:'--color-primary'}] },
  chatbg:   { sel:'.stream, .chathead',      note:'消息区底 · chat panel', parts:[{label:'聊天底',kind:'bg',v:'--color-background'}], more:[{label:'次级文字',kind:'text',v:'--color-text-2'},{label:'弱文字',kind:'text',v:'--color-text-3'}] },
  ai:       { sel:'.msg.ai .bubble',         note:'助手消息',              parts:[
                {label:'气泡底',kind:'bg',v:'--chat-background-ai'},
                {label:'助手文字',kind:'text',v:'--color-text'},
              ], more:[{label:'次级文字',kind:'text',v:'--color-text-2'},{label:'弱文字',kind:'text',v:'--color-text-3'}] },
  user:     { sel:'.msg.user .bubble',       note:'用户消息',              parts:[
                {label:'气泡底',kind:'bg',v:'--chat-background-user'},
                {label:'文字',kind:'text',v:'--chat-text-user'},
              ], more:[{label:'链接默认',kind:'link',v:'--color-link'}]},
  link:     { sel:'.bubble a, .attach .fname', note:'链接 · link',       parts:[
                {label:'链接默认',kind:'link',v:'--color-link'},
                {label:'链接悬浮',kind:'link',v:'--color-link-hover'},
              ]},
  codehead: { sel:'.code .ch',               note:'代码块标题底',          parts:[{label:'标题底',kind:'bg',v:'--color-background-mute'}] },
  codebody: { sel:'.code pre',               note:'代码块底色',           parts:[{label:'代码底',kind:'bg',v:'--color-code-background'}] },
  kwcomment: { sel:'.kwz[data-kw="comment"]', note:'注释',                 parts:[{label:'注释颜色',kind:'kw',v:'--kw-comment',hint:'一个语法群，全块一起变'}] },
  kwkeyword: { sel:'.kwz[data-kw="keyword"]', note:'关键字',               parts:[{label:'关键字颜色',kind:'kw',v:'--kw-keyword',hint:'keyword：const/import/export/async/function…'}] },
  kwstring:  { sel:'.kwz[data-kw="string"]',  note:'字符串',               parts:[{label:'字符串颜色',kind:'kw',v:'--kw-string',hint:'字符串 + template literal'}] },
  kwliteral: { sel:'.kwz[data-kw="literal"]', note:'字面量',               parts:[{label:'字面量颜色',kind:'kw',v:'--kw-literal',hint:'number / boolean / null'}] },
  kwname:    { sel:'.kwz[data-kw="name"]',    note:'名称',                 parts:[{label:'名称颜色',kind:'kw',v:'--kw-name',hint:'变量 / 函数名 / 类名 / property'}] },
  kwpunct:   { sel:'.kwz[data-kw="punct"]',   note:'标点 / 运算符',        parts:[{label:'标点颜色',kind:'kw',v:'--kw-punct',hint:'括号 / 逗号 / 分号 / 运算符 / 方法调用'}] },
  thead:    { sel:'.tablewrap thead th',     note:'表头 · 表头底',        parts:[
                {label:'表头底 · 整行一起换',kind:'bg',v:'--table-header'},
              ], more:[{label:'表头文字',kind:'text',v:'--table-header-text'}]},
  theadtext:{ sel:'.tablewrap thead th .thtxt',note:'表头 · 字体',        parts:[
                {label:'表头字体 · 全部一起换',kind:'text',v:'--table-header-text'},
              ], more:[{label:'表头底',kind:'bg',v:'--table-header'}]},
  td:       { sel:'.tablewrap tbody td',     note:'单元格 · rows',        parts:[
                {label:'行底 · 全部一起换',kind:'bg',v:'--table-row-bg'},
                {label:'字体 · 全部一起换',kind:'text',v:'--color-text-2'},
              ] },
  table:    { sel:'.tablewrap',              note:'表格 · 边框 / 圆角',   parts:[
                {label:'边框颜色',kind:'bg',v:'--table-border',grp:'边框 / 圆角'},
                {label:'圆角',kind:'range',v:'--table-radius',min:0,max:26,def:10,step:1,unit:'px',grp:'边框 / 圆角'},
                {label:'边框粗细',kind:'range',v:'--table-border-width',min:0,max:3,def:1,step:1,unit:'px',grp:'边框 / 圆角'},
              ]},
  inputbar: { sel:'.inputbar',              note:'输入栏 · input bar',    parts:[
                {label:'输入栏底',kind:'bg',v:'--color-background'},
                {label:'输入框底',kind:'bg',v:'--local-input-bg'},
              ], more:[{label:'输入框边框',kind:'bg',v:'--local-input-border'}]},
  quote:    { sel:'.quote',                  note:'引用块',               parts:[
                {label:'引用边线',kind:'bg',v:'--color-reference',grp:'引用块'},
                {label:'引用底色',kind:'bg',v:'--color-reference-background',grp:'引用块'},
                {label:'引用文字',kind:'text',v:'--color-reference-text',grp:'引用块'},
              ]},
  think:    { sel:'.think',                  note:'思考框',               parts:[
                {label:'思考框底',kind:'bg',v:'--local-thinking-bg',grp:'思考框'},
                {label:'思考框边框',kind:'bg',v:'--local-thinking-border',grp:'思考框'},
                {label:'思考框文字',kind:'text',v:'--local-thinking-text',grp:'思考框'},
              ]},
  scrollbar:{ sel:'.scrolly',                note:'滚动条',               parts:[
                {label:'滑块颜色',kind:'bg',v:'--scroll-thumb'},
                {label:'宽度',kind:'range',v:'--scroll-width',min:6,max:18,def:10,step:1,unit:'px'},
              ]},
  accent:   { sel:'.accent-ball',            note:'主色 Accent',          parts:[
                {label:'主色 Accent',kind:'bg',v:'--color-primary'},
              ], more:[{label:'主色淡阶',kind:'bg',v:'--color-primary-soft'},{label:'主色中阶',kind:'bg',v:'--color-primary-mute'}]},
}

export const VAR_LINKS = {}
Object.entries(ZONES).forEach(([id, z]) => z.parts.forEach(p => { (VAR_LINKS[p.v] = VAR_LINKS[p.v] || []).push(id) }))
