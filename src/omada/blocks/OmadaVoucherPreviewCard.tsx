import React, { useState } from 'react';
import { TPIconButton } from '../../core/components/TPIconButton';
import { TPTag } from '../../core/components/TPTag';
import { TPIcon } from '../../assets-lib';
import '../../styles/tp-omada.css';

export type OmadaVoucherStatus = 'valid' | 'in-use' | 'expired';

export interface OmadaVoucherPreviewCardProps {
  code: string;
  status?: OmadaVoucherStatus;
  durationLabel?: string;
  bandwidthLimit?: string;
  dataQuota?: string;
  validUntil?: string;
  concurrentDevices?: number;
  notes?: string;
  onCopy?: (code: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Printable & shareable Hotspot Voucher preview card showing access code, copy action,
 * rate limits, data cap, and expiration timestamp.
 */
export const OmadaVoucherPreviewCard: React.FC<OmadaVoucherPreviewCardProps> = ({
  code,
  status = 'valid',
  durationLabel = '24 Hours',
  bandwidthLimit = '↓ 50 Mbps · ↑ 20 Mbps',
  dataQuota = '5 GB',
  validUntil = '2026-12-31 23:59',
  concurrentDevices = 2,
  notes,
  onCopy,
  className = '',
  style,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    onCopy?.(code);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(code).catch(() => {});
    }
  };

  const statusTone =
    status === 'valid' ? 'success' : status === 'in-use' ? 'info' : 'alert';
  const statusText =
    status === 'valid' ? 'Valid' : status === 'in-use' ? 'In Use' : 'Expired';

  return (
    <section
      className={`tp-omada-card tp-omada-voucher-card ${className}`.trim()}
      data-testid="omada-voucher-preview-card"
      data-status={status}
      style={style}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <TPIcon name="keys" size={18} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Guest Hotspot Voucher</span>
        </div>
        <TPTag size="xs" shape="rect" tone={statusTone}>
          {statusText}
        </TPTag>
      </div>

      <div className="tp-omada-voucher-code-box">
        <span className="tp-omada-voucher-code">{code}</span>
        <TPIconButton
          size="sm"
          variant="tonal"
          ariaLabel={copied ? 'Voucher code copied' : 'Copy voucher code'}
          icon={<TPIcon name="copy" size={16} />}
          onClick={handleCopy}
        />
      </div>

      {copied && (
        <div style={{ fontSize: 12, color: 'var(--tp-focus)', fontWeight: 500 }}>
          Voucher code copied to clipboard
        </div>
      )}

      <div className="tp-omada-voucher-meta-grid">
        <div className="tp-omada-voucher-meta-cell">
          <span className="tp-omada-voucher-meta-label">Duration</span>
          <span className="tp-omada-voucher-meta-val">{durationLabel}</span>
        </div>
        <div className="tp-omada-voucher-meta-cell">
          <span className="tp-omada-voucher-meta-label">Data Quota</span>
          <span className="tp-omada-voucher-meta-val">{dataQuota}</span>
        </div>
        <div className="tp-omada-voucher-meta-cell">
          <span className="tp-omada-voucher-meta-label">Speed Limit</span>
          <span className="tp-omada-voucher-meta-val">{bandwidthLimit}</span>
        </div>
        <div className="tp-omada-voucher-meta-cell">
          <span className="tp-omada-voucher-meta-label">Max Clients</span>
          <span className="tp-omada-voucher-meta-val">{concurrentDevices} devices</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--tp-text-secondary-alt)' }}>
        <span>Expires: {validUntil}</span>
        {notes && <span>{notes}</span>}
      </div>
    </section>
  );
};
