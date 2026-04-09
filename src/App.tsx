import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getAiAssessment } from "./ai";
import { AiPalette } from "./AiPalette";
import { BossModeOverlay } from "./BossModeOverlay";
import {
  bossModeShortcut,
  homeQuickActions,
  sectionCatalog,
  sections,
  systemTools,
} from "./content";
import { getBossModeViewState } from "./fakeUpdate";
import { InfoDrawer } from "./InfoDrawer";
import { useAppSettings } from "./hooks/useAppSettings";
import { useResponsiveLayout } from "./hooks/useResponsiveLayout";
import { AiPage } from "./pages/AiPage";
import { ComponentsPage } from "./pages/ComponentsPage";
import { EfficiencyPage } from "./pages/EfficiencyPage";
import { HomePage } from "./pages/HomePage";
import { SettingsPage } from "./pages/SettingsPage";
import { SystemPage } from "./pages/SystemPage";
import { SupportModal } from "./SupportModal";
import type {
  ActionId,
  AiChatResponse,
  AiRuntimeStatus,
  BossModeViewState,
  ComponentBusyState,
  ComponentManifest,
  ComponentOperation,
  SectionId,
  StorageHotspot,
  SystemSnapshot,
  ThirdPartyNotice,
  ToolActionResult,
} from "./types";
import "./App.css";

type ToastState = {
  message: string;
  tone: "info" | "error";
} | null;

type StartupState = {
  visible: boolean;
  progress: number;
  title: string;
  detail: string;
};

const startupInitialState: StartupState = {
  visible: true,
  progress: 8,
  title: "正在启动 Win Toolbox",
  detail: "先把主界面准备好，稍后会继续读取当前机器和组件状态。",
};

const componentStageCatalog: Record<
  ComponentOperation | "launch",
  Array<{ progress: number; label: string }>
> = {
  install: [
    { progress: 16, label: "正在准备安装包" },
    { progress: 46, label: "正在解压文件" },
    { progress: 82, label: "正在写入组件信息" },
  ],
  repair: [
    { progress: 18, label: "正在校验组件文件" },
    { progress: 58, label: "正在补齐缺失内容" },
    { progress: 86, label: "正在恢复组件状态" },
  ],
  uninstall: [
    { progress: 20, label: "正在准备卸载" },
    { progress: 62, label: "正在移除组件文件" },
    { progress: 88, label: "正在清理组件状态" },
  ],
  disable: [
    { progress: 30, label: "正在关闭组件进程" },
    { progress: 86, label: "正在恢复默认状态" },
  ],
  update: [
    { progress: 20, label: "正在检查可用更新" },
    { progress: 58, label: "正在完成更新" },
    { progress: 88, label: "正在写入组件信息" },
  ],
  launch: [
    { progress: 34, label: "正在检查启动入口" },
    { progress: 82, label: "正在启动组件" },
  ],
};

