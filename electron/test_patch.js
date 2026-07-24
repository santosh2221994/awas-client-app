'use strict';
const Module = require('module');
const path = require('path');
const fs = require('fs');

const _origNMP = Module._nodeModulePaths;
Module._nodeModulePaths = function(fromPath) {
  const paths = _origNMP.call(this, fromPath);
  // Log ALL calls
  fs.appendFileSync('/tmp/patch-debug.log', 'NMP: ' + fromPath + ' -> ' + paths.length + ' paths\n');
  // Filter electron
  return paths.filter(p => {
    const ep = path.join(p, 'electron', 'index.js');
    try { fs.accessSync(ep); fs.appendFileSync('/tmp/patch-debug.log', '  DROP: ' + p + '\n'); return false; }
    catch { return true; }
  });
};

fs.writeFileSync('/tmp/patch-debug.log', 'START\n');
let e;
try { e = require('electron'); }
catch(err) { e = null; fs.appendFileSync('/tmp/patch-debug.log', 'ERR: ' + err.message.substring(0,80) + '\n'); }
fs.appendFileSync('/tmp/patch-debug.log', 'result: ' + typeof e + '\n');
Module._nodeModulePaths = _origNMP;
setTimeout(() => process.exit(0), 200);
