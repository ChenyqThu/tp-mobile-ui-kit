import React, { useState } from 'react';
import '@chenyqthu/tp-mobile-ui-kit/style.css';
import {
  TP_BRANDS,
  TPAlert,
  TPBadge,
  TPButton,
  TPHeader,
  TPListCard,
  TPListItem,
  TPPhoneFrame,
  TPSearchBar,
  TPSectionHeader,
  TPSegment,
  TPSlider,
  TPStatusBar,
  TPTabBar,
  TPTag,
  TPThemeProvider,
  TPToastProvider,
  useTPTheme,
  useTPToast,
  type TPBrand,
  type TPColorMode,
  type TPPlatformOS,
  type TPTabBarItem,
} from '@chenyqthu/tp-mobile-ui-kit/core';
import {
  TPBrandLogo,
  TPIcon,
  TPIllustration,
  type TPBrandLogoName,
} from '@chenyqthu/tp-mobile-ui-kit/assets';

const BRAND_LOGO_MAP: Record<TPBrand, TPBrandLogoName> = {
  omada: 'omada',
  tapo: 'tapo',
  tether: 'tether',
  mercusys: 'mercusys',
  deco: 'deco',
  ux: 'tp-link',
};

const TAB_ITEMS: readonly TPTabBarItem[] = [
  { key: 'controls', label: 'Controls', icon: 'tabbar-home-off', activeIcon: 'tabbar-home-on' },
  { key: 'lists', label: 'Devices', icon: 'tabbar-device-off', activeIcon: 'tabbar-device-on', badge: 2 },
  { key: 'assets', label: 'Assets', icon: 'tabbar-settings-off', activeIcon: 'tabbar-settings-on' },
];

