import React, { useState } from 'react';
import '@chenyqthu/tp-mobile-ui-kit/style.css';
import {
  TPButton,
  TPTag,
  TPThemeProvider,
  TPToastProvider,
  useTPTheme,
  useTPToast,
} from '@chenyqthu/tp-mobile-ui-kit/core';
import { TPIcon } from '@chenyqthu/tp-mobile-ui-kit/assets';
import { OmadaAppDemo, type OmadaAppScreenId } from '@chenyqthu/tp-mobile-ui-kit/omada';

const SCREEN_SHORTCUTS: readonly { key: OmadaAppScreenId; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'controllers', label: 'Controllers' },
  { key: 'devices', label: 'Devices' },
  { key: 'clients', label: 'Clients' },
  { key: 'insights', label: 'Insights' },
  { key: 'settings', label: 'Settings' },
  { key: 'launch', label: 'Launch' },
];

const OmadaDashboardStage: React.FC = () => {
  const [screen, setScreen] = useState<OmadaAppScreenId>('dashboard');
  const [device, setDevice] = useState<'iphone16pro' | 'android'>('iphone16pro');
  const { resolvedMode, setMode, setOS, tokens } = useTPTheme();
  const toast = useTPToast();

  const toggleTheme = () => {
    const next = resolvedMode === 'dark' ? 'light' : 'dark';
    setMode(next);
    toast.show({ type: 'info', message: `Switched to ${next} mode` });
  };

  const toggleDevice = () => {
    const nextDevice = device === 'iphone16pro' ? 'android' : 'iphone16pro';
    setDevice(nextDevice);
    setOS(nextDevice === 'android' ? 'android' : 'ios');
  };

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
        gap: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 760,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '12px 16px',
          borderRadius: 14,
          background: tokens.card,
          border: `1px solid ${tokens.listDivider}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TPIcon name="platform-omada" size={24} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Omada APP Mobile Prototype</div>
            <div style={{ fontSize: 12, color: tokens.textSecondary }}>
              Tap tabs, Topology, Site Health, or Toolkit FAB inside the phone
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <TPButton variant="secondary" size="sm" onClick={toggleDevice}>
            {device === 'iphone16pro' ? 'iPhone 16 Pro' : 'Android'}
          </TPButton>
          <TPButton variant="primary" size="sm" onClick={toggleTheme}>
            {resolvedMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </TPButton>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
        {SCREEN_SHORTCUTS.map((item) => (
          <TPTag
            key={item.key}
            selected={screen === item.key}
            onClick={() => setScreen(item.key)}
          >
            {item.label}
          </TPTag>
        ))}
      </div>

      <OmadaAppDemo
        screen={screen}
        onScreenChange={setScreen}
        device={device}
        showFrame
      />
    </div>
  );
};

export const OmadaDashboardTemplate: React.FC = () => (
  <TPThemeProvider defaultBrand="omada" defaultMode="light" defaultOS="ios">
    <TPToastProvider>
      <OmadaDashboardStage />
    </TPToastProvider>
  </TPThemeProvider>
);
