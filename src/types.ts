export type SectionId = "home" | "system" | "efficiency" | "ai" | "settings";

export type ActionId =
  | "launch_capture"
  | "one_click_clean"
  | "open_apps_features"
  | "open_notifications"
  | "open_windows_update"
  | "dism_check_health"
  | "dism_scan_health"
  | "export_drivers"
  | "enable_beast_mode"
  | "restore_balanced_mode";

export type SystemSnapshot = {
  hostName: string;
  osName: string;
  osVersion: string;
  osBuild: string;
  cpuName: string;
  cpuLoad: number;
  cpuCores: number;
  logicalCores: number;
  memoryTotalMb: number;
  memoryUsedMb: number;
  memoryUsagePercent: number;
  gpuName?: string | null;
  gpuMemoryMb?: number | null;
  networkName?: string | null;
  networkDescription?: string | null;
  networkLinkSpeed?: string | null;
  collectedAt: string;
};

export type ToolActionResult = {
  actionId: string;
  title: string;
  success: boolean;
  summary: string;
  details: string;
  durationMs: number;
  outputPath?: string | null;
  warnings: string[];
};

export type StorageHotspot = {
  id: string;
  label: string;
  path: string;
  source: string;
  sizeBytes: number;
  itemCount: number;
};

export type AiRuntimeStatus = {
  ollamaInstalled: boolean;
  ollamaRunning: boolean;
  availableModels: string[];
  openClawDetected: boolean;
  paletteReady: boolean;
  suggestedEntry: string;
};

export type AiChatResponse = {
  model: string;
  answer: string;
};

export type ComponentManifest = {
  id: string;
  name: string;
  description: string;
  category: string;
  kind: "built-in" | "winget";
  installed: boolean;
  statusLabel: string;
  summary: string;
  wingetId?: string | null;
  homepage?: string | null;
  launchPath?: string | null;
  launchArguments?: string[] | null;
  recommended: boolean;
};

export type SectionConfig = {
  label: string;
  hint: string;
  eyebrow: string;
  title: string;
  description: string;
};

export type ToolDefinition = {
  id: ActionId;
  title: string;
  description: string;
  tag: string;
  note: string;
  tone?: "primary" | "default";
};

export type HomeQuickAction = {
  id: string;
  title: string;
  description: string;
  tone?: "primary" | "default";
};

export type AiAssessment = {
  tier: string;
  headline: string;
  models: string[];
  runtime: string;
  notes: string[];
};

export type BossModeViewState = {
  stageTitle: string;
  stageHint: string;
  percent: number;
  phaseLabel: string;
  phaseIndex: number;
  isRebooting: boolean;
  instruction: string;
};

export type AppSettings = {
  density: "auto" | "compact" | "standard" | "comfortable";
  scale: "auto" | "compact" | "standard" | "relaxed";
  fontPreset: "harmony" | "system";
  startOnBoot: boolean;
  saveToClipboardFirst: boolean;
  screenshotFolder: string;
};
