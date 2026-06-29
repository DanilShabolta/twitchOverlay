# Twoverlay — Twitch Chat Overlay

[Русское описание ниже](#RU)

A modern, lightweight, frameless, and transparent Twitch chat overlay for streamers and gamers. It stays on top of all windows and supports a click-through mode, so it doesn't interfere with your gameplay.

## Features

- 🖥️ **Always on Top**: Renders over games and other windows (even in borderless windowed mode).
- 🖱️ **Click-Through Mode (Locked)**: Pass clicks directly through the chat overlay to the game underneath.
- ⚙️ **Edit Mode (Unlocked)**: Toggle with a hotkey to move, resize, and configure the window.
- 💬 **Twitch Integration**: Connected directly to Twitch IRC. Shows custom user colors and standard Twitch emotes.
- 🎨 **Sleek Customization**: Adjust font size, background opacity, and message fade timers.
- ⌨️ **Global Shortcut**: Customize the lock/unlock key combination (default: `Ctrl+Shift+Y`).
- 💾 **Auto-save**: Persists settings and window coordinates on restart.

---

## Installation & Setup

### 🟢 Easy way (for non-technical users)

1. Install [Node.js](https://nodejs.org/) (LTS version).
2. Download the project as a ZIP → **Code → Download ZIP**, extract it anywhere.
3. Double-click **`install.bat`** — it will create a **Twoverlay shortcut on your Desktop**.
4. From now on, just double-click the **Desktop shortcut** to launch the overlay.
   > On first launch it will automatically install all dependencies — just wait ~1 minute.

### 🔧 Manual way (for developers)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DanilShabolta/twitchOverlay.git
   cd twitchOverlay
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

---

## How to Use

1. By default, the app starts in **Unlocked Mode** on the first run (or **Locked Mode** if already configured).
2. Press **`Ctrl + Shift + Y`** on your keyboard (global hotkey) to unlock the overlay.
3. In the settings panel:
   - Enter your Twitch username in the **Twitch Channel** input and click **Connect**.
   - Customize opacity, font size, message fade duration, and hotkey.
   - Drag the window by the top header bar, and resize it by dragging its edges.
4. Click **Save & Lock** or press `Ctrl + Shift + Y` again to lock the overlay. It will become click-through and ready for gaming.

---

<a name="RU"></a>
# Twoverlay — Оверлей Twitch-чата поверх всех окон

Современный, легкий, прозрачный оверлей для чата Twitch. Отображается поверх всех окон и поддерживает режим сквозного клика (click-through), благодаря чему не мешает игровому процессу.

## Особенности

- 🖥️ **Поверх всех окон**: Работает поверх игр и приложений (в оконном режиме без рамки).
- 🖱️ **Сквозной клик (Заблокирован)**: Клик мыши проходит сквозь чат прямо в игру под ним.
- ⚙️ **Режим настройки (Разблокирован)**: Переключается горячей клавишей для перемещения, изменения размеров и настройки оверлея.
- 💬 **Прямое подключение к Twitch**: Показывает цвета ников пользователей и стандартные смайлики.
- 🎨 **Кастомизация**: Настройка размера шрифта, прозрачности фона и таймера исчезновения сообщений.
- ⌨️ **Глобальный хоткей**: Изменение сочетания клавиш блокировки/разблокировки (по умолчанию: `Ctrl+Shift+Y`).
- 💾 **Автосохранение**: Сохраняет ваши настройки и координаты окна.

---

## Установка и запуск

### 🟢 Простой способ (для обычных пользователей)

1. Установите [Node.js](https://nodejs.org/) (версия LTS).
2. Скачайте проект архивом: **Code → Download ZIP**, распакуйте в любую папку.
3. Дважды кликните **`install.bat`** — он создаст **ярлык на рабочем столе**.
4. Теперь запускайте оверлей двойным кликом по **ярлыку на рабочем столе**.
   > При первом запуске автоматически установятся все зависимости — подождите ~1 минуту.

### 🔧 Способ для разработчиков

1. **Склонируйте репозиторий**:
   ```bash
   git clone https://github.com/DanilShabolta/twitchOverlay.git
   cd twitchOverlay
   ```

2. **Установите зависимости**:
   ```bash
   npm install
   ```

3. **Запустите оверлей**:
   ```bash
   npm start
   ```

---

## Руководство пользователя

1. При первом запуске оверлей откроется в **Режиме настройки**.
2. Нажмите **`Ctrl + Shift + Y`** на клавиатуре (глобальное сочетание клавиш), чтобы заблокировать или разблокировать окно.
3. На панели настроек:
   - Введите имя вашего канала в поле **Twitch Channel** и нажмите **Connect**.
   - Настройте прозрачность, размер шрифта, время отображения сообщений и хоткей.
   - Перетащите окно за верхнюю плашку в удобное место экрана и растяните до нужного размера за края.
4. Нажмите **Save & Lock** или повторно нажмите `Ctrl + Shift + Y`, чтобы скрыть настройки. Окно станет прозрачным для кликов и готовым к игре.
