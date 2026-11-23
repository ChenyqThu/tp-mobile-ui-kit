import React, { useState } from 'react';
import type { TPPhoneFrameProps } from '../../core/types';
import { TPPhoneFrame } from '../../core/components/TPPhoneFrame';
import { TPStatusBar } from '../../core/components/TPStatusBar';
import { TPTabBar } from '../../core/components/TPTabBar';
import { TPBottomSheet } from '../../core/components/TPBottomSheet';
import { TPIcon, type TPIconName } from '../../assets-lib';
import {
  DEFAULT_OMADA_DEVICES,
  OMADA_SITE_TABS,
  type OmadaDeviceRecord,
  type OmadaSiteTabKey,
} from '../blocks/OmadaDeviceListBlock';
import { OmadaWirelessNetworkBlock } from '../blocks/OmadaWirelessNetworkBlock';
import { OmadaIncidentsBlock } from '../blocks/OmadaIncidentsBlock';
import { OmadaLaunchLoadingPage } from './OmadaLaunchLoadingPage';
import { OmadaControllerListPage } from './OmadaControllerListPage';
import { OmadaSiteDashboardPage } from './OmadaSiteDashboardPage';
import { OmadaSiteInsightsPage } from './OmadaSiteInsightsPage';
import { OmadaSiteDevicesPage } from './OmadaSiteDevicesPage';
import { OmadaSiteClientsPage } from './OmadaSiteClientsPage';
import { OmadaSiteSettingsPage } from './OmadaSiteSettingsPage';
import { OmadaHealthDetailPage } from './OmadaHealthDetailPage';
import { OmadaDeviceDetailPage } from './OmadaDeviceDetailPage';
import '../../styles/tp-omada.css';

export type OmadaAppScreenId =
  | 'launch'
  | 'controllers'
  | 'dashboard'
  | 'insights'
  | 'devices'
  | 'clients'
  | 'settings'
  | 'health-detail'
  | 'device-detail'
  | 'wireless-settings'
  | 'incidents';

