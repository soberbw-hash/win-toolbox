import type { ToolDefinition } from "../types";

type SystemPageProps = {
  tools: ToolDefinition[];
  runningActionId: string | null;
  onRunAction: (actionId: ToolDefinition["id"]) => void;
};

export function SystemPage({ tools, runningActionId, onRunAction }: SystemPageProps) {
  return (
    <div className="page-stack">
      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">System</p>
            <h2>维护与修复</h2>
          </div>
          <p className="section-copy">把系统维护动作整理成更清楚、更克制的卡片。</p>
        </div>

        <div className="tool-grid">
          {tools.map((tool) => (
            <article key={tool.id} className="soft-card tool-card">
              <div className="tool-card__top">
                <h3>{tool.title}</h3>
                <span className="pill pill--muted">{tool.tag}</span>
              </div>
              <p>{tool.description}</p>
              <small>{tool.note}</small>
              <button
                className={tool.tone === "primary" ? "primary-button" : "secondary-button"}
                type="button"
                disabled={runningActionId === tool.id}
                onClick={() => onRunAction(tool.id)}
              >
                {runningActionId === tool.id ? "处理中..." : "运行"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
