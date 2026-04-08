<p align="center">
  <img src="./public/banner.svg" alt="Win Toolbox Banner" width="100%" />
</p>

<h1 align="center">Win Toolbox</h1>

<p align="center">
  给中文用户做的极简 Windows 效率控制台
</p>

<p align="center">
  截图、清理、修复、空间管理、本地 AI，一装即用，不再来回切窗口。
</p>

---

## 功能概览

- 截图：基础截图开箱即用，增强截图可一键安装并直接启用。
- 清理：安全清理临时文件，结果、耗时和输出路径都会回显。
- 修复：DISM 检查、深度扫描、驱动导出和性能模式都收在系统页。
- 空间管理：用环形图、块状图和列表视图快速看清大文件和大目录。
- 本地 AI：自动评估机器档位，给出更适合当前硬件的本地模型建议。

## 这一版重点

- 首页只保留四个高频入口：截图、清理、修复、管理空间。
- 老板键增加明确的进入 / 退出提示，快捷键为 `Ctrl + Alt + B`。
- 空间管理改成可视化视图，不再像安装软件页面。
- 截图增强改成开启 / 关闭式体验，开启后自动安装 Snipaste 并提示快捷键。
- Clash Verge Rev、软件卸载增强、Everything、PowerToys 都支持一键安装。
- 修掉了 PowerShell 黑窗反复闪烁的问题。
- 图标、任务栏图标、README Banner 和应用内品牌统一重做。

## 组件中心

组件中心只保留用户能直接理解的状态：

- 安装
- 打开
- 卸载

当前已接入：

- Snipaste 截图增强
- Clash Verge Rev
- 软件卸载增强（BCUninstaller）
- Everything 搜索增强
- 右键菜单管理
- 7-Zip
- PowerToys
- Ollama

## 快捷键

- `Ctrl + Alt + B`：进入 / 退出老板键
- `Alt + Space`：打开 AI 灵感悬浮窗
- `F1`：Snipaste 截图
- `F3`：Snipaste 贴图

## 本地开发

### 环境要求

- Node.js 24+
- Rust stable
- Visual Studio C++ Build Tools

### 安装依赖

```bash
npm install
```

### 启动前端开发

```bash
npm run dev
```

### 启动桌面应用

```bash
npm run tauri dev
```

### 构建生产版本

```bash
npm run build
npm run tauri build
```

## 赞助支持

如果这个工具对你有帮助，欢迎扫码支持继续打磨：

<p align="center">
  <img src="./public/donate-qr.png" alt="赞助码" width="220" />
</p>
