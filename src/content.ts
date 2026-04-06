import type { ActionId, SectionConfig, SectionId, ToolDefinition } from "./types";

export const sections: Array<{ id: SectionId; label: string; hint: string }> = [
  { id: "dashboard", label: "Dashboard", hint: "live status" },
  { id: "common-tools", label: "Common Tools", hint: "safe actions" },
  { id: "advanced-toolbox", label: "Advanced Toolbox", hint: "plugin-ready" },
  { id: "ai-local-deploy", label: "AI Local Deploy", hint: "hardware fit" },
];

export const sectionCatalog: Record<SectionId, SectionConfig> = {
  dashboard: {
    label: "Dashboard",
    hint: "live status",
    eyebrow: "Home / Dashboard",
    title: "A Windows toolbox that already does useful work",
    description:
      "This MVP focuses on real diagnostics, safe cleanup, screenshot launch, DISM checks, driver export, and plugin discovery.",
  },
  "common-tools": {
    label: "Common Tools",
    hint: "safe actions",
    eyebrow: "Common Tools",
    title: "High-frequency maintenance tools with clear feedback",
    description:
      "Every action returns a visible result so you can see what happened instead of guessing.",
  },
  "advanced-toolbox": {
    label: "Advanced Toolbox",
    hint: "plugin-ready",
    eyebrow: "Advanced Toolbox",
    title: "Portable tools are discovered automatically from Plugins/",
    description:
      "Drop third-party executables into the plugin folder, keep config.json tidy, and the launcher lights up the installed tools.",
  },
  "ai-local-deploy": {
    label: "AI Local Deploy",
    hint: "hardware fit",
    eyebrow: "AI Local Deploy",
    title: "Hardware-aware recommendations before local AI deployment",
    description:
      "The app reads memory and GPU capacity, then suggests a realistic Qwen deployment tier before you burn time on the wrong model.",
  },
};

export const toolDefinitions: ToolDefinition[] = [
  {
    id: "launch_capture",
    title: "Launch Capture",
    description:
      "Starts PixPin or Snipaste from Plugins/ when available, otherwise falls back to the built-in Windows capture bar.",
    tag: "Screenshot",
    note: "Best everyday entry point for screenshots and OCR plugins.",
  },
  {
    id: "one_click_clean",
    title: "Safe Cleanup",
    description:
      "Cleans the current user's temporary files and skips locked items automatically to stay on the safe side.",
    tag: "Cleanup",
    note: "Useful right away and low risk compared with aggressive system tuning.",
  },
  {
    id: "open_apps_features",
    title: "Apps & Features",
    description: "Jumps straight into the Windows Apps & Features settings page.",
    tag: "Settings",
    note: "Fast path for uninstalling built-in or third-party software.",
  },
  {
    id: "dism_check_health",
    title: "DISM CheckHealth",
    description:
      "Runs a fast component-store health check and returns the raw DISM output in the activity panel.",
    tag: "Repair",
    note: "Good first check when Windows servicing feels suspicious.",
  },
  {
    id: "dism_scan_health",
    title: "DISM ScanHealth",
    description:
      "Runs a deeper Windows image scan. This can take longer, so the tool keeps the full output for review.",
    tag: "Repair",
    note: "Use when CheckHealth is not enough or Windows Update is acting up.",
  },
  {
    id: "export_drivers",
    title: "Export Drivers",
    description:
      "Backs up installed drivers into Documents/WinToolbox/DriverBackups with a timestamped folder.",
    tag: "Backup",
    note: "Often needs Administrator privileges, but the destination folder is prepared automatically.",
  },
  {
    id: "open_plugin_folder",
    title: "Open Plugin Folder",
    description:
      "Opens the live plugin directory and creates default manifest files if they are missing.",
    tag: "Plugins",
    note: "This is the core of the plugin-style architecture for later growth.",
  },
];

export const dashboardActionIds: ActionId[] = [
  "launch_capture",
  "one_click_clean",
  "dism_check_health",
  "open_plugin_folder",
];

export const safetyRails = [
  "Focus on actions that are useful today and transparent about what they do.",
  "Prefer cleanup, backup, launch, and diagnostics before registry-level optimization.",
  "If an action needs elevation, tell the user clearly instead of pretending it succeeded.",
];

export const roadmap = [
  "Phase 1: usable Tauri desktop shell with working Windows integrations",
  "Phase 2: guarded optimize flows, restore points, and richer system maintenance",
  "Phase 3: release fetching, AI runtime management, and process lifecycle cleanup",
];
