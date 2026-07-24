'use strict';

/**
 * Electron preload script.
 * Runs with contextIsolation=true. Exposes a minimal, safe API to the renderer.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /** App version string, e.g. "1.0.0" */
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  /** OS platform: "darwin" | "win32" | "linux" */
  platform: process.platform,
  /** True when running inside Electron (use for conditional UI tweaks) */
  isElectron: true,
});
