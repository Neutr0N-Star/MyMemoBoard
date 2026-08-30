// 知墙 · 学习工作台 — Electron 主进程
// 职责边界：只做「窗口外壳 + 数据落盘位置 + 单实例锁」三件事。
// 业务逻辑全在 index.html（纯前端 + localStorage），主进程不介入。

const { app, BrowserWindow, ipcMain, Notification, session, safeStorage, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// ---------------------------------------------------------------------------
// 0. 全局错误日志：主进程崩溃/未处理 Promise/渲染进程上报，统一写 data/logs/error.log
// ---------------------------------------------------------------------------
function writeErrorLog(msg){
  try{
    const dir = path.join(app.getPath('userData'), 'logs');
    fs.mkdirSync(dir, { recursive: true });
    const line = '[' + new Date().toISOString() + '] ' + msg + '\n';
    fs.appendFileSync(path.join(dir, 'error.log'), line);
  }catch(_e){}
}

// ---------------------------------------------------------------------------
// 0.1 文件化数据存储：state.json 原子写（临时文件 + rename），data/ 随程序走
// ---------------------------------------------------------------------------
function readStateFile(){
  try{
    const p = path.join(app.getPath('userData'), 'state.json');
    if(fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }catch(_e){}
  return null;
}
function writeStateFile(json){
  try{
    const p = path.join(app.getPath('userData'), 'state.json');
    const tmp = p + '.tmp';
    fs.writeFileSync(tmp, json, 'utf8');
    fs.renameSync(tmp, p);
  }catch(_e){}
}
function saveBackup(json){
  try{
    const dir = path.join(app.getPath('userData'), 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const d = new Date();
    const day = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    fs.writeFileSync(path.join(dir, 'backup-' + day + '.json'), json, 'utf8');
    // 只保留最近 7 份
    fs.readdirSync(dir).filter(function(f){ return /^backup-\d{4}-\d{2}-\d{2}\.json$/.test(f); })
      .sort().reverse().slice(7).forEach(function(f){ try{ fs.unlinkSync(path.join(dir, f)); }catch(_e){} });
  }catch(_e){}
}
process.on('uncaughtException', function(err){
  writeErrorLog('uncaughtException: ' + ((err && err.stack) || err));
});
process.on('unhandledRejection', function(reason){
  writeErrorLog('unhandledRejection: ' + (reason && (reason.stack || reason.message || reason)));
});

// Windows 上系统通知要能正常弹出，需先声明 AppUserModelID（与 package.json 的 build.appId 一致）
if (process.platform === 'win32') {
  app.setAppUserModelId('com.neutronstar.mymemoboards');
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
let updateStatus = 'idle';

// ---------------------------------------------------------------------------
// 2.5 自动更新：GitHub Releases 作为更新源（打包版才启用）
// ---------------------------------------------------------------------------
function initAutoUpdate(){
  try{
    if(!app.isPackaged) return;
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.on('update-available', function(info){ updateStatus = 'available:' + info.version; });
    autoUpdater.on('update-not-available', function(){ updateStatus = 'up-to-date'; });
    autoUpdater.on('update-downloaded', function(info){
      updateStatus = 'downloaded:' + info.version;
      if(win && Notification.isSupported()){
        new Notification({ title: '知墙更新已就绪', body: '重启后生效（v' + info.version + '）' }).show();
      }
    });
    autoUpdater.on('error', function(){ updateStatus = 'error'; });
    autoUpdater.checkForUpdates().catch(function(){});
  }catch(_e){}
}
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

function getWinModeFromState(){
  // 知墙默认/固定为无边框窗口，使用自绘标题栏；旧的 winMode 设置不再驱赶窗口形态
  return 'frameless';
}

// ---------------------------------------------------------------------------
// 3. 窗口
// ---------------------------------------------------------------------------
function createWindow() {
  const winMode = getWinModeFromState();
  win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 700,
    // 与 index.html 的 <title> 保持一致，避免加载完成瞬间标题跳变
    title: '知墙 · 学习工作台',
    backgroundColor: '#F2EFE6', // 与界面底稿纸同色，启动瞬间不闪白
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    frame: winMode !== 'frameless', // 无边框模式在创建时生效（重启后切换）
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

  if (winMode === 'fullscreen') {
    win.setFullScreen(true);
  }

  win.loadFile(path.join(__dirname, 'index.html'));

  // 知墙是纯本地单页应用：阻止一切页面跳转，防止意外导航/外链打开
  win.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
  });

  // 兜底防御：知墙无外链，禁止任何形式的新窗口弹出
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
  new Notification({ title: title || '知墙', body: body || '' }).show();
  return true;
});

ipcMain.handle('get-autostart', () => {
  try { return app.getLoginItemSettings().openAtLogin; } catch (_e) { return false; }
});

ipcMain.handle('set-autostart', (_e, on) => {
  try {
    app.setLoginItemSettings({ openAtLogin: !!on, openAsHidden: false });
    return app.getLoginItemSettings().openAtLogin;
  } catch (_e) {
    return false;
  }
});

ipcMain.handle('report-error', (_e, msg) => {
  writeErrorLog('renderer: ' + msg);
  return true;
});

ipcMain.handle('encrypt-text', (_e, text) => {
  try{
    if(!safeStorage.isEncryptionAvailable()) return null;
    return 'enc:' + safeStorage.encryptString(String(text || '')).toString('base64');
  }catch(_e){ return null; }
});

ipcMain.handle('decrypt-text', (_e, enc) => {
  try{
    if(!enc || String(enc).indexOf('enc:') !== 0) return String(enc || '');
    if(!safeStorage.isEncryptionAvailable()) return '';
    return safeStorage.decryptString(Buffer.from(String(enc).slice(4), 'base64'));
  }catch(_e){ return ''; }
});

ipcMain.on('load-state-sync', (e) => {
  e.returnValue = readStateFile();
});

ipcMain.on('save-state', (_e, json) => {
  writeStateFile(String(json || ''));
});

ipcMain.on('backup-state', (_e, json) => {
  saveBackup(String(json || ''));
});

// 语义化版本号比较：返回 1/0/-1（供 check-update 判断是否真有新版）
function compareVersions(a, b){
  const pa = String(a || '').split('.').map(x => parseInt(x, 10) || 0);
  const pb = String(b || '').split('.').map(x => parseInt(x, 10) || 0);
  const n = Math.max(pa.length, pb.length);
  for(let i = 0; i < n; i++){
    const x = pa[i] || 0, y = pb[i] || 0;
    if(x > y) return 1;
    if(x < y) return -1;
  }
  return 0;
}

ipcMain.handle('check-update', async function(){
  if(!app.isPackaged) return { available:false, status:'dev', message:'开发模式不检查更新' };
  try{
    const r = await autoUpdater.checkForUpdates();
    const remote = r && r.updateInfo && r.updateInfo.version;
    const local = app.getVersion();
    // 关键修复：用真实版本号比较，而不是 !!(r)（r 只要检查成功就非空，会造成“永远有新版本”的假象）
    return {
      available: !!remote && compareVersions(remote, local) > 0,
      version: remote,
      status: updateStatus
    };
  }catch(e){
    return { available:false, status:'error', message:String((e && e.message) || e) };
  }
});

ipcMain.handle('get-update-status', function(){
  return { status: updateStatus };
});

// 字体导入：选文件 → 拷进 userData/fonts → 返回 base64 给渲染进程注册 FontFace
ipcMain.handle('pick-font-file', async function(){
  try{
    const parent = (win && !win.isDestroyed()) ? win : undefined;
    const opts = {
      title: '选择字体文件',
      filters: [{ name: '字体文件', extensions: ['ttf','otf','ttc','woff','woff2'] }],
      properties: ['openFile']
    };
    const r = parent ? await dialog.showOpenDialog(parent, opts) : await dialog.showOpenDialog(opts);
    if(r.canceled || !r.filePaths || !r.filePaths[0]) return null;
    const src = r.filePaths[0];
    const name = path.basename(src);
    const fontsDir = path.join(app.getPath('userData'), 'fonts');
    fs.mkdirSync(fontsDir, { recursive: true });
    const dest = path.join(fontsDir, name);
    if(src.toLowerCase() !== dest.toLowerCase()) fs.copyFileSync(src, dest);
    const buf = fs.readFileSync(dest);
    return { name: name, base64: buf.toString('base64') };
  }catch(e){
    return { error: String((e && e.message) || e) };
  }
});

// 读取已保存的自定义字体（重启后重新注册用）
ipcMain.handle('read-font-file', function(_e, name){
  try{
    const safe = path.basename(String(name || ''));
    if(!safe) return null;
    const p = path.join(app.getPath('userData'), 'fonts', safe);
    if(!fs.existsSync(p)) return null;
    return { name: safe, base64: fs.readFileSync(p).toString('base64') };
  }catch(_err){
    return null;
  }
});

ipcMain.handle('set-window-mode', (_e, opts) => {
  if(!win) return { ok:false };
  if(opts && typeof opts.fullscreen === 'boolean'){
    win.setFullScreen(opts.fullscreen);
  }
  return {
    ok: true,
    fullscreen: win.isFullScreen(),
    frameless: !!(opts && typeof opts.frameless === 'boolean' ? opts.frameless : false)
  };
});

ipcMain.handle('window-action', (_e, action) => {
  if(!win) return false;
  if(action === 'minimize') win.minimize();
  else if(action === 'maximize') { if(win.isMaximized()) win.unmaximize(); else win.maximize(); }
  else if(action === 'close') win.close();
  return true;
});

ipcMain.handle('quit-app', function(){
  app.quit();
  return true;
});

app.whenReady().then(function(){
  // 最小权限原则：拒绝所有页面权限请求（摄像头/麦克风/地理位置等），页面无需这些能力
  session.defaultSession.setPermissionRequestHandler(function(_wc, _permission, callback){ callback(false); });
  createWindow();
  initAutoUpdate();
});

// Windows：关窗即退出（不做 macOS 那套驻留）
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
