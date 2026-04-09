const componentIconMap: Record<string, string> = {
  qclaw: "/component-icons/qclaw.png",
  "image-viewer": "/component-icons/honeyview.png",
  "capture-plus": "/component-icons/snipaste.ico",
  "everything-search": "/component-icons/everything.ico",
  "context-menu-manager": "/component-icons/context-menu-manager.ico",
  "archive-tools": "/component-icons/7zip.ico",
  "clash-verge-rev": "/component-icons/clash-verge.ico",
  "uninstall-plus": "/component-icons/bcuninstaller.png",
  "powertoys-suite": "/component-icons/powertoys.svg",
  "ollama-runtime": "/component-icons/ollama.png",
  "file-converter": "/component-icons/file-converter.svg",
  "koodo-reader": "/component-icons/koodo-reader.ico",
};

export function getComponentIconPath(componentId: string) {
  return componentIconMap[componentId] ?? null;
}
