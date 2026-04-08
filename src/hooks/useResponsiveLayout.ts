import { useEffect, useState } from "react";

type LayoutTier = "large" | "desktop" | "compact" | "narrow";

function getTier(width: number): LayoutTier {
  if (width >= 1600) {
    return "large";
  }

  if (width >= 1280) {
    return "desktop";
  }

  if (width >= 1024) {
    return "compact";
  }

  return "narrow";
}

export function useResponsiveLayout() {
  const [layoutTier, setLayoutTier] = useState<LayoutTier>(() => getTier(window.innerWidth));

  useEffect(() => {
    const onResize = () => setLayoutTier(getTier(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return { layoutTier };
}
