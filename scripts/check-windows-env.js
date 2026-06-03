const { execSync } = require('child_process');
const path = require('path');

function log(msg) {
  console.log('[check-windows-env] ' + msg);
}

if (process.platform !== 'win32') {
  // Non-Windows systems: nothing to check here.
  process.exit(0);
}

// Enforce Node 20.x per project engines
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor !== 20) {
  log('ERROR: Unsupported Node.js version: ' + process.versions.node);
  log('This project targets Node 20.x to match Electron and native modules.');
  log('Please install Node 20 using nvm-windows (https://github.com/coreybutler/nvm-windows)');
  process.exit(1);
}

// Check for Visual Studio C++ build tools (cl.exe available)
let hasCl = true;
try {
  execSync('where cl.exe', { stdio: 'ignore' });
} catch (err) {
  hasCl = false;
}

if (!hasCl) {
  log('ERROR: Visual C++ build tools not found (cl.exe missing).');
  log(
    'Install "Build Tools for Visual Studio 2022" with the "Desktop development with C++" workload.'
  );
  log('Download: https://aka.ms/vs/17/release/vs_BuildTools.exe');
  process.exit(1);
}

// Warn about OneDrive path which can lock node_modules
const cwd = process.cwd();
if (/OneDrive/i.test(cwd) || process.env.ONEDRIVE) {
  log('WARNING: Project appears to be on OneDrive which can lock files during install.');
  log('Recommendation: Move the project to a local folder (e.g., C:\\Projects) and retry.');
}

log('Environment checks passed.');
process.exit(0);
