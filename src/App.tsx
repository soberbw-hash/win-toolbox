import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getAiAssessment } from "./ai";
import {
  dashboardActionIds,
  roadmap,
  safetyRails,
  sectionCatalog,
  sections,
  toolDefinitions,
} from "./content";
import type {
  ActionId,
  PluginManifest,
  SectionId,
  SystemSnapshot,
  ToolActionResult,
} from "./types";
import "./App.css";

function formatMemory(mb: number | null | undefined) {
  if (!mb) {
    return "Not detected";
  }

  const gb = mb / 1024;
  return gb >= 10 ? `${gb.toFixed(0)} GB` : `${gb.toFixed(1)} GB`;
}

function formatRelativeTime(iso: string | null | undefined) {
  if (!iso) {
    return "Not refreshed yet";
  }

  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.max(Math.round(diff / 1000), 0);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  return `${Math.round(minutes / 60)}h ago`;
}

function formatDuration(durationMs: number | null | undefined) {
  if (!durationMs) {
    return "instant";
  }

  return durationMs < 1000 ? `${durationMs} ms` : `${(durationMs / 1000).toFixed(1)} s`;
}

function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [snapshotError, setSnapshotError] = useState("");
  const [pluginError, setPluginError] = useState("");
  const [lastResult, setLastResult] = useState<ToolActionResult | null>(null);
  const [refreshingSnapshot, setRefreshingSnapshot] = useState(false);
  const [refreshingPlugins, setRefreshingPlugins] = useState(false);
  const [runningActionId, setRunningActionId] = useState<string | null>(null);

  async function loadSnapshot() {
    try {
      setRefreshingSnapshot(true);
      setSnapshotError("");
      setSnapshot(await invoke<SystemSnapshot>("get_system_snapshot"));
    } catch (error) {
      setSnapshotError(String(error));
    } finally {
      setRefreshingSnapshot(false);
    }
  }

  async function loadPlugins() {
    try {
      setRefreshingPlugins(true);
      setPluginError("");
      setPlugins(await invoke<PluginManifest[]>("list_plugins"));
    } catch (error) {
      setPluginError(String(error));
    } finally {
      setRefreshingPlugins(false);
    }
  }

  async function runAction(actionId: ActionId) {
    try {
      setRunningActionId(actionId);
      const result = await invoke<ToolActionResult>("run_tool_action", { actionId });
      setLastResult(result);

      if (actionId === "one_click_clean") {
        void loadSnapshot();
      }

      if (actionId === "open_plugin_folder") {
        void loadPlugins();
      }
    } catch (error) {
      setLastResult({
        actionId,
        title: "Action Error",
        success: false,
        summary: "The action failed before it returned a result.",
        details: String(error),
        durationMs: 0,
        warnings: [],
      });
    } finally {
      setRunningActionId(null);
    }
  }

  async function launchPlugin(pluginId: string) {
    try {
      setRunningActionId(pluginId);
      setLastResult(await invoke<ToolActionResult>("launch_plugin", { pluginId }));
    } catch (error) {
      setLastResult({
        actionId: pluginId,
        title: "Plugin Error",
        success: false,
        summary: "The plugin launch failed.",
        details: String(error),
        durationMs: 0,
        warnings: [],
      });
    } finally {
      setRunningActionId(null);
    }
  }

  async function openTarget(target: string) {
    try {
      setRunningActionId(target);
      setLastResult(await invoke<ToolActionResult>("open_target", { target }));
    } catch (error) {
      setLastResult({
        actionId: "open_target",
        title: "Open Target Error",
        success: false,
        summary: "The target could not be opened.",
        details: String(error),
        durationMs: 0,
        warnings: [],
      });
    } finally {
      setRunningActionId(null);
    }
  }

  useEffect(() => {
    void loadSnapshot();
    void loadPlugins();

    const timer = window.setInterval(() => {
      void loadSnapshot();
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const installedPlugins = plugins.filter((plugin) => plugin.installed);
  const screenshotProvider = installedPlugins.find((plugin) =>
    plugin.tags.some((tag) => tag === "screenshot"),
  );
  const aiAssessment = getAiAssessment(snapshot);
  const activeSectionInfo = sectionCatalog[activeSection];

  const signalCards = [
    {
      label: "CPU",
      value: snapshot?.cpuName ?? "Reading processor information",
      meta: snapshot
        ? `${snapshot.cpuLoad}% load · ${snapshot.cpuCores} cores / ${snapshot.logicalCores} threads`
        : "Refreshes automatically every 30 seconds",
      progress: snapshot?.cpuLoad ?? 10,
    },
    {
      label: "Memory",
      value: snapshot
        ? `${formatMemory(snapshot.memoryUsedMb)} / ${formatMemory(snapshot.memoryTotalMb)}`
        : "Reading physical memory",
      meta: snapshot ? `${snapshot.memoryUsagePercent}% in use` : "Useful for cleanup and AI sizing",
      progress: snapshot?.memoryUsagePercent ?? 24,
    },
    {
      label: "GPU",
      value: snapshot?.gpuName ?? "Reading graphics adapter",
      meta: snapshot?.gpuMemoryMb
        ? `${formatMemory(snapshot.gpuMemoryMb)} VRAM detected`
        : "Fallback detection is active",
      progress: snapshot?.gpuMemoryMb ? Math.min((snapshot.gpuMemoryMb / 12288) * 100, 100) : 20,
    },
    {
      label: "Network",
      value: snapshot?.networkName ?? "No active adapter",
      meta: snapshot?.networkLinkSpeed ?? "Waiting for primary adapter",
      progress: snapshot?.networkName ? 68 : 12,
    },
  ];

  const dashboardActions = dashboardActionIds
    .map((id) => toolDefinitions.find((tool) => tool.id === id))
    .filter(Boolean);

  return (
    <div className="shell">
      <div className="shell__background shell__background--aurora" />
      <div className="shell__background shell__background--grid" />

      <aside className="sidebar panel">
        <div className="brand">
          <div className="brand__badge">WT</div>
          <div>
            <p className="eyebrow">Win Toolbox</p>
            <h1>Minimal Windows Toolbox</h1>
          </div>
        </div>

        <p className="sidebar__summary">
          Main app as the entry point. Real actions first. Plugin growth second. Heavy system tuning only when safety rails are ready.
        </p>

        <nav className="nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`nav__button ${section.id === activeSection ? "nav__button--active" : ""}`}
              type="button"
              onClick={() => setActiveSection(section.id)}
            >
              <span>{section.label}</span>
              <small>{section.hint}</small>
            </button>
          ))}
        </nav>

        <div className="sidebar__footnote card">
          <p className="eyebrow">Current Status</p>
          <h2>Usable MVP</h2>
          <p>Snapshot refresh, cleanup, capture launch, DISM checks, driver export, plugin scanning, and AI sizing are all wired in.</p>
        </div>
      </aside>

      <main className="workspace">
        <section className="hero panel">
          <div className="hero__copy">
            <p className="eyebrow">{activeSectionInfo.eyebrow}</p>
            <h2>{activeSectionInfo.title}</h2>
            <p>{activeSectionInfo.description}</p>
            <div className="hero__pills">
              <span className="status-pill">Usable MVP</span>
              <span className="status-pill status-pill--soft">
                {snapshot ? `${snapshot.hostName} · ${snapshot.osName} ${snapshot.osVersion}` : "Connecting to the local machine"}
              </span>
            </div>
          </div>

          <div className="hero__actions">
            <button className="primary-button" type="button" onClick={() => void loadSnapshot()} disabled={refreshingSnapshot}>
              {refreshingSnapshot ? "Refreshing..." : "Refresh system snapshot"}
            </button>

            <div className="hero__activity card">
              <p className="eyebrow">What makes this useful</p>
              <p>The app launches tools, runs checks, exports backups, and keeps the raw result of each action visible.</p>
            </div>
          </div>
        </section>

        {snapshotError ? <section className="panel warning-banner"><strong>System snapshot failed.</strong><span>{snapshotError}</span></section> : null}

        <section className="signals">
          {signalCards.map((card) => (
            <article key={card.label} className="card signal-card">
              <div className="signal-card__top"><p className="eyebrow">{card.label}</p><span>{card.progress.toFixed(0)}%</span></div>
              <h3>{card.value}</h3>
              <p>{card.meta}</p>
              <div className="signal-card__bar"><span style={{ width: `${card.progress}%` }} /></div>
            </article>
          ))}
        </section>

        {activeSection === "dashboard" ? (
          <section className="panel">
            <div className="section-heading">
              <div><p className="eyebrow">Quick Start</p><h2>Useful right now</h2></div>
              <p>These four actions make the MVP feel like a toolbox instead of a static mockup.</p>
            </div>

            <div className="cards-grid cards-grid--actions">
              {dashboardActions.map((tool) => (
                <article key={tool!.id} className="card action-card">
                  <div className="action-card__header"><h3>{tool!.title}</h3><span>{tool!.tag}</span></div>
                  <p>{tool!.description}</p>
                  <small>{tool!.note}</small>
                  <button type="button" className="secondary-button" onClick={() => void runAction(tool!.id)} disabled={runningActionId === tool!.id}>
                    {runningActionId === tool!.id ? "Running..." : "Run action"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === "common-tools" ? (
          <section className="panel">
            <div className="section-heading">
              <div><p className="eyebrow">Common Tools</p><h2>Built-in Windows integrations</h2></div>
              <p>Every card below is wired to a real command or Windows URI already.</p>
            </div>
            <div className="cards-grid">
              {toolDefinitions.map((tool) => (
                <article key={tool.id} className="card action-card">
                  <div className="action-card__header"><h3>{tool.title}</h3><span>{tool.tag}</span></div>
                  <p>{tool.description}</p>
                  <small>{tool.note}</small>
                  <button type="button" className="secondary-button" onClick={() => void runAction(tool.id)} disabled={runningActionId === tool.id}>
                    {runningActionId === tool.id ? "Running..." : "Run action"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === "advanced-toolbox" ? (
          <section className="panel">
            <div className="section-heading">
              <div><p className="eyebrow">Plugins</p><h2>Portable tools that light up automatically</h2></div>
              <p>The launcher reads Plugins/config.json and resolves every executable relative to that folder.</p>
            </div>

            <div className="button-row">
              <button className="primary-button" type="button" onClick={() => void runAction("open_plugin_folder")} disabled={runningActionId === "open_plugin_folder"}>
                {runningActionId === "open_plugin_folder" ? "Opening..." : "Open plugin folder"}
              </button>
              <button className="secondary-button" type="button" onClick={() => void loadPlugins()} disabled={refreshingPlugins}>
                {refreshingPlugins ? "Scanning..." : "Rescan plugins"}
              </button>
            </div>

            {pluginError ? <p className="inline-error">{pluginError}</p> : null}

            <div className="cards-grid">
              {plugins.map((plugin) => (
                <article key={plugin.id} className="card plugin-card">
                  <div className="plugin-card__top">
                    <div><h3>{plugin.name}</h3><p>{plugin.category}</p></div>
                    <span className={`plugin-card__state ${plugin.installed ? "plugin-card__state--installed" : "plugin-card__state--missing"}`}>
                      {plugin.installed ? "Installed" : "Missing"}
                    </span>
                  </div>
                  <p>{plugin.description}</p>
                  <div className="tag-list">{plugin.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  <small>{plugin.resolvedPath ?? plugin.executable}</small>
                  <div className="button-row">
                    <button type="button" className="secondary-button" onClick={() => void launchPlugin(plugin.id)} disabled={!plugin.installed || runningActionId === plugin.id}>
                      {runningActionId === plugin.id ? "Launching..." : "Launch"}
                    </button>
                    {plugin.homepage ? <button type="button" className="ghost-button" onClick={() => void openTarget(plugin.homepage!)} disabled={runningActionId === plugin.homepage}>Homepage</button> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === "ai-local-deploy" ? (
          <>
            <section className="panel">
              <div className="section-heading">
                <div><p className="eyebrow">Hardware Fit</p><h2>{aiAssessment.tier}</h2></div>
                <p>{aiAssessment.headline}</p>
              </div>
              <div className="cards-grid">
                <article className="card module-card"><span className="module-card__status">Recommended</span><h3>Model size</h3><p>{aiAssessment.models.join(" · ")}</p><small>Based on current RAM and detected VRAM</small></article>
                <article className="card module-card"><span className="module-card__status">Runtime</span><h3>Suggested deploy pattern</h3><p>{aiAssessment.runtime}</p><small>Keep idle shutdown in the loop from day one</small></article>
                <article className="card module-card"><span className="module-card__status">Current machine</span><h3>Detected budget</h3><p>{formatMemory(snapshot?.memoryTotalMb)} RAM · {formatMemory(snapshot?.gpuMemoryMb)} VRAM</p><small>{snapshot?.gpuName ?? "Waiting for GPU detection"}</small></article>
              </div>
            </section>

            <section className="panel">
              <div className="section-heading">
                <div><p className="eyebrow">Execution Notes</p><h2>How to keep local AI from becoming a resource leak</h2></div>
                <p>The recommendation engine is useful now even before one-click deploy arrives.</p>
              </div>
              <ul className="plain-list">{aiAssessment.notes.map((note) => <li key={note}>{note}</li>)}</ul>
            </section>
          </>
        ) : null}
      </main>

      <aside className="rail">
        <section className="panel rail-panel">
          <p className="eyebrow">Snapshot</p>
          <h2>Current machine</h2>
          <dl className="detail-list">
            <div><dt>Host</dt><dd>{snapshot?.hostName ?? "Loading"}</dd></div>
            <div><dt>Build</dt><dd>{snapshot ? `${snapshot.osName} (${snapshot.osBuild})` : "Loading"}</dd></div>
            <div><dt>Primary network</dt><dd>{snapshot?.networkDescription ?? "Waiting for adapter detection"}</dd></div>
            <div><dt>Last refresh</dt><dd>{formatRelativeTime(snapshot?.collectedAt)}</dd></div>
          </dl>
        </section>

        <section className="panel rail-panel">
          <p className="eyebrow">Activity</p>
          <h2>Last action result</h2>
          {lastResult ? (
            <div className="result-card">
              <span className={`result-card__status ${lastResult.success ? "is-success" : "is-failure"}`}>{lastResult.success ? "Success" : "Needs attention"}</span>
              <h3>{lastResult.title}</h3>
              <p>{lastResult.summary}</p>
              <small>Completed in {formatDuration(lastResult.durationMs)}</small>
              {lastResult.warnings.length > 0 ? <ul className="plain-list">{lastResult.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
              {lastResult.outputPath ? <button type="button" className="ghost-button" onClick={() => void openTarget(lastResult.outputPath!)} disabled={runningActionId === lastResult.outputPath}>Open output path</button> : null}
              <pre className="console-output">{lastResult.details}</pre>
            </div>
          ) : <p className="muted-copy">Run any action and the result will be pinned here with raw details.</p>}
        </section>

        <section className="panel rail-panel">
          <p className="eyebrow">Plugin Summary</p>
          <h2>Portable tools</h2>
          <ul className="plain-list">
            <li>{installedPlugins.length} plugin(s) installed from the manifest</li>
            <li>Screenshot provider: {screenshotProvider ? screenshotProvider.name : "Windows fallback only"}</li>
            <li>{plugins.length} total manifest entries ready for future growth</li>
          </ul>
        </section>

        <section className="panel rail-panel">
          <p className="eyebrow">Safety Rails</p>
          <h2>Guiding rules</h2>
          <ul className="plain-list">{safetyRails.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section className="panel rail-panel">
          <p className="eyebrow">Roadmap</p>
          <h2>Next steps</h2>
          <ul className="plain-list">{roadmap.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </aside>
    </div>
  );
}

export default App;
