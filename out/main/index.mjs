import { createRequire } from "node:module";
// -- CommonJS Shims --
import __cjs_mod__ from "node:module";
import.meta.filename;
const __dirname = import.meta.dirname;
__cjs_mod__.createRequire(import.meta.url);
//#region \0rolldown/runtime.js
var __require = /* #__PURE__ */ (() => createRequire(import.meta.url))();
//#endregion
//#region electron/main.js
/**
* Electron main process — AWAS Client App
*
* Dev  → loads Vite dev server at http://localhost:5173
* Prod → loads out/renderer/index.html (built by electron-vite build)
*/
var { app, BrowserWindow, shell, session, ipcMain } = __require("electron");
var path = __require("path");
var isDev = !app.isPackaged;
var VITE_DEV_URL = "http://localhost:5173";
function createWindow() {
	const win = new BrowserWindow({
		width: 1440,
		height: 900,
		minWidth: 960,
		minHeight: 600,
		title: "AWAS – Agentic Workflow Automation System",
		webPreferences: {
			preload: path.join(__dirname, "..", "preload", "index.mjs"),
			contextIsolation: true,
			nodeIntegration: false,
			webSecurity: true
		},
		autoHideMenuBar: true,
		backgroundColor: "#0f0f0f",
		show: false
	});
	win.once("ready-to-show", () => win.show());
	if (isDev) {
		win.loadURL(VITE_DEV_URL);
		win.webContents.openDevTools({ mode: "detach" });
	} else win.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith("http")) shell.openExternal(url);
		return { action: "deny" };
	});
}
app.on("ready", () => {
	if (!isDev) session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				"Content-Security-Policy": ["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:3000 http://localhost:4111 ws://localhost:*; img-src 'self' data:; font-src 'self' data:;"]
			}
		});
	});
	createWindow();
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
ipcMain.handle("app:get-version", () => app.getVersion());
//#endregion
export { };
