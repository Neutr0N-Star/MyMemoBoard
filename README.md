# 知墙 · MyMemoBoards

知墙是一个 Windows 桌面便签墙工作台：把考研、课程、待办、生活这些事分开贴在墙上，做完撕下来归档。界面是构成主义风格，蓝图纸底、机械剖线、红黑白三色，没有圆角也没有多余装饰。

## 下载与安装

- 系统要求：Windows 10 / 11
- 安装版：`MyMemoBoards-1.0.0-setup.exe`，装完在开始菜单和桌面生成「知墙」快捷方式——**正式发布只提供这个安装包**

> 目前 exe 没有代码签名，Windows SmartScreen 可能提示「未知发布者」。这是本地/小规模分发的正常现象，不是病毒；点「更多信息 → 仍要运行」即可。

下载后可以核对一下文件：

```powershell
Get-FileHash -Algorithm SHA256 .\MyMemoBoards-1.0.0-setup.exe
```

SHA256 值放在 `release/SHA256SUMS.txt`，GitHub Release 附件里也会带上。

## 功能

- **便签墙**：墙可以增、删、改名、拖拽换顺序、设默认墙；空态启动，不预置示例。
- **作息与课程表**：侧栏时间轴左边是课表、右边是作息，撞车段标红，空档标灰；课程表节次可增删，每节课起止时间可改。
- **考试倒计时**：初试、复试、教资这些节点放顶栏，临近自动变色。
- **便签盒与收纳箱**：撕下的便签进便签盒，满一周自动入收纳箱；便签盒里的可以粘回墙上，也可以彻底丢掉。
- **每日任务**：一类特殊便签，撕掉后第二天自动贴回墙上，不会进收纳箱。
- **AI 周报**：可选功能。自己填 Base URL、Key、模型名，支持本地 Ollama；Key 用系统 safeStorage 加密保存，导出 JSON 时自动脱敏。
- **数据**：默认全本机，桌面版存在 exe 同目录 `data/state.json`；支持导出/导入 JSON、CSV、Markdown，每天自动存快照。

## 数据与隐私

- 默认离线。便签、作息、课程、设置都只存在本机，不上传服务器。
- AI 周报只有在你主动填了接口并点「生成」时才会请求网络。
- API Key 不会发给作者，也不会随导出文件传出去（导出时替换为 `***`）。
- 导出的 JSON 虽然已脱敏 Key，但仍包含你的学习/待办数据，分享前留意。

## 技术

- 业务逻辑集中在 `index.html`，纯原生 JS，无框架、无 CDN、无外链。
- Electron 只负责窗口和桌面能力（置顶、通知、开机启动、自动更新、文件化存储）。
- 交互全部用内联输入框，不依赖浏览器原生 `prompt`/`alert`。

## 开发

```bash
npm install
npm start            # 本地运行，开发模式数据在 data-dev/
npm run dist         # 打包 Windows 安装版 + 便携版（便携版仅供内测，不随正式发布提供）
npm run dist:ci      # CI 专用：同上但禁止 electron-builder 自动发布（--publish never）
npm run dist:store   # 商店版（Windows AppX）
```

## 许可证

[MIT](LICENSE)。Electron、Chromium 等第三方组件按各自开源许可随发布包附带声明文件。
