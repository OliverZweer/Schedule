const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  dialog,
  globalShortcut,
  nativeImage,
  screen,
  shell,
} = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const { spawn } = require("node:child_process");

const APP_NAME = "岁序日历";
const SERVER_PORT = 3210;
const DEV_URL = process.env.CALENDAR_APP_URL || "http://localhost:3000";

let mainWindow = null;
let tray = null;
let serverProcess = null;
let serverLog = null;
let appUrl = DEV_URL;
let isQuitting = false;
let settings = {};
let settingsPath = "";
let boundsTimer = null;

app.setName(APP_NAME);

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => showWindow());
  app
    .whenReady()
    .then(bootstrap)
    .catch((error) => {
      dialog.showErrorBox(
        APP_NAME,
        `启动失败：${error instanceof Error ? error.message : String(error)}`,
      );
      isQuitting = true;
      app.quit();
    });
}

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  } catch {
    return {};
  }
}

function writeSettings(patch) {
  settings = { ...settings, ...patch };
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf8");
  } catch (error) {
    console.error("无法写入设置", error);
  }
}

function assetPath(file) {
  return path.join(__dirname, "..", "build", file);
}

function saveWindowBounds() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  clearTimeout(boundsTimer);
  boundsTimer = setTimeout(() => {
    if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isMinimized()) {
      return;
    }
    const bounds = mainWindow.getBounds();
    writeSettings(bounds);
  }, 500);
}

function createWindow() {
  const display = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint(),
  );
  const { workArea } = display;
  const width = Math.min(settings.width || 460, workArea.width - 24);
  const height = Math.min(settings.height || 780, workArea.height - 24);
  let x = Number.isFinite(settings.x)
    ? settings.x
    : workArea.x + workArea.width - width - 24;
  let y = Number.isFinite(settings.y) ? settings.y : workArea.y + 48;

  x = Math.max(workArea.x, Math.min(x, workArea.x + workArea.width - width));
  y = Math.max(workArea.y, Math.min(y, workArea.y + workArea.height - height));

  const alwaysOnTop = settings.alwaysOnTop !== false;

  mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    minWidth: 380,
    minHeight: 520,
    show: false,
    title: APP_NAME,
    icon: assetPath("icon.png"),
    backgroundColor: "#f5f4ef",
    alwaysOnTop,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      backgroundThrottling: false,
    },
  });

  if (process.platform !== "darwin") mainWindow.removeMenu();
  mainWindow.setAlwaysOnTop(alwaysOnTop, "floating");
  mainWindow.loadURL(appUrl);

  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("move", saveWindowBounds);
  mainWindow.on("resize", saveWindowBounds);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) void shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(appUrl)) {
      event.preventDefault();
      if (url.startsWith("http")) void shell.openExternal(url);
    }
  });
}

function showWindow() {
  if (!mainWindow) {
    if (appUrl) createWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) mainWindow.hide();
  else showWindow();
}

