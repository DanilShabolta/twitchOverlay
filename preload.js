const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Methods for renderer to call main process
  getConfig: () => ipcRenderer.invoke('get-config'),
  initApp: () => ipcRenderer.invoke('init-app'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  updateHotkey: (hotkey) => ipcRenderer.invoke('update-hotkey', hotkey),
  setLockState: (locked) => ipcRenderer.invoke('set-lock-state', locked),
  connectTwitch: (channel) => ipcRenderer.invoke('connect-twitch', channel),
  disconnectTwitch: () => ipcRenderer.invoke('disconnect-twitch'),
  exitApp: () => ipcRenderer.invoke('exit-app'),

  // Event listeners for main process calling renderer
  onInitConfig: (callback) => {
    ipcRenderer.on('init-config', (event, config, isLocked) => callback(config, isLocked));
  },
  onLockStateChanged: (callback) => {
    ipcRenderer.on('lock-state-changed', (event, isLocked) => callback(isLocked));
  },
  onTwitchMessage: (callback) => {
    ipcRenderer.on('twitch-message', (event, data) => callback(data));
  },
  onTwitchStatus: (callback) => {
    ipcRenderer.on('twitch-status', (event, status, extra) => callback(status, extra));
  }
});
