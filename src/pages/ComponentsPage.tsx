import { ComponentCenter } from "../ComponentCenter";
import { getComponentIconPath } from "../componentIcons";
import type {
  ComponentBusyState,
  ComponentManifest,
  ComponentOperation,
} from "../types";

type ComponentsPageProps = {
  components: ComponentManifest[];
  busyState: ComponentBusyState | null;
  captureHelperEnabled: boolean;
  onToggleCaptureHelper: (nextEnabled: boolean) => void;
  onManageComponent: (componentId: string, operation: ComponentOperation) => void;
  onLaunchComponent: (componentId: string) => void;
  onOpenTarget: (target: string) => void;
};

export function ComponentsPage({
  components,
  busyState,
  captureHelperEnabled,
  onToggleCaptureHelper,
  onManageComponent,
  onLaunchComponent,
  onOpenTarget,
}: ComponentsPageProps) {
  const capturePlus = components.find((item) => item.id === "capture-plus");
  const captureBusy = busyState?.componentId === "capture-plus";

  const captureStatus = capturePlus?.installed
    ? captureHelperEnabled
      ? "已开启。按 F1 截图，按 F3 贴图。"
      : "Snipaste 已安装。点击开启后会直接接管截图增强。"
    : "未开启。点击开启后会自动安装 Snipaste 并立即启用。";

  return (
    <div className="page-stack">
      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Capture Plus</p>
            <h2>截图增强</h2>
          </div>
          <p className="section-copy">这里只保留一个开关。开就安装并启用，关就恢复系统默认截图。</p>
        </div>

        <div className="split-grid split-grid--capture">
          <article className="soft-card feature-card capture-card capture-card--with-icon">
            <div className="component-card__title">
              <span className="component-card__icon component-card__icon--efficiency">
                <img src={getComponentIconPath("capture-plus") ?? undefined} alt="" />
              </span>
              <div>
                <h3>Snipaste 截图增强</h3>
                <small>{capturePlus?.statusLabel ?? "未检测到"}</small>
              </div>
            </div>

            <p>{captureStatus}</p>
            <small>不开启时，仍然可以直接使用 `Win + Shift + S`。</small>

            {captureBusy ? (
              <div className="component-progress">
                <div className="component-progress__head">
                  <span>{busyState?.stageLabel}</span>
                  <strong>{busyState?.progress}%</strong>
                </div>
                <div className="component-progress__bar">
                  <span style={{ width: `${busyState?.progress ?? 0}%` }} />
                </div>
              </div>
            ) : null}

            <div className="button-row">
              <button
                className={captureHelperEnabled ? "secondary-button" : "primary-button"}
                type="button"
                disabled={captureBusy}
                onClick={() => onToggleCaptureHelper(!captureHelperEnabled)}
              >
                {captureBusy ? "处理中..." : captureHelperEnabled ? "关闭" : "开启"}
              </button>

              {capturePlus?.installed ? (
                <button
                  className="ghost-button"
                  type="button"
                  disabled={captureBusy}
                  onClick={() => onLaunchComponent("capture-plus")}
                >
                  打开
                </button>
              ) : null}

              {capturePlus?.installed ? (
                <button
                  className="ghost-button"
                  type="button"
                  disabled={captureBusy}
                  onClick={() => onManageComponent("capture-plus", "uninstall")}
                >
                  卸载
                </button>
              ) : null}
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
                <strong>Win + Shift + S</strong>
                <span>系统默认截图</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <ComponentCenter
        items={components}
        busyState={busyState}
        hiddenIds={["capture-plus"]}
        onManage={onManageComponent}
        onLaunch={onLaunchComponent}
        onOpenTarget={onOpenTarget}
      />
    </div>
  );
}
