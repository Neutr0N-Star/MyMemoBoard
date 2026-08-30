# 星之间 · 学习工作台（便签墙）

面向学生（考研 + 学期 + 待办 + 生活）的单文件学习工作台。**定稿视觉 = 构成主义·工程设计流**（蓝图网格 / 机械剖线 / 红黑白功能色）。

## 快速开始

**推荐 · 桌面应用**：双击桌面上的「星之间.exe」→ 独立窗口，无浏览器地址栏/标签页，视觉完整，自带构成主义图标。

**临时 · 浏览器**：双击 `index.html` 即可。无需安装、无需服务器、无网络依赖。

> ⚠️ 浏览器版与桌面 exe 的便签数据**分开存储**（浏览器在浏览器 profile，桌面 exe 在 exe 同目录 `data/`）。
> 从浏览器迁移到桌面版：浏览器里「导出 JSON」→ 桌面版「导入 JSON」。

## 功能

| 模块 | 说明 |
|---|---|
| 考试倒计时 | 顶栏并排多个考试节点（初试 / 复试 / 教资…），点 pill 或 `+` 改名字与日期，超宽自动换行 |
| 今日时间轴 | 侧栏：左 = 课表课程、右 = 我的作息，都按**时间段**堆叠；中轴撞车段**红色**描粗、不撞车段**绿色**描粗、空档淡灰 |
| 考研备考 | 便签墙 |
| 学期科目 | 课程清单 + **课程筛选芯片**（点哪门只看哪门）+ 课程便签 |
| 待办 / 生活事项 | 便签墙 |
| 课程表 | 顶栏「课程表」进**完整编辑页**（课程清单 + 每节课起止时间 + 周课表）；墙上小按钮开**只读预览** |
| 完成情况 | 左下角：本周 / 累计撕下张数、**纸堆便签盒**（张数越多堆越高）、**收纳箱抽屉** |
| 便签盒 / 收纳箱 | 撕下的进便签盒，满一周自动入收纳箱（也可手动），盒与箱都能粘回墙上或彻底丢掉 |
| 数据 | localStorage 自动保存；导出 / 导入 JSON 备份 |

**操作语义**：贴 = 新增，撕下 = 完成归档，粘回 = 恢复，入箱 = 长期归档。无「去处理」按钮，只有写与撕。

**便签排序规则**：重要置顶（红框 + 「重要」角标）→ 有截止的按截止日升序 → 无截止按创建时间。

**时间轴的撞车判定**：中线按 5 分钟切片，逐片判断该时刻是否同时落在「某节课」与「某段作息」内——两者都在 = 撞车（红），只有一个 = 不撞车（绿），都没有 = 空档（灰）。切片结果合并成 CSS `linear-gradient` 色标，一个 div 画出整条分段轴。这解决的真实问题是「这节课去不去」：左边有课、右边空着 → 可以去；左右都有 → 当场抉择。

## 视觉体系

- **定稿版**（`index.html`）：构成主义·工程设计流——蓝图底稿纸 + 毫米网格 + 图纸标题栏/刻度 + 机械剖线 + 工单卡便签（红/钢蓝/墨黑功能色）+ 零装饰零渐变零圆角。
- **候选材质**（`assets/archive/`，随时可换皮）：纸品手账 / 工业仪表 / 织物软木 / 花窗构成主义 / 至上主义 / 方案B时间轴 / 方案C看板流 / 方案A基座。
- 风格提示词已沉淀回库：`01-Prompts\Art-Style\Constructivism\` + `Suprematism\` + `Constructivist-StainedGlass\`。

## 开发

- 纯原生 JS 单文件，`<script>` 内 数据层 → 计算层 → 渲染层（refreshAll 统一入口）→ 行为层。
- 交互全部用内联输入框（不依赖 `prompt()`/`alert()`，iframe 预览环境可用）。
- 换皮 = 只改 `index.html` 的 `<style>` 与可选 HTML 装饰，`<script>` 块保持与基座一致。

## 桌面应用模式（Electron 外壳）

`index.html` 零改动，Electron 只提供一层窗口外壳。业务逻辑仍是纯前端 localStorage。

| 文件 | 作用 |
|---|---|
| `main.js` | 主进程：窗口外壳 + 数据目录绿色化 + 单实例锁 |
| `package.json` | 应用声明与脚本（`npm start`） |
| `assets/icon.ico` | 构成主义图标，由 `assets/make-icon.py` 生成（改脚本即重画，可复现） |
| `.gitignore` | 排除 `node_modules/` 与运行期数据目录 |

**设计要点**

- **数据随程序走**：开发模式存 `data-dev/`，打包后存 exe 同目录 `data/`，不写 C 盘 AppData。整个文件夹拷走即迁移，卸载不留残余。
- **单实例锁**：重复点启动器不会开第二个窗口，而是把已有窗口拉回前台。
- **无菜单栏**：`autoHideMenuBar` + `setMenuBarVisibility(false)`，界面保持纯粹的构成主义外观。
- **零 node 能力**：`nodeIntegration: false` + `contextIsolation: true`，不引入任何 node 依赖。

**启动方式**

- 桌面 exe：`C:\Users\19747\Desktop\星之间.exe`（单文件 portable，双击即开，数据落在 `Desktop\data\`）
- 命令行开发：`npm start`

**打包为单文件 exe**

```bash
npm install            # 装 electron + electron-builder
npm run dist           # 产出 release/XingZhiJian-1.0.0-portable.exe（约 86MB，自带图标）
```

- 打包配置在 `package.json` 的 `build` 段（appId / icon / files 白名单 / win portable 目标）。
- `release/` 与 `node_modules/` 已 gitignore，构建产物不入库；重打只需 `npm run dist`。
- ⚠️ 构建环境若启用了「删除走回收站」的钩子（如本 agent 沙箱），需先 `NODE_OPTIONS=""` 清掉注入的 shim，否则临时目录清理会失败导致打包中断。

**已知环境坑**

`ELECTRON_RUN_AS_NODE=1` 会让 Electron 退化成纯 Node 模式——窗口永远起不来，报
`Cannot read properties of undefined (reading 'isPackaged')`。
该变量**不在系统级/用户级**（查过 HKCU/HKLM 注册表），通常是某些开发工具链临时注入。
桌面启动器已在启动前清除它，命令行启动前如遇同样报错，手动 `set ELECTRON_RUN_AS_NODE=` 即可。

## 入口

- 门牌：`.overview.md`；蓝图：`notes.md`；产物：`index.html` + `assets/archive/`。
- 桌面外壳：`main.js` + `package.json` + `assets/icon.ico`；打包产物 `release/XingZhiJian-1.0.0-portable.exe`，桌面入口 `C:\Users\19747\Desktop\星之间.exe`。
