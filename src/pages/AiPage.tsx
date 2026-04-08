import type { AiAssessment, AiChatResponse, AiRuntimeStatus, ComponentManifest } from "../types";

type AiPageProps = {
  assessment: AiAssessment;
  runtime: AiRuntimeStatus | null;
  response: AiChatResponse | null;
  busyComponentId: string | null;
  onOpenPalette: () => void;
  onManageComponent: (componentId: string, operation: "install" | "repair" | "uninstall") => void;
  components: ComponentManifest[];
};

export function AiPage({
  assessment,
  runtime,
  response,
  busyComponentId,
  onOpenPalette,
  onManageComponent,
  components,
}: AiPageProps) {
  const ollama = components.find((item) => item.id === "ollama-runtime");

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
            <p>{runtime?.suggestedEntry ?? "正在读取运行时状态。"}</p>
            <small>
              {runtime?.ollamaInstalled ? "Ollama 已安装" : "Ollama 未安装"}
              {runtime?.ollamaRunning ? " · 推理中" : ""}
            </small>
          </article>

          <article className="soft-card tool-card">
            <h3>一句话调用</h3>
            <p>需要的时候再呼出，不让本地模型长期常驻。</p>
            <button className="secondary-button" type="button" onClick={onOpenPalette}>
              打开 AI 面板
            </button>
          </article>
        </div>
      </section>

      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">AI Component</p>
            <h2>本地运行时</h2>
          </div>
        </div>

        <div className="split-grid">
          <article className="soft-card feature-card">
            <h3>{ollama?.name ?? "Ollama 运行时"}</h3>
            <p>{ollama?.description ?? "本地 AI 运行时。"}</p>
            <button
              className={ollama?.installed ? "secondary-button" : "primary-button"}
              type="button"
              disabled={busyComponentId === "ollama-runtime"}
              onClick={() =>
                onManageComponent("ollama-runtime", ollama?.installed ? "repair" : "install")
              }
            >
              {busyComponentId === "ollama-runtime"
                ? "处理中..."
                : ollama?.installed
                  ? "重新安装"
                  : "安装 Ollama"}
            </button>
          </article>

          <article className="soft-card feature-card">
            <h3>最近回答</h3>
            <p>{response?.model ?? "还没有调用记录"}</p>
            <small>
              {response?.answer?.slice(0, 120) ?? "打开 AI 面板后，就可以直接发起本地问答。"}
            </small>
          </article>
        </div>
      </section>
    </div>
  );
}
