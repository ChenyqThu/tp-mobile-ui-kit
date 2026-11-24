import React, { useState } from 'react';
import { TPInput } from '../../core/components/TPInput';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPSectionNote } from '../../core/components/TPSectionNote';
import { TPSwitch } from '../../core/components/TPSwitch';
import {
  OmadaFormRepeaterBlock,
  type OmadaFormRepeaterItem,
} from '../blocks/OmadaFormRepeaterBlock';
import { OmadaStandardInput } from '../components/OmadaStandardInput';
import { OmadaConfigFormPage } from './OmadaConfigFormPage';
import '../../styles/tp-omada.css';

export interface OmadaLanNetworkConfig {
  name: string;
  vlanId: string;
  gatewaySubnet: string;
  dhcpEnabled: boolean;
  dhcpRange: string;
  dnsServers: OmadaFormRepeaterItem[];
}

export const DEFAULT_OMADA_LAN_CONFIG: OmadaLanNetworkConfig = {
  name: 'Corporate LAN',
  vlanId: '10',
  gatewaySubnet: '192.168.10.1/24',
  dhcpEnabled: true,
  dhcpRange: '192.168.10.100 - 192.168.10.220',
  dnsServers: [
    { id: 'dns-1', value: '1.1.1.1' },
    { id: 'dns-2', value: '8.8.8.8' },
  ],
};

export interface OmadaLanSettingsPageProps {
  initialConfig?: OmadaLanNetworkConfig;
  mode?: 'create' | 'edit';
  onSave?: (config: OmadaLanNetworkConfig) => void;
  onBack?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Legacy-Omada-aligned Wired LAN / VLAN Edit page combining `OmadaConfigFormPage`,
 * underline/form-field rows, structured CIDR & IP Range inputs, and DNS repeater.
 */
export const OmadaLanSettingsPage: React.FC<OmadaLanSettingsPageProps> = ({
  initialConfig = DEFAULT_OMADA_LAN_CONFIG,
  mode = 'edit',
  onSave,
  onBack,
  className = '',
  style,
}) => {
  const [config, setConfig] = useState<OmadaLanNetworkConfig>(initialConfig);
  const [dirty, setDirty] = useState(false);

  const patchConfig = (patch: Partial<OmadaLanNetworkConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  return (
    <OmadaConfigFormPage
      title={mode === 'create' ? 'Create LAN Network' : `Edit ${config.name}`}
      subtitle={`VLAN ${config.vlanId || '1'}`}
      mode={mode}
      dirty={dirty}
      onBack={onBack}
      onSave={() => {
        onSave?.(config);
        setDirty(false);
      }}
      className={className}
      style={style}
    >
      <div data-testid="omada-lan-settings-page" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TPSectionHeader title="Network Identity" />
        <TPListCard divided>
          <div style={{ padding: '10px 16px' }}>
            <TPInput
              variant="underline"
              label="Network Name"
              value={config.name}
              placeholder="e.g. Corporate LAN"
              maxLength={32}
              showCount
              onChange={(val) => patchConfig({ name: val })}
            />
          </div>
          <TPListItem
            layout="form-field"
            title="VLAN ID"
            value={config.vlanId || '1'}
            arrow
            onClick={() => patchConfig({ vlanId: config.vlanId === '10' ? '20' : '10' })}
          />
          <div style={{ padding: '10px 16px' }}>
            <OmadaStandardInput
              type="cidr"
              label="Gateway / Subnet"
              value={config.gatewaySubnet}
              onChange={(val) => patchConfig({ gatewaySubnet: val })}
            />
          </div>
        </TPListCard>

        <TPSectionHeader title="DHCP Server" />
        <TPListCard divided>
          <TPListItem
            title="Enable DHCP Server"
            subtitle="Automatically assign IP addresses to clients"
            trailing={
              <TPSwitch
                checked={config.dhcpEnabled}
                onChange={(checked) => patchConfig({ dhcpEnabled: checked })}
                ariaLabel="Enable DHCP Server"
              />
            }
          />
          {config.dhcpEnabled && (
            <div style={{ padding: '10px 16px' }}>
              <OmadaStandardInput
                type="ip-range"
                label="DHCP IP Range"
                value={config.dhcpRange}
                onChange={(val) => patchConfig({ dhcpRange: val })}
              />
            </div>
          )}
        </TPListCard>

        {config.dhcpEnabled && (
          <OmadaFormRepeaterBlock
            title="DNS Servers"
            items={config.dnsServers}
            valueLabel="DNS IP"
            valuePlaceholder="e.g. 9.9.9.9"
            addText="Add DNS"
            minItems={1}
            maxItems={4}
            onChange={(nextDns) => patchConfig({ dnsServers: nextDns })}
          />
        )}

        <TPSectionNote>
          Changes to VLAN ID or gateway subnet briefly renew client DHCP leases on affected switch ports.
        </TPSectionNote>
      </div>
    </OmadaConfigFormPage>
  );
};
