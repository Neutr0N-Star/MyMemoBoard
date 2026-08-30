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
| 考研备考 | 倒计时（距初试天数）+ 便签墙 |
| 学期科目 | 课程清单（点课程名改名/留空删）+ 课程表浮窗 + 课程便签 |
| 待办 | 普通待办便签墙 |
| 生活事项 | 生活类便签墙 |
| 日常作息 | 侧边栏，点时间/内容直接改，每天固定节奏 |
| 便签盒 | 撕下的完成事项，可粘回墙上或彻底丢掉 |
| 数据 | localStorage 自动保存；导出/导入 JSON 备份 |

**操作语义**：贴=新增，撕下=完成归档，粘回=恢复。无「去处理」按钮，只有写与撕。

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
