Windows setup for building native modules (better-sqlite3)

- Install Node 20.x using nvm-windows: https://github.com/coreybutler/nvm-windows
  - Example: `nvm install 20.8.0 && nvm use 20.8.0`

- Install "Build Tools for Visual Studio 2022":
  - Download: https://aka.ms/vs/17/release/vs_BuildTools.exe
  - During install select the "Desktop development with C++" workload and the Windows 10/11 SDK.

- If your project folder is on OneDrive, move it to a local path (e.g., `C:\Projects\test-prep-app`) to avoid file locking/EPERM issues.

- After installing the above, from the repository root run:

```powershell
npm ci
npm run build
```

- To ensure native modules are rebuilt for Electron, the project includes `electron-rebuild` and runs a postinstall step that will rebuild `better-sqlite3` for the Electron runtime.

If you still see build failures, collect the full `npm install` log and the output of `cl.exe` (or confirm it's in PATH).
