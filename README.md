<p align="center">
  <img src="./public/banner.svg" alt="Win Toolbox Banner" width="100%" />
</p>

<h1 align="center">Win Toolbox V3</h1>

<p align="center">
  ⚡ Less is more · 给中文用户做的极简 Windows 效率控制台
</p>

<p align="center">
  <strong>截图、清理、修复、找大文件，还在来回切窗口？</strong><br />
  这一版不再堆按钮，也不再讲插件目录，安装完成就能直接用。
</p>

---

## ✨ V3 现在是什么

> 更轻  
> 更克制  
> 更像正式桌面产品  
> 不再像一个“什么都想塞进去”的展示页

Win Toolbox V3 面向中文用户，主打 5 件事：

- 🖼️ 截图：基础截图内置，增强截图支持一键安装
- 🧹 清理：安全清理临时文件，结果有反馈
- 🩺 修复：DISM 快速检查、深度扫描、驱动导出
- 📦 空间管理：直接找出下载、桌面、文档里的大块空间占用
- 🧠 本地 AI：根据 RAM / VRAM 给出模型建议，并接入 Ollama 运行时

---

## 🎯 这一版改了什么

- ✅ 去创作者化：删除创作者缓存主线，不再把小众场景放在产品中心
- ✅ 去插件化：核心体验不再依赖 `Plugins` 目录和手动塞 exe
- ✅ 去展示化：首页只保留截图、清理、修复、管理空间四个动作
- ✅ 全中文：界面、动作、README 都改成中文产品语言
- ✅ 更克制的视觉：减少大标题、减少说明堆叠、右侧信息改为按需抽屉
- ✅ 分辨率适配：桌面宽屏、中屏、小屏都做了响应式收口
- ✅ 鸿蒙字体优先：字体链默认优先 HarmonyOS Sans 系列

---

## 🧩 组件中心

增强能力统一改成“组件”：

- 截图增强
- 极速搜索
- 右键菜单管理
- 压缩解压增强
- PowerToys
- Ollama 运行时

用户只需要看到：

- 安装
- 启动
- 卸载

不再需要理解插件目录、配置清单和重新扫描。

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

## 📌 当前方向

Win Toolbox V3 的目标不是“做最多功能”，而是：

**把真正高频的 Windows 能力，做成一个干净、中文化、安装后就能直接用的桌面控制台。**

---

## ⚠️ 说明

- 当前版本优先保证“可展示、可理解、可运行”
- 深度系统操作仍然保持谨慎，不做高风险黑盒修改
- 老板键保留为隐藏入口，不作为首页主卖点
