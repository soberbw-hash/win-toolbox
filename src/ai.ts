import type { AiAssessment, SystemSnapshot } from "./types";

export function getAiAssessment(snapshot: SystemSnapshot | null): AiAssessment {
  const vramMb = snapshot?.gpuMemoryMb ?? 0;
  const ramMb = snapshot?.memoryTotalMb ?? 0;

  if (vramMb >= 10_000 && ramMb >= 32_768) {
    return {
      tier: "本地 AI 强力档",
      headline: "默认从 Qwen 3.5 4B 起步最稳，再按需要升级到 7B。",
      models: ["Qwen 3.5 4B", "Qwen 3.5 7B Q4_K_M"],
      runtime: "推荐：Ollama + Qwen 3.5 4B 常用，7B 按需启动",
      notes: [
        "先把 4B 跑顺，再考虑更大的模型。",
        "重任务时配合性能模式，结束后及时切回平衡模式。",
      ],
    };
  }

  if (vramMb >= 7_000 && ramMb >= 24_576) {
    return {
      tier: "本地 AI 均衡档",
      headline: "这台机器最适合默认上 Qwen 3.5 4B，速度和效果会比较平衡。",
      models: ["Qwen 3.5 4B", "Qwen 3.5 7B Q4_K_M"],
      runtime: "推荐：Ollama + Qwen 3.5 4B 默认常用",
      notes: [
        "适合写作润色、摘要和灵感整理。",
        "不建议默认常驻太重的模型，避免长期占用资源。",
      ],
    };
  }

  if (vramMb >= 4_000 && ramMb >= 16_384) {
    return {
      tier: "本地 AI 轻量档",
      headline: "默认推荐 Qwen 3.5 4B；如果你更看重响应速度，再退到 1.8B。",
      models: ["Qwen 3.5 4B", "Qwen 3.5 1.8B"],
      runtime: "推荐：Ollama + Qwen 3.5 4B",
      notes: [
        "轻量模型更适合做全局悬浮问答。",
        "先确保电脑不被模型拖慢，再考虑加大规模。",
      ],
    };
  }

  return {
    tier: "本地 AI 入门档",
    headline: "这类机器更建议先从 Qwen 3.5 1.8B 起步，确保体验顺手。",
    models: ["Qwen 3.5 1.8B", "Qwen 3.5 0.5B"],
    runtime: "推荐：按需启动 + 及时释放资源",
    notes: [
      "适合偶尔问答、文案润色和灵感补全。",
      "本地 AI 不是越大越好，顺手更重要。",
    ],
  };
}
