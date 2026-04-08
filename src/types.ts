export type SectionId =
  | "dashboard"
  | "common-tools"
  | "advanced-toolbox"
  | "ai-local-deploy";

export type ActionId =
  | "launch_capture"
  | "one_click_clean"
  | "creator_deep_clean_all"
  | "open_apps_features"
  | "open_notifications"
  | "open_windows_update"
  | "dism_check_health"
  | "dism_scan_health"
  | "export_drivers"
  | "open_plugin_folder"
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

export type PluginManifest = {
  id: string;
  name: string;
  description: string;
  category: string;
  executable: string;
  resolvedPath?: string | null;
  homepage?: string | null;
  requiresAdmin: boolean;
  tags: string[];
  installed: boolean;
};

export type CreatorCacheTarget = {
  id: string;
  name: string;
  description: string;
  path: string;
  exists: boolean;
  sizeBytes: number;
  recommended: boolean;
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
