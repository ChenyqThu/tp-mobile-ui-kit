import React, { useState } from 'react';
import { TPHeader } from '../../core/components/TPHeader';
import { TPFixedToast } from '../../core/components/TPFixedToast';
import { TPStepText } from '../../core/components/TPStepText';
import { TPListCard } from '../../core/components/TPListCard';
import { TPCheckbox } from '../../core/components/TPCheckbox';
import { TPProgress } from '../../core/components/TPProgress';
import { TPButton } from '../../core/components/TPButton';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPIcon, TPMotion } from '../../assets-lib';
import '../../styles/tp-omada.css';

export interface OmadaFirmwareCandidate {
  id: string;
  model: string;
  mac: string;
  currentVersion: string;
  targetVersion: string;
}

export const DEFAULT_FIRMWARE_CANDIDATES: readonly OmadaFirmwareCandidate[] = [
  {
    id: 'fw-ap1',
    model: 'EAP723',
    mac: '3C-78-95-F0-45-F1',
    currentVersion: 'v1.2.0',
    targetVersion: 'v1.3.2',
  },
  {
    id: 'fw-ap2',
    model: 'EAP723',
    mac: '3C-78-95-F0-46-0C',
    currentVersion: 'v1.2.0',
    targetVersion: 'v1.3.2',
  },
];

export interface OmadaFirmwareUpdateBlockProps {
  candidates?: readonly OmadaFirmwareCandidate[];
  showHeader?: boolean;
  onBack?: () => void;
  onUpgradeStart?: (selectedIds: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Omada v5.3+ batch firmware update workflow block (`SMBNET-4894`) combining
 * `TPFixedToast`, `TPStepText`, `TPCheckbox`, `TPProgress`, and `update-network` PAG motion.
 */
export const OmadaFirmwareUpdateBlock: React.FC<OmadaFirmwareUpdateBlockProps> = ({
  candidates = DEFAULT_FIRMWARE_CANDIDATES,
  showHeader = true,
  onBack,
  onUpgradeStart,
  className = '',
  style,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => candidates.map((c) => c.id));
  const [upgradeState, setUpgradeState] = useState<'idle' | 'running' | 'done'>('idle');
  const [progress, setProgress] = useState(0);

  const toggleCandidate = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id),
    );
  };

  const handleStartUpgrade = () => {
    if (selectedIds.length === 0) return;
    setUpgradeState('running');
    setProgress(72);
    onUpgradeStart?.(selectedIds);
  };

  return (
    <div
      className={showHeader ? `tp-omada-screen ${className}`.trim() : className}
      data-testid="omada-firmware-update-block"
      style={style}
    >
      {showHeader && (
        <div className="tp-omada-header-wrap">
          <TPHeader
            variant="floating"
            title="Firmware Updates"
            subtitle={`${candidates.length} updates available`}
            left={
              onBack ? (
                <button
                  type="button"
                  className="tp-header-icon-btn"
                  aria-label="Back"
                  onClick={onBack}
                >
                  <TPIcon name="nav-back" size={20} />
                </button>
              ) : undefined
            }
          />
        </div>
      )}

      <div className={showHeader ? 'tp-omada-scroll' : undefined}>
        <div className={`tp-omada-body ${showHeader ? '' : 'tp-omada-body--no-header'}`.trim()}>
          <TPFixedToast
            status={upgradeState === 'done' ? 'success' : 'info'}
            message={
              upgradeState === 'done'
                ? 'Selected Access Points upgraded to v1.3.2.'
                : 'New signed EAP723 release v1.3.2 verified via Cloud.'
            }
          />

          <TPSectionHeader title="Release Highlights" />
          <section className="tp-omada-card">
            <TPStepText
              variant="bullet"
              items={[
                { text: 'Improves 6 GHz Multi-Link Operation (MLO) roaming latency by 32%.' },
                { text: 'Adds AFC power coordination and Loopback Detection telemetry.' },
              ]}
            />
          </section>

          <TPSectionHeader title="Eligible Devices" count={selectedIds.length} />
          <TPListCard divided padding="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {candidates.map((item) => (
                <TPCheckbox
                  key={item.id}
                  checked={selectedIds.includes(item.id)}
                  disabled={upgradeState === 'running'}
                  label={`${item.model} (${item.mac})`}
                  description={`${item.currentVersion} → ${item.targetVersion}`}
                  onChange={(checked) => toggleCandidate(item.id, checked)}
                />
              ))}
            </div>
          </TPListCard>

          {upgradeState !== 'idle' && (
            <section className="tp-omada-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <TPMotion
                  name="update-network"
                  width={56}
                  height={56}
                  playing={upgradeState === 'running'}
                />
                <div style={{ flex: 1 }}>
                  <TPProgress
                    percent={upgradeState === 'done' ? 100 : progress}
                    tone={upgradeState === 'done' ? 'success' : 'focus'}
                    label={upgradeState === 'done' ? 'Firmware Applied' : 'Downloading & Flashing…'}
                  />
                </div>
              </div>
              {upgradeState === 'running' && (
                <TPButton
                  variant="tonal"
                  size="sm"
                  onClick={() => {
                    setProgress(100);
                    setUpgradeState('done');
                  }}
                >
                  Complete Verification
                </TPButton>
              )}
            </section>
          )}

          <TPButton
            variant="primary"
            block
            disabled={selectedIds.length === 0 || upgradeState === 'done'}
            loading={upgradeState === 'running'}
            onClick={handleStartUpgrade}
          >
            {upgradeState === 'done'
              ? 'All Selected Devices Up to Date'
              : `Upgrade Selected (${selectedIds.length})`}
          </TPButton>
        </div>
      </div>
    </div>
  );
};
