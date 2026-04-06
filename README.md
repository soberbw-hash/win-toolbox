# Win Toolbox

Win Toolbox is a minimal Windows system toolbox built with Tauri, React, TypeScript, Rust, and PowerShell.

## What Works Now

- Live system snapshot for CPU, memory, GPU, and primary network state
- Safe temp cleanup for the current user
- Screenshot launch with plugin-first fallback to the built-in Windows capture bar
- DISM CheckHealth and ScanHealth actions with raw command output surfaced in the UI
- Driver export into `Documents/WinToolbox/DriverBackups`
- Plugin discovery from `Plugins/config.json`
- Hardware-aware local AI recommendations for Qwen-sized deployments

## Plugin Folder

The repo ships with a sample plugin manifest in [`Plugins/config.json`](./Plugins/config.json).

Drop portable tools into `Plugins/` using a structure like this:

- `Plugins/PixPin/PixPin.exe`
- `Plugins/Snipaste/Snipaste.exe`
- `Plugins/ContextMenuManager/ContextMenuManager.exe`

The app resolves each executable relative to the plugin folder and automatically enables launch buttons for installed tools.

## Development

Prerequisites:

- Node.js 24+
- Rust stable toolchain
- Visual Studio C++ Build Tools

Install dependencies:

```bash
npm install
```

Run the web shell:

```bash
npm run dev
```

Run the desktop app:

```bash
npm run tauri dev
```

Build the desktop frontend:

```bash
npm run build
```
