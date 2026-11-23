import React, { useState } from 'react';
import { TPHeader } from '../../core/components/TPHeader';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPTag } from '../../core/components/TPTag';
import { TPButton } from '../../core/components/TPButton';
import { TPSwitch } from '../../core/components/TPSwitch';
import { TPBottomSheet } from '../../core/components/TPBottomSheet';
import { TPIcon, TPMotion } from '../../assets-lib';
import { OmadaStandardInput } from '../components/OmadaStandardInput';
import '../../styles/tp-omada.css';

export type OmadaBandKey = '2.4G' | '5G' | '6G';
export type OmadaSecurityMode = 'WPA3-Personal' | 'WPA2/WPA3' | 'WPA2-Personal' | 'Open';

export interface OmadaWirelessConfig {
  ssid: string;
  enabled: boolean;
  bands: OmadaBandKey[];
  security: OmadaSecurityMode;
  vlanId: string;
  aclGatewayIp: string;
  aclMacAddress: string;
}

export interface OmadaWirelessNetworkBlockProps {
  initialConfig?: Partial<OmadaWirelessConfig>;
  showHeader?: boolean;
  onBack?: () => void;
  onSave?: (config: OmadaWirelessConfig) => void;
  className?: string;
  style?: React.CSSProperties;
}

const BANDS: readonly { key: OmadaBandKey; label: string }[] = [
  { key: '2.4G', label: '2.4 GHz' },
  { key: '5G', label: '5 GHz' },
  { key: '6G', label: '6 GHz' },
];

const SECURITY_OPTIONS: readonly OmadaSecurityMode[] = [
  'WPA3-Personal',
  'WPA2/WPA3',
  'WPA2-Personal',
  'Open',
];

/**
 * Reusable Omada v5.3+ Wireless Network (WLAN/SSID) configuration block with IP/MAC ACL and `deploy-config` PAG motion.
 */
export const OmadaWirelessNetworkBlock: React.FC<OmadaWirelessNetworkBlockProps> = ({
  initialConfig,
  showHeader = true,
  onBack,
  onSave,
  className = '',
  style,
}) => {
  const [ssid, setSsid] = useState(initialConfig?.ssid ?? 'Sara Banday');
  const [enabled, setEnabled] = useState(initialConfig?.enabled ?? true);
  const [bands, setBands] = useState<OmadaBandKey[]>(
    initialConfig?.bands ?? ['2.4G', '5G', '6G'],
  );
  const [security, setSecurity] = useState<OmadaSecurityMode>(
    initialConfig?.security ?? 'WPA3-Personal',
  );
  const [vlanId, setVlanId] = useState(initialConfig?.vlanId ?? '10');
  const [aclGatewayIp, setAclGatewayIp] = useState(initialConfig?.aclGatewayIp ?? '192.168.0.1');
  const [aclMacAddress, setAclMacAddress] = useState(
    initialConfig?.aclMacAddress ?? '8C-86-DD-A6-A7-5F',
  );
  const [deployOpen, setDeployOpen] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const toggleBand = (band: OmadaBandKey) => {
    setBands((prev) => {
      if (prev.includes(band)) {
        return prev.length > 1 ? prev.filter((b) => b !== band) : prev;
      }
      return [...prev, band];
    });
  };

  const handleSave = () => {
    const config: OmadaWirelessConfig = {
      ssid,
      enabled,
      bands,
      security,
      vlanId,
      aclGatewayIp,
      aclMacAddress,
    };
    setDeployed(false);
    setDeployOpen(true);
    onSave?.(config);
  };

  return (
    <div className={`tp-omada-screen ${className}`.trim()} style={style}>
      {showHeader && (
        <TPHeader
          variant="floating"
          title="Wireless Networks"
          subtitle="SSID & Access Control"
          left={
            onBack ? (
              <button
                type="button"
                className="tp-omada-glass-btn"
                onClick={onBack}
                aria-label="Back"
              >
                <TPIcon name="nav-back" size={20} />
              </button>
            ) : undefined
          }
        />
      )}

      <div className="tp-omada-scroll">
        <div className="tp-omada-body">
          <TPSectionHeader title="Basic Wireless Settings" />
          <TPListCard divided>
            <div style={{ padding: '12px 16px' }}>
              <OmadaStandardInput
                type="text"
                label="Network Name (SSID)"
                value={ssid}
                onChange={setSsid}
                placeholder="Enter SSID"
              />
            </div>

            <TPListItem
              leading={<TPIcon name="qa-ssid" size={22} />}
              title="Enable WLAN"
              subtitle={enabled ? 'Broadcasting on selected bands' : 'Disabled'}
              trailing={
                <TPSwitch
                  checked={enabled}
                  onChange={setEnabled}
                  ariaLabel="Enable Wireless Network"
                />
              }
            />

            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="tp-omada-std-input-label">Frequency Band</span>
              <div className="tp-omada-chip-group">
                {BANDS.map((band) => (
                  <TPTag
                    key={band.key}
                    selected={bands.includes(band.key)}
                    onClick={() => toggleBand(band.key)}
                  >
                    {band.label}
                  </TPTag>
                ))}
              </div>
            </div>

            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="tp-omada-std-input-label">Security</span>
              <div className="tp-omada-chip-group">
                {SECURITY_OPTIONS.map((mode) => (
                  <TPTag
                    key={mode}
                    selected={security === mode}
                    onClick={() => setSecurity(mode)}
                  >
                    {mode}
                  </TPTag>
                ))}
              </div>
            </div>

            <div style={{ padding: '12px 16px' }}>
              <OmadaStandardInput
                type="port"
                label="VLAN ID"
                value={vlanId}
                onChange={setVlanId}
                helperText="Valid IEEE 802.1Q VLAN ID (1–4094)"
              />
            </div>
          </TPListCard>

          <TPSectionHeader title="IP / MAC Access Control (ACL)" />
          <TPListCard divided>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <OmadaStandardInput
                type="ip"
                label="Allowed Gateway IP"
                value={aclGatewayIp}
                onChange={setAclGatewayIp}
              />
              <OmadaStandardInput
                type="mac"
                label="MAC Filter Allowlist"
                value={aclMacAddress}
                onChange={setAclMacAddress}
              />
            </div>
          </TPListCard>

          <div style={{ marginTop: 4 }}>
            <TPButton variant="primary" block onClick={handleSave}>
              Save &amp; Deploy Configuration
            </TPButton>
          </div>
        </div>
      </div>

      <TPBottomSheet
        open={deployOpen}
        title={deployed ? 'Configuration Applied' : 'Deploying Configuration'}
        subtitle={`SSID: ${ssid || 'Unnamed'} • ${bands.join(' / ')}`}
        onClose={() => setDeployOpen(false)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            padding: '8px 0 12px',
          }}
        >
          <TPMotion name="deploy-config" width={112} height={112} playing={!deployed} />
          <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--tp-text-secondary-alt)' }}>
            {deployed
              ? `Synced ${security} profile (VLAN ${vlanId || '1'}) to 2 EAP723 access points.`
              : `Pushing ${security} policy and ACL rules (${aclGatewayIp}) to site APs…`}
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            {!deployed ? (
              <TPButton variant="primary" block onClick={() => setDeployed(true)}>
                Confirm Provisioning
              </TPButton>
            ) : (
              <TPButton variant="secondary" block onClick={() => setDeployOpen(false)}>
                Done
              </TPButton>
            )}
          </div>
        </div>
      </TPBottomSheet>
    </div>
  );
};
