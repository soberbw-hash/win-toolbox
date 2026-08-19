<p align="center">
  <img src="./public/banner.svg" alt="Win Toolbox Banner" width="100%" />
</p>

<h1 align="center">Win Toolbox</h1>

<p align="center">
  <strong>给中文 Windows 用户准备的一站式效率与维护控制台。</strong><br />
  截图、清理、系统检查、空间管理、常用组件和本地 AI，一处完成。
</p>

<p align="center">
  <a href="https://github.com/soberbw-hash/win-toolbox/releases/latest"><img alt="GitHub Release" src="https://img.shields.io/github/v/release/soberbw-hash/win-toolbox?display_name=tag&sort=semver" /></a>
  <img alt="Windows 10 / 11" src="https://img.shields.io/badge/Windows-10%20%2F%2011-1675F2?logo=windows11&logoColor=white" />
  <img alt="Tauri 2" src="https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri&logoColor=white" />
  <img alt="Local AI" src="https://img.shields.io/badge/AI-local%20via%20Ollama-15946F" />
  <a href="LICENSE"><img alt="Source available, all rights reserved" src="https://img.shields.io/badge/license-source--available%20%7C%20all%20rights%20reserved-64748B" /></a>
</p>

<p align="center">
  <a href="#下载与安装">下载</a> ·
  <a href="#功能全览">功能</a> ·
  <a href="#组件中心">组件中心</a> ·
  <a href="#本地-ai">本地 AI</a> ·
  <a href="#安全与数据边界">安全</a> ·
  <a href="#从源码开发">开发</a> ·
  <a href="#许可">许可</a>
</p>

> [!IMPORTANT]
> Win Toolbox 包含临时文件清理、DISM 检查、驱动导出、电源策略切换和第三方软件安装等系统操作。执行前请阅读界面中的动作说明；受管理的公司电脑应先确认组织策略和管理员授权。

## 项目状态

