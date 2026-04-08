import type { ComponentManifest } from "./types";

type ComponentCenterProps = {
  items: ComponentManifest[];
  busyId: string | null;
  onManage: (componentId: string, operation: "install" | "repair" | "uninstall") => void;
  onLaunch: (componentId: string) => void;
};

export function ComponentCenter({ items, busyId, onManage, onLaunch }: ComponentCenterProps) {
  const visibleItems = items.filter((item) => item.kind !== "built-in");

  return (
    <section className="surface">
      <div className="section-head">
        <div>
          <p className="section-kicker">组件中心</p>
          <h2>安装即用</h2>
        </div>
        <p className="section-copy">增强能力统一通过组件安装，不再要求手动塞插件目录。</p>
      </div>

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
                    return;
                  }

                  onManage(item.id, "install");
                }}
              >
                {busyId === item.id ? "处理中..." : item.installed ? "启动" : "安装"}
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
    </section>
  );
}
