import type { AiChatResponse, AiRuntimeStatus } from "./types";

type AiPaletteProps = {
  open: boolean;
  runtime: AiRuntimeStatus | null;
  prompt: string;
  busy: boolean;
  response: AiChatResponse | null;
  onPromptChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function AiPalette({
  open,
  runtime,
  prompt,
  busy,
  response,
  onPromptChange,
  onClose,
  onSubmit,
}: AiPaletteProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <section className="palette" onClick={(event) => event.stopPropagation()}>
        <div className="palette__header">
          <div>
            <p className="eyebrow">AI 灵感悬浮窗</p>
            <h3>一句话直接问</h3>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            关闭
          </button>
        </div>

        <p className="palette__meta">
          {runtime?.paletteReady
            ? `当前默认模型：${runtime.availableModels[0]}`
            : "还没有可直接调用的本地模型，请先安装 Ollama 并拉取模型。"}
        </p>

        <textarea
          className="palette__input"
          value={prompt}
          placeholder="比如：帮我把这段文案改得更像短视频开场钩子。"
          onChange={(event) => onPromptChange(event.target.value)}
        />

        <div className="button-row">
          <button
            className="primary-button"
            type="button"
            disabled={busy || !runtime?.paletteReady}
            onClick={onSubmit}
          >
            {busy ? "本地模型思考中..." : "发送到本地 AI"}
          </button>
          <span className="palette__shortcut">快捷键：Alt + Space</span>
        </div>

        {response ? (
          <article className="soft-card palette__response">
            <div className="history-item__top">
              <strong>{response.model}</strong>
              <span className="pill pill--muted">本地回答</span>
            </div>
            <pre className="console-output">{response.answer}</pre>
          </article>
        ) : null}
      </section>
    </div>
  );
}
