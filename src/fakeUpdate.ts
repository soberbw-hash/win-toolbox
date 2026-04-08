import type { BossModeViewState } from "./types";

type Phase = {
  endMs: number;
  percentFrom: number;
  percentTo: number;
  stageTitle: string;
  stageHint: string;
  phaseLabel: string;
  instruction: string;
  isRebooting?: boolean;
};

const phases: Phase[] = [
  {
    endMs: 18_000,
    percentFrom: 0,
    percentTo: 32,
    stageTitle: "正在配置 Windows 更新",
    stageHint: "正在准备更新所需的系统组件",
    phaseLabel: "阶段 1 / 安装中",
    instruction: "请保持计算机打开。你的电脑可能会重启几次。",
  },
  {
    endMs: 48_000,
    percentFrom: 32,
    percentTo: 72,
    stageTitle: "正在安装系统功能",
    stageHint: "这一阶段通常会慢一点，这是正常现象",
    phaseLabel: "阶段 1 / 写入中",
    instruction: "请勿关闭电脑，也不要断开电源。",
  },
  {
    endMs: 78_000,
    percentFrom: 72,
    percentTo: 89,
    stageTitle: "正在处理更新",
    stageHint: "已经接近完成，但还需要一点时间",
    phaseLabel: "阶段 1 / 处理中",
    instruction: "系统正在完成最后的处理工作。",
  },
  {
    endMs: 90_000,
    percentFrom: 89,
    percentTo: 100,
    stageTitle: "正在完成第一阶段配置",
    stageHint: "即将进入重新启动",
    phaseLabel: "阶段 1 / 收尾",
    instruction: "正在进入重启前的最后准备。",
  },
  {
    endMs: 94_000,
    percentFrom: 100,
    percentTo: 100,
    stageTitle: "正在重新启动",
    stageHint: "请稍候",
    phaseLabel: "阶段切换",
    instruction: "系统正在重启以继续更新。",
    isRebooting: true,
  },
  {
    endMs: 116_000,
    percentFrom: 0,
    percentTo: 64,
    stageTitle: "正在清理配置",
    stageHint: "正在整理更新后的系统环境",
    phaseLabel: "阶段 2 / 清理中",
    instruction: "请保持计算机打开。",
  },
  {
    endMs: 132_000,
    percentFrom: 64,
    percentTo: 100,
    stageTitle: "正在完成更新",
    stageHint: "快好了，再等一会",
    phaseLabel: "阶段 2 / 即将完成",
    instruction: "更新已经接近完成。",
  },
];

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

export function getBossModeViewState(elapsedMs: number): BossModeViewState {
  const capped = Math.max(elapsedMs, 0);
  let previousEnd = 0;

  for (let index = 0; index < phases.length; index += 1) {
    const phase = phases[index];
    if (capped <= phase.endMs) {
      const duration = phase.endMs - previousEnd;
      const phaseElapsed = capped - previousEnd;
      const progress = duration <= 0 ? 1 : easeOutCubic(phaseElapsed / duration);
      const percent = Math.round(
        phase.percentFrom + (phase.percentTo - phase.percentFrom) * progress,
      );

      return {
        stageTitle: phase.stageTitle,
        stageHint: phase.stageHint,
        percent,
        phaseLabel: phase.phaseLabel,
        phaseIndex: index,
        isRebooting: Boolean(phase.isRebooting),
        instruction: phase.instruction,
      };
    }

    previousEnd = phase.endMs;
  }

  return {
    stageTitle: "正在等待恢复桌面",
    stageHint: "演示模式仍在保持中",
    percent: 100,
    phaseLabel: "阶段 2 / 已完成",
    phaseIndex: phases.length - 1,
    isRebooting: false,
    instruction: "请保持计算机打开。你的电脑可能会重启几次。",
  };
}
