import { getComponentIconPath } from "./componentIcons";
import type {
  ComponentBusyState,
  ComponentManifest,
  ComponentOperation,
} from "./types";

type ComponentCenterProps = {
  items: ComponentManifest[];
  busyState: ComponentBusyState | null;
  hiddenIds?: string[];
  onManage: (componentId: string, operation: ComponentOperation) => void;
  onLaunch: (componentId: string) => void;
  onOpenTarget: (target: string) => void;
};

function getCategoryTone(category: string) {
  if (category.includes("AI")) {
    return "component-card__icon--ai";
  }

  if (category.includes("网络")) {
    return "component-card__icon--network";
  }

  if (category.includes("系统")) {
    return "component-card__icon--system";
  }

  return "component-card__icon--efficiency";
}

function getPrimaryAction(item: ComponentManifest) {
  if (item.status === "repairable") {
    return { label: "修复", operation: "repair" as const };
  }

  if (item.installed) {
    return { label: "打开", operation: null };
  }

  return { label: "安装", operation: "install" as const };
}

export function ComponentCenter({
  items,
  busyState,
  hiddenIds = [],
  onManage,
  onLaunch,
  onOpenTarget,
}: ComponentCenterProps) {
  const visibleItems = items.filter(
    (item) => item.kind !== "built-in" && !hiddenIds.includes(item.id),
  );

  return (
    <section className="surface">
      <div className="section-head">
        <div>
          <p className="section-kicker">Components</p>
          <h2>组件中心</h2>
        </div>
        <p className="section-copy">
          装上常用增强工具，状态、版本、来源和日志入口都能在这里直接看到。
        </p>
      </div>

      {visibleItems.length === 0 ? (
        <div className="empty-state">当前还没有可展示的组件。</div>
      ) : (
        <div className="component-grid">
          {visibleItems.map((item) => {
            const isBusy = busyState?.componentId === item.id;
            const primary = getPrimaryAction(item);
            const iconPath = getComponentIconPath(item.id);

            return (
              <article key={item.id} className="soft-card component-card component-card--rich">
                <div className="component-card__top">
                  <div className="component-card__title">
                    <span className={`component-card__icon ${getCategoryTone(item.category)}`}>
                      {iconPath ? <img src={iconPath} alt="" /> : item.name.slice(0, 1)}
                    </span>
                    <div>
                      <h3>{item.name}</h3>
                      <small>{item.category}</small>
                    </div>
                  </div>
                  <span
                    className={`pill ${
                      item.status === "repairable"
                        ? "pill--warning"
                        : item.installed
                          ? "pill--success"
                          : "pill--muted"
                    }`}
                  >
                    {item.statusLabel}
                  </span>
                </div>

                <p>{item.description}</p>
                <small>{item.summary}</small>

                <div className="component-card__meta">
                  <span>{item.version ? `版本 ${item.version}` : "版本跟随安装源"}</span>
                  <span>{item.sourceLabel ?? "官方来源"}</span>
                </div>

                {isBusy ? (
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
                    className={item.installed ? "secondary-button" : "primary-button"}
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      if (primary.operation) {
                        onManage(item.id, primary.operation);
                      } else {
                        onLaunch(item.id);
                      }
                    }}
                  >
                    {isBusy ? "处理中..." : primary.label}
                  </button>

                  {item.installed && item.supportsRepair && item.status !== "repairable" ? (
                    <button
                      className="ghost-button"
                      type="button"
                      disabled={isBusy}
                      onClick={() => onManage(item.id, "repair")}
                    >
                      修复
                    </button>
                  ) : null}

                  {item.supportsUninstall && item.installed ? (
                    <button
                      className="ghost-button"
                      type="button"
                      disabled={isBusy}
                      onClick={() => onManage(item.id, "uninstall")}
                    >
                      卸载
                    </button>
                  ) : null}
                </div>

                <div className="component-card__links">
                  {item.sourceUrl ? (
                    <button
                      className="component-card__link"
                      type="button"
                      onClick={() => onOpenTarget(item.sourceUrl!)}
                    >
                      来源
                    </button>
                  ) : null}
                  {item.licenseUrl ? (
                    <button
                      className="component-card__link"
                      type="button"
                      onClick={() => onOpenTarget(item.licenseUrl!)}
                    >
                      许可证
                    </button>
                  ) : null}
                  {item.logDir ? (
                    <button
                      className="component-card__link"
                      type="button"
                      onClick={() => onOpenTarget(item.logDir!)}
                    >
                      日志
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