function App() {
  const { settings, updateSettings } = useAppSettings();
  const { layoutTier } = useResponsiveLayout();
  const toastTimerRef = useRef<number | null>(null);
  const componentTimerRef = useRef<number | null>(null);

  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [components, setComponents] = useState<ComponentManifest[]>([]);
  const [hotspots, setHotspots] = useState<StorageHotspot[]>([]);
  const [thirdPartyNotices, setThirdPartyNotices] = useState<ThirdPartyNotice[]>([]);
  const [aiRuntime, setAiRuntime] = useState<AiRuntimeStatus | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<AiChatResponse | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [bossMode, setBossMode] = useState(false);
  const [bossStartedAt, setBossStartedAt] = useState(0);
  const [bossState, setBossState] = useState<BossModeViewState>(getBossModeViewState(0));
  const [lastResult, setLastResult] = useState<ToolActionResult | null>(null);
  const [actionHistory, setActionHistory] = useState<ToolActionResult[]>([]);
  const [runningActionId, setRunningActionId] = useState<string | null>(null);
  const [componentBusyState, setComponentBusyState] = useState<ComponentBusyState | null>(null);
  const [snapshotError, setSnapshotError] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [startup, setStartup] = useState<StartupState>(startupInitialState);

  const activeSectionInfo = sectionCatalog[activeSection];
  const aiAssessment = getAiAssessment(snapshot);
  const capturePlus = components.find((item) => item.id === "capture-plus");
  const qclawComponent = components.find((item) => item.id === "qclaw");

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

  function beginComponentProgress(componentId: string, operation: ComponentOperation | "launch") {
    if (componentTimerRef.current) {
      window.clearInterval(componentTimerRef.current);
    }

    const stages = componentStageCatalog[operation];
    let stageIndex = 0;

    setComponentBusyState({
      componentId,
      operation,
      stageLabel: stages[0].label,
      progress: stages[0].progress,
    });

    componentTimerRef.current = window.setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, stages.length - 1);
      const stage = stages[stageIndex];
      setComponentBusyState((current) =>
        current?.componentId === componentId
          ? {
              componentId,
              operation,
              stageLabel: stage.label,
              progress: stage.progress,
            }
          : current,
      );
    }, 1150);
  }

  function endComponentProgress() {
    if (componentTimerRef.current) {
      window.clearInterval(componentTimerRef.current);
      componentTimerRef.current = null;
    }
    setComponentBusyState(null);
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

  async function loadThirdPartyNotices() {
    const next = await invoke<ThirdPartyNotice[]>("get_third_party_notices");
    setThirdPartyNotices(next);
  }

  async function refreshCore(showStartup = false) {
    try {
      if (showStartup) {
        setStartup({
          visible: true,
          progress: 12,
          title: "正在读取当前机器",
          detail: "先检查 CPU、内存、显卡和系统版本，让首页状态先显示出来。",
        });
      }

      await loadSnapshot();

      if (showStartup) {
        setStartup({
          visible: true,
          progress: 46,
          title: "正在检查组件与本地 AI",
          detail: "正在同步组件状态、Qclaw、图片查看器和本地运行时。",
        });
      }

      await Promise.all([loadComponents(), loadAiRuntime(), loadThirdPartyNotices()]);

      if (showStartup) {
        setStartup({
          visible: true,
          progress: 78,
          title: "正在扫描空间管理",
          detail: "正在读取下载、桌面和文档区的大文件热点。",
        });
      }

      await loadHotspots();

      if (showStartup) {
        setStartup({
          visible: true,
          progress: 100,
          title: "准备完成",
          detail: "主界面已经就绪，现在可以直接开始使用。",
        });
      }
    } finally {
      if (showStartup) {
        window.setTimeout(() => {
          setStartup((current) => ({ ...current, visible: false }));
        }, 280);
      }
    }
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
      beginComponentProgress(componentId, operation);
      const result = await invoke<ToolActionResult>("manage_component", {
        componentId,
        operation,
      });
      recordResult(result);
      pushToast(result.summary, result.success ? "info" : "error");
      await Promise.all([loadComponents(), loadAiRuntime(), loadThirdPartyNotices()]);
      return result;
    } catch (error) {
      pushToast(String(error), "error");
      return null;
    } finally {
      endComponentProgress();
    }
  }

  async function launchComponent(componentId: string): Promise<ToolActionResult | null> {
    try {
      beginComponentProgress(componentId, "launch");
      const result = await invoke<ToolActionResult>("launch_component", { componentId });
      recordResult(result);
      pushToast(result.summary, result.success ? "info" : "error");
      return result;
    } catch (error) {
      pushToast(String(error), "error");
      return null;
    } finally {
      endComponentProgress();
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

    await appWindow.setDecorations(false);
    await appWindow.setResizable(false);
    await appWindow.setAlwaysOnTop(true);
    await appWindow.setFullscreen(true);
    await appWindow.setCursorVisible(false);
    await appWindow.setContentProtected(true);

    pushToast(`已进入老板键，按 ${bossModeShortcut} 或 Esc 退出。`);
  }

  async function exitBossMode() {
    const appWindow = getCurrentWindow();
    setBossMode(false);

    await appWindow.setFullscreen(false);
    await appWindow.setAlwaysOnTop(false);
    await appWindow.setDecorations(true);
    await appWindow.setResizable(true);
    await appWindow.setCursorVisible(true);
    await appWindow.setContentProtected(false);
  }

  useEffect(() => {
    void refreshCore(true);

    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }

      if (componentTimerRef.current) {
        window.clearInterval(componentTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden && !bossMode && !startup.visible) {
        void loadSnapshot();
      }
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [bossMode, startup.visible]);

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
            qclawInstalled={Boolean(qclawComponent?.installed)}
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
      case "components":
        return (
          <ComponentsPage
            components={components}
            busyState={componentBusyState}
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
            onOpenTarget={(target) => {
              void openTarget(target);
            }}
          />
        );
      case "efficiency":
        return (
          <EfficiencyPage
            hotspots={hotspots}
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
            busyState={componentBusyState}
            onOpenPalette={() => setPaletteOpen(true)}
            onManageComponent={(componentId, operation) => {
              void manageComponent(componentId, operation);
            }}
            onLaunchComponent={(componentId) => {
              void launchComponent(componentId);
            }}
            components={components}
          />
        );
      case "settings":
        return (
          <SettingsPage
            settings={settings}
            components={components}
            notices={thirdPartyNotices}
            busyState={componentBusyState}
            onUpdateSettings={updateSettings}
            onEnterBossMode={() => {
              void enterBossMode();
            }}
            onManageComponent={(componentId, operation) => {
              void manageComponent(componentId, operation);
            }}
            onLaunchComponent={(componentId) => {
              void launchComponent(componentId);
            }}
            onOpenTarget={(target) => {
              void openTarget(target);
            }}
            onOpenSupportModal={() => setSupportModalOpen(true)}
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
            高频动作留在首页，安装增强工具放到组件中心，空间热点单独做成可视化页面。
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
            <p>赞助入口已经恢复为弹窗显示，点击就能直接看到收款码。</p>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setSupportModalOpen(true)}
            >
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

      {startup.visible ? (
        <div className="startup-overlay">
          <div className="startup-overlay__panel">
            <p className="section-kicker">Starting Up</p>
            <h2>{startup.title}</h2>
            <p>{startup.detail}</p>
            <div className="startup-overlay__progress-head">
              <span>正在加载配置与组件状态</span>
              <strong>{startup.progress}%</strong>
            </div>
            <div className="startup-progress">
              <span style={{ width: `${startup.progress}%` }} />
            </div>
          </div>
        </div>
      ) : null}

      <InfoDrawer
        open={drawerOpen}
        snapshot={snapshot}
        history={actionHistory}
        onClose={() => setDrawerOpen(false)}
        onOpenTarget={(target) => {
          void openTarget(target);
        }}
      />

      <SupportModal open={supportModalOpen} onClose={() => setSupportModalOpen(false)} />

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
