const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const tmi = require('tmi.js');

// Disable hardware acceleration to resolve transparent window rendering issues on Windows
app.disableHardwareAcceleration();

let tmiClient = null;

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

const DEFAULT_CONFIG = {
  channel: '',
  fontSize: 16,
  opacity: 0.85,
  fadeTime: 15, // in seconds, 0 = never fade
  hotkey: 'Ctrl+Shift+Y',
  windowBounds: { x: 100, y: 100, width: 380, height: 600 }
};

let mainWindow = null;
let config = { ...DEFAULT_CONFIG };
let isLocked = true; // start locked (click-through) by default

// Load configuration
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
      // If channel is empty, start unlocked so settings are visible
      if (!config.channel) {
        isLocked = false;
      } else {
        isLocked = true;
      }
    } else {
      isLocked = false; // first run
      saveConfig(config);
    }
  } catch (err) {
    console.error('Failed to load config:', err);
    config = { ...DEFAULT_CONFIG };
    isLocked = false;
  }
}

// Save configuration
function saveConfig(newConfig) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save config:', err);
  }
}

function createWindow() {
  loadConfig();

  const { x, y, width, height } = config.windowBounds;

  mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: !isLocked,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Show and focus the window immediately to avoid paint lags on Windows
  mainWindow.show();
  mainWindow.focus();

  // Ensure window is always on top (even over fullscreen games in some modes)
  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  // Apply initial click-through state
  mainWindow.setIgnoreMouseEvents(isLocked);

  // Save window bounds when moved or resized
  const saveBounds = () => {
    if (mainWindow && !isLocked) {
      const bounds = mainWindow.getBounds();
      config.windowBounds = bounds;
      saveConfig(config);
    }
  };

  mainWindow.on('move', saveBounds);
  mainWindow.on('resize', saveBounds);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Log renderer console messages to main process stdout
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[RENDERER] [Level ${level}] ${message} (at ${sourceId}:${line})`);
  });

  // Register hotkey once window is ready
  mainWindow.webContents.on('did-finish-load', () => {
    registerHotkey(config.hotkey);
    if (config.channel) {
      connectToTwitch(config.channel);
    }
  });
}

function connectToTwitch(channelName) {
  if (tmiClient) {
    try {
      tmiClient.disconnect();
    } catch (e) {
      console.error('Failed to disconnect tmi:', e);
    }
    tmiClient = null;
  }

  tmiClient = new tmi.Client({
    options: { debug: false },
    channels: [channelName]
  });

  tmiClient.on('message', (channel, tags, message, self) => {
    if (self) return;
    if (mainWindow) {
      mainWindow.webContents.send('twitch-message', {
        username: tags['display-name'] || tags.username,
        message,
        color: tags.color,
        emotes: tags.emotes
      });
    }
  });

  tmiClient.on('connected', (address, port) => {
    console.log(`[MAIN] Connected to channel #${channelName}`);
    if (mainWindow) {
      mainWindow.webContents.send('twitch-status', 'connected', channelName);
    }
  });

  tmiClient.on('disconnected', (reason) => {
    console.log('[MAIN] Disconnected from twitch');
    if (mainWindow) {
      mainWindow.webContents.send('twitch-status', 'disconnected');
    }
  });

  tmiClient.connect().catch(err => {
    console.error('Twitch connection error:', err);
    if (mainWindow) {
      mainWindow.webContents.send('twitch-status', 'failed', err.message || err);
    }
  });
}

function toggleLockState() {
  if (!mainWindow) return;

  isLocked = !isLocked;

  // Toggle click-through
  mainWindow.setIgnoreMouseEvents(isLocked);

  // Toggle resizability
  mainWindow.setResizable(!isLocked);

  // Notify renderer about the new state
  mainWindow.webContents.send('lock-state-changed', isLocked);
}

function registerHotkey(shortcutString) {
  globalShortcut.unregisterAll();
  try {
    const success = globalShortcut.register(shortcutString, () => {
      toggleLockState();
    });
    if (!success) {
      console.error(`Registration failed for hotkey: ${shortcutString}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error registering hotkey: ${shortcutString}`, err);
    return false;
  }
}

// IPC Handlers
ipcMain.handle('get-config', () => {
  return config;
});

ipcMain.handle('init-app', () => {
  return { config, isLocked };
});

ipcMain.handle('set-lock-state', (event, lockState) => {
  if (!mainWindow) return;
  isLocked = lockState;
  mainWindow.setIgnoreMouseEvents(isLocked);
  mainWindow.setResizable(!isLocked);
  mainWindow.webContents.send('lock-state-changed', isLocked);
  return isLocked;
});

ipcMain.handle('save-settings', (event, newSettings) => {
  config = { ...config, ...newSettings };
  saveConfig(config);
  return true;
});

ipcMain.handle('connect-twitch', (event, channel) => {
  connectToTwitch(channel);
  return true;
});

ipcMain.handle('disconnect-twitch', () => {
  if (tmiClient) {
    try {
      tmiClient.disconnect();
    } catch (e) {}
    tmiClient = null;
  }
  return true;
});

ipcMain.handle('update-hotkey', (event, newHotkey) => {
  const oldHotkey = config.hotkey;
  if (registerHotkey(newHotkey)) {
    config.hotkey = newHotkey;
    saveConfig(config);
    return { success: true };
  } else {
    // Revert to old hotkey if registration fails
    registerHotkey(oldHotkey);
    return { success: false, currentHotkey: oldHotkey };
  }
});

ipcMain.handle('exit-app', () => {
  app.quit();
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
