import React, { useState } from 'react';
import type { TPPhoneFrameProps } from '../../core/types';
import { useTPTheme } from '../../theme/TPThemeProvider';
import { TPPhoneFrame } from '../../core/components/TPPhoneFrame';
import { TPStatusBar } from '../../core/components/TPStatusBar';
import { TPTabBar } from '../../core/components/TPTabBar';
import { TPBottomSheet } from '../../core/components/TPBottomSheet';
import { TPButton } from '../../core/components/TPButton';
import { TPLiquidGlass } from '../../core/components/TPLiquidGlass';
import { TPIcon, type TPIconName } from '../../assets-lib';
import {
  DEFAULT_OMADA_DEVICES,
  OMADA_SITE_TABS,
  type OmadaDeviceRecord,
  type OmadaSiteTabKey,
} from '../blocks/OmadaDeviceListBlock';
import { OmadaWirelessNetworkBlock } from '../blocks/OmadaWirelessNetworkBlock';
import { OmadaIncidentsBlock } from '../blocks/OmadaIncidentsBlock';
import { OmadaScheduleBlock } from '../blocks/OmadaScheduleBlock';
import { OmadaPortPanelBlock } from '../blocks/OmadaPortPanelBlock';
import { OmadaTopologyBlock } from '../blocks/OmadaTopologyBlock';
import { OmadaFirmwareUpdateBlock } from '../blocks/OmadaFirmwareUpdateBlock';
import { OmadaSiteListBlock } from '../blocks/OmadaSiteListBlock';
import { OmadaSidebarDrawer } from '../blocks/OmadaSidebarDrawer';
import { OmadaVoucherPreviewCard } from '../blocks/OmadaVoucherPreviewCard';
import { OmadaLaunchLoadingPage } from './OmadaLaunchLoadingPage';
import { OmadaControllerListPage } from './OmadaControllerListPage';
import { OmadaSiteDashboardPage } from './OmadaSiteDashboardPage';
import { OmadaSiteInsightsPage } from './OmadaSiteInsightsPage';
import { OmadaSiteDevicesPage } from './OmadaSiteDevicesPage';
import { OmadaSiteClientsPage } from './OmadaSiteClientsPage';
import { OmadaSiteSettingsPage } from './OmadaSiteSettingsPage';
import { OmadaHealthDetailPage } from './OmadaHealthDetailPage';
import { OmadaDeviceDetailPage } from './OmadaDeviceDetailPage';
import { OmadaLanSettingsPage } from './OmadaLanSettingsPage';
import { OmadaPortDetailPage } from './OmadaPortDetailPage';
import { OmadaAccessibilitySettingsPage } from './OmadaAccessibilitySettingsPage';
import { OmadaPrivacyPolicyPage } from './OmadaPrivacyPolicyPage';
import { OmadaConfigFormPage } from './OmadaConfigFormPage';
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
  | 'incidents'
  | 'schedule'
  | 'firmware'
  | 'topology'
  | 'port-panel'
  | 'sites'
  | 'lan-settings'
  | 'port-detail'
  | 'accessibility'
  | 'privacy'
  | 'voucher-preview';

