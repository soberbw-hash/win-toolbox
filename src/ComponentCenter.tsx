import type { ComponentManifest, ComponentOperation } from "./types";

type ComponentCenterProps = {
  items: ComponentManifest[];
  busyId: string | null;
  hiddenIds?: string[];
  onManage: (componentId: string, operation: ComponentOperation) => void;
  onLaunch: (componentId: string) => void;
};

export function ComponentCenter({
  items,
  busyId,
  hiddenIds = [],
  onManage,
  onLaunch,
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
        <p className="section-copy">常用增强统一放在这里，安装、打开、卸载都一目了然。</p>
      </div>

      {visibleItems.length === 0 ? (
        <div className="empty-state">当前没有可展示的组件。</div>
      ) : (
        <div className="component-grid">
          {visibleItems.map((item) => (
            <article key={item.id} className="soft-card component-card">
              <div className="component-card__top">
                <div>
                  <h3>{item.name}</h3>
                  <small>{item.category}</small>
                </div>
                <span className={`pill ${item.installed ? "pill--success" : "pill--muted"}`}>
                  {item.statusLabel}
                </span>
              </div>

              <p>{item.description}</p>
              <small>{item.summary}</small>

              <div className="button-row">
                <button
                  className={item.installed ? "secondary-button" : "primary-button"}
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => {
                    if (item.installed) {
                      onLaunch(item.id);
                    } else {
                      onManage(item.id, "install");
                    }
                  }}
                >
                  {busyId === item.id ? "处理中..." : item.installed ? "打开" : "安装"}
                </button>

                {item.installed && item.kind === "winget" ? (
                  <button
                    className="ghost-button"
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => onManage(item.id, "uninstall")}
                  >
                    卸载
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
