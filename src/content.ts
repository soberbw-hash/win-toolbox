import type {
  ActionId,
  HomeQuickAction,
  SectionConfig,
  SectionId,
  ToolDefinition,
} from "./types";

export const bossModeShortcut = "Ctrl + Alt + B";

export const sections: Array<{ id: SectionId; label: string; hint: string }> = [
  { id: "home", label: "首页", hint: "四个高频入口" },
  { id: "system", label: "系统", hint: "修复与维护" },
  { id: "efficiency", label: "效率", hint: "截图与组件" },
  { id: "ai", label: "AI", hint: "本地模型" },
  { id: "settings", label: "设置", hint: "外观与偏好" },
];

export const sectionCatalog: Record<SectionId, SectionConfig> = {
  home: {
    label: "首页",
    hint: "四个高频入口",
    eyebrow: "WIN TOOLBOX / HOME",
    title: "首页",
    description: "把最常用的动作留在第一屏，点一下就开始工作。",
  },
  system: {
    label: "系统",
    hint: "修复与维护",
    eyebrow: "SYSTEM",
    title: "系统",
    description: "系统修复、驱动备份和常用入口都放在这里。",
  },
  efficiency: {
    label: "效率",
    hint: "截图与组件",
    eyebrow: "EFFICIENCY",
    title: "效率",
    description: "截图增强、空间管理和常用组件集中在这一页。",
  },
  ai: {
    label: "AI",
    hint: "本地模型",
    eyebrow: "LOCAL AI",
    title: "AI",
    description: "先看机器适不适合，再决定装什么模型。",
  },
  settings: {
    label: "设置",
    hint: "外观与偏好",
    eyebrow: "SETTINGS",
    title: "设置",
    description: "界面偏好、老板键和赞助入口都在这里。",
  },
};

export const homeQuickActions: HomeQuickAction[] = [
  { id: "launch_capture", title: "截图", description: "区域截图，开箱即用。", tone: "primary" },
  { id: "one_click_clean", title: "清理", description: "安全清理临时文件。" },
  { id: "dism_check_health", title: "修复", description: "快速检查系统组件。" },
  { id: "open_storage", title: "管理空间", description: "看看大文件都在哪。" },
];

export const systemTools: ToolDefinition[] = [
  {
    id: "dism_check_health",
    title: "DISM 快速检查",
    description: "先做一轮轻量检查，看看系统组件是否健康。",
    tag: "系统修复",
    note: "适合更新异常、卡顿或怀疑系统损坏时先跑一次。",
  },
  {
    id: "dism_scan_health",
    title: "DISM 深度扫描",
    description: "完整扫描系统映像状态，比快速检查更深入。",
    tag: "系统修复",
    note: "耗时会更长，但结果更完整。",
  },
  {
    id: "export_drivers",
    title: "驱动导出",
    description: "把当前驱动导出到文档目录，方便重装或迁移。",
    tag: "驱动备份",
    note: "换系统或换机器前很实用。",
  },
  {
    id: "open_windows_update",
    title: "Windows 更新",
    description: "直接打开系统更新页面。",
    tag: "系统入口",
    note: "更新、修复和重启前后经常会用到。",
  },
  {
    id: "open_apps_features",
    title: "应用管理",
    description: "打开系统应用和功能页，管理已安装软件。",
    tag: "系统入口",
    note: "配合卸载增强一起用更顺手。",
  },
  {
    id: "open_notifications",
    title: "通知净化",
    description: "快速进入通知设置，先把打扰降下来。",
    tag: "系统入口",
    note: "安静一点，工作会更顺。",
  },
  {
    id: "enable_beast_mode",
    title: "性能野兽模式",
    description: "切换到高性能电源策略，给渲染和推理让路。",
    tag: "性能模式",
    note: "适合导出视频、跑本地模型或大批量任务。",
    tone: "primary",
  },
  {
    id: "restore_balanced_mode",
    title: "恢复平衡模式",
    description: "恢复到日常更稳妥的平衡电源策略。",
    tag: "性能模式",
    note: "重任务跑完后记得切回来。",
  },
];

export const quickPathTargets: Array<{
  id: string;
  label: string;
  pathKey: "downloads" | "desktop" | "documents";
}> = [
  { id: "downloads", label: "下载", pathKey: "downloads" },
  { id: "desktop", label: "桌面", pathKey: "desktop" },
  { id: "documents", label: "文档", pathKey: "documents" },
];

export const homePrimaryActionIds: ActionId[] = [
  "launch_capture",
  "one_click_clean",
  "dism_check_health",
];
