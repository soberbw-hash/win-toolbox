# Win Toolbox 插件目录

把便携工具放进这个目录，并维护好 `config.json`，主程序就会自动识别并点亮入口。

推荐结构：

- `Plugins/PixPin/PixPin.exe`
- `Plugins/Snipaste/Snipaste.exe`
- `Plugins/ContextMenuManager/ContextMenuManager.exe`
- `Plugins/FileConverter/FileConverter.exe`

应用会读取 `config.json`，并基于这个目录去解析每个可执行文件的相对路径。
