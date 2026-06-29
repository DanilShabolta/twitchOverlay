console.log("Renderer: app.js loaded!");
// DOM Elements
const appContainer = document.getElementById('app');
const dragHeader = document.getElementById('drag-header');
const messagesList = document.getElementById('messages-list');
const chatContainer = document.getElementById('chat-container');

// Settings Elements
const channelInput = document.getElementById('channel-input');
const connectBtn = document.getElementById('connect-btn');
const connectionStatus = document.getElementById('connection-status');
const opacityInput = document.getElementById('opacity-input');
const opacityVal = document.getElementById('opacity-val');
const fontSizeInput = document.getElementById('font-size-input');
const fontSizeVal = document.getElementById('font-size-val');
const fadeTimeInput = document.getElementById('fade-time-input');
const fadeTimeVal = document.getElementById('fade-time-val');
const hotkeyInput = document.getElementById('hotkey-input');
const currentHotkeyHint = document.getElementById('current-hotkey-hint');
const saveBtn = document.getElementById('save-btn');
const exitBtn = document.getElementById('exit-btn');

// App State
let config = {};
let isLocked = true;
let client = null;
const MAX_MESSAGES = 100;

// Escape HTML utility to prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Safely format message with Twitch emotes
function formatMessage(text, emotes) {
  let escapedText = escapeHTML(text);
  if (!emotes) return escapedText;

  // Extract all occurrence ranges of emotes
  const emotePositions = [];
  Object.keys(emotes).forEach(id => {
    emotes[id].forEach(range => {
      const [startStr, endStr] = range.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      emotePositions.push({ id, start, end });
    });
  });

  // Sort descending by start position to replace from end to start
  // This prevents index shifts when editing the string
  emotePositions.sort((a, b) => b.start - a.start);

  let result = '';
  let lastIdx = text.length;

  for (const emote of emotePositions) {
    if (emote.start >= lastIdx) continue;

    // Escape text after this emote
    const afterText = text.substring(emote.end + 1, lastIdx);
    result = escapeHTML(afterText) + result;

    // Insert emote image
    const emoteText = text.substring(emote.start, emote.end + 1);
    const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/1.0`;
    const imgHtml = `<img class="chat-emote" src="${emoteUrl}" alt="${escapeHTML(emoteText)}" title="${escapeHTML(emoteText)}">`;
    result = imgHtml + result;

    lastIdx = emote.start;
  }

  // Escape remaining text at start
  const beforeText = text.substring(0, lastIdx);
  result = escapeHTML(beforeText) + result;

  return result;
}

// Update settings values in view (CSS variables & UI controls)
function applyConfig(newConfig) {
  config = { ...config, ...newConfig };

  // Set CSS Custom Properties
  document.documentElement.style.setProperty('--bg-opacity', config.opacity);
  document.documentElement.style.setProperty('--font-size', `${config.fontSize}px`);

  // Update DOM control values
  channelInput.value = config.channel || '';
  opacityInput.value = Math.round(config.opacity * 100);
  opacityVal.textContent = opacityInput.value;
  fontSizeInput.value = config.fontSize;
  fontSizeVal.textContent = config.fontSize;
  fadeTimeInput.value = config.fadeTime;
  fadeTimeVal.textContent = config.fadeTime === 0 ? 'Never' : config.fadeTime;
  hotkeyInput.value = config.hotkey;
  if (currentHotkeyHint) currentHotkeyHint.textContent = config.hotkey;
}

// Add message to chat list
function addMessage(username, message, color, emotes = null) {
  const messageEl = document.createElement('div');
  messageEl.classList.add('chat-message');

  const userColor = color || '#a970ff'; // default twitch purple
  const formattedText = formatMessage(message, emotes);

  messageEl.innerHTML = `
    <span class="chat-username" style="color: ${userColor}">${escapeHTML(username)}:</span>
    <span class="chat-text">${formattedText}</span>
  `;

  messagesList.appendChild(messageEl);

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Manage Fade Out
  if (config.fadeTime > 0) {
    setTimeout(() => {
      messageEl.classList.add('faded');
    }, config.fadeTime * 1000);
  }

  // Prevent memory build up
  const messages = messagesList.getElementsByClassName('chat-message');
  if (messages.length > MAX_MESSAGES) {
    messagesList.removeChild(messages[0]);
  }
}

function addSystemMessage(title, text) {
  const messageEl = document.createElement('div');
  messageEl.classList.add('system-message');
  messageEl.innerHTML = `
    <div class="system-title">${escapeHTML(title)}</div>
    <div class="system-body">${escapeHTML(text)}</div>
  `;
  messagesList.appendChild(messageEl);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Remove oldest system messages if too many elements
  const systemMsgs = messagesList.getElementsByClassName('system-message');
  if (systemMsgs.length > 5) {
    messagesList.removeChild(systemMsgs[0]);
  }
}

// Connect to Twitch Channel Chat
function connectToTwitch(channelName) {
  if (!channelName) {
    addSystemMessage('Info', 'Enter a Twitch channel name to connect.');
    return;
  }

  connectionStatus.textContent = 'Connecting...';
  connectionStatus.className = 'status-connecting';

  window.api.connectTwitch(channelName);
}

// Event Listeners for settings inputs
opacityInput.addEventListener('input', (e) => {
  const val = e.target.value;
  opacityVal.textContent = val;
  document.documentElement.style.setProperty('--bg-opacity', val / 100);
});

fontSizeInput.addEventListener('input', (e) => {
  const val = e.target.value;
  fontSizeVal.textContent = val;
  document.documentElement.style.setProperty('--font-size', `${val}px`);
});

fadeTimeInput.addEventListener('input', (e) => {
  const val = e.target.value;
  fadeTimeVal.textContent = val === '0' ? 'Never' : val;
});

// Capture hotkey dynamically
hotkeyInput.addEventListener('keydown', (e) => {
  e.preventDefault();
  
  const keys = [];
  if (e.ctrlKey) keys.push('Ctrl');
  if (e.shiftKey) keys.push('Shift');
  if (e.altKey) keys.push('Alt');
  if (e.metaKey) keys.push('Cmd');

  // Key code checks
  if (['Control', 'Shift', 'Alt', 'Meta'].indexOf(e.key) === -1) {
    let keyName = e.key;
    if (keyName === ' ') keyName = 'Space';
    // Format single chars to uppercase
    if (keyName.length === 1) keyName = keyName.toUpperCase();
    if (keyName.startsWith('Arrow')) keyName = keyName.replace('Arrow', '');
    keys.push(keyName);
  }

  if (keys.length > 0) {
    const shortcutStr = keys.join('+');
    hotkeyInput.value = shortcutStr;
  }
});

// Action buttons
connectBtn.addEventListener('click', () => {
  const channel = channelInput.value.trim().toLowerCase();
  if (channel) {
    config.channel = channel;
    window.api.saveSettings({ channel });
    connectToTwitch(channel);
  }
});

saveBtn.addEventListener('click', async () => {
  const updatedSettings = {
    channel: channelInput.value.trim().toLowerCase(),
    opacity: parseFloat(opacityInput.value) / 100,
    fontSize: parseInt(fontSizeInput.value, 10),
    fadeTime: parseInt(fadeTimeInput.value, 10)
  };

  const selectedHotkey = hotkeyInput.value;

  // If hotkey was changed, try to update in main process
  if (selectedHotkey !== config.hotkey) {
    const result = await window.api.updateHotkey(selectedHotkey);
    if (result.success) {
      updatedSettings.hotkey = selectedHotkey;
      addSystemMessage('System', `Global hotkey updated to ${selectedHotkey}`);
    } else {
      addSystemMessage('System', `Failed to register hotkey ${selectedHotkey}. Reverting.`);
      hotkeyInput.value = result.currentHotkey;
    }
  }

  await window.api.saveSettings(updatedSettings);
  applyConfig(updatedSettings);

  // Lock window after saving settings
  await window.api.setLockState(true);
});

exitBtn.addEventListener('click', () => {
  window.api.exitApp();
});

// IPC Initialization (Pull config from main process)
async function init() {
  console.log("Renderer: Initializing app...");
  const data = await window.api.initApp();
  console.log("Renderer: Initial config received:", data);
  
  applyConfig(data.config);
  isLocked = data.isLocked;
  updateLockStateView(isLocked);
}

// Start initialization when DOM is ready
window.addEventListener('DOMContentLoaded', init);

window.api.onLockStateChanged((newLockState) => {
  isLocked = newLockState;
  updateLockStateView(isLocked);
});

// Twitch Event Listeners from Main Process
window.api.onTwitchMessage((data) => {
  addMessage(data.username, data.message, data.color, data.emotes);
});

window.api.onTwitchStatus((status, extra) => {
  if (status === 'connected') {
    connectionStatus.textContent = `Connected to #${extra}`;
    connectionStatus.className = 'status-connected';
    addSystemMessage('System', `Successfully connected to channel: ${extra}`);
  } else if (status === 'disconnected') {
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.className = 'status-disconnected';
  } else if (status === 'failed') {
    connectionStatus.textContent = 'Connection Failed';
    connectionStatus.className = 'status-disconnected';
    addSystemMessage('Error', `Failed to connect: ${extra}`);
  }
});

function updateLockStateView(locked) {
  if (locked) {
    appContainer.className = 'locked';
    // Enable full click-through in renderer (to be extra safe, though Electron handles it)
    document.body.style.pointerEvents = 'none';
    appContainer.style.pointerEvents = 'none';
  } else {
    appContainer.className = 'unlocked';
    document.body.style.pointerEvents = 'auto';
    appContainer.style.pointerEvents = 'auto';
    // Clear blur or fade styles momentarily while editing so user can see chat
    const messages = messagesList.getElementsByClassName('chat-message');
    for (const msg of messages) {
      msg.classList.remove('faded');
    }
  }
}