const MultiBrandContent: React.FC = () => {
  const { brand, mode, resolvedMode, os, tokens, setBrand, setMode, setOS } = useTPTheme();
  const toast = useTPToast();

  const [activeTab, setActiveTab] = useState('controls');
  const [txPower, setTxPower] = useState(75);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [search, setSearch] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);

  const brandMeta = TP_BRANDS.find((b) => b.id === brand) ?? TP_BRANDS[0];

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
          maxWidth: 780,
          padding: '12px 16px',
          borderRadius: 14,
          background: tokens.card,
          border: `1px solid ${tokens.listDivider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TP_BRANDS.map((b) => (
              <TPTag key={b.id} selected={brand === b.id} onClick={() => setBrand(b.id)}>
                {b.label}
              </TPTag>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <TPSegment
              variant="pill"
              fullWidth={false}
              options={[
                { key: 'light', label: 'Light' },
                { key: 'dark', label: 'Dark' },
                { key: 'system', label: 'OS' },
              ]}
              value={mode}
              onChange={(v) => setMode(v as TPColorMode)}
            />
            <TPSegment
              variant="pill"
              fullWidth={false}
              options={[
                { key: 'ios', label: 'iOS' },
                { key: 'android', label: 'Android' },
              ]}
              value={os}
              onChange={(v) => setOS(v as TPPlatformOS)}
            />
          </div>
        </div>
        <div style={{ fontSize: 12, color: tokens.textSecondary }}>{brandMeta.description}</div>
      </div>

      <TPPhoneFrame
        device={os === 'android' ? 'android' : 'iphone16pro'}
        statusBar={
          <TPStatusBar time="10:51" os={os} signalStrength={4} wifiStrength={3} battery={94} />
        }
        bottomBar={
          <TPTabBar
            variant={os === 'ios' ? 'floating-pill' : 'docked'}
            items={TAB_ITEMS}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
        }
      >
        <TPHeader
          variant="standard"
          title={brandMeta.label}
          subtitle={`${resolvedMode.toUpperCase()} • ${os.toUpperCase()}`}
          rightBadge={2}
          right={
            <button
              type="button"
              className="tp-header-icon-btn"
              aria-label="Refresh tokens"
              onClick={() =>
                toast.show({ type: 'success', message: `${brandMeta.label} (${resolvedMode}) synced` })
              }
            >
              <TPIcon name="nav-refresh" size={18} />
            </button>
          }
        />

        <div style={{ padding: '12px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TPSegment
            variant="pill"
            options={[
              { key: 'controls', label: 'Controls' },
              { key: 'lists', label: 'Lists' },
              { key: 'assets', label: 'Assets' },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === 'controls' && (
            <>
              <TPListCard divided>
                <TPListItem
                  leading={<TPBrandLogo name={BRAND_LOGO_MAP[brand]} size={36} />}
                  title={`${brandMeta.label} Theme`}
                  subtitle={`Focus ${tokens.focus} • Btn radius ${tokens.radiusButton}px`}
                  trailing={
                    <TPBadge
                      count={tokens.buttonSecondaryStroke === 2 ? '2px' : 'Fill'}
                      tone="focus"
                    />
                  }
                />
                <TPListItem
                  title="Auto-Optimize Channel"
                  subtitle="Adapts switch track to brand focus color"
                  switchProps={{ checked: autoOptimize, onChange: setAutoOptimize }}
                />
              </TPListCard>

              <TPListCard padding="md">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <TPSlider
                    min={0}
                    max={100}
                    step={25}
                    value={txPower}
                    onChange={setTxPower}
                    showValue
                    unit="% Tx Power"
                    marks={[
                      { value: 0, label: 'Low' },
                      { value: 50, label: 'Mid' },
                      { value: 100, label: 'Max' },
                    ]}
                  />
                  <TPButton
                    variant="primary"
                    block
                    onClick={() =>
                      toast.show({
                        type: 'success',
                        message: `Applied ${brandMeta.label} config (${txPower}%)`,
                      })
                    }
                  >
                    Primary Action ({tokens.radiusButton}px)
                  </TPButton>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <TPButton variant="secondary" onClick={() => setAlertOpen(true)}>
                      Open Alert
                    </TPButton>
                    <TPButton
                      variant="tonal"
                      onClick={() => toast.show({ type: 'info', message: `OS style: ${os}` })}
                    >
                      Show Toast
                    </TPButton>
                  </div>
                </div>
              </TPListCard>
            </>
          )}

          {activeTab === 'lists' && (
            <>
              <TPSearchBar value={search} placeholder="Filter components..." onChange={setSearch} />
              <TPSectionHeader title="Connected Nodes" count={3} />
              <TPListCard divided>
                <TPListItem
                  leading={<TPIcon name="client-ap" size={32} />}
                  title="Living Room Node"
                  subtitle="192.168.0.2 • 5 GHz"
                  value="Online"
                  arrow
                />
                <TPListItem
                  leading={<TPIcon name="client-switch" size={32} />}
                  title="Core Switch"
                  subtitle="192.168.0.1 • PoE+"
                  badge={1}
                  arrow
                />
                <TPListItem
                  leading={<TPIcon name="client-macbook" size={32} />}
                  title="Workstation"
                  subtitle="192.168.0.13"
                  checked
                />
              </TPListCard>
            </>
          )}

          {activeTab === 'assets' && (
            <>
              <TPListCard padding="md">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <TPIllustration name="mlo-network" width={260} />
                  <div style={{ fontSize: 13, color: tokens.textSecondary, textAlign: 'center' }}>
                    Illustrations automatically follow Light / Dark theme mode
                  </div>
                </div>
              </TPListCard>
              <TPSectionHeader title="Brand Logos" count={6} />
              <TPListCard padding="md">
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-around',
                    gap: 12,
                  }}
                >
                  <TPBrandLogo name="omada" size={40} />
                  <TPBrandLogo name="tapo" size={40} />
                  <TPBrandLogo name="tether" size={40} />
                  <TPBrandLogo name="mercusys" size={40} />
                  <TPBrandLogo name="deco" size={40} />
                  <TPBrandLogo name="vigi" size={40} />
                </div>
              </TPListCard>
            </>
          )}
        </div>
      </TPPhoneFrame>

      <TPAlert
        open={alertOpen}
        os={os}
        title={`Reset ${brandMeta.label} Settings?`}
        message={`This ${os === 'ios' ? 'iOS frosted dialog' : 'Android Material dialog'} adapts automatically to TPThemeProvider.`}
        actions={[
          { label: 'Cancel', role: 'cancel' },
          {
            label: 'Reset',
            role: 'destructive',
            onClick: () => toast.show({ type: 'warning', message: 'Settings reset' }),
          },
        ]}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
};

export const MultiBrandTemplate: React.FC = () => (
  <TPThemeProvider defaultBrand="omada" defaultMode="light" defaultOS="ios">
    <TPToastProvider>
      <MultiBrandContent />
    </TPToastProvider>
  </TPThemeProvider>
);
