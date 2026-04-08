<p align="center">
  <img src="./public/banner.svg" alt="Win Toolbox Banner" width="100%" />
</p>

<h1 align="center">Win Toolbox V3.3</h1>

<p align="center">
  给中文用户做的极简 Windows 效率控制台
</p>

<p align="center">
  截图、清理、修复、空间管理、Qclaw 和图片查看器，一装即用，不再来回切窗口。
</p>

---

## 功能概览

- 截图：基础截图开箱即用，增强截图可一键安装并直接启用。
- 清理：安全清理临时文件，结果、耗时和日志都会回显。
- 修复：DISM 检查、深度扫描、驱动导出和性能模式都收在系统页。
- 空间管理：用环形图、块状图和列表视图快速看清大文件和大目录。
- 本地 AI：自动评估机器档位，给出更适合当前硬件的本地模型建议。
- 组件中心：Qclaw、图片查看器、Clash Verge Rev、软件卸载增强都支持一键安装。

## V3.3 这一版重点

- 组件中心已接入 `Qclaw 桌面助手`。
- 组件中心新增 `图片查看器`，默认接入 Honeyview。
- 组件卡片统一支持安装、打开、修复、卸载和状态提示。
- 设置页新增第三方组件说明、来源、许可证、日志目录和组件数据目录入口。
- 软件首次打开会显示启动进度，不再像卡住几秒没有反馈。

## 组件中心

当前已接入：

- Qclaw 桌面助手
- 图片查看器（Honeyview）
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
