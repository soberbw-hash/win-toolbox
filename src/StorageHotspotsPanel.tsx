import type { StorageHotspot } from "./types";
import { formatBytes } from "./format";

type StorageHotspotsPanelProps = {
  items: StorageHotspot[];
  onRefresh: () => void;
  onOpenPath: (path: string) => void;
};

export function StorageHotspotsPanel({
  items,
  onRefresh,
  onOpenPath,
}: StorageHotspotsPanelProps) {
  const maxSize = Math.max(...items.map((item) => item.sizeBytes), 1);

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Space Visualizer</p>
          <h2>空间透视仪</h2>
        </div>
        <p>快速找出最占空间的位置。</p>
      </div>

      <div className="button-row">
        <button className="secondary-button" type="button" onClick={onRefresh}>
          重新扫描
        </button>
      </div>

      <div className="hotspot-list">
        {items.map((item) => (
          <article key={item.id} className="card hotspot-card action-card--compact">
            <div className="action-card__header">
              <h3>{item.label}</h3>
              <span>{item.source}</span>
            </div>
            <div className="hotspot-card__bar">
              <span style={{ width: `${Math.max((item.sizeBytes / maxSize) * 100, 8)}%` }} />
            </div>
            <p>
              {formatBytes(item.sizeBytes)} · {item.itemCount} 项
            </p>
            <div className="button-row">
              <button className="ghost-button" type="button" onClick={() => onOpenPath(item.path)}>
                打开位置
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
