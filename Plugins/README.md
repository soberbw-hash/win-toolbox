# Win Toolbox Plugins

Drop portable tools into this folder and keep `config.json` updated.

Suggested layout:

- `Plugins/PixPin/PixPin.exe`
- `Plugins/Snipaste/Snipaste.exe`
- `Plugins/ContextMenuManager/ContextMenuManager.exe`
- `Plugins/FileConverter/FileConverter.exe`

The app scans `config.json`, resolves every executable relative to this folder, and lights up installed tools automatically.
