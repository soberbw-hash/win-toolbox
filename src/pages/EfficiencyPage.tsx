import { ComponentCenter } from "../ComponentCenter";
import { quickPathTargets } from "../content";
import { formatBytes } from "../format";
import type { ComponentManifest, StorageHotspot } from "../types";

type EfficiencyPageProps = {
  components: ComponentManifest[];
  hotspots: StorageHotspot[];
  busyComponentId: string | null;
  runningActionId: string | null;
  onRunCapture: () => void;
  onManageComponent: (componentId: string, operation: "install" | "repair" | "uninstall") => void;
  onLaunchComponent: (componentId: string) => void;
  onRefreshHotspots: () => void;
  onOpenTarget: (target: string) => void;
};

const quickPathMap: Record<(typeof quickPathTargets)[number]["pathKey"], string> = {
  downloads: "shell:Downloads",
  desktop: "shell:Desktop",
  documents: "shell:Personal",
};

export function EfficiencyPage({
  components,
  hotspots,
  busyComponentId,
  runningActionId,
  onRunCapture,
  onManageComponent,
  onLaunchComponent,
  onRefreshHotspots,
  onOpenTarget,
}: EfficiencyPageProps) {
  const capturePlus = components.find((item) => item.id === "capture-plus");

  return (
    <div className="page-stack">
      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Capture Center</p>
            <h2>截图中心</h2>
          </div>
          <p className="section-copy">基础截图内置，增强能力通过组件一键补齐。</p>
        </div>

        <div className="split-grid">
          <article className="soft-card feature-card">
            <h3>立即截图</h3>
            <p>区域截图开箱即用，不需要额外配置。</p>
            <button
              className="primary-button"
              type="button"
              disabled={runningActionId === "launch_capture"}
              onClick={onRunCapture}
            >
              {runningActionId === "launch_capture" ? "处理中..." : "截图"}
            </button>
          </article>

          <article className="soft-card feature-card">
            <h3>增强截图</h3>
            <p>
              {capturePlus?.installed
                ? "增强截图已经可用，支持更完整的截图工作流。"
                : "需要更强能力时，一键安装截图增强组件即可。"}
            </p>
            <button
              className={capturePlus?.installed ? "secondary-button" : "primary-button"}
              type="button"
              disabled={busyComponentId === "capture-plus"}
              onClick={() => {
                if (capturePlus?.installed) {
                  onLaunchComponent("capture-plus");
                  return;
                }

                onManageComponent("capture-plus", "install");
              }}
            >
              {busyComponentId === "capture-plus"
                ? "处理中..."
                : capturePlus?.installed
                  ? "启动增强截图"
                  : "安装增强截图"}
            </button>
          </article>
        </div>
      </section>

      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Storage</p>
            <h2>空间管理</h2>
          </div>
          <button className="ghost-button" type="button" onClick={onRefreshHotspots}>
            重新扫描
          </button>
        </div>

        <div className="hotspot-grid">
          {hotspots.slice(0, 8).map((item) => (
            <article key={item.id} className="soft-card hotspot-item">
              <div className="history-item__top">
                <strong>{item.label}</strong>
                <span className="pill pill--muted">{item.source}</span>
              </div>
              <p>{formatBytes(item.sizeBytes)}</p>
              <small>{item.itemCount} 项</small>
              <button className="ghost-button" type="button" onClick={() => onOpenTarget(item.path)}>
                打开位置
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Quick Paths</p>
            <h2>常用目录</h2>
          </div>
        </div>

        <div className="quick-path-grid">
          {quickPathTargets.map((item) => (
            <button
              key={item.id}
              className="quick-path"
              type="button"
              onClick={() => onOpenTarget(quickPathMap[item.pathKey])}
            >
              <strong>{item.label}</strong>
              <span>快速打开</span>
            </button>
          ))}
        </div>
      </section>

      <ComponentCenter
        items={components}
        busyId={busyComponentId}
        onManage={onManageComponent}
        onLaunch={onLaunchComponent}
      />
    </div>
  );
}
