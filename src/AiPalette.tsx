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
            <h3>想法来了，直接问</h3>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            关闭
          </button>
        </div>

        <p className="palette__meta">
          {runtime?.paletteReady
            ? `当前模型：${runtime.availableModels[0]}`
            : "未检测到可直接使用的本地模型，请先安装 Ollama 并拉取 Qwen。"}
        </p>

        <textarea
          className="palette__input"
          value={prompt}
          placeholder="比如：帮我把这段文案润色成更像短视频口播的语气"
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
          <article className="card palette__response">
            <div className="action-card__header">
              <h3>{response.model}</h3>
              <span>本地回答</span>
            </div>
            <pre className="console-output">{response.answer}</pre>
          </article>
        ) : null}
      </section>
    </div>
  );
}
