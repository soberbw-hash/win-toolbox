import type { AppSettings } from "../types";

type SettingsPageProps = {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onEnterBossMode: () => void;
};

export function SettingsPage({
  settings,
  onUpdateSettings,
  onEnterBossMode,
}: SettingsPageProps) {
  return (
    <div className="page-stack">
      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Settings</p>
            <h2>外观与偏好</h2>
          </div>
          <p className="section-copy">优先使用鸿蒙字体链，并为不同分辨率保留可调节密度。</p>
        </div>

        <div className="settings-grid">
          <label className="setting-row soft-card">
            <span>字体</span>
            <select
              value={settings.fontPreset}
              onChange={(event) =>
                onUpdateSettings({ fontPreset: event.target.value as AppSettings["fontPreset"] })
              }
            >
              <option value="harmony">鸿蒙优先</option>
              <option value="system">系统字体</option>
            </select>
          </label>

          <label className="setting-row soft-card">
            <span>界面密度</span>
            <select
              value={settings.density}
              onChange={(event) =>
                onUpdateSettings({ density: event.target.value as AppSettings["density"] })
              }
            >
              <option value="auto">自动</option>
              <option value="compact">紧凑</option>
              <option value="standard">标准</option>
              <option value="comfortable">舒展</option>
            </select>
          </label>

          <label className="setting-row soft-card">
            <span>界面缩放</span>
            <select
              value={settings.scale}
              onChange={(event) =>
                onUpdateSettings({ scale: event.target.value as AppSettings["scale"] })
              }
            >
              <option value="auto">自动</option>
              <option value="compact">紧凑</option>
              <option value="standard">标准</option>
              <option value="relaxed">舒展</option>
            </select>
          </label>

          <label className="setting-row soft-card setting-row--toggle">
            <span>截图优先复制</span>
            <input
              type="checkbox"
              checked={settings.saveToClipboardFirst}
              onChange={(event) => onUpdateSettings({ saveToClipboardFirst: event.target.checked })}
            />
          </label>

          <label className="setting-row soft-card setting-row--toggle">
            <span>开机启动</span>
            <input
              type="checkbox"
              checked={settings.startOnBoot}
              onChange={(event) => onUpdateSettings({ startOnBoot: event.target.checked })}
            />
          </label>

          <label className="setting-row soft-card setting-row--full">
            <span>截图保存目录</span>
            <input
              type="text"
              value={settings.screenshotFolder}
              onChange={(event) => onUpdateSettings({ screenshotFolder: event.target.value })}
            />
          </label>
        </div>
      </section>

      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Advanced</p>
            <h2>隐藏入口</h2>
          </div>
        </div>

        <div className="split-grid">
          <article className="soft-card feature-card">
            <h3>老板键</h3>
            <p>保留为隐藏功能，不再作为主卖点放在首页。</p>
            <button className="ghost-button" type="button" onClick={onEnterBossMode}>
              进入演示遮罩
            </button>
          </article>

          <article className="soft-card feature-card">
            <h3>关于 V3</h3>
            <p>去创作者化、去插件化、去展示化，回到更克制的桌面产品形态。</p>
            <small>目标是更像正式产品，而不是一个功能堆叠的演示页。</small>
          </article>
        </div>
      </section>
    </div>
  );
}
