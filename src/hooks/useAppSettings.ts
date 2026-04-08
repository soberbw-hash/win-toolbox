import { useEffect, useState } from "react";
import type { AppSettings } from "../types";

const STORAGE_KEY = "win-toolbox:settings:v3";

const defaultSettings: AppSettings = {
  density: "auto",
  scale: "auto",
  fontPreset: "harmony",
  startOnBoot: false,
  saveToClipboardFirst: true,
  screenshotFolder: "图片/Win Toolbox",
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultSettings;
    }

    try {
      return { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) };
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  return {
    settings,
    updateSettings: (patch: Partial<AppSettings>) =>
      setSettings((current) => ({ ...current, ...patch })),
  };
}
