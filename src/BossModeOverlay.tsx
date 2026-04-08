import type { BossModeViewState } from "./types";

type BossModeOverlayProps = {
  state: BossModeViewState;
  exitHint: string;
};

function LoadingDots() {
  return (
    <div className="boss-mode__dots" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} style={{ animationDelay: `${index * 120}ms` }} />
      ))}
    </div>
  );
}

export function BossModeOverlay({ state, exitHint }: BossModeOverlayProps) {
  if (state.isRebooting) {
    return <div className="boss-mode boss-mode--reboot" />;
  }

  return (
    <div className="boss-mode" onContextMenu={(event) => event.preventDefault()}>
      <div className="boss-mode__content">
        <LoadingDots />
        <h2>{state.stageTitle}</h2>
        <p className="boss-mode__percent">{state.percent}% 完成</p>
        <p className="boss-mode__hint">{state.stageHint}</p>
      </div>

      <div className="boss-mode__footer">
        <p>{state.instruction}</p>
        <small>{state.phaseLabel}</small>
        <div className="boss-mode__exit">{exitHint}</div>
      </div>
    </div>
  );
}
