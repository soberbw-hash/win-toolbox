import { formatMemory, formatRelativeTime } from "../format";
import type {
  HomeQuickAction,
  StorageHotspot,
  SystemSnapshot,
  ToolActionResult,
} from "../types";

type HomePageProps = {
  snapshot: SystemSnapshot | null;
  quickActions: HomeQuickAction[];
  runningActionId: string | null;
  hotspots: StorageHotspot[];
  lastResult: ToolActionResult | null;
  onQuickAction: (actionId: string) => void;
};

export function HomePage({
  snapshot,
  quickActions,
  runningActionId,
  hotspots,
  lastResult,
  onQuickAction,
}: HomePageProps) {
  const stats = [
    {
      label: "CPU",
      value: snapshot ? `${snapshot.cpuLoad}%` : "读取中",
      meta: snapshot?.cpuName ?? "处理器信息",
    },
    {
      label: "内存",
      value: snapshot ? `${snapshot.memoryUsagePercent}%` : "读取中",
      meta: snapshot
        ? `${formatMemory(snapshot.memoryUsedMb)} / ${formatMemory(snapshot.memoryTotalMb)}`
        : "物理内存占用",
    },
    {
      label: "显卡",
      value: snapshot?.gpuMemoryMb ? formatMemory(snapshot.gpuMemoryMb) : "读取中",
      meta: snapshot?.gpuName ?? "图形设备信息",
    },
    {
      label: "空间热点",
      value: hotspots[0]?.label ?? "扫描中",
      meta: hotspots[0]?.source ?? "空间管理",
    },
  ];

  return (
    <div className="page-stack">
      <section className="hero-surface">
        <div className="hero-surface__copy">
          <p className="section-kicker">WIN TOOLBOX V3.2</p>
          <h1>装好就能用</h1>
          <p>截图、清理、修复、空间管理，四个高频入口都留在第一屏。</p>
        </div>

        <div className="hero-surface__status soft-card">
          <h3>当前状态</h3>
          <p>{snapshot ? `${snapshot.osName} · ${snapshot.hostName}` : "正在读取设备状态"}</p>
          <small>{formatRelativeTime(snapshot?.collectedAt)}</small>
        </div>
      </section>

      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Quick Actions</p>
            <h2>四个高频入口</h2>
          </div>
          <p className="section-copy">不用解释太多，点一下就开始工作。</p>
        </div>

        <div className="home-actions">
          {quickActions.map((item) => (
            <button
              key={item.id}
              className={`home-action ${item.tone === "primary" ? "home-action--primary" : ""}`}
              type="button"
              disabled={runningActionId === item.id}
              onClick={() => onQuickAction(item.id)}
            >
              <strong>{runningActionId === item.id ? "处理中..." : item.title}</strong>
              <span>{item.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Snapshot</p>
            <h2>一眼看懂</h2>
          </div>
        </div>

        <div className="stat-strip">
          {stats.map((item) => (
            <article key={item.label} className="soft-card stat-strip__item">
              <small>{item.label}</small>
              <strong>{item.value}</strong>
              <p>{item.meta}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Last Result</p>
            <h2>结果摘要</h2>
          </div>
        </div>

        {lastResult ? (
          <article className="soft-card result-inline">
            <div className="history-item__top">
              <strong>{lastResult.title}</strong>
              <span className={`pill ${lastResult.success ? "pill--success" : "pill--warning"}`}>
                {lastResult.success ? "成功" : "注意"}
              </span>
            </div>
            <p>{lastResult.summary}</p>
          </article>
        ) : (
          <div className="empty-state">执行任意动作后，这里会保留最近一次结果。</div>
        )}
      </section>
    </div>
  );
}
