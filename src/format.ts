export function formatMemory(mb: number | null | undefined) {
  if (!mb) {
    return "未检测到";
  }

  const gb = mb / 1024;
  return gb >= 10 ? `${gb.toFixed(0)} GB` : `${gb.toFixed(1)} GB`;
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return index === 0
    ? `${Math.round(value)} ${units[index]}`
    : `${value.toFixed(1)} ${units[index]}`;
}

export function formatRelativeTime(iso: string | null | undefined) {
  if (!iso) {
    return "尚未刷新";
  }

  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.max(Math.round(diff / 1000), 0);

  if (seconds < 60) {
    return `${seconds} 秒前`;
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} 分钟前`;
  }

  return `${Math.round(minutes / 60)} 小时前`;
}

export function formatDuration(durationMs: number | null | undefined) {
  if (!durationMs) {
    return "瞬时完成";
  }

  return durationMs < 1000
    ? `${durationMs} ms`
    : `${(durationMs / 1000).toFixed(1)} s`;
}
