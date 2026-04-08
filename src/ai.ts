import type { AiAssessment, SystemSnapshot } from "./types";

export function getAiAssessment(snapshot: SystemSnapshot | null): AiAssessment {
  const vramMb = snapshot?.gpuMemoryMb ?? 0;
  const ramMb = snapshot?.memoryTotalMb ?? 0;

  if (vramMb >= 10_000 && ramMb >= 32_768) {
    return {
      tier: "本地 AI 强力档",
      headline: "这台机器可以比较轻松地跑 7B 级量化模型，适合日常高频使用。",
      models: ["Qwen 7B Q4_K_M", "Qwen 14B Q4（按需启动）"],
      runtime: "推荐：Ollama + 按需拉起",
      notes: [
        "优先把运行时装稳，再考虑更大的模型。",
        "重任务时配合性能模式，结束后及时切回平衡模式。",
      ],
    };
  }

  if (vramMb >= 7_000 && ramMb >= 24_576) {
    return {
      tier: "本地 AI 均衡档",
      headline: "7B 量化模型会是比较舒服的甜点区，速度和效果比较平衡。",
      models: ["Qwen 7B Q4_K_M", "Qwen 4B 常驻方案"],
      runtime: "推荐：Ollama + 轻量模型常驻",
      notes: [
        "适合写作润色、摘要和灵感整理。",
        "不建议默认常驻太重的模型，避免长期占用资源。",
      ],
    };
  }

  if (vramMb >= 4_000 && ramMb >= 16_384) {
    return {
      tier: "本地 AI 轻量档",
      headline: "先从 4B 或 1.8B 起步会更稳，体验也会更顺。",
      models: ["Qwen 4B 量化版", "Qwen 1.8B 低延迟版"],
      runtime: "推荐：Ollama + 空闲回收",
      notes: [
        "轻量模型更适合做全局悬浮问答。",
        "先确保电脑不被模型拖慢，再考虑加大规模。",
      ],
    };
  }

  return {
    tier: "本地 AI 入门档",
    headline: "建议从 0.5B 到 1.8B 开始，先把场景跑通。",
    models: ["Qwen 0.5B", "Qwen 1.8B"],
    runtime: "推荐：按需启动 + 及时释放资源",
    notes: [
      "适合偶尔问答、文案润色和灵感补全。",
      "本地 AI 不是越大越好，顺手更重要。",
    ],
  };
}
