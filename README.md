<p align="center">
  <img src="./public/banner.svg" alt="Win Toolbox Banner" width="100%" />
</p>

<h1 align="center">Win Toolbox</h1>

<p align="center">
  ⚡ Less is more · 给中国 Windows 用户做的极简系统工具箱
</p>

<p align="center">
  <strong>还在截图、清理、修复、找大文件之间反复横跳？</strong><br />
  一个软件，把高频系统能力和高级玩法，压进一个好看又真能用的 Fluent 控制台里。
</p>

---

## 🔥 这不是“又一个工具箱”，而是能直接给客户演示的版本

> 截图要快  
> 清理要稳  
> 系统修复要有结果回显  
> 创作者缓存要能一键回血  
> 本地 AI 要会自己收手，不要后台偷吃显存

Win Toolbox 面向中国用户做产品语言和默认流程，目标不是堆功能，而是把真正高频、真正能打的 Windows 能力，做成一个顺手的桌面入口。

---

## ✨ 当前已经做好的能力

- 🏠 仪表盘：实时读取 CPU、内存、显卡、网络状态
- ✂️ 高级截图利器：优先调用 PixPin / Snipaste，未安装时回退到系统截图
- 🧹 一键清理：安全清理当前用户临时文件与常见垃圾
- 🎬 创作者深度清理：扫描剪映、CapCut、Adobe、DaVinci、OBS 等缓存
- 🩺 系统修复：内置 DISM 快速检查与深度扫描
- 💾 驱动导出备份：一键导出当前驱动到文档目录
- 🧠 AI 本地大脑：根据 RAM / VRAM 推荐 Qwen 档位，检测 Ollama 运行态
- 💬 AI 灵感悬浮窗：本地模型就绪后，可直接发起轻量问答
- 📦 插件化架构：扫描 `Plugins/config.json`，自动点亮便携工具入口
- 🪟 老板键演示模式：全屏假更新界面，适合演示与临时离屏遮罩
- ⚙️ 性能野兽模式：切换高性能电源策略，给渲染与推理让路
- 🧭 空间透视仪：直观看出下载、桌面、文档、视频里的大块空间占用

---

## 🖼️ 产品方向

### 1. Less is more

主界面只给最常用、最容易理解的高频动作。复杂能力默认折叠到二级区域，需要时再展开，不把用户第一眼注意力浪费在一堆噪音按钮上。

### 2. 中文化体验

从首页文案、功能命名、README 到插件清单，全部走中文产品语言。它不是技术 demo，而是给中国用户看的成品思路。

### 3. 结果可回看

所有动作都尽量把执行结果、耗时、输出路径和原始日志留在界面里。不是“点一下没反应”，而是“做了什么一清二楚”。

---

## 🧩 插件目录怎么用

项目自带一个插件 manifest：[`Plugins/config.json`](./Plugins/config.json)

你可以把便携工具按下面结构扔进去：

- `Plugins/PixPin/PixPin.exe`
- `Plugins/Snipaste/Snipaste.exe`
- `Plugins/ContextMenuManager/ContextMenuManager.exe`
- `Plugins/FileConverter/FileConverter.exe`

然后在工具箱里点“重新扫描插件”，对应入口就会自动亮起。

---

## 🚀 本地运行

### 环境要求

- Node.js 24+
- Rust stable
- Visual Studio C++ Build Tools

### 安装依赖

```bash
npm install
```

### 启动前端开发模式

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

---

## 🧠 为什么这个方向值得做

很多 Windows 工具箱的问题不是功能少，而是：

- 功能太乱，第一眼就让人累
- 改系统很猛，但没有安全边界
- 只会堆工具，不会做“能交付的产品感”
- 明明能做给中国用户用，却还停留在英文拼盘阶段

Win Toolbox 想做的，是把这些问题一起解决。

---

## ☕ 支持一下

如果你觉得这个项目真的有点意思，欢迎在应用内扫二维码给它来一口“160W 快充支援”。

---

## 📌 免责声明

- 当前版本优先保证“可展示、可理解、可运行”
- 深度系统调优会继续保持谨慎，不做高风险黑盒操作
- 老板键模式当前以安全的窗口级遮罩为主，不会做可能导致用户锁死桌面的危险拦截
