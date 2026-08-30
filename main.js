// 星之间 · 学习工作台 — Electron 主进程
// 职责边界：只做「窗口外壳 + 数据落盘位置 + 单实例锁」三件事。
// 业务逻辑全在 index.html（纯前端 + localStorage），主进程不介入。

const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

// Windows 上系统通知要能正常弹出，需先声明 AppUserModelID（与 package.json 的 build.appId 一致）
if (process.platform === 'win32') {
  app.setAppUserModelId('com.neutronstar.xingzhijian');
}

// ---------------------------------------------------------------------------
// 1. 数据目录绿色化：随程序走，不污染 C 盘 AppData
//    - portable 单文件 exe → exe 同目录 data/
//    - 打包目录版         → exe 同目录 data/
//    - 开发模式(npm start) → 项目内 data-dev/
//    好处：整个文件夹拷到 U 盘带走，数据跟着走；卸载不留残余。
// ---------------------------------------------------------------------------
(function setupUserData() {
  let base;
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    base = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'data');
  } else if (app.isPackaged) {
    base = path.join(path.dirname(process.execPath), 'data');
  } else {
    base = path.join(__dirname, 'data-dev');
  }
  app.setPath('userData', base);
})();

// ---------------------------------------------------------------------------
// 2. 单实例锁：避免双击启动器反复开出多个窗口
//    第二次启动时，把已开的窗口拉回前台。
// ---------------------------------------------------------------------------
let win = null;
const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

// ---------------------------------------------------------------------------
// 3. 窗口
// ---------------------------------------------------------------------------
function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 700,
    // 与 index.html 的 <title> 保持一致，避免加载完成瞬间标题跳变
    title: '星之间 · 便签墙（构成主义 · 工程设计流）',
    backgroundColor: '#F2EFE6', // 与界面底稿纸同色，启动瞬间不闪白
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
      // preload 只桥接「置顶 / 通知」两个桌面能力，页面依旧拿不到 node
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 去掉菜单栏（Alt 键也不再弹出），界面保持纯粹的构成主义外观
  win.setMenuBarVisibility(false);

  win.loadFile(path.join(__dirname, 'index.html'));

  // 兜底防御：星之间无外链，禁止任何形式的新窗口弹出
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // 开发模式下保留 F12 / Ctrl+Shift+I 调试入口（打包后自动失效）
  if (!app.isPackaged) {
    win.webContents.on('before-input-event', (event, input) => {
      const isDevTools =
        input.key === 'F12' ||
        (input.control && input.shift && (input.key === 'I' || input.key === 'i'));
      if (isDevTools) {
        win.webContents.toggleDevTools();
        event.preventDefault();
      }
    });
  }

  win.on('closed', () => {
    win = null;
  });
}

// ---------------------------------------------------------------------------
// 4. 桌面能力桥接：窗口置顶 / 系统通知
//    只开这两个口子，页面依然接触不到任何 node 模块。
// ---------------------------------------------------------------------------
ipcMain.handle('toggle-top', () => {
  if (!win) return false;
  const on = !win.isAlwaysOnTop();
  win.setAlwaysOnTop(on, 'screen-saver');
  return on;
});

ipcMain.handle('get-top', () => (win ? win.isAlwaysOnTop() : false));

ipcMain.handle('notify', (_e, { title, body }) => {
  if (!Notification.isSupported()) return false;
  new Notification({ title: title || '星之间', body: body || '' }).show();
  return true;
});

app.whenReady().then(createWindow);

// Windows：关窗即退出（不做 macOS 那套驻留）
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
