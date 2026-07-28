'use strict';

/**
 * Electron main process — AWAS Client App
 *
 * Dev  → loads Vite dev server at http://localhost:5173
 * Prod → loads out/renderer/index.html (built by electron-vite build)
 *
 * Electron's node_init.js patches Module._nodeModulePaths to filter paths
 * when a module is loaded from within resourcesPath. For user apps outside
 * resourcesPath, the normal node_modules resolution applies — which finds
 * the `electron` npm package (returning a binary path string) before
 * Electron can intercept require('electron').
 *
 * Fix: patch _nodeModulePaths to exclude node_modules/electron from
 * resolution so Electron's c._load can provide the real API object.
 */

const Module = require('module');
const path = require('path');

// Intercept _nodeModulePaths to exclude paths containing node_modules/electron
// This makes require('electron') fall through to Electron's c._load built-in.
const _origNodeModulePaths = Module._nodeModulePaths;
Module._nodeModulePaths = function (fromPath) {
  const paths = _origNodeModulePaths.call(this, fromPath);
  return paths.filter((p) => {
    // Keep path only if it does NOT resolve to a directory containing
    // the electron npm package (node_modules/electron/index.js)
    const electronPkg = path.join(p, 'electron', 'index.js');
    try {
      require('fs').accessSync(electronPkg);
      return false; // this node_modules has electron — skip it
    } catch {
      return true; // electron not found here — keep this path
    }
  });
};

// Now require('electron') will NOT find node_modules/electron and
// Electron's c._load hook will provide the real API object.
const { app, BrowserWindow, shell, session, ipcMain } = require('electron');

// Restore the original _nodeModulePaths so other requires work normally
Module._nodeModulePaths = _origNodeModulePaths;

const isDev = !app.isPackaged;
const VITE_DEV_URL = 'http://localhost:5173';

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    title: 'AWAS – Agentic Workflow Automation System',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    autoHideMenuBar: true,
    backgroundColor: '#0f0f0f',
    show: false,
  });

  win.once('ready-to-show', () => win.show());

  if (isDev) {
    win.loadURL(VITE_DEV_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '..', 'out', 'renderer', 'index.html'));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.on('ready', () => {
  if (!isDev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "connect-src 'self' http://localhost:3000 http://localhost:4111 ws://localhost:*; " +
            "img-src 'self' data:; " +
            "font-src 'self' data:;",
          ],
        },
      });
    });
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('app:get-version', () => app.getVersion());
