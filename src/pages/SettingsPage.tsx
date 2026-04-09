import { bossModeShortcut } from "../content";
import type {
  AppSettings,
  ComponentBusyState,
  ComponentManifest,
  ComponentOperation,
  ThirdPartyNotice,
} from "../types";

type SettingsPageProps = {
  settings: AppSettings;
  components: ComponentManifest[];
  notices: ThirdPartyNotice[];
  busyState: ComponentBusyState | null;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onEnterBossMode: () => void;
  onManageComponent: (componentId: string, operation: ComponentOperation) => void;
  onLaunchComponent: (componentId: string) => void;
  onOpenTarget: (target: string) => void;
  onOpenSupportModal: () => void;
};

export function SettingsPage({
  settings,
  components,
  notices,
  busyState,
  onUpdateSettings,
  onEnterBossMode,
  onManageComponent,
  onLaunchComponent,
  onOpenTarget,
  onOpenSupportModal,
}: SettingsPageProps) {
  const installedComponents = components.filter((item) => item.installed && item.kind !== "built-in");

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
            <p className="section-kicker">Components</p>
            <h2>已安装组件</h2>
          </div>
          <p className="section-copy">组件装好以后，打开、修复、日志和数据目录都在这里。</p>
        </div>

        {installedComponents.length === 0 ? (
          <div className="empty-state">还没有检测到已安装组件，去组件中心点一下就能开始安装。</div>
        ) : (
          <div className="settings-installed-grid">
            {installedComponents.map((item) => (
              <article key={item.id} className="soft-card installed-component-card">
                <div className="history-item__top">
                  <div>
                    <h3>{item.name}</h3>
                    <small>{item.version ? `版本 ${item.version}` : item.category}</small>
                  </div>
                  <span className="pill pill--success">{item.statusLabel}</span>
                </div>

                <p>{item.summary}</p>

                {busyState?.componentId === item.id ? (
                  <div className="component-progress">
                    <div className="component-progress__head">
                      <span>{busyState.stageLabel}</span>
                      <strong>{busyState.progress}%</strong>
                    </div>
                    <div className="component-progress__bar">
                      <span style={{ width: `${busyState.progress}%` }} />
                    </div>
                  </div>
                ) : null}

                <div className="button-row">
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={busyState?.componentId === item.id}
                    onClick={() => onLaunchComponent(item.id)}
                  >
                    打开
                  </button>

                  {item.supportsRepair ? (
                    <button
                      className="ghost-button"
                      type="button"
                      disabled={busyState?.componentId === item.id}
                      onClick={() => onManageComponent(item.id, "repair")}
                    >
                      修复
                    </button>
                  ) : null}

                  {item.supportsUninstall ? (
                    <button
                      className="ghost-button"
                      type="button"
                      disabled={busyState?.componentId === item.id}
                      onClick={() => onManageComponent(item.id, "uninstall")}
                    >
                      卸载
                    </button>
                  ) : null}
                </div>

                <div className="component-card__links">
                  {item.installDir ? (
                    <button
                      className="component-card__link"
                      type="button"
                      onClick={() => onOpenTarget(item.installDir!)}
                    >
                      数据目录
                    </button>
                  ) : null}
                  {item.logDir ? (
                    <button
                      className="component-card__link"
                      type="button"
                      onClick={() => onOpenTarget(item.logDir!)}
                    >
                      日志目录
                    </button>
                  ) : null}
                  {item.homepage ? (
                    <button
                      className="component-card__link"
                      type="button"
                      onClick={() => onOpenTarget(item.homepage!)}
                    >
                      官方主页
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Third Party</p>
            <h2>第三方组件说明</h2>
          </div>
          <p className="section-copy">版本、来源和许可证都在这里，方便直接核对。</p>
        </div>

        <div className="notice-grid">
          {notices.map((notice) => (
            <article key={notice.id} className="soft-card notice-card">
              <div className="history-item__top">
                <div>
                  <h3>{notice.name}</h3>
                  <small>{notice.version}</small>
                </div>
                <span className="pill pill--muted">{notice.licenseName}</span>
              </div>
              <p>{notice.notes}</p>
              <div className="component-card__links">
                <button
                  className="component-card__link"
                  type="button"
                  onClick={() => onOpenTarget(notice.sourceUrl)}
                >
                  来源
                </button>
                {notice.licenseUrl ? (
                  <button
                    className="component-card__link"
                    type="button"
                    onClick={() => onOpenTarget(notice.licenseUrl!)}
                  >
                    许可证
                  </button>
                ) : null}
              </div>
            </article>
          ))}
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
              <button className="ghost-button" type="button" onClick={onOpenSupportModal}>
                弹出赞助码
              </button>
            </div>
            <img src="/donate-qr.png" alt="赞助收款码" className="support-card__qr" />
          </article>
        </div>
      </section>
    </div>
  );
}
