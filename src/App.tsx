import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getAiAssessment } from "./ai";
import { AiPalette } from "./AiPalette";
import { BossModeOverlay } from "./BossModeOverlay";
import { bossModeShortcut, homeQuickActions, sectionCatalog, sections, systemTools } from "./content";
import { getBossModeViewState } from "./fakeUpdate";
import { InfoDrawer } from "./InfoDrawer";
import { useAppSettings } from "./hooks/useAppSettings";
import { useResponsiveLayout } from "./hooks/useResponsiveLayout";
import { AiPage } from "./pages/AiPage";
import { EfficiencyPage } from "./pages/EfficiencyPage";
import { HomePage } from "./pages/HomePage";
import { SettingsPage } from "./pages/SettingsPage";
import { SystemPage } from "./pages/SystemPage";
import type {
  ActionId,
  AiChatResponse,
  AiRuntimeStatus,
  BossModeViewState,
  ComponentManifest,
  ComponentOperation,
  SectionId,
  StorageHotspot,
  SystemSnapshot,
  ToolActionResult,
} from "./types";
import "./App.css";

type ToastState = {
  message: string;
  tone: "info" | "error";
} | null;

function App() {
  const { settings, updateSettings } = useAppSettings();
  const { layoutTier } = useResponsiveLayout();
  const toastTimerRef = useRef<number | null>(null);

  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [components, setComponents] = useState<ComponentManifest[]>([]);
  const [hotspots, setHotspots] = useState<StorageHotspot[]>([]);
  const [aiRuntime, setAiRuntime] = useState<AiRuntimeStatus | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<AiChatResponse | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bossMode, setBossMode] = useState(false);
  const [bossStartedAt, setBossStartedAt] = useState(0);
  const [bossState, setBossState] = useState<BossModeViewState>(getBossModeViewState(0));
  const [lastResult, setLastResult] = useState<ToolActionResult | null>(null);
  const [actionHistory, setActionHistory] = useState<ToolActionResult[]>([]);
  const [runningActionId, setRunningActionId] = useState<string | null>(null);
  const [busyComponentId, setBusyComponentId] = useState<string | null>(null);
  const [snapshotError, setSnapshotError] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  const activeSectionInfo = sectionCatalog[activeSection];
  const aiAssessment = getAiAssessment(snapshot);
  const capturePlus = components.find((item) => item.id === "capture-plus");

  function pushToast(message: string, tone: "info" | "error" = "info") {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({ message, tone });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2600);
  }

  function recordResult(result: ToolActionResult) {
    setLastResult(result);
    setActionHistory((current) => [result, ...current].slice(0, 12));
  }

  async function loadSnapshot() {
    try {
      setSnapshotError("");
      const next = await invoke<SystemSnapshot>("get_system_snapshot");
      setSnapshot(next);
    } catch (error) {
      setSnapshotError(String(error));
    }
  }

  async function loadComponents() {
    const next = await invoke<ComponentManifest[]>("list_components");
    setComponents(next);
  }

  async function loadHotspots() {
    const next = await invoke<StorageHotspot[]>("scan_storage_hotspots");
    setHotspots(next);
  }

  async function loadAiRuntime() {
    const next = await invoke<AiRuntimeStatus>("get_ai_runtime_status");
    setAiRuntime(next);
  }

  async function refreshCore() {
    await Promise.all([loadSnapshot(), loadComponents(), loadHotspots(), loadAiRuntime()]);
  }

  async function runAction(actionId: ActionId) {
    try {
      setRunningActionId(actionId);
      const result = await invoke<ToolActionResult>("run_tool_action", { actionId });
      recordResult(result);
      pushToast(result.summary, result.success ? "info" : "error");
      await Promise.all([loadSnapshot(), loadHotspots(), loadAiRuntime(), loadComponents()]);
      return result;
    } catch (error) {
      const message = String(error);
      const result: ToolActionResult = {
        actionId,
        title: "操作失败",
        success: false,
        summary: "动作没有完成，请查看错误信息。",
        details: message,
        durationMs: 0,
        warnings: [],
      };
      pushToast(message, "error");
      recordResult(result);
      return result;
    } finally {
      setRunningActionId(null);
    }
  }

  async function manageComponent(
    componentId: string,
    operation: ComponentOperation,
  ): Promise<ToolActionResult | null> {
    try {
      setBusyComponentId(componentId);
      const result = await invoke<ToolActionResult>("manage_component", {
        componentId,
        operation,
      });
      recordResult(result);
      pushToast(result.summary, result.success ? "info" : "error");
      await Promise.all([loadComponents(), loadAiRuntime()]);
      return result;
    } catch (error) {
      pushToast(String(error), "error");
      return null;
    } finally {
      setBusyComponentId(null);
    }
  }

  async function launchComponent(componentId: string): Promise<ToolActionResult | null> {
    try {
      setBusyComponentId(componentId);
      const result = await invoke<ToolActionResult>("launch_component", { componentId });
      recordResult(result);
      pushToast(result.summary, result.success ? "info" : "error");
      return result;
    } catch (error) {
      pushToast(String(error), "error");
      return null;
    } finally {
      setBusyComponentId(null);
    }
  }

  async function openTarget(target: string) {
    try {
      const result = await invoke<ToolActionResult>("open_target", { target });
      pushToast(result.summary);
    } catch (error) {
      pushToast(String(error), "error");
    }
  }

  async function handleQuickAction(actionId: string) {
    if (actionId === "open_storage") {
      setActiveSection("efficiency");
      pushToast("已切换到空间管理。");
      return;
    }

    await runAction(actionId as ActionId);
  }

  async function toggleCaptureHelper(nextEnabled: boolean) {
    if (nextEnabled) {
      if (!capturePlus?.installed) {
        const installResult = await manageComponent("capture-plus", "install");
        if (!installResult?.success) {
          return;
        }
      }

      updateSettings({ captureHelperEnabled: true });
      await launchComponent("capture-plus");
      pushToast("截图增强已开启。按 F1 截图，按 F3 贴图。");
      return;
    }

    await manageComponent("capture-plus", "disable");
    updateSettings({ captureHelperEnabled: false });
    pushToast("截图增强已关闭，已恢复系统默认截图。");
  }

  async function askLocalAi() {
    if (!aiPrompt.trim()) {
      pushToast("先输入一句话，再交给本地 AI。", "error");
      return;
    }

    try {
      setAiBusy(true);
      const response = await invoke<AiChatResponse>("ask_local_ai", {
        prompt: aiPrompt,
        model: null,
      });
      setAiResponse(response);
      pushToast("本地 AI 已返回结果。");
    } catch (error) {
      pushToast(String(error), "error");
    } finally {
      setAiBusy(false);
    }
  }

  async function enterBossMode() {
    const appWindow = getCurrentWindow();
    setBossStartedAt(Date.now());
    setBossState(getBossModeViewState(0));
    setBossMode(true);
    setPaletteOpen(false);

    await Promise.all([
      appWindow.setAlwaysOnTop(true),
      appWindow.setFullscreen(true),
      appWindow.setDecorations(false),
      appWindow.setResizable(false),
      appWindow.setCursorVisible(false),
      appWindow.setContentProtected(true),
    ]);

    pushToast(`已进入老板键，按 ${bossModeShortcut} 或 Esc 退出。`);
  }

  async function exitBossMode() {
    const appWindow = getCurrentWindow();
    setBossMode(false);

    await Promise.all([
      appWindow.setAlwaysOnTop(false),
      appWindow.setFullscreen(false),
      appWindow.setDecorations(true),
      appWindow.setResizable(true),
      appWindow.setCursorVisible(true),
      appWindow.setContentProtected(false),
    ]);
  }

  useEffect(() => {
    void refreshCore();

    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden && !bossMode) {
        void loadSnapshot();
      }
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [bossMode]);

  useEffect(() => {
    if (settings.captureHelperEnabled && !capturePlus?.installed) {
      updateSettings({ captureHelperEnabled: false });
    }
  }, [capturePlus?.installed, settings.captureHelperEnabled, updateSettings]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        if (bossMode) {
          void exitBossMode();
        } else {
          void enterBossMode();
        }
        return;
      }

      if (bossMode) {
        if (event.key === "Escape") {
          event.preventDefault();
          void exitBossMode();
          return;
        }

        if (["Meta", "ContextMenu"].includes(event.key)) {
          event.preventDefault();
        }
        return;
      }

      if (event.altKey && event.code === "Space" && aiRuntime?.paletteReady) {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aiRuntime, bossMode]);

  useEffect(() => {
    if (!bossMode) {
      return;
    }

    const timer = window.setInterval(() => {
      setBossState(getBossModeViewState(Date.now() - bossStartedAt));
    }, 250);

    return () => window.clearInterval(timer);
  }, [bossMode, bossStartedAt]);

  function renderPage() {
    switch (activeSection) {
      case "home":
        return (
          <HomePage
            snapshot={snapshot}
            quickActions={homeQuickActions}
            runningActionId={runningActionId}
            hotspots={hotspots}
            lastResult={lastResult}
            onQuickAction={(actionId) => {
              void handleQuickAction(actionId);
            }}
          />
        );
      case "system":
        return (
          <SystemPage
            tools={systemTools}
            runningActionId={runningActionId}
            onRunAction={(actionId) => {
              void runAction(actionId);
            }}
          />
        );
      case "efficiency":
        return (
          <EfficiencyPage
            components={components}
            hotspots={hotspots}
            busyComponentId={busyComponentId}
            captureHelperEnabled={settings.captureHelperEnabled}
            onToggleCaptureHelper={(nextEnabled) => {
              void toggleCaptureHelper(nextEnabled);
            }}
            onManageComponent={(componentId, operation) => {
              void manageComponent(componentId, operation);
            }}
            onLaunchComponent={(componentId) => {
              void launchComponent(componentId);
            }}
            onRefreshHotspots={() => {
              void loadHotspots();
            }}
            onOpenTarget={(target) => {
              void openTarget(target);
            }}
          />
        );
      case "ai":
        return (
          <AiPage
            assessment={aiAssessment}
            runtime={aiRuntime}
            response={aiResponse}
            busyComponentId={busyComponentId}
            onOpenPalette={() => setPaletteOpen(true)}
            onManageComponent={(componentId, operation) => {
              void manageComponent(componentId, operation);
            }}
            components={components}
          />
        );
      case "settings":
        return (
          <SettingsPage
            settings={settings}
            onUpdateSettings={updateSettings}
            onEnterBossMode={() => {
              void enterBossMode();
            }}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      <div
        className="app-shell"
        data-tier={layoutTier}
        data-density={settings.density}
        data-scale={settings.scale}
        data-font={settings.fontPreset}
      >
        <div className="app-shell__glow app-shell__glow--left" />
        <div className="app-shell__glow app-shell__glow--right" />

        <aside className="sidebar">
          <div className="sidebar__brand">
            <img src="/app-mark.svg" alt="" className="sidebar__logo-image" />
            <div className="sidebar__brand-copy">
              <p className="sidebar__eyebrow">WIN TOOLBOX</p>
              <h1>Win Toolbox</h1>
              <p className="sidebar__product-label">效率控制台</p>
            </div>
          </div>

          <p className="sidebar__summary">
            高频动作留在首页，复杂能力收进二级页，打开就能直接用。
          </p>

          <nav className="sidebar__nav">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`sidebar__nav-item ${
                  section.id === activeSection ? "sidebar__nav-item--active" : ""
                }`}
                type="button"
                onClick={() => setActiveSection(section.id)}
              >
                <strong>{section.label}</strong>
                <span>{section.hint}</span>
              </button>
            ))}
          </nav>

          <section className="sidebar__panel">
            <p className="section-kicker">当前机器</p>
            <h2>{snapshot ? snapshot.hostName : "正在读取设备状态"}</h2>
            <p>{snapshot ? `${snapshot.osName} · ${snapshot.osBuild}` : "稍后会自动刷新。"}</p>
            <button className="ghost-button" type="button" onClick={() => setDrawerOpen(true)}>
              查看状态与记录
            </button>
          </section>

          <section className="sidebar__panel sidebar__panel--support">
            <p className="section-kicker">支持一下</p>
            <p>赞助入口已经放回设置页里了。</p>
            <button className="ghost-button" type="button" onClick={() => setActiveSection("settings")}>
              打开赞助码
            </button>
          </section>
        </aside>

        <main className="main-panel">
          <header className="main-toolbar">
            <div>
              <p className="section-kicker">{activeSectionInfo.eyebrow}</p>
              <h2>{activeSectionInfo.title}</h2>
            </div>

            <div className="main-toolbar__actions">
              <span className="toolbar-pill">
                {snapshot
                  ? `${snapshot.cpuName} · ${snapshot.memoryUsagePercent}% 内存占用`
                  : "正在读取快照"}
              </span>
              <button className="ghost-button" type="button" onClick={() => setDrawerOpen(true)}>
                机器与记录
              </button>
            </div>
          </header>

          {snapshotError ? (
            <section className="banner banner--warning">
              <strong>读取系统快照失败</strong>
              <span>{snapshotError}</span>
            </section>
          ) : null}

          <div className="page-frame">{renderPage()}</div>
        </main>
      </div>

      <InfoDrawer
        open={drawerOpen}
        snapshot={snapshot}
        history={actionHistory}
        onClose={() => setDrawerOpen(false)}
        onOpenTarget={(target) => {
          void openTarget(target);
        }}
      />

      <AiPalette
        open={paletteOpen}
        runtime={aiRuntime}
        prompt={aiPrompt}
        busy={aiBusy}
        response={aiResponse}
        onPromptChange={setAiPrompt}
        onClose={() => setPaletteOpen(false)}
        onSubmit={() => {
          void askLocalAi();
        }}
      />

      {bossMode ? (
        <BossModeOverlay
          state={bossState}
          exitHint={`按 ${bossModeShortcut} 或 Esc 退出演示模式`}
        />
      ) : null}

      {toast ? <div className={`toast toast--${toast.tone}`}>{toast.message}</div> : null}
    </>
  );
}

export default App;
