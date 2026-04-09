import { quickPathTargets } from "../content";
import { StorageVisualizer } from "../StorageVisualizer";
import type { StorageHotspot } from "../types";

type EfficiencyPageProps = {
  hotspots: StorageHotspot[];
  onRefreshHotspots: () => void;
  onOpenTarget: (target: string) => void;
};

const quickPathMap: Record<(typeof quickPathTargets)[number]["pathKey"], string> = {
  downloads: "shell:Downloads",
  desktop: "shell:Desktop",
  documents: "shell:Personal",
};

export function EfficiencyPage({
  hotspots,
  onRefreshHotspots,
  onOpenTarget,
}: EfficiencyPageProps) {
  return (
    <div className="page-stack">
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
          用图形视图和列表一起看清空间热点，先知道哪里能删、哪里最好先别动。
        </p>

        <StorageVisualizer hotspots={hotspots} onOpenTarget={onOpenTarget} />
      </section>

      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Quick Paths</p>
            <h2>常用目录</h2>
          </div>
          <p className="section-copy">下载、桌面和文档一键直达，找空间热点时会更顺手。</p>
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
    </div>
  );
}
