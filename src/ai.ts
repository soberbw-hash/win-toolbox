import type { AiAssessment, SystemSnapshot } from "./types";

export function getAiAssessment(snapshot: SystemSnapshot | null): AiAssessment {
  const vramMb = snapshot?.gpuMemoryMb ?? 0;
  const ramMb = snapshot?.memoryTotalMb ?? 0;

  if (vramMb >= 10000 && ramMb >= 32768) {
    return {
      tier: "Strong local AI host",
      headline: "7B to 14B quantized models are realistic here.",
      models: ["Qwen 7B Q4_K_M", "Qwen 14B Q4 for selective workloads"],
      runtime: "Portable Ollama with model idle shutdown",
      notes: [
        "You have enough headroom for serious local assistant workflows.",
        "Still add process cleanup so idle AI does not eat VRAM forever.",
      ],
    };
  }

  if (vramMb >= 7000 && ramMb >= 24576) {
    return {
      tier: "Balanced local AI host",
      headline: "7B class quantized models should be the sweet spot.",
      models: ["Qwen 7B Q4_K_M", "Qwen 4B for lower power sessions"],
      runtime: "Ollama with explicit start and stop controls",
      notes: [
        "Great fit for a one-click local deploy MVP.",
        "Favor lightweight defaults and make larger models opt-in.",
      ],
    };
  }

  if (vramMb >= 4000 && ramMb >= 16384) {
    return {
      tier: "Lightweight local AI host",
      headline: "4B and 1.8B models are the practical default.",
      models: ["Qwen 4B quantized", "Qwen 1.8B for low-latency tasks"],
      runtime: "Ollama with strict idle shutdown",
      notes: [
        "Your machine can still run useful local AI if defaults stay disciplined.",
        "Avoid pretending that bigger models will feel smooth.",
      ],
    };
  }

  return {
    tier: "Entry local AI host",
    headline: "Start with 0.5B to 1.8B models or CPU-first experiments.",
    models: ["Qwen 0.5B", "Qwen 1.8B"],
    runtime: "Portable runtime with aggressive resource release",
    notes: [
      "Protect system responsiveness first and chase bigger models later.",
      "Hardware evaluation is more valuable than automatic downloads at this tier.",
    ],
  };
}
