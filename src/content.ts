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
    title: "少一点按钮，多一点效率。",
    description: "高频入口直达，状态一眼看懂。",
  },
  "common-tools": {
    label: "常用工具",
    hint: "截图修复清理即点即用",
    eyebrow: "常用工具",
    title: "系统维护和高频动作",
    description: "常用能力收一屏，点一下就开跑。",
  },
  "advanced-toolbox": {
    label: "进阶工具箱",
    hint: "创作者清理与空间透视",
    eyebrow: "进阶工具箱",
    title: "创作者与进阶能力",
    description: "重功能放二级层，需要时再展开。",
  },
  "ai-local-deploy": {
    label: "AI 本地大脑",
    hint: "本地模型与灵感悬浮窗",
    eyebrow: "AI 本地大脑",
    title: "本地 AI 面板",
    description: "先评估硬件，再决定模型与运行方式。",
  },
};

export const toolDefinitions: ToolDefinition[] = [
  {
    id: "launch_capture",
    title: "高级截图利器",
    description: "优先调用 PixPin 或 Snipaste，未安装时回退系统截图。",
    tag: "截图 / OCR",
    note: "贴图、长截图、OCR。",
    tone: "primary",
  },
  {
    id: "one_click_clean",
    title: "一键清理",
    description: "安全清理临时文件和常见垃圾。",
    tag: "系统清理",
    note: "日常维护首选。",
  },
  {
    id: "creator_deep_clean_all",
    title: "创作者深度清理",
    description: "扫描并清理剪映、Adobe、DaVinci、OBS 等缓存。",
    tag: "创作缓存",
    note: "重度回血项。",
  },
  {
    id: "dism_check_health",
    title: "DISM 快速检查",
    description: "快速检查系统组件健康状态。",
    tag: "系统修复",
    note: "先查再修。",
  },
  {
    id: "dism_scan_health",
    title: "DISM 深度扫描",
    description: "完整扫描系统映像健康状态。",
    tag: "系统修复",
    note: "耗时更长。",
  },
  {
    id: "export_drivers",
    title: "驱动导出备份",
    description: "一键导出当前驱动到文档目录。",
    tag: "驱动备份",
    note: "装机和交付常用。",
  },
  {
    id: "enable_beast_mode",
    title: "性能野兽模式",
    description: "切换高性能电源策略，释放更多算力。",
    tag: "性能释放",
    note: "渲染和推理适用。",
  },
  {
    id: "restore_balanced_mode",
    title: "恢复平衡模式",
    description: "恢复平衡模式，回到日常状态。",
    tag: "性能恢复",
    note: "用完记得恢复。",
  },
  {
    id: "open_apps_features",
    title: "应用管理",
    description: "直达 Windows 应用和功能。",
    tag: "系统入口",
    note: "卸载与清理入口。",
  },
  {
    id: "open_notifications",
    title: "通知净化",
    description: "直达通知设置，减少系统打扰。",
    tag: "弹窗治理",
    note: "先降噪。",
  },
  {
    id: "open_windows_update",
    title: "更新中心",
    description: "直达 Windows 更新页面。",
    tag: "系统更新",
    note: "修复前后常用。",
  },
  {
    id: "open_plugin_folder",
    title: "打开插件目录",
    description: "打开 Plugins 文件夹并自动准备 manifest。",
    tag: "插件系统",
    note: "便携工具入口。",
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
