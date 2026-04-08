import type { AiAssessment, SystemSnapshot } from "./types";

export function getAiAssessment(snapshot: SystemSnapshot | null): AiAssessment {
  const vramMb = snapshot?.gpuMemoryMb ?? 0;
  const ramMb = snapshot?.memoryTotalMb ?? 0;

  if (vramMb >= 10000 && ramMb >= 32768) {
    return {
      tier: "本地 AI 强机位",
      headline: "7B 到 14B 量化模型都有不错的操作空间。",
      models: ["Qwen 7B Q4_K_M", "Qwen 14B Q4（按需使用）"],
      runtime: "便携版 Ollama + 空闲自动休眠",
      notes: [
        "这类机器完全值得做本地大模型部署，而且能真正形成生产力。",
        "即使配置够强，也建议做显存占用回收和闲置进程清理。",
      ],
    };
  }

  if (vramMb >= 7000 && ramMb >= 24576) {
    return {
      tier: "本地 AI 均衡机位",
      headline: "7B 量化模型会是最舒服的甜点区。",
      models: ["Qwen 7B Q4_K_M", "Qwen 4B 轻负载常驻"],
      runtime: "Ollama 本地运行 + 显式启停控制",
      notes: [
        "这类机器特别适合做“一键部署 + 用完即走”的本地 AI 方案。",
        "默认用轻量模型，重模型不要默认常驻，这是体验上限的关键。",
      ],
    };
  }

  if (vramMb >= 4000 && ramMb >= 16384) {
    return {
      tier: "本地 AI 轻量机位",
      headline: "4B 和 1.8B 是最现实、也最稳妥的选择。",
      models: ["Qwen 4B 量化版", "Qwen 1.8B 低延迟方案"],
      runtime: "Ollama + 强制空闲回收",
      notes: [
        "机器依然可以跑本地 AI，但默认策略必须克制，不能一上来就贪大。",
        "把体验做顺，比参数表好看更重要。",
      ],
    };
  }

  return {
    tier: "本地 AI 入门机位",
    headline: "建议从 0.5B 到 1.8B 开始，先把场景跑通。",
    models: ["Qwen 0.5B", "Qwen 1.8B"],
    runtime: "便携运行时 + 激进资源释放",
    notes: [
      "这类机器更需要的是硬件评估和轻量策略，而不是盲目自动下载大模型。",
      "先保证电脑不卡，再谈本地 AI 的高级玩法。",
    ],
  };
}
