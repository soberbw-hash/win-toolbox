import type { CreatorCacheTarget } from "./types";
import { formatBytes } from "./format";

type CreatorCachePanelProps = {
  items: CreatorCacheTarget[];
  runningId: string | null;
  onRefresh: () => void;
  onCleanAll: () => void;
  onCleanOne: (id: string) => void;
};

export function CreatorCachePanel({
  items,
  runningId,
  onRefresh,
  onCleanAll,
  onCleanOne,
}: CreatorCachePanelProps) {
  const totalBytes = items.reduce((sum, item) => sum + item.sizeBytes, 0);
  const existingCount = items.filter((item) => item.exists).length;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Creator Cache Cleaner</p>
          <h2>创作者深度清理</h2>
        </div>
        <p>面向剪映、CapCut、Adobe、DaVinci、OBS 这类重度缓存场景做的定向回血。</p>
      </div>

      <div className="stats-row">
        <article className="card stat-chip">
          <strong>{formatBytes(totalBytes)}</strong>
          <span>当前可见缓存体积</span>
        </article>
        <article className="card stat-chip">
          <strong>{existingCount}</strong>
          <span>已命中缓存目录</span>
        </article>
        <article className="card stat-chip">
          <strong>{items.length}</strong>
          <span>预置扫描目标</span>
        </article>
      </div>

      <div className="button-row">
        <button className="primary-button" type="button" onClick={onCleanAll}>
          {runningId === "creator_deep_clean_all" ? "正在清理..." : "一键清空创作缓存"}
        </button>
        <button className="secondary-button" type="button" onClick={onRefresh}>
          重新扫描
        </button>
      </div>

      <div className="cards-grid">
        {items.map((item) => (
          <article key={item.id} className="card action-card">
            <div className="action-card__header">
              <h3>{item.name}</h3>
              <span>{item.exists ? "已发现" : "未发现"}</span>
            </div>
            <p>{item.description}</p>
            <small>{item.path}</small>
            <div className="button-row">
              <span className="status-pill">{formatBytes(item.sizeBytes)}</span>
              <button
                className="ghost-button"
                type="button"
                disabled={!item.exists || runningId === item.id}
                onClick={() => onCleanOne(item.id)}
              >
                {runningId === item.id ? "清理中..." : "清理这一项"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
