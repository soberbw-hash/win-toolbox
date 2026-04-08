import { bossModeShortcut } from "../content";
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
          <p className="section-copy">字体、密度、截图保存目录和开机启动都在这里。</p>
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
            <p className="section-kicker">Boss Mode & Support</p>
            <h2>老板键与赞助</h2>
          </div>
        </div>

        <div className="split-grid split-grid--support">
          <article className="soft-card feature-card">
            <h3>老板键</h3>
            <p>快捷键是 {bossModeShortcut}。进入后按同样的快捷键，或按 Esc 就能退出。</p>
            <small>进入演示模式后，底部也会一直显示退出提示，不会再出现进去了退不出来。</small>
            <button className="ghost-button" type="button" onClick={onEnterBossMode}>
              立即进入
            </button>
          </article>

          <article className="soft-card support-card">
            <div>
              <h3>赞助支持</h3>
              <p>如果这个工具对你有帮助，欢迎扫码支持继续打磨。</p>
            </div>
            <img src="/donate-qr.png" alt="赞助收款码" className="support-card__qr" />
          </article>
        </div>
      </section>
    </div>
  );
}
