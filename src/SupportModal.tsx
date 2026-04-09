type SupportModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SupportModal({ open, onClose }: SupportModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="support-modal-backdrop" onClick={onClose}>
      <div className="support-modal" onClick={(event) => event.stopPropagation()}>
        <button className="support-modal__close" type="button" onClick={onClose}>
          关闭
        </button>
        <p className="section-kicker">Support</p>
        <h2>赞助支持</h2>
        <p>如果这个工具对你有帮助，欢迎扫码支持继续打磨。</p>
        <img src="/donate-qr.png" alt="赞助收款码" className="support-modal__qr" />
      </div>
    </div>
  );
}
