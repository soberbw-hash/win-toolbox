type DonatePanelProps = {
  charged: boolean;
  onCharge: () => void;
};

export function DonatePanel({ charged, onCharge }: DonatePanelProps) {
  return (
    <section className={`panel rail-panel donate-panel ${charged ? "donate-panel--charged" : ""}`}>
      <p className="eyebrow">160W 快充支援</p>
      <h2>给工具箱续一口电</h2>
      <p className="donate-panel__lead">
        扫码就像给这台系统工具箱打进一束高压电，把低电量小怪兽一击秒掉。
      </p>

      <div className="donate-panel__monster" aria-hidden="true">
        <span className="donate-panel__spark" />
        <span className="donate-panel__spark donate-panel__spark--alt" />
      </div>

      <img
        className="donate-panel__qr"
        src="/donate-qr.png"
        alt="Win Toolbox 打赏二维码"
      />

      <div className="button-row">
        <button className="primary-button" type="button" onClick={onCharge}>
          {charged ? "已充能，感谢支持" : "我已经赞赏了"}
        </button>
      </div>

      <p className="muted-copy">
        {charged
          ? "160W 快充已接入，感谢你让这个项目继续进化。"
          : "喜欢这个项目的话，可以请作者喝一杯高压电。"}
      </p>
    </section>
  );
}