export interface OmadaAppDemoProps {
  initialScreen?: OmadaAppScreenId;
  screen?: OmadaAppScreenId;
  onScreenChange?: (screen: OmadaAppScreenId) => void;
  device?: TPPhoneFrameProps['device'];
  showFrame?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SITE_TAB_SCREENS: readonly OmadaAppScreenId[] = [
  'launch',
  'dashboard',
  'insights',
  'devices',
  'clients',
  'settings',
];

const TOOLKIT_ITEMS: readonly { key: string; label: string; icon: TPIconName; summary: string }[] = [
  { key: 'speed', label: 'Speed Test', icon: 'tool-speed-test', summary: 'WAN3: 942 Mbps ↓ / 418 Mbps ↑' },
  { key: 'ping', label: 'Ping Test', icon: 'tool-ping-test', summary: '1.1.1.1 avg 3.2 ms • 0% loss' },
  { key: 'tracert', label: 'Traceroute', icon: 'tool-tracert', summary: '4 hops to edge POP (3.4 ms)' },
  { key: 'wifi-scan', label: 'Wi-Fi Scan', icon: 'tool-wi-fi-scan', summary: '5 GHz Ch 36 optimal (12% util)' },
  { key: 'roaming', label: 'Roaming Test', icon: 'tool-roaming-test', summary: '802.11k/v/r fast transition < 18 ms' },
  { key: 'iface', label: 'Port Detect', icon: 'tool-interface-detection', summary: 'ER7212PC WAN3 1000M Full' },
];

/**
 * Interactive end-to-end Omada APP v5.3–6.3 prototype wiring all 7 real-device screens
 * and drill-down sub-pages inside `TPPhoneFrame`.
 */
export const OmadaAppDemo: React.FC<OmadaAppDemoProps> = ({
  initialScreen = 'dashboard',
  screen: controlledScreen,
  onScreenChange,
  device = 'iphone16pro',
  showFrame = true,
  className = '',
  style,
}) => {
  const [uncontrolledScreen, setUncontrolledScreen] = useState<OmadaAppScreenId>(initialScreen);
  const currentScreen = controlledScreen ?? uncontrolledScreen;

  const [siteName, setSiteName] = useState('92');
  const [controllerName, setControllerName] = useState('62');
  const [selectedDevice, setSelectedDevice] = useState<OmadaDeviceRecord>(DEFAULT_OMADA_DEVICES[0]);
  const [unreadLogsCount, setUnreadLogsCount] = useState(1);
  const [previousScreen, setPreviousScreen] = useState<OmadaAppScreenId>('dashboard');
  const [toolkitOpen, setToolkitOpen] = useState(false);
  const [toolSummary, setToolSummary] = useState<string | null>(null);

  const navigate = (next: OmadaAppScreenId) => {
    setPreviousScreen(currentScreen);
    if (controlledScreen === undefined) {
      setUncontrolledScreen(next);
    }
    onScreenChange?.(next);
  };

  const hasBottomTabBar = SITE_TAB_SCREENS.includes(currentScreen);
  const activeTabKey: OmadaSiteTabKey =
    currentScreen === 'launch'
      ? 'dashboard'
      : (currentScreen as OmadaSiteTabKey);

  const showToolkitFab = currentScreen === 'launch' || currentScreen === 'dashboard';

  const renderScreen = () => {
    switch (currentScreen) {
      case 'launch':
        return (
          <OmadaLaunchLoadingPage
            siteName={siteName}
            controllerName={controllerName}
            showTabBar={false}
            showFloatingAction={false}
            onBackToGlobal={() => navigate('controllers')}
            onOpenLogs={() => navigate('incidents')}
            onUpgrade={() => navigate('dashboard')}
            onTabChange={(tab) => navigate(tab)}
          />
        );
      case 'controllers':
        return (
          <OmadaControllerListPage
            onSelectController={(ctrl) => {
              setControllerName(ctrl.name);
              navigate('dashboard');
            }}
          />
        );
      case 'dashboard':
        return (
          <OmadaSiteDashboardPage
            siteName={siteName}
            controllerName={controllerName}
            unreadLogsCount={unreadLogsCount}
            showTabBar={false}
            showFloatingAction={false}
            onSiteChange={setSiteName}
            onBackToGlobal={() => navigate('controllers')}
            onOpenLogs={() => navigate('incidents')}
            onOpenHealthDetail={() => navigate('health-detail')}
            onOpenInsights={() => navigate('insights')}
            onOpenDevices={() => navigate('devices')}
            onOpenClients={() => navigate('clients')}
          />
        );
      case 'insights':
        return <OmadaSiteInsightsPage showTabBar={false} />;
      case 'devices':
        return (
          <OmadaSiteDevicesPage
            showTabBar={false}
            onSelectDevice={(dev) => {
              setSelectedDevice(dev);
              navigate('device-detail');
            }}
          />
        );
      case 'clients':
        return <OmadaSiteClientsPage showTabBar={false} />;
      case 'settings':
        return (
          <OmadaSiteSettingsPage
            logsCount={unreadLogsCount}
            showTabBar={false}
            onOpenWirelessNetworks={() => navigate('wireless-settings')}
            onOpenLogs={() => navigate('incidents')}
          />
        );
      case 'health-detail':
        return (
          <OmadaHealthDetailPage
            siteName={siteName}
            onBack={() => navigate('dashboard')}
          />
        );
      case 'device-detail':
        return (
          <OmadaDeviceDetailPage
            device={selectedDevice}
            onBack={() => navigate('devices')}
          />
        );
      case 'wireless-settings':
        return <OmadaWirelessNetworkBlock onBack={() => navigate('settings')} />;
      case 'incidents':
        return (
          <OmadaIncidentsBlock
            onUnreadCountChange={setUnreadLogsCount}
            onBack={() =>
              navigate(previousScreen === 'settings' ? 'settings' : 'dashboard')
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <TPPhoneFrame
        device={device}
        showFrame={showFrame}
        className={className}
        style={style}
        statusBar={
          <TPStatusBar
            time="10:51"
            muted={currentScreen !== 'controllers'}
            locationActive={currentScreen === 'controllers'}
          />
        }
        floatingAction={
          showToolkitFab ? (
            <button
              type="button"
              className="tp-omada-fab"
              aria-label="Network Toolkit"
              onClick={() => setToolkitOpen(true)}
            >
              <TPIcon name="settings-network-tools" size={22} color="#FFFFFF" />
            </button>
          ) : undefined
        }
        bottomBar={
          hasBottomTabBar ? (
            <TPTabBar
              variant="floating-pill"
              items={OMADA_SITE_TABS}
              activeKey={activeTabKey}
              onChange={(key) => navigate(key as OmadaAppScreenId)}
            />
          ) : undefined
        }
      >
        {renderScreen()}
      </TPPhoneFrame>

      <TPBottomSheet
        open={toolkitOpen}
        title="Network Toolkit"
        subtitle={`Diagnostics for Site ${siteName}`}
        onClose={() => setToolkitOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="tp-omada-tool-grid">
            {TOOLKIT_ITEMS.map((tool) => (
              <button
                key={tool.key}
                type="button"
                className="tp-omada-tool-tile"
                onClick={() => setToolSummary(`${tool.label}: ${tool.summary}`)}
              >
                <TPIcon name={tool.icon} size={30} />
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
          {toolSummary && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--tp-focus-10)',
                color: 'var(--tp-focus)',
                fontSize: 13,
              }}
            >
              {toolSummary}
            </div>
          )}
        </div>
      </TPBottomSheet>
    </>
  );
};
