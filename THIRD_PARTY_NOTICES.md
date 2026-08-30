# Third-Party Notices

本文件列出知墙运行/打包涉及的主要第三方组件及其许可。完整文本以各依赖包内 LICENSE / LICENSES 文件为准。

| 组件 | 用途 | License |
|---|---|---|
| Electron | 桌面运行时（窗口/主进程/渲染） | MIT（详见 `LICENSE.electron.txt`，随发布包附带） |
| Chromium | Electron 内置浏览器内核 | BSD-style（详见 `LICENSES.chromium.html`，随发布包附带） |
| electron-builder | 打包工具（仅开发依赖） | MIT |
| electron-updater | 自动更新 | MIT |
| @electron/asar | 打包 app.asar（仅开发依赖） | MIT |
| 黄令东齐伋体（Huanglingdong Qiji Ti） | 界面展示字体（已嵌入分发，文件 `assets/fonts/huanglingdong-qijiti.ttf`） | SIL Open Font License 1.1（全文见 `assets/fonts/HUANGLINGDONG-LICENSE.txt`） |

> 本项目自身为 MIT License，见 `LICENSE`。发布包内 `win-unpacked` 已随 Electron/Chromium 附带对应许可文件；`tools/`、`node_modules/` 不入库。
