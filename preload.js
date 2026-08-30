// 星之间 · 学习工作台 — 预加载脚本
// 职责边界：只把「窗口置顶」和「系统通知」两个桌面能力经 contextBridge 暴露给页面。
// 页面依旧拿不到任何 node 能力，业务逻辑仍然全在 index.html。

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  toggleTop: () => ipcRenderer.invoke('toggle-top'),
  getTop: () => ipcRenderer.invoke('get-top'),
  notify: (title, body) => ipcRenderer.invoke('notify', { title, body }),
  getAutoStart: () => ipcRenderer.invoke('get-autostart'),
  setAutoStart: (on) => ipcRenderer.invoke('set-autostart', !!on)
});
