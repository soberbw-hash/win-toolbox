import { ComponentCenter } from "../ComponentCenter";
import { bossModeShortcut, quickPathTargets } from "../content";
import { StorageVisualizer } from "../StorageVisualizer";
import type {
  ComponentManifest,
  ComponentOperation,
  StorageHotspot,
} from "../types";

type EfficiencyPageProps = {
  components: ComponentManifest[];
  hotspots: StorageHotspot[];
  busyComponentId: string | null;
  captureHelperEnabled: boolean;
  onToggleCaptureHelper: (nextEnabled: boolean) => void;
  onManageComponent: (componentId: string, operation: ComponentOperation) => void;
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
  captureHelperEnabled,
  onToggleCaptureHelper,
  onManageComponent,
  onLaunchComponent,
  onRefreshHotspots,
  onOpenTarget,
}: EfficiencyPageProps) {
  const capturePlus = components.find((item) => item.id === "capture-plus");
  const captureBusy = busyComponentId === "capture-plus";

  const captureStatus = capturePlus?.installed
    ? captureHelperEnabled
      ? "已开启。按 F1 截图，按 F3 贴图。"
      : "Snipaste 已安装，点击开启后就会直接接管截图。"
    : "未开启。点击一下会自动安装 Snipaste 并启用。";

  return (
    <div className="page-stack">
      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Capture</p>
            <h2>截图增强</h2>
          </div>
          <p className="section-copy">这里只保留一个开关。开就装好，关就回到系统默认。</p>
        </div>

        <div className="split-grid split-grid--capture">
          <article className="soft-card feature-card capture-card">
            <div className="history-item__top">
              <div>
                <h3>Snipaste 截图增强</h3>
                <small>{capturePlus?.statusLabel ?? "未检测到"}</small>
              </div>
              <span
                className={`pill ${captureHelperEnabled ? "pill--success" : "pill--muted"}`}
              >
                {captureHelperEnabled ? "已开启" : "未开启"}
              </span>
            </div>

            <p>{captureStatus}</p>
            <small>不开启时，仍然可以直接使用 `Win + Shift + S`。</small>

            <div className="button-row">
              <button
                className={captureHelperEnabled ? "secondary-button" : "primary-button"}
                type="button"
                disabled={captureBusy}
                onClick={() => onToggleCaptureHelper(!captureHelperEnabled)}
              >
                {captureBusy ? "处理中..." : captureHelperEnabled ? "关闭" : "开启"}
              </button>
            </div>
          </article>

          <article className="soft-card feature-card capture-shortcut-card">
            <h3>快捷键提示</h3>
            <div className="shortcut-list">
              <div className="shortcut-row">
                <strong>F1</strong>
                <span>截图</span>
              </div>
              <div className="shortcut-row">
                <strong>F3</strong>
                <span>贴图</span>
              </div>
              <div className="shortcut-row">
                <strong>{bossModeShortcut}</strong>
                <span>进入 / 退出老板键</span>
              </div>
            </div>
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
            刷新扫描
          </button>
        </div>

        <p className="section-copy section-copy--full">
          用图形视图直接看清空间都去哪了。点图块或列表就能打开对应位置。
        </p>

        <StorageVisualizer hotspots={hotspots} onOpenTarget={onOpenTarget} />
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
        hiddenIds={["capture-plus"]}
        onManage={onManageComponent}
        onLaunch={onLaunchComponent}
      />
    </div>
  );
}
