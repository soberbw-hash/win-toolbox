import type {
  ActionId,
  HomeQuickAction,
  SectionConfig,
  SectionId,
  ToolDefinition,
} from "./types";

export const sections: Array<{ id: SectionId; label: string; hint: string }> = [
  { id: "home", label: "首页", hint: "四个高频动作" },
  { id: "system", label: "系统", hint: "修复与维护" },
  { id: "efficiency", label: "效率", hint: "截图与组件中心" },
  { id: "ai", label: "AI", hint: "本地模型与运行时" },
  { id: "settings", label: "设置", hint: "外观与偏好" },
];

export const sectionCatalog: Record<SectionId, SectionConfig> = {
  home: {
    label: "首页",
    hint: "四个高频动作",
    eyebrow: "Win Toolbox / Home",
    title: "装好就能直接用。",
    description: "首页保留高频动作，复杂能力收进二级页。",
  },
  system: {
    label: "系统",
    hint: "修复与维护",
    eyebrow: "System",
    title: "清楚、克制、可回看。",
    description: "修复、导出、更新和性能模式都放在这里。",
  },
  efficiency: {
    label: "效率",
    hint: "截图与组件中心",
    eyebrow: "Efficiency",
    title: "截图、空间管理、组件安装。",
    description: "去插件化，改成安装即用的组件思路。",
  },
  ai: {
    label: "AI",
    hint: "本地模型与运行时",
    eyebrow: "AI",
    title: "先判断能跑什么，再决定怎么跑。",
    description: "本地模型不贪大，运行时状态一目了然。",
  },
  settings: {
    label: "设置",
    hint: "外观与偏好",
    eyebrow: "Settings",
    title: "字体、缩放和偏好设置。",
    description: "少一些杂讯，多一些一致性。",
  },
};

export const homeQuickActions: HomeQuickAction[] = [
  { id: "launch_capture", title: "截图", description: "区域截图，开箱即用。", tone: "primary" },
  { id: "one_click_clean", title: "清理", description: "安全清理临时文件。" },
  { id: "dism_check_health", title: "修复", description: "快速检查系统组件。" },
  { id: "open_storage", title: "管理空间", description: "查看大文件和大目录。" },
];

export const systemTools: ToolDefinition[] = [
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
    title: "驱动导出",
    description: "导出当前驱动到文档目录。",
    tag: "驱动备份",
    note: "重装前常用。",
  },
  {
    id: "open_windows_update",
    title: "Windows 更新",
    description: "直达系统更新页面。",
    tag: "系统入口",
    note: "修复前后常用。",
  },
  {
    id: "open_apps_features",
    title: "应用管理",
    description: "直达应用和功能。",
    tag: "系统入口",
    note: "卸载更顺手。",
  },
  {
    id: "open_notifications",
    title: "通知净化",
    description: "快速收敛系统通知。",
    tag: "系统入口",
    note: "先降噪。",
  },
  {
    id: "enable_beast_mode",
    title: "高性能模式",
    description: "切换高性能电源策略。",
    tag: "性能模式",
    note: "渲染与推理适用。",
    tone: "primary",
  },
  {
    id: "restore_balanced_mode",
    title: "恢复平衡模式",
    description: "切回日常电源策略。",
    tag: "性能模式",
    note: "用完记得恢复。",
  },
];

export const efficiencyTools: ToolDefinition[] = [
  {
    id: "launch_capture",
    title: "截图中心",
    description: "区域截图开箱即用，可安装增强组件。",
    tag: "效率",
    note: "基础能力内置。",
    tone: "primary",
  },
  {
    id: "one_click_clean",
    title: "一键清理",
    description: "安全清理当前用户临时文件。",
    tag: "效率",
    note: "日常维护首选。",
  },
];

export const homeStatusTips = [
  "默认界面更轻，详细信息按需展开。",
  "核心功能不依赖手动塞插件。",
  "截图、清理、修复、空间管理放在首页。",
];

export const settingsGroups = [
  "外观",
  "字体",
  "缩放",
  "组件管理",
  "截图保存路径",
  "日志与关于",
];

export const quickPathTargets: Array<{ id: string; label: string; pathKey: "downloads" | "desktop" | "documents" }> = [
  { id: "downloads", label: "下载", pathKey: "downloads" },
  { id: "desktop", label: "桌面", pathKey: "desktop" },
  { id: "documents", label: "文档", pathKey: "documents" },
];

export const homePrimaryActionIds: ActionId[] = ["launch_capture", "one_click_clean", "dism_check_health"];