- 当前正式版：`v3.4.0`；
- 支持平台：Windows 10 / 11 x64；
- 桌面架构：Tauri 2 + Rust + React + TypeScript；
- 本地 AI：可选使用用户自己安装的 Ollama 和本地模型；
- 发布方式：通过本仓库 [Releases](https://github.com/soberbw-hash/win-toolbox/releases/latest) 提供正式版本。

## 为什么做 Win Toolbox

Windows 上很多常用操作不是不存在，而是散落在系统设置、旧控制面板、命令行和多个独立工具里。用户为了截图、清理临时文件、检查系统映像、导出驱动、看磁盘占用或安装常用组件，需要记住不同入口和命令。

Win Toolbox 把这些动作整理成一个中文控制台：先说明用途和影响，再执行固定操作并回显结果。它不试图替代所有专业工具，而是把高频入口、可靠系统命令和常用第三方组件放到一个一致界面中。

## 功能全览

### 首页与快捷动作

- 基础区域截图；
- 一键安全清理临时目录；
- DISM 快速健康检查；
- 空间管理入口；
- 最近动作结果、耗时和错误回显；
- 机器 CPU、内存、显卡、系统与主要网络接口概览。

### 系统维护

| 动作 | 作用 | 注意事项 |
| --- | --- | --- |
| DISM 快速检查 | 快速判断 Windows 组件存储是否健康 | 主要为只读检查 |
| DISM 深度扫描 | 更完整地扫描系统映像 | 耗时更长，建议等待完成 |
| 驱动导出 | 把当前驱动导出到文档目录 | 适合重装或迁移前准备 |
| Windows 更新 | 打开系统更新页 | 最终安装由 Windows 管理 |
| 应用管理 | 打开系统应用管理入口 | 卸载前确认重要数据 |
| 通知净化 | 打开通知设置 | 不在后台擅自关闭通知 |
| 高性能模式 | 切换 Windows 电源计划 | 会提高功耗和发热 |
| 恢复平衡模式 | 回到日常电源策略 | 重任务中切换前确认时机 |

### 空间管理

- 扫描常见用户目录和应用数据热点；
- 用环形图、块状图和列表查看空间分布；
- 列出最大的 16 个热点位置；
- 从结果直接打开对应目录，再由用户决定如何处理；
- 不把“占用大”自动等同于“可以删除”。

### 效率体验

- `Ctrl + Alt + B` 进入或退出老板键全屏遮罩；
- `Alt + Space` 打开本地 AI 灵感悬浮窗；
- 安装 Snipaste 后可使用 `F1` 截图、`F3` 贴图；
- 响应式桌面布局、启动进度和操作 Toast；
- 外观、偏好、组件说明与第三方许可集中在设置页。

> 老板键只是界面遮罩，不是安全隔离、隐私保护或防监控功能，不应用于隐藏敏感数据或绕过组织制度。

## 组件中心

Win Toolbox 通过 Windows Package Manager（`winget`）安装和管理常用软件，并保留每个组件的来源、软件包 ID、主页和许可提示。第三方软件不是 Win Toolbox 自有组件，仍由原作者发布并适用各自条款。

| 组件 | 用途 | 安装来源 / 许可提示 |
| --- | --- | --- |
| Qclaw 桌面助手 | 桌面 AI 助手 | 腾讯官方安装包，专有软件 |
| Honeyview | 轻量图片与压缩包图片查看 | Bandisoft，Freeware |
| Snipaste | 增强截图与贴图 | Snipaste，Freemium |
| File Converter | 右键转换和压缩文件 | GPL-3.0 |
| Koodo Reader | 电子书阅读 | AGPL-3.0 |
| Everything | 快速文件搜索 | voidtools，专有免费软件 |
| Context Menu Manager | 管理系统右键菜单 | 开源项目 |
| 7-Zip | 压缩与解压 | 7-Zip 自有开源许可组合 |
| Clash Verge Rev | 网络代理客户端 | GPL-3.0 |
| BCUninstaller | 增强软件卸载 | Apache-2.0 |
| PowerToys | Windows 效率工具集 | Microsoft，MIT |
| Ollama | 本地模型运行时 | 以安装时官方条款为准 |

组件支持能力因上游软件而异：安装、打开、修复、更新、禁用或卸载按钮只在实现和上游安装方式允许时显示。界面会记录组件管理日志，便于排查失败。

安装第三方组件前请确认：

- `winget` 显示的软件包 ID 与发布者正确；
- 当前网络和组织策略允许下载；
- 接受对应软件的许可证、隐私政策和系统影响；
- 代理、卸载器、右键菜单管理等工具具有较高系统权限，应从可信来源安装。

## 本地 AI

Win Toolbox 不内置云端 AI 账号。AI 页面会检查本机是否存在 Ollama、是否有已下载模型，并根据当前 CPU、内存和显存给出本地模型档位建议。

工作方式：

1. 用户选择安装或自行安装 Ollama；
2. 用户自行下载本地模型；
3. Win Toolbox 通过本机 `ollama` 命令列出和运行模型；
4. 提示词交给所选本地模型处理；
5. 回答在当前桌面会话中显示。

本地运行通常意味着提示词不需要发送到第三方云 API，但所安装模型、Ollama 版本、网络下载和其它扩展仍可能有自己的行为与条款。输入敏感信息前应了解模型来源和本机环境。

## 下载与安装

前往 [Releases](https://github.com/soberbw-hash/win-toolbox/releases/latest) 下载最新版。只使用本仓库明确发布的安装文件，并核对 Release 说明和校验值（如提供）。

首次运行建议：

1. 阅读启动时显示的机器信息；
2. 先试用只读入口和基础截图；
3. 清理前关闭正在写临时文件的应用；
4. 系统维护动作一次只执行一个，等待结果回显；
5. 安装组件前查看来源与许可；
6. 需要本地 AI 时再安装 Ollama 和模型。

若 Windows SmartScreen 提示未知发布者，应先确认文件确实来自本仓库，不要从第三方网盘或重新打包站点下载。

## 安全与数据边界

### 系统操作

- 前端通过 Tauri IPC 调用 Rust 实现的已知动作；
- 系统检查、清理、DISM、驱动导出和电源模式分别有固定处理路径；
- 操作结果包含成功状态、摘要、日志、耗时和必要的下一步提示；
- 需要管理员权限的动作应由 Windows 权限机制决定；
- 空间扫描只用于定位热点，不自动删除扫描结果中的目录；
- 第三方组件通过明确的 `winget` 包 ID 管理。

### 本地数据

- 系统快照读取 OS、CPU、内存、显卡和主要网络接口等设备状态；
- 组件状态、操作日志和偏好保存在本机；
- 临时文件清理只处理实现中明确选择的目标；
- 本地 AI 通过本机 Ollama 运行；
- 项目没有内置账号、云同步或广告分析系统。

提交 Issue 或截图前，请删除主机名、用户名、本机路径、公司网络名称、已安装软件清单和其它敏感信息。

## 常见问题

### 清理会删除我的文档吗？

一键清理针对实现中指定的临时目录，不应被理解为任意磁盘清理。任何自动清理都有边界，重要任务运行中应先关闭相关程序并备份数据。

### 空间管理为什么只显示热点，不直接删除？

目录很大不代表可以删除。项目把识别和删除分开，让用户先打开位置、判断内容和所属应用。

### 为什么 DISM 提示权限不足？

部分系统维护命令需要管理员权限。关闭当前任务后，以管理员身份启动应用并重试；受组织管理的设备请联系管理员。

### 组件安装失败怎么办？

确认 `winget` 可用、网络可访问上游源、软件包 ID 未下架，并查看组件日志。企业代理或软件限制策略可能阻止安装。

### AI 页面没有可用模型

先安装 Ollama，再至少下载一个兼容模型。Win Toolbox 只调用本机已有模型，不代替模型下载、许可证审核或硬件容量评估。

## 技术架构

```text
React / TypeScript UI
├─ 首页、系统、组件、空间、AI 与设置页面
├─ 操作状态、进度、结果和本地偏好
└─ 通过 Tauri invoke 调用结构化命令
              │
              ▼
Rust / Tauri Core
├─ 系统快照与 Windows 命令封装
├─ 清理、DISM、驱动导出和电源策略
├─ 空间热点扫描
├─ winget 组件清单与生命周期
├─ 本机 Ollama 检测与调用
└─ 日志、结果和第三方许可信息
```

主要技术：Tauri 2、Rust、React 19、TypeScript、Vite 7、Windows PowerShell / 系统命令和 WebView2。

## 从源码开发

### 环境要求

- Windows 10 / 11；
- Node.js 24+ 与 npm；
- Rust stable；
- Visual Studio 2022 C++ Build Tools；
- WebView2 Runtime；
- 测试组件安装时需要 `winget`。

### 安装依赖

```powershell
git clone https://github.com/soberbw-hash/win-toolbox.git
cd win-toolbox
npm install
```

### 前端开发

```powershell
npm run dev
```

浏览器开发模式只能验证前端布局；系统快照、清理、组件管理和本地 AI 等能力需要 Tauri 环境。

### 桌面开发

```powershell
npm run tauri dev
```

### 构建

```powershell
npm run build
npm run tauri build
```

## 变更验证建议

提交前至少完成：

- `npm run build`；
- `cargo check --manifest-path src-tauri/Cargo.toml`；
- 普通权限与管理员权限启动；
- 清理目标为空、部分文件占用和权限拒绝场景；
- DISM 成功/失败回显；
- 空间扫描空目录、大目录和不可访问目录；
- `winget` 不存在、网络失败、已安装、可修复和卸载场景；
- Ollama 未安装、无模型、有模型和命令失败场景；
- 980×680 最小窗口与 1440×900 默认窗口；
- 老板键进入、退出和重复触发。

系统动作改动应在测试机或可恢复环境中验证，不要用唯一的生产设备第一次试验删除和注册表逻辑。

## 项目结构

```text
src/                       React / TypeScript 界面
├─ pages/                  首页、系统、组件、空间、AI 与设置
├─ ComponentCenter.tsx     组件清单与操作界面
├─ StorageVisualizer.tsx   空间热点可视化
├─ AiPalette.tsx           本地 AI 悬浮入口
├─ content.ts              页面与系统动作说明
└─ types.ts                IPC 与视图类型
src-tauri/src/lib.rs       Rust 系统能力、组件管理、扫描与 Ollama
src-tauri/tauri.conf.json  桌面窗口、构建与安全配置
public/component-icons/    第三方组件图标
public/                    品牌图形、应用图标和支持图片
```

## 许可

本仓库公开是为了展示、审阅和发布 Win Toolbox，**不代表软件是开放源代码软件**。除第三方组件外，Win Toolbox 的源代码、界面、文档、品牌和构建资源均保留全部权利。普通用户可以按照 [LICENSE](LICENSE) 运行作者发布的未修改正式版本；未经书面许可，不得复制源码、制作和分发修改版、重新打包、转售、对外托管或用于商业产品。

组件中心中的 Qclaw、Honeyview、Snipaste、File Converter、Koodo Reader、Everything、7-Zip、Clash Verge Rev、BCUninstaller、PowerToys、Ollama 等均属于各自权利方，并继续适用各自许可证、隐私政策和最终用户条款。Win Toolbox 的许可不覆盖这些第三方软件。

完整条款见 [LICENSE](LICENSE)。需要商业合作、分发、二次开发或预装授权时，请先取得版权所有者的书面许可。

