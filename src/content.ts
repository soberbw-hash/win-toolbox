import type { ActionId, SectionConfig, SectionId, ToolDefinition } from "./types";

export const sections: Array<{ id: SectionId; label: string; hint: string }> = [
  { id: "dashboard", label: "仪表盘", hint: "高频能力一眼看全" },
  { id: "common-tools", label: "常用工具", hint: "截图修复清理即点即用" },
  { id: "advanced-toolbox", label: "进阶工具箱", hint: "创作者清理与空间透视" },
  { id: "ai-local-deploy", label: "AI 本地大脑", hint: "本地模型与灵感悬浮窗" },
];

export const sectionCatalog: Record<SectionId, SectionConfig> = {
  dashboard: {
    label: "仪表盘",
    hint: "高频能力一眼看全",
    eyebrow: "首页 / Dashboard",
    title: "极简，不等于阉割。真正好用的 Windows 工具箱应该少而强。",
    description:
      "Win Toolbox 面向中国 Windows 用户，主打高频入口、可视反馈和按需展开。该快的时候一键直达，该深的时候再展开细节。",
  },
  "common-tools": {
    label: "常用工具",
    hint: "截图修复清理即点即用",
    eyebrow: "常用工具",
    title: "把最常用的系统入口和高频动作，做成真正顺手的桌面控制台。",
    description:
      "这里不堆花哨按钮，只放能立刻派上用场的能力：截图、清理、修复、备份、通知治理、更新入口全部直达。",
  },
  "advanced-toolbox": {
    label: "进阶工具箱",
    hint: "创作者清理与空间透视",
    eyebrow: "进阶工具箱",
    title: "创作者缓存、磁盘热点、插件扩展和性能模式，统一收进一个干净的二级层。",
    description:
      "重能力默认折叠，真正需要时再展开，这就是 Less is more 的正确打开方式。",
  },
  "ai-local-deploy": {
    label: "AI 本地大脑",
    hint: "本地模型与灵感悬浮窗",
    eyebrow: "AI 本地大脑",
    title: "先看你的电脑能跑什么，再决定本地 AI 怎么落地。",
    description:
      "根据 RAM 和 VRAM 给出 Qwen 推荐档位，显示 Ollama 运行状态，并提供灵感悬浮窗式的轻交互入口。",
  },
};

export const toolDefinitions: ToolDefinition[] = [
  {
    id: "launch_capture",
    title: "高级截图利器",
    description:
      "优先调用 PixPin 或 Snipaste，未安装时自动回退到 Windows 自带截图工具，保证任何机器都能马上开截。",
    tag: "截图 / OCR",
    note: "贴图、长截图、OCR 是国内用户最真实的高频需求。",
    tone: "primary",
  },
  {
    id: "one_click_clean",
    title: "一键清理",
    description:
      "安全清理当前用户临时文件和常见垃圾，不碰高风险系统区域，适合日常维护和交付前快速瘦身。",
    tag: "系统清理",
    note: "先把真正稳妥的空间回血做好，再谈更激进的系统优化。",
  },
  {
    id: "creator_deep_clean_all",
    title: "创作者深度清理",
    description:
      "扫描并清理 CapCut、剪映、Adobe 公共缓存、DaVinci、OBS 等重度创作缓存，专治硬盘暴瘦。",
    tag: "创作缓存",
    note: "这类缓存动不动几十 GB，是真正的空间杀手。",
  },
  {
    id: "dism_check_health",
    title: "DISM 快速检查",
    description: "快速检测 Windows 组件存储是否存在明显损坏，适合更新异常前先做一次轻诊断。",
    tag: "系统修复",
    note: "出问题先判断，不要一上来就重装。",
  },
  {
    id: "dism_scan_health",
    title: "DISM 深度扫描",
    description: "更完整地扫描系统映像健康状态，并把原始输出保留在结果面板里。",
    tag: "系统修复",
    note: "耗时更长，但诊断价值更高。",
  },
  {
    id: "export_drivers",
    title: "驱动导出备份",
    description: "一键导出当前系统驱动到文档目录，适合重装前、交付前和应急回滚前留底。",
    tag: "驱动备份",
    note: "对装机、售后和客户交付都很实用。",
  },
  {
    id: "enable_beast_mode",
    title: "性能野兽模式",
    description: "切换到高性能电源策略，把更多算力让给渲染、导出、压制和本地推理。",
    tag: "性能释放",
    note: "导出视频、跑本地模型、压渲染时尤其有用。",
  },
  {
    id: "restore_balanced_mode",
    title: "恢复平衡模式",
    description: "把系统电源策略恢复到更日常、更省心的平衡模式，避免长期高功耗。",
    tag: "性能恢复",
    note: "野兽模式适合临时冲刺，不适合永远常驻。",
  },
  {
    id: "open_apps_features",
    title: "应用管理",
    description: "快速跳转到 Windows 应用和功能，便于卸载系统应用、清理冗余软件。",
    tag: "系统入口",
    note: "把系统自带入口直接拉到桌面级操作面板里。",
  },
  {
    id: "open_notifications",
    title: "通知净化",
    description: "直达 Windows 通知设置，快速压住系统级弹窗和消息打扰。",
    tag: "弹窗治理",
    note: "先从系统层面减少噪音，再叠加规则拦截。",
  },
  {
    id: "open_windows_update",
    title: "更新中心",
    description: "直达 Windows 更新页面，便于修复链路前后做状态确认。",
    tag: "系统更新",
    note: "配合修复和演示场景都很好用。",
  },
  {
    id: "open_plugin_folder",
    title: "打开插件目录",
    description:
      "打开 Plugins 文件夹并自动准备 manifest。后续把便携工具扔进去，界面就会自动点亮。",
    tag: "插件系统",
    note: "这是后续扩展 Clash、ExplorerBlurMica、FileConverter 的底座。",
  },
];

export const dashboardActionIds: ActionId[] = [
  "launch_capture",
  "one_click_clean",
  "creator_deep_clean_all",
  "enable_beast_mode",
];

export const safetyRails = [
  "高频能力优先可理解、可回看、可撤退，而不是一键黑盒乱改。",
  "先做清理、修复、备份和入口整合，再做更深的系统调优。",
  "AI 模块不仅要能跑，更要懂得在空闲时主动释放内存和显存。",
];

export const roadmap = [
  "首页已经不是静态壳子，而是能真实读取系统、执行动作的控制台。",
  "插件化架构已就位，后续接入更多便携工具不需要重写主程序。",
  "创作者清理、空间透视、老板键和本地 AI 面板都围绕“可展示、可交付”打磨。",
];