function updateTrayMenu() {
  if (!tray) return;

  let autoLaunch = false;
  if (app.isPackaged) {
    try {
      autoLaunch = app.getLoginItemSettings().openAtLogin;
    } catch {
      autoLaunch = false;
    }
  }

  const menu = Menu.buildFromTemplate([
    {
      label: "显示 / 隐藏日历",
      accelerator: "CmdOrCtrl+Shift+C",
      click: toggleWindow,
    },
    { type: "separator" },
    {
      label: "窗口置顶",
      type: "checkbox",
      checked: mainWindow ? mainWindow.isAlwaysOnTop() : settings.alwaysOnTop !== false,
      click: (item) => {
        writeSettings({ alwaysOnTop: item.checked });
        mainWindow?.setAlwaysOnTop(item.checked, "floating");
        updateTrayMenu();
      },
    },
    {
      label: "开机启动",
      type: "checkbox",
      checked: autoLaunch,
      enabled: app.isPackaged,
      click: (item) => {
        if (!app.isPackaged) return;
        try {
          app.setLoginItemSettings({
            openAtLogin: item.checked,
            openAsHidden: false,
          });
          writeSettings({ autoLaunchInitialized: true });
        } catch (error) {
          console.error("设置开机启动失败", error);
        }
        updateTrayMenu();
      },
    },
    { type: "separator" },
    {
      label: "安装到手机 / 桌面",
      click: () => {
        showWindow();
        mainWindow?.loadURL(`${appUrl}/install`);
      },
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(menu);
}

function createTray() {
  const image = nativeImage.createFromPath(assetPath("tray.png"));
  if (image.isEmpty()) {
    console.warn("Tray icon not found:", assetPath("tray.png"));
  }
  tray = new Tray(image);
  tray.setToolTip(APP_NAME);
  tray.on("click", toggleWindow);
  updateTrayMenu();
}

function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();
  return new Promise((resolve) => {
    const attempt = () => {
      if (Date.now() - startedAt > timeoutMs) {
        resolve(false);
        return;
      }
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve(true);
        } else {
          setTimeout(attempt, 400);
        }
      });
      request.on("error", () => setTimeout(attempt, 400));
      request.setTimeout(1500, () => {
        request.destroy();
        setTimeout(attempt, 400);
      });
    };
    attempt();
  });
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once("error", () => resolve(false));
    probe.once("listening", () => probe.close(() => resolve(true)));
    probe.listen(port, "127.0.0.1");
  });
}

async function startBundledServer() {
  if (!(await isPortFree(SERVER_PORT))) {
    throw new Error(
      `端口 ${SERVER_PORT} 已被占用，请关闭占用该端口的程序后重试。`,
    );
  }

  const serverDir = path.join(process.resourcesPath, "app-server");
  const entry = path.join(serverDir, "server.js");
  if (!fs.existsSync(entry)) {
    throw new Error(`找不到内置服务器文件：${entry}`);
  }

  const logPath = path.join(app.getPath("userData"), "server.log");
  serverLog = fs.createWriteStream(logPath, { flags: "a" });
  serverLog.write(`\n[${new Date().toISOString()}] starting ${entry}\n`);

  serverProcess = spawn(process.execPath, [entry], {
    cwd: serverDir,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(SERVER_PORT),
      HOSTNAME: "127.0.0.1",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  serverProcess.stdout.pipe(serverLog);
  serverProcess.stderr.pipe(serverLog);

  serverProcess.on("exit", (code) => {
    serverLog?.write(`\n[server exited] code=${code}\n`);
    if (!isQuitting && code !== 0) {
      dialog.showErrorBox(
        APP_NAME,
        `内置服务异常退出（${code}）。日志：${logPath}`,
      );
    }
  });
}

async function bootstrap() {
  settingsPath = path.join(app.getPath("userData"), "settings.json");
  settings = readSettings();

  if (app.isPackaged) {
    await startBundledServer();
    const ready = await waitForServer(`http://127.0.0.1:${SERVER_PORT}`);
    if (!ready) throw new Error("内置服务启动超时");
    appUrl = `http://127.0.0.1:${SERVER_PORT}`;

    // Start with the floating calendar at login on first run; the tray menu
    // lets the user turn it off afterwards.
    try {
      const login = app.getLoginItemSettings();
      if (!login.openAtLogin && settings.autoLaunchInitialized !== true) {
        app.setLoginItemSettings({ openAtLogin: true, openAsHidden: false });
        writeSettings({ autoLaunchInitialized: true });
      }
    } catch (error) {
      console.warn("无法设置开机启动", error);
    }
  } else {
    appUrl = DEV_URL;
  }

  createWindow();
  createTray();
  globalShortcut.register("CommandOrControl+Shift+C", toggleWindow);
  app.on("activate", showWindow);
}

app.on("before-quit", () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
  serverLog?.end();
});

// Keep the tray app alive after the window is closed.
app.on("window-all-closed", () => {});