export interface OmadaAppDemoProps {
  initialScreen?: OmadaAppScreenId;
  screen?: OmadaAppScreenId;
  onScreenChange?: (screen: OmadaAppScreenId) => void;
  device?: TPPhoneFrameProps['device'];
  showFrame?: boolean;
  initialDrawerOpen?: boolean;
  drawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
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
 * Interactive end-to-end Omada APP v5.3–6.3 prototype wiring all core screens,
 * OS-adaptive Liquid Glass (iOS) / Traditional (Android) chrome, sidebar drawer, and sub-pages inside `TPPhoneFrame`.
 */
export const OmadaAppDemo: React.FC<OmadaAppDemoProps> = ({
  initialScreen = 'dashboard',
  screen: controlledScreen,
  onScreenChange,
  device = 'iphone16pro',
  showFrame = true,
  initialDrawerOpen = false,
  drawerOpen: controlledDrawerOpen,
  onDrawerOpenChange,
  className = '',
  style,
}) => {
  const { os } = useTPTheme();
  const [uncontrolledScreen, setUncontrolledScreen] = useState<OmadaAppScreenId>(initialScreen);
  const currentScreen = controlledScreen ?? uncontrolledScreen;

  const [siteName, setSiteName] = useState('92');
  const [controllerName, setControllerName] = useState('62');
  const [selectedDevice, setSelectedDevice] = useState<OmadaDeviceRecord>(DEFAULT_OMADA_DEVICES[0]);
  const [unreadLogsCount, setUnreadLogsCount] = useState(1);
  const [previousScreen, setPreviousScreen] = useState<OmadaAppScreenId>('dashboard');
  const [toolkitOpen, setToolkitOpen] = useState(false);
  const [uncontrolledDrawerOpen, setUncontrolledDrawerOpen] = useState(initialDrawerOpen);
  const drawerOpen = controlledDrawerOpen ?? uncontrolledDrawerOpen;
  const setDrawerOpen = (next: boolean) => {
    if (controlledDrawerOpen === undefined) {
      setUncontrolledDrawerOpen(next);
    }
    onDrawerOpenChange?.(next);
  };
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
  const isAndroid = os === 'android';

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
            onOpenSchedule={() => navigate('schedule')}
            onOpenFirmware={() => navigate('firmware')}
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
      case 'schedule':
        return <OmadaScheduleBlock onBack={() => navigate('settings')} />;
      case 'firmware':
        return <OmadaFirmwareUpdateBlock onBack={() => navigate('settings')} />;
      case 'topology':
        return (
          <OmadaTopologyBlock
            siteName={siteName}
            showHeader
            onBack={() => navigate('dashboard')}
          />
        );
      case 'port-panel':
        return (
          <OmadaPortPanelBlock
            deviceModel="ER7212PC"
            showHeader
            onBack={() => navigate('devices')}
          />
        );
      case 'sites':
        return (
          <OmadaConfigFormPage
            title="Switch Site"
            subtitle={controllerName}
            mode="subpage"
            onBack={() => navigate('dashboard')}
          >
            <OmadaSiteListBlock
              onSelectSite={(site) => {
                setSiteName(site.name);
                navigate('dashboard');
              }}
            />
          </OmadaConfigFormPage>
        );
      case 'lan-settings':
        return <OmadaLanSettingsPage onBack={() => navigate('settings')} />;
      case 'port-detail':
        return <OmadaPortDetailPage onBack={() => navigate('port-panel')} />;
      case 'accessibility':
        return <OmadaAccessibilitySettingsPage onBack={() => navigate('settings')} />;
      case 'privacy':
        return (
          <OmadaPrivacyPolicyPage
            onAccept={() => navigate('dashboard')}
            onBack={() => navigate('settings')}
          />
        );
      case 'voucher-preview':
        return (
          <OmadaConfigFormPage
            title="Hotspot Vouchers"
            subtitle={`Site ${siteName}`}
            mode="subpage"
            onBack={() => navigate('settings')}
          >
            <OmadaVoucherPreviewCard
              code="OMD-8492-5109"
              status="valid"
              durationLabel="72 Hours"
              dataQuota="10 GB"
              bandwidthLimit="↓ 100 Mbps · ↑ 30 Mbps"
              notes="Lobby Reception"
            />
          </OmadaConfigFormPage>
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
        overlayTop
        overlayBottom={!isAndroid && hasBottomTabBar}
        className={className}
        style={style}
        statusBar={
          <TPStatusBar
            time="10:51"
            transparent
            muted={currentScreen !== 'controllers'}
            locationActive={currentScreen === 'controllers'}
          />
        }
        floatingAction={
          showToolkitFab ? (
            isAndroid ? (
              <button
                type="button"
                className="tp-omada-fab tp-omada-fab--android"
                aria-label="Network Toolkit"
                onClick={() => setToolkitOpen(true)}
              >
                <TPIcon name="settings-network-tools" size={22} color="#FFFFFF" />
              </button>
            ) : (
              <TPLiquidGlass
                as="button"
                shape="circle"
                tint="brand"
                interactive
                blur={1.8}
                className="tp-omada-fab"
                ariaLabel="Network Toolkit"
                onClick={() => setToolkitOpen(true)}
              >
                <TPIcon name="settings-network-tools" size={22} color="#FFFFFF" />
              </TPLiquidGlass>
            )
          ) : undefined
        }
        bottomBar={
          hasBottomTabBar ? (
            <TPTabBar
              variant="floating-pill"
              os={os}
              items={OMADA_SITE_TABS}
              activeKey={activeTabKey}
              onChange={(key) => navigate(key as OmadaAppScreenId)}
            />
          ) : undefined
        }
      >
        {renderScreen()}

        <OmadaSidebarDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          controllerName={controllerName}
          siteName={siteName}
          activeKey={currentScreen}
          onSwitchSite={() => navigate('sites')}
          onSelectItem={(key) => navigate(key as OmadaAppScreenId)}
        />
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
          <TPButton
            variant="secondary"
            size="md"
            block
            onClick={() => {
              setToolkitOpen(false);
              setDrawerOpen(true);
            }}
          >
            Open Workspace Drawer
          </TPButton>
        </div>
      </TPBottomSheet>
    </>
  );
};
