import { createRequire } from "node:module";
// -- CommonJS Shims --
import __cjs_mod__ from "node:module";
import.meta.filename;
import.meta.dirname;
__cjs_mod__.createRequire(import.meta.url);
//#region \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __require = /* #__PURE__ */ (() => createRequire(import.meta.url))();
//#endregion
//#region electron/preload.cjs
var require_preload = /* @__PURE__ */ __commonJSMin((() => {
	/**
	* Electron preload script.
	* Runs with contextIsolation=true. Exposes a minimal, safe API to the renderer.
	*/
	var { contextBridge, ipcRenderer } = __require("electron");
	contextBridge.exposeInMainWorld("electronAPI", {
		/** App version string, e.g. "1.0.0" */
		getVersion: () => ipcRenderer.invoke("app:get-version"),
		/** OS platform: "darwin" | "win32" | "linux" */
		platform: process.platform,
		/** True when running inside Electron (use for conditional UI tweaks) */
		isElectron: true
	});
}));
//#endregion
export default require_preload();
export {};
