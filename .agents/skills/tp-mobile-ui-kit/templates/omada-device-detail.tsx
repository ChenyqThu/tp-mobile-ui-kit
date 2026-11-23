import React, { useState } from 'react';
import '@chenyqthu/tp-mobile-ui-kit/style.css';
import {
  TPButton,
  TPPhoneFrame,
  TPStatusBar,
  TPTag,
  TPThemeProvider,
  TPToastProvider,
  useTPTheme,
  useTPToast,
} from '@chenyqthu/tp-mobile-ui-kit/core';
import { TPIcon } from '@chenyqthu/tp-mobile-ui-kit/assets';
import {
  DEFAULT_OMADA_DEVICES,
  OmadaDeviceDetailPage,
  OmadaWirelessNetworkBlock,
} from '@chenyqthu/tp-mobile-ui-kit/omada';

const DeviceDetailStage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'device' | 'wireless'>('device');
  const [selectedIdx, setSelectedIdx] = useState(1);
  const { resolvedMode, setMode, tokens } = useTPTheme();
  const toast = useTPToast();

  const currentDevice = DEFAULT_OMADA_DEVICES[selectedIdx] ?? DEFAULT_OMADA_DEVICES[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: tokens.background,
        color: tokens.textPrimary,
        padding: '20px 16px 36px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 760,
          padding: '12px 16px',
          borderRadius: 14,
          background: tokens.card,
          border: `1px solid ${tokens.listDivider}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TPIcon name="platform-omada" size={24} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Device Detail &amp; Real PAG Motion</div>
            <div style={{ fontSize: 12, color: tokens.textSecondary }}>
              Inspect Ports (port-card-expand), Upgrade (update-network), or WLAN Provisioning (deploy-config)
            </div>
          </div>
        </div>

        <TPButton
          variant="secondary"
          size="sm"
          onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
        >
          {resolvedMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </TPButton>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        <TPTag
          selected={viewMode === 'device' && selectedIdx === 1}
          onClick={() => {
            setViewMode('device');
            setSelectedIdx(1);
          }}
        >
          EAP723 (AP + Upgrade)
        </TPTag>
        <TPTag
          selected={viewMode === 'device' && selectedIdx === 0}
          onClick={() => {
            setViewMode('device');
            setSelectedIdx(0);
          }}
        >
          ER7212PC (8-Port Gateway)
        </TPTag>
        <TPTag selected={viewMode === 'wireless'} onClick={() => setViewMode('wireless')}>
          WLAN &amp; ACL Block
        </TPTag>
      </div>

      <TPPhoneFrame device="iphone16pro" statusBar={<TPStatusBar time="10:51" muted />}>
        {viewMode === 'device' ? (
          <OmadaDeviceDetailPage
            key={currentDevice.id}
            device={currentDevice}
            onBack={() => toast.show({ type: 'info', message: 'Back to device list' })}
            onSaveConfig={(updated) =>
              toast.show({
                type: 'success',
                message: `Saved ${updated.name ?? updated.model} (${updated.ip})`,
              })
            }
          />
        ) : (
          <OmadaWirelessNetworkBlock
            onBack={() => setViewMode('device')}
            onSave={(cfg) =>
              toast.show({
                type: 'info',
                message: `Provisioning SSID "${cfg.ssid}" (${cfg.security})`,
              })
            }
          />
        )}
      </TPPhoneFrame>
    </div>
  );
};

export const OmadaDeviceDetailTemplate: React.FC = () => (
  <TPThemeProvider defaultBrand="omada" defaultMode="dark" defaultOS="ios">
    <TPToastProvider>
      <DeviceDetailStage />
    </TPToastProvider>
  </TPThemeProvider>
);
