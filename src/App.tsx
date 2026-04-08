import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getAiAssessment } from "./ai";
import { AiPalette } from "./AiPalette";
import { BossModeOverlay } from "./BossModeOverlay";
import { CreatorCachePanel } from "./CreatorCachePanel";
import { DonatePanel } from "./DonatePanel";
import { StorageHotspotsPanel } from "./StorageHotspotsPanel";
import {
  dashboardActionIds,
  safetyRails,
  sectionCatalog,
  sections,
  toolDefinitions,
} from "./content";
import { getBossModeViewState } from "./fakeUpdate";
import { formatDuration, formatMemory, formatRelativeTime } from "./format";
import type {
  ActionId,
  AiChatResponse,
  AiRuntimeStatus,
  BossModeViewState,
  CreatorCacheTarget,
  PluginManifest,
  SectionId,
  StorageHotspot,
  SystemSnapshot,
  ToolActionResult,
} from "./types";
import "./App.css";

type ToastState = { message: string; tone: "info" | "error" } | null;

function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [creatorCaches, setCreatorCaches] = useState<CreatorCacheTarget[]>([]);
  const [hotspots, setHotspots] = useState<StorageHotspot[]>([]);
  const [aiRuntime, setAiRuntime] = useState<AiRuntimeStatus | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<AiChatResponse | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [bossMode, setBossMode] = useState(false);
  const [bossStartedAt, setBossStartedAt] = useState(0);
  const [bossState, setBossState] = useState<BossModeViewState>(getBossModeViewState(0));
  const [lastResult, setLastResult] = useState<ToolActionResult | null>(null);
  const [runningActionId, setRunningActionId] = useState<string | null>(null);
  const [snapshotError, setSnapshotError] = useState("");
  const [pluginError, setPluginError] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [charged, setCharged] = useState(false);

  const activeSectionInfo = sectionCatalog[activeSection];
  const aiAssessment = getAiAssessment(snapshot);
  const installedPlugins = plugins.filter((plugin) => plugin.installed);
  const dashboardActions = dashboardActionIds.flatMap((id) =>
    toolDefinitions.find((tool) => tool.id === id) ?? [],
  );
  const primaryTools = toolDefinitions.slice(0, 8);

  function pushToast(message: string, tone: "info" | "error" = "info") {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2800);
  }

  async function loadSnapshot() {
    try {
      setSnapshotError("");
      setSnapshot(await invoke<SystemSnapshot>("get_system_snapshot"));
    } catch (error) {
      setSnapshotError(String(error));
    }
  }

  async function loadPlugins() {
    try {
      setPluginError("");
      setPlugins(await invoke<PluginManifest[]>("list_plugins"));
    } catch (error) {
      setPluginError(String(error));
    }
  }

  async function loadCreatorCaches() {
    setCreatorCaches(await invoke<CreatorCacheTarget[]>("scan_creator_caches"));
  }

  async function loadHotspots() {
    setHotspots(await invoke<StorageHotspot[]>("scan_storage_hotspots"));
  }

  async function loadAiRuntime() {
    setAiRuntime(await invoke<AiRuntimeStatus>("get_ai_runtime_status"));
  }

  async function refreshAll() {
    await Promise.all([loadSnapshot(), loadPlugins(), loadCreatorCaches(), loadHotspots(), loadAiRuntime()]);
  }

  async function runAction(actionId: ActionId) {
    try {
      setRunningActionId(actionId);
      const result = await invoke<ToolActionResult>("run_tool_action", { actionId });
      setLastResult(result);
      pushToast(result.summary, result.success ? "info" : "error");

      if (["one_click_clean", "creator_deep_clean_all"].includes(actionId)) {
        await Promise.all([loadSnapshot(), loadCreatorCaches(), loadHotspots()]);
      }

      if (actionId === "open_plugin_folder") {
        await loadPlugins();
      }
    } catch (error) {
      const message = String(error);
      pushToast(message, "error");
      setLastResult({
        actionId,
        title: "操作失败",
        success: false,
        summary: "动作执行前就中断了。",
        details: message,
        durationMs: 0,
        warnings: [],
      });
    } finally {
      setRunningActionId(null);
    }
  }

  async function cleanCreatorCache(cacheId: string) {
    try {
      setRunningActionId(cacheId);
      const result = await invoke<ToolActionResult>("clean_creator_cache", { cacheId });
      setLastResult(result);
      pushToast(result.summary, result.success ? "info" : "error");
      await Promise.all([loadCreatorCaches(), loadHotspots()]);
    } finally {
      setRunningActionId(null);
    }
  }

  async function launchPlugin(pluginId: string) {
    setRunningActionId(pluginId);
    const result = await invoke<ToolActionResult>("launch_plugin", { pluginId });
    setLastResult(result);
    setRunningActionId(null);
  }

  async function openTarget(target: string) {
    await invoke<ToolActionResult>("open_target", { target });
  }

  async function askLocalAi() {
    if (!aiPrompt.trim()) {
      pushToast("先输入一句话，再让本地 AI 帮你发力。", "error");
      return;
    }

    try {
      setAiBusy(true);
      const response = await invoke<AiChatResponse>("ask_local_ai", { prompt: aiPrompt, model: null });
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
    void refreshAll();
    const timer = window.setInterval(() => void loadSnapshot(), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "Space" && aiRuntime?.paletteReady && !bossMode) {
        event.preventDefault();
        setPaletteOpen((value) => !value);
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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.shiftKey && event.key.toLowerCase() === "u") {
        event.preventDefault();
        void exitBossMode();
        return;
      }

      if (["Escape", "Meta", "ContextMenu"].includes(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [bossMode, bossStartedAt]);

  const signalCards = useMemo(
    () => [
      {
        label: "CPU",
        value: snapshot?.cpuName ?? "正在读取处理器信息",
        meta: snapshot ? `${snapshot.cpuLoad}% 负载 · ${snapshot.cpuCores} 核 / ${snapshot.logicalCores} 线程` : "每 30 秒自动刷新一次",
        progress: snapshot?.cpuLoad ?? 12,
      },
      {
        label: "内存",
        value: snapshot ? `${formatMemory(snapshot.memoryUsedMb)} / ${formatMemory(snapshot.memoryTotalMb)}` : "正在读取物理内存",
        meta: snapshot ? `${snapshot.memoryUsagePercent}% 已使用` : "适合判断清理和 AI 档位",
        progress: snapshot?.memoryUsagePercent ?? 28,
      },
      {
        label: "显卡",
        value: snapshot?.gpuName ?? "正在读取显卡信息",
        meta: snapshot?.gpuMemoryMb ? `${formatMemory(snapshot.gpuMemoryMb)} 显存已检测` : "未识别时将走保守判断",
        progress: snapshot?.gpuMemoryMb ? Math.min((snapshot.gpuMemoryMb / 12288) * 100, 100) : 18,
      },
      {
        label: "网络",
        value: snapshot?.networkName ?? "未发现活动网卡",
        meta: snapshot?.networkLinkSpeed ?? "等待主网卡链路信息",
        progress: snapshot?.networkName ? 70 : 8,
      },
    ],
    [snapshot],
  );

  return (
    <>
      <div className="shell">
        <div className="shell__background shell__background--aurora" />
        <div className="shell__background shell__background--grid" />

        <aside className="sidebar panel">
          <div className="brand"><div className="brand__badge">WT</div><div><p className="eyebrow">Win Toolbox</p><h1>极简 Windows 工具箱</h1></div></div>
          <p className="sidebar__summary">截图、清理、修复、本地 AI，收进一个干净界面。</p>
          <nav className="nav">{sections.map((section) => <button key={section.id} className={`nav__button ${section.id === activeSection ? "nav__button--active" : ""}`} type="button" onClick={() => setActiveSection(section.id)}><span>{section.label}</span><small>{section.hint}</small></button>)}</nav>
          <div className="sidebar__footnote card sidebar__footnote--compact"><p className="eyebrow">状态</p><h2>真功能</h2><p>系统状态、截图、清理、修复都已接通。</p></div>
        </aside>

        <main className="workspace">
          <section className="hero panel">
            <div className="hero__copy"><p className="eyebrow">{activeSectionInfo.eyebrow}</p><h2>{activeSectionInfo.title}</h2><p>{activeSectionInfo.description}</p><div className="hero__pills"><span className="status-pill">客户展示版</span><span className="status-pill status-pill--soft">{snapshot ? `${snapshot.hostName} · ${snapshot.osBuild}` : "读取中"}</span></div></div>
            <div className="hero__actions"><button className="primary-button" type="button" onClick={() => void runAction("one_click_clean")} disabled={runningActionId === "one_click_clean"}>{runningActionId === "one_click_clean" ? "清理中..." : "一键清理"}</button><div className="button-row"><button className="secondary-button" type="button" onClick={() => void enterBossMode()}>老板键</button><button className="ghost-button" type="button" onClick={() => setPaletteOpen(true)} disabled={!aiRuntime?.paletteReady}>AI 悬浮窗</button></div><div className="hero__activity card hero__activity--compact"><p className="eyebrow">AI 状态</p><p>{aiRuntime?.suggestedEntry ?? "正在读取本地 AI 状态。"}</p></div></div>
          </section>

          {snapshotError ? <section className="panel warning-banner"><strong>系统快照读取失败</strong><span>{snapshotError}</span></section> : null}
          {pluginError ? <section className="panel warning-banner"><strong>插件扫描失败</strong><span>{pluginError}</span></section> : null}

          <section className="signals">{signalCards.map((card) => <article key={card.label} className="card signal-card"><div className="signal-card__top"><p className="eyebrow">{card.label}</p><span>{card.progress.toFixed(0)}%</span></div><h3>{card.value}</h3><p>{card.meta}</p><div className="signal-card__bar"><span style={{ width: `${card.progress}%` }} /></div></article>)}</section>

          {activeSection === "dashboard" ? <section className="panel"><div className="section-heading"><div><p className="eyebrow">Quick Launch</p><h2>常用 4 项</h2></div><p>高频能力优先。</p></div><div className="cards-grid cards-grid--actions cards-grid--compact">{dashboardActions.map((tool) => <article key={tool.id} className="card action-card action-card--compact"><div className="action-card__header"><h3>{tool.title}</h3><span>{tool.tag}</span></div><p>{tool.description}</p><button type="button" className={tool.tone === "primary" ? "primary-button" : "secondary-button"} onClick={() => void runAction(tool.id)} disabled={runningActionId === tool.id}>{runningActionId === tool.id ? "执行中" : "运行"}</button></article>)}</div></section> : null}

          {activeSection === "common-tools" ? <section className="panel"><div className="section-heading"><div><p className="eyebrow">Common Tools</p><h2>系统维护和高频动作</h2></div><p>保留最常用的一屏入口。</p></div><div className="cards-grid cards-grid--compact">{primaryTools.map((tool) => <article key={tool.id} className="card action-card action-card--compact"><div className="action-card__header"><h3>{tool.title}</h3><span>{tool.tag}</span></div><p>{tool.description}</p><button type="button" className={tool.tone === "primary" ? "primary-button" : "secondary-button"} onClick={() => void runAction(tool.id)} disabled={runningActionId === tool.id}>{runningActionId === tool.id ? "执行中" : "运行"}</button></article>)}</div><details className="more-tools"><summary>更多入口</summary><div className="cards-grid cards-grid--compact">{toolDefinitions.slice(8).map((tool) => <article key={tool.id} className="card action-card action-card--compact"><div className="action-card__header"><h3>{tool.title}</h3><span>{tool.tag}</span></div><p>{tool.description}</p><button type="button" className="secondary-button" onClick={() => void runAction(tool.id)} disabled={runningActionId === tool.id}>{runningActionId === tool.id ? "执行中" : "运行"}</button></article>)}</div></details></section> : null}

          {activeSection === "advanced-toolbox" ? <><CreatorCachePanel items={creatorCaches} runningId={runningActionId} onRefresh={() => void loadCreatorCaches()} onCleanAll={() => void runAction("creator_deep_clean_all")} onCleanOne={(id) => void cleanCreatorCache(id)} /><StorageHotspotsPanel items={hotspots} onRefresh={() => void loadHotspots()} onOpenPath={(path) => void openTarget(path)} /><section className="panel"><div className="section-heading"><div><p className="eyebrow">Plugin System</p><h2>插件工具</h2></div><p>按需点亮，不默认堆满。</p></div><div className="button-row"><button className="primary-button" type="button" onClick={() => void runAction("open_plugin_folder")}>打开插件目录</button><button className="secondary-button" type="button" onClick={() => void loadPlugins()}>重新扫描</button></div><div className="cards-grid cards-grid--compact">{plugins.map((plugin) => <article key={plugin.id} className="card plugin-card action-card--compact"><div className="plugin-card__top"><div><h3>{plugin.name}</h3><p>{plugin.category}</p></div><span className={`plugin-card__state ${plugin.installed ? "plugin-card__state--installed" : "plugin-card__state--missing"}`}>{plugin.installed ? "已就绪" : "未安装"}</span></div><p>{plugin.description}</p><div className="button-row"><button className="secondary-button" type="button" disabled={!plugin.installed || runningActionId === plugin.id} onClick={() => void launchPlugin(plugin.id)}>{runningActionId === plugin.id ? "启动中" : "启动"}</button>{plugin.homepage ? <button className="ghost-button" type="button" onClick={() => void openTarget(plugin.homepage!)}>官网</button> : null}</div></article>)}</div></section></> : null}

          {activeSection === "ai-local-deploy" ? <><section className="panel"><div className="section-heading"><div><p className="eyebrow">AI Fit</p><h2>{aiAssessment.tier}</h2></div><p>{aiAssessment.headline}</p></div><div className="cards-grid cards-grid--compact"><article className="card module-card action-card--compact"><span className="module-card__status">推荐模型</span><h3>{aiAssessment.models.join(" / ")}</h3><p>按当前硬件给出的现实建议。</p></article><article className="card module-card action-card--compact"><span className="module-card__status">运行方式</span><h3>{aiAssessment.runtime}</h3><p>用完即走，避免常驻吃资源。</p></article><article className="card module-card action-card--compact"><span className="module-card__status">当前机器</span><h3>{formatMemory(snapshot?.memoryTotalMb)} RAM / {formatMemory(snapshot?.gpuMemoryMb)} VRAM</h3><p>{snapshot?.gpuName ?? "等待显卡检测"}</p></article></div></section><section className="panel"><div className="section-heading"><div><p className="eyebrow">Runtime Status</p><h2>Ollama 状态</h2></div><p>{aiRuntime?.suggestedEntry ?? "正在读取运行态。"}</p></div><div className="stats-row"><article className="card stat-chip"><strong>{aiRuntime?.ollamaInstalled ? "已安装" : "未安装"}</strong><span>Ollama</span></article><article className="card stat-chip"><strong>{aiRuntime?.ollamaRunning ? "运行中" : "未运行"}</strong><span>推理进程</span></article><article className="card stat-chip"><strong>{aiRuntime?.availableModels.length ?? 0}</strong><span>可用模型</span></article><article className="card stat-chip"><strong>{aiRuntime?.openClawDetected ? "已发现" : "未发现"}</strong><span>OpenClaw</span></article></div></section></> : null}
        </main>

        <aside className="rail">
          <section className="panel rail-panel"><p className="eyebrow">系统概览</p><h2>当前机器</h2><dl className="detail-list"><div><dt>主机</dt><dd>{snapshot?.hostName ?? "读取中"}</dd></div><div><dt>系统</dt><dd>{snapshot ? `${snapshot.osName} ${snapshot.osBuild}` : "读取中"}</dd></div><div><dt>主网络</dt><dd>{snapshot?.networkDescription ?? "等待网卡识别"}</dd></div><div><dt>刷新时间</dt><dd>{formatRelativeTime(snapshot?.collectedAt)}</dd></div></dl></section>
          <section className="panel rail-panel"><p className="eyebrow">操作结果</p><h2>最近一次动作</h2>{lastResult ? <div className="result-card result-card--compact"><span className={`result-card__status ${lastResult.success ? "is-success" : "is-failure"}`}>{lastResult.success ? "成功" : "注意"}</span><h3>{lastResult.title}</h3><p>{lastResult.summary}</p><small>耗时 {formatDuration(lastResult.durationMs)}</small>{lastResult.outputPath ? <button className="ghost-button" type="button" onClick={() => void openTarget(lastResult.outputPath!)}>打开输出位置</button> : null}<details className="result-details"><summary>查看详情</summary>{lastResult.warnings.length > 0 ? <ul className="plain-list">{lastResult.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}<pre className="console-output">{lastResult.details}</pre></details></div> : <p className="muted-copy">执行任意功能后，这里会显示结果摘要。</p>}</section>
          <section className="panel rail-panel rail-panel--compact"><p className="eyebrow">原则</p><h2>Less is more</h2><ul className="plain-list">{safetyRails.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul><p className="muted-copy">已接入插件 {installedPlugins.length} 个。</p></section>
          <DonatePanel charged={charged} onCharge={() => setCharged(true)} />
        </aside>
      </div>

      <AiPalette open={paletteOpen} runtime={aiRuntime} prompt={aiPrompt} busy={aiBusy} response={aiResponse} onPromptChange={setAiPrompt} onClose={() => setPaletteOpen(false)} onSubmit={() => void askLocalAi()} />
      {bossMode ? <BossModeOverlay state={bossState} /> : null}
      {toast ? <div className={`toast toast--${toast.tone}`}>{toast.message}</div> : null}
    </>
  );
}

export default App;
