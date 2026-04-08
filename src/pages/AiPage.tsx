import type {
  AiAssessment,
  AiChatResponse,
  AiRuntimeStatus,
  ComponentBusyState,
  ComponentManifest,
} from "../types";

type AiPageProps = {
  assessment: AiAssessment;
  runtime: AiRuntimeStatus | null;
  response: AiChatResponse | null;
  busyState: ComponentBusyState | null;
  onOpenPalette: () => void;
  onManageComponent: (componentId: string, operation: "install" | "repair" | "uninstall") => void;
  onLaunchComponent: (componentId: string) => void;
  components: ComponentManifest[];
};

export function AiPage({
  assessment,
  runtime,
  response,
  busyState,
  onOpenPalette,
  onManageComponent,
  onLaunchComponent,
  components,
}: AiPageProps) {
  const ollama = components.find((item) => item.id === "ollama-runtime");
  const qclaw = components.find((item) => item.id === "qclaw");

  return (
    <div className="page-stack">
      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">AI Runtime</p>
            <h2>{assessment.tier}</h2>
          </div>
          <p className="section-copy">{assessment.headline}</p>
        </div>

        <div className="tool-grid tool-grid--three">
          <article className="soft-card tool-card">
            <h3>推荐模型</h3>
            <p>{assessment.models.join(" / ")}</p>
            <small>{assessment.runtime}</small>
          </article>

          <article className="soft-card tool-card">
            <h3>运行时状态</h3>
            <p>{runtime?.suggestedEntry ?? "正在读取本地运行时状态"}</p>
            <small>
              {runtime?.ollamaInstalled ? "Ollama 已安装" : "Ollama 未安装"}
              {runtime?.ollamaRunning ? " · 正在运行" : ""}
              {runtime?.qclawInstalled ? " · Qclaw 已安装" : ""}
            </small>
          </article>

          <article className="soft-card tool-card">
            <h3>一句话调用</h3>
            <p>需要的时候再呼出，不让本地模型长期常驻占资源。</p>
            <button className="secondary-button" type="button" onClick={onOpenPalette}>
              打开 AI 悬浮窗
            </button>
          </article>
        </div>
      </section>

      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Desktop Helpers</p>
            <h2>桌面助手与运行时</h2>
          </div>
          <p className="section-copy">Win Toolbox 只负责安装、打开和修复，复杂配置都交给组件本体。</p>
        </div>

        <div className="split-grid">
          <article className="soft-card feature-card">
            <div className="history-item__top">
              <div>
                <h3>{qclaw?.name ?? "Qclaw 桌面助手"}</h3>
                <small>{qclaw?.statusLabel ?? "未安装"}</small>
              </div>
              <span className={`pill ${qclaw?.installed ? "pill--success" : "pill--muted"}`}>
                {qclaw?.installed ? "已就绪" : "未安装"}
              </span>
            </div>
            <p>{qclaw?.description ?? "一键部署本地 AI 桌面助手。"}</p>
            <small>{qclaw?.summary ?? "安装完成后点击打开即可使用。"}</small>
            {busyState?.componentId === "qclaw" ? (
              <div className="component-progress">
                <div className="component-progress__head">
                  <span>{busyState.stageLabel}</span>
                  <strong>{busyState.progress}%</strong>
                </div>
                <div className="component-progress__bar">
                  <span style={{ width: `${busyState.progress}%` }} />
                </div>
              </div>
            ) : null}
            <div className="button-row">
              <button
                className={qclaw?.installed ? "secondary-button" : "primary-button"}
                type="button"
                disabled={busyState?.componentId === "qclaw"}
                onClick={() => {
                  if (qclaw?.status === "repairable") {
                    onManageComponent("qclaw", "repair");
                    return;
                  }

                  if (qclaw?.installed) {
                    onLaunchComponent("qclaw");
                    return;
                  }

                  onManageComponent("qclaw", "install");
                }}
              >
                {busyState?.componentId === "qclaw"
                  ? "处理中..."
                  : qclaw?.status === "repairable"
                    ? "修复"
                    : qclaw?.installed
                      ? "打开"
                      : "安装"}
              </button>

              {qclaw?.installed ? (
                <button
                  className="ghost-button"
                  type="button"
                  disabled={busyState?.componentId === "qclaw"}
                  onClick={() => onManageComponent("qclaw", "uninstall")}
                >
                  卸载
                </button>
              ) : null}
            </div>
          </article>

          <article className="soft-card feature-card">
            <div className="history-item__top">
              <div>
                <h3>{ollama?.name ?? "Ollama 运行时"}</h3>
                <small>{ollama?.statusLabel ?? "未安装"}</small>
              </div>
              <span className={`pill ${ollama?.installed ? "pill--success" : "pill--muted"}`}>
                {ollama?.installed ? "已就绪" : "未安装"}
              </span>
            </div>
            <p>{ollama?.description ?? "本地 AI 运行时。"}</p>
            <small>{ollama?.summary ?? "先装好运行时，再决定拉什么模型。"}</small>
            {busyState?.componentId === "ollama-runtime" ? (
              <div className="component-progress">
                <div className="component-progress__head">
                  <span>{busyState.stageLabel}</span>
                  <strong>{busyState.progress}%</strong>
                </div>
                <div className="component-progress__bar">
                  <span style={{ width: `${busyState.progress}%` }} />
                </div>
              </div>
            ) : null}
            <div className="button-row">
              <button
                className={ollama?.installed ? "secondary-button" : "primary-button"}
                type="button"
                disabled={busyState?.componentId === "ollama-runtime"}
                onClick={() =>
                  onManageComponent(
                    "ollama-runtime",
                    ollama?.installed ? "repair" : "install",
                  )
                }
              >
                {busyState?.componentId === "ollama-runtime"
                  ? "处理中..."
                  : ollama?.installed
                    ? "修复"
                    : "安装"}
              </button>

              {ollama?.installed ? (
                <button
                  className="ghost-button"
                  type="button"
                  disabled={busyState?.componentId === "ollama-runtime"}
                  onClick={() => onManageComponent("ollama-runtime", "uninstall")}
                >
                  卸载
                </button>
              ) : null}
            </div>
          </article>
        </div>
      </section>

      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Recent Output</p>
            <h2>最近回答</h2>
          </div>
        </div>

        {response ? (
          <article className="soft-card feature-card">
            <div className="history-item__top">
              <strong>{response.model}</strong>
              <span className="pill pill--muted">本地回答</span>
            </div>
            <small>{response.answer.slice(0, 220)}</small>
          </article>
        ) : (
          <div className="empty-state">打开 AI 悬浮窗后，就可以直接发起本地问答。</div>
        )}
      </section>
    </div>
  );
}
