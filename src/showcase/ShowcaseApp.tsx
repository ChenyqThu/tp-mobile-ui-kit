import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  TP_BRANDS,
  TP_THEME_PRESETS,
  TPThemeProvider,
  useTPTheme,
  type TPBrand,
  type TPPlatformOS,
  type TPResolvedMode,
} from '../theme';
import {
  TPBrandLogo,
  TPIcon,
  TPIllustration,
  TPMotion,
  TP_BRAND_LOGOS,
  TP_ICONS,
  TP_ILLUSTRATIONS,
  TP_MOTIONS,
  type TPBrandLogoName,
  type TPIconName,
  type TPIllustrationName,
  type TPMotionName,
} from '../assets-lib';
import {
  TPActionSheet,
  TPAlert,
  TPAvatar,
  TPBadge,
  TPBottomSheet,
  TPButton,
  TPCheckboxGroup,
  TPDatePicker,
  TPDaySwitcher,
  TPDivider,
  TPEmptyState,
  TPFixedButtonBar,
  TPFixedToast,
  TPHeader,
  TPIconButton,
  TPIconButtonGroup,
  TPInput,
  TPKeyboard,
  TPLast7DaysPicker,
  TPLiquidGlass,
  TPListButton,
  TPListCard,
  TPListItem,
  TPMenu,
  TPMonthPicker,
  TPPageControl,
  TPPhoneFrame,
  TPPinInput,
  TPPopup,
  TPProgress,
  TPPrompt,
  TPRadioGroup,
  TPSearchBar,
  TPSectionHeader,
  TPSectionNote,
  TPSegment,
  TPSkeleton,
  TPSlider,
  TPStatusBar,
  TPStepText,
  TPStepper,
  TPSwipeRow,
  TPSwitch,
  TPTabBar,
  TPTag,
  TPText,
  TPTimePicker,
  TPToastProvider,
  TPTooltip,
  TPWheelPicker,
  useTPToast,
  type TPDayKey,
  type TPMenuItem,
  type TPMonthPickerValue,
  type TPPhoneFrameProps,
  type TPSegmentOption,
  type TPTabBarItem,
  type TPToastType,
  type TPWheelPickerColumn,
} from '../core';
import {
  OmadaAppDemo,
  OmadaStandardInput,
  type OmadaAppScreenId,
} from '../omada';

type StudioTabId = 'omada-app' | 'theme-lab' | 'core-kit' | 'assets-motion' | 'agent-skill';
type CoreCategoryId = 'all' | 'nav-controls' | 'display-lists' | 'inputs-pickers' | 'overlays-feedback';
type AssetsSubTabId = 'motions' | 'omada-icons' | 'general-icons' | 'illustrations' | 'logos';

interface OmadaScreenMeta {
  id: OmadaAppScreenId;
  label: string;
  badge: string;
  group: 'screenshot' | 'drilldown';
  description: string;
  components: readonly string[];
}

const OMADA_SCREEN_META: readonly OmadaScreenMeta[] = [
  {
    id: 'launch',
    label: 'Launch Loading',
    badge: 'launchloading.png',
    group: 'screenshot',
    description:
      'Floating glass site header (92 / 62), dismissible V2.5.2 upgrade banner, 3 animated shimmer skeleton dashboard cards, Toolkit FAB, and floating pill TabBar.',
    components: ['TPHeader variant="floating"', 'TPPrompt tone="info"', 'TPTabBar variant="floating-pill"', 'TPIcon (nav-*)'],
  },
  {
    id: 'controllers',
    label: 'Controller List',
    badge: 'controllerlist.png',
    group: 'screenshot',
    description:
      'Global cloud & local controller directory with "All Systems" dropdown menu, live search bar, and all 5 real-device controller rows.',
    components: ['TPHeader + TPMenu', 'TPSearchBar', 'TPSectionHeader', 'TPListCard + TPListItem', 'OmadaStandardInput (ip)'],
  },
  {
    id: 'dashboard',
    label: 'Site Dashboard',
    badge: 'siteDashboard.png',
    group: 'screenshot',
    description:
      '4-column Gateway/Switch/AP/Client KPI tiles, interactive Topology sheet, Site Health Score (100) scrubber, ISP Activity, Internet Activity chart, and Network Toolkit FAB.',
    components: ['TPHeader (rightBadge=1)', 'TPBottomSheet', 'TPIcon (dashboard-*)', 'TPTabBar variant="floating-pill"'],
  },
  {
    id: 'insights',
    label: 'Site Insights',
    badge: 'SiteInsights.png',
    group: 'screenshot',
    description:
      'Telemetry workbench with calendar date-range menu, 4 underline tabs (Wired/Wireless/Client/Apps), ISP Load dual-axis chart, WAN Health Trend, and Gateway Utilization.',
    components: ['TPHeader + TPMenu', 'TPSegment variant="underline"', 'TPIcon (nav-calendar)', 'TPTabBar variant="floating-pill"'],
  },
  {
    id: 'devices',
    label: 'Site Devices',
    badge: 'SiteDevices.png',
    group: 'screenshot',
    description:
      'Floating Devices header (+ | more capsule), live search, Device List / Group toggle, expandable TPTag filters, ER7212PC + 2x EAP723 rows, and Adopt MAC sheet.',
    components: ['TPHeader capsule', 'TPSegment', 'TPTag', 'OmadaDeviceListBlock', 'OmadaStandardInput (mac)'],
  },
  {
    id: 'clients',
    label: 'Site Clients',
    badge: 'SiteClients.png',
    group: 'screenshot',
    description:
      'Online / Offline / Blocked / All client segmentation, Wired & Wireless tag chips, real client rows with dBm RSSI status, and client block/unblock action sheet.',
    components: ['TPSearchBar', 'TPSegment', 'TPTag', 'TPListItem', 'TPEmptyState (no-clients)'],
  },
  {
    id: 'settings',
    label: 'Site Settings',
    badge: 'SiteSettings.png',
    group: 'screenshot',
    description:
      '4 grouped TPListCards with 11 authentic Omada settings icons, live search filtering, unread Logs badge, and drill-downs to Wireless Networks & Logs.',
    components: ['TPHeader variant="floating"', 'TPSearchBar', 'TPListCard + TPListItem', 'TPIcon (settings-*)', 'TPEmptyState (no-search)'],
  },
  {
    id: 'health-detail',
    label: 'Health Detail',
    badge: 'V5.3 Drill-down',
    group: 'drilldown',
    description:
      'Radial Site Health Score (100) gauge, Device / Wi-Fi / WAN subsystem scorecards, 24-hour health trend waveform, and diagnostic check rows.',
    components: ['TPHeader (nav-back)', 'TPSectionHeader', 'TPListCard + TPListItem', 'TPIcon (status-success-solid)'],
  },
  {
    id: 'device-detail',
    label: 'Device Detail',
    badge: 'V5.3 Drill-down',
    group: 'drilldown',
    description:
      'Overview telemetry + firmware upgrade sheet ("update-network" PAG), interactive Ports matrix ("port-card-expand" PAG), and Config form with segmented inputs.',
    components: ['TPSegment', 'TPMotion (port-card-expand, update-network)', 'OmadaStandardInput (ip/mac/port)', 'TPSwitch'],
  },
  {
    id: 'wireless-settings',
    label: 'Wireless Config',
    badge: 'wireless-config',
    group: 'drilldown',
    description:
      'OmadaWirelessNetworkBlock featuring SSID input, 2.4G/5G/6G band & WPA3 security chips, VLAN ID validation, IP/MAC ACL inputs, and "deploy-config" PAG sheet.',
    components: ['OmadaWirelessNetworkBlock', 'OmadaStandardInput', 'TPTag', 'TPSwitch', 'TPMotion (deploy-config)'],
  },
  {
    id: 'incidents',
    label: 'Logs & Incidents',
    badge: 'V5.3 Block',
    group: 'drilldown',
    description:
      'OmadaIncidentsBlock with category filter pills (All/Alerts/Device/Client/Operation), Mark All Read state sync back to Dashboard/Settings badges, and unread dots.',
    components: ['OmadaIncidentsBlock', 'TPTag', 'TPSectionHeader', 'TPListItem', 'TPIcon (log-*, status-*)'],
  },
  {
    id: 'topology',
    label: 'Network Topology',
    badge: 'V5.3 Block',
    group: 'drilldown',
    description:
      'Interactive OmadaTopologyBlock showing WAN3 uplink, Loop Protection, ER7212PC gateway, 2.5G PoE+ downlinks, and selectable node telemetry.',
    components: ['OmadaTopologyBlock', 'TPTag', 'TPListCard', 'TPListItem', 'TPIcon'],
  },
  {
    id: 'port-panel',
    label: 'Hardware Port Panel',
    badge: 'V5.3 Block',
    group: 'drilldown',
    description:
      'Interactive OmadaPortPanelBlock faceplate matrix with RJ45/SFP+ link status LEDs, PoE wattage badges, VLAN assignment chips, and port-card-expand PAG motion.',
    components: ['OmadaPortPanelBlock', 'TPSwitch', 'TPTag', 'TPMotion (port-card-expand)'],
  },
  {
    id: 'schedule',
    label: 'Site Schedules',
    badge: 'V5.3 Block',
    group: 'drilldown',
    description:
      'OmadaScheduleBlock (SMBNET-3501) managing Wi-Fi, PoE, and Reboot policies with TPDaySwitcher, TPTimePicker bottom sheet, and live rule creation.',
    components: ['OmadaScheduleBlock', 'TPSwitch', 'TPDaySwitcher', 'TPTimePicker', 'TPBottomSheet'],
  },
  {
    id: 'firmware',
    label: 'Firmware Center',
    badge: 'V5.3 Block',
    group: 'drilldown',
    description:
      'OmadaFirmwareUpdateBlock (SMBNET-4894) combining TPFixedToast release notes, TPStepText changelog, TPCheckbox targets, TPProgress, and update-network PAG motion.',
    components: ['OmadaFirmwareUpdateBlock', 'TPFixedToast', 'TPStepText', 'TPCheckbox', 'TPProgress', 'TPMotion'],
  },
];

const BRAND_LOGO_MAP: Record<TPBrand, TPBrandLogoName> = {
  omada: 'omada',
  tapo: 'tapo',
  tether: 'tether',
  mercusys: 'mercusys',
  deco: 'deco',
  ux: 'tp-link',
};

const CORE_CATEGORIES: readonly { id: CoreCategoryId; label: string; countLabel: string }[] = [
  { id: 'all', label: 'All Components', countLabel: '38+' },
  { id: 'nav-controls', label: 'Nav & Liquid Glass', countLabel: '11' },
  { id: 'display-lists', label: 'Lists & Display', countLabel: '12' },
  { id: 'inputs-pickers', label: 'Inputs & Pickers', countLabel: '11' },
  { id: 'overlays-feedback', label: 'Overlays & Feedback', countLabel: '9' },
];

const CORE_TAB_ITEMS: readonly TPTabBarItem[] = [
  { key: 'home', label: 'Dashboard', icon: 'tabbar-dashboard-off', activeIcon: 'tabbar-dashboard-on' },
  { key: 'devices', label: 'Devices', icon: 'tabbar-device-off', activeIcon: 'tabbar-device-on', badge: 2 },
  { key: 'clients', label: 'Clients', icon: 'tabbar-client-off', activeIcon: 'tabbar-client-on', badge: true },
  { key: 'settings', label: 'Settings', icon: 'tabbar-settings-off', activeIcon: 'tabbar-settings-on' },
];

function copyTextWithToast(snippet: string, showToast: (msg: string) => void) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(snippet).catch(() => {});
  }
  showToast(`Copied: ${snippet}`);
}

const ThemeLabTab: React.FC<{ onApplyBrand?: (brand: TPBrand, mode: TPResolvedMode, os: TPPlatformOS) => void }> = ({
  onApplyBrand,
}) => {
  const [labMode, setLabMode] = useState<TPResolvedMode>('light');
  const [labOS, setLabOS] = useState<TPPlatformOS>('ios');
  const [switchStates, setSwitchStates] = useState<Record<TPBrand, boolean>>({
    omada: true,
    tapo: true,
    tether: false,
    mercusys: true,
    deco: true,
    ux: false,
  });
  const [sliderValues, setSliderValues] = useState<Record<TPBrand, number>>({
    omada: 75,
    tapo: 50,
    tether: 65,
    mercusys: 80,
    deco: 45,
    ux: 60,
  });

  const sliderMarks = useMemo(
    () => [
      { value: 0, label: '0%' },
      { value: 50, label: '50%' },
      { value: 100, label: '100%' },
    ],
    [],
  );

  return (
    <div>
      <div className="studio-toolbar">
        <div className="studio-toolbar-left">
          <h2 className="studio-toolbar-title">6-Brand × 2-Mode Theme Lab (12 Presets)</h2>
          <div className="studio-toolbar-sub">
            Live scoped <code>TPThemeProvider</code> comparison showing corner radius (10px vs 24px), secondary button
            stroke (2px outlined vs 0px tinted), slider stroke, and typography tokens side by side.
          </div>
        </div>
        <div className="studio-toolbar-controls">
          <div className="studio-segmented" role="group" aria-label="Theme Lab Color Mode">
            <button
              type="button"
              className={`studio-seg-btn ${labMode === 'light' ? 'studio-seg-btn--active' : ''}`}
              onClick={() => setLabMode('light')}
            >
              Light Mode
            </button>
            <button
              type="button"
              className={`studio-seg-btn ${labMode === 'dark' ? 'studio-seg-btn--active' : ''}`}
              onClick={() => setLabMode('dark')}
            >
              Dark Mode
            </button>
          </div>
          <div className="studio-segmented" role="group" aria-label="Theme Lab Platform OS">
            <button
              type="button"
              className={`studio-seg-btn ${labOS === 'ios' ? 'studio-seg-btn--active' : ''}`}
              onClick={() => setLabOS('ios')}
            >
              iOS
            </button>
            <button
              type="button"
              className={`studio-seg-btn ${labOS === 'android' ? 'studio-seg-btn--active' : ''}`}
              onClick={() => setLabOS('android')}
            >
              Android
            </button>
          </div>
        </div>
      </div>

      <div className="studio-brand-grid">
        {TP_BRANDS.map((b) => {
          const preset = TP_THEME_PRESETS[b.id][labMode];
          const isChecked = switchStates[b.id];
          const sliderVal = sliderValues[b.id];

          return (
            <div key={b.id} className="studio-brand-card-outer">
              <TPThemeProvider scoped brand={b.id} mode={labMode} os={labOS}>
                <div className="studio-brand-surface">
                  <div className="studio-brand-card-head">
                    <div className="studio-brand-card-id">
                      <TPBrandLogo name={BRAND_LOGO_MAP[b.id]} size={34} />
                      <div>
                        <div className="studio-brand-card-name">{b.label}</div>
                        <div className="studio-brand-card-mode">
                          {preset.figmaMode} • {labOS.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    {onApplyBrand && (
                      <TPButton
                        variant="in-card"
                        size="sm"
                        onClick={() => onApplyBrand(b.id, labMode, labOS)}
                      >
                        Use in APP
                      </TPButton>
                    )}
                  </div>

                  <div className="studio-spec-row">
                    <span className="studio-spec-badge">Btn {preset.radiusButton}px</span>
                    <span className="studio-spec-badge">Card {preset.radiusCard}px</span>
                    <span className="studio-spec-badge">
                      2nd Stroke {preset.buttonSecondaryStroke}px
                    </span>
                    <span className="studio-spec-badge">Slider {preset.sliderStroke}px</span>
                    <span className="studio-spec-badge">{preset.focus}</span>
                  </div>

                  <div className="studio-brand-btn-row">
                    <TPButton variant="primary" size="md" block>
                      Primary
                    </TPButton>
                    <TPButton variant="secondary" size="md" block>
                      Secondary
                    </TPButton>
                  </div>

                  <div className="studio-brand-control-strip">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Auto Optimization</span>
                      <span style={{ fontSize: 11, color: 'var(--tp-text-secondary)' }}>
                        {isChecked ? 'Enabled' : 'Disabled'} • {preset.fontSizeMain}px base
                      </span>
                    </div>
                    <TPSwitch
                      checked={isChecked}
                      ariaLabel={`${b.label} Auto Optimization`}
                      onChange={(next) =>
                        setSwitchStates((prev) => ({ ...prev, [b.id]: next }))
                      }
                    />
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--tp-radius-card)',
                      background: 'var(--tp-bg-card)',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>
                      Tx Power Level
                    </div>
                    <TPSlider
                      value={sliderVal}
                      min={0}
                      max={100}
                      step={5}
                      marks={sliderMarks}
                      showValue
                      unit="%"
                      ariaLabel={`${b.label} Tx Power`}
                      onChange={(val) =>
                        setSliderValues((prev) => ({ ...prev, [b.id]: val }))
                      }
                    />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <TPTag selected tone="focus" size="sm">
                      {b.label} Active
                    </TPTag>
                    <TPTag tone="neutral" size="sm">
                      Wi-Fi 7
                    </TPTag>
                    <TPTag tone="success" size="sm">
                      Online
                    </TPTag>
                    <TPTag tone="warning" size="sm">
                      {preset.buttonSecondaryStroke === 2 ? 'Outlined 2px' : 'Filled 0px'}
                    </TPTag>
                  </div>

                  <TPListCard divided>
                    <TPListItem
                      leading={<TPIcon name="settings-wireless-settings" size={20} />}
                      title="Wireless Network"
                      subtitle={`${b.label}_5GHz • WPA3`}
                      value="Active"
                      arrow
                    />
                    <TPListItem
                      leading={<TPIcon name="settings-network-security" size={20} />}
                      title="Security Shield"
                      badge={2}
                      arrow
                    />
                  </TPListCard>
                </div>
              </TPThemeProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CoreKitTab: React.FC<{
  phoneDevice: NonNullable<TPPhoneFrameProps['device']>;
  onPhoneDeviceChange: (d: NonNullable<TPPhoneFrameProps['device']>) => void;
}> = ({ phoneDevice, onPhoneDeviceChange }) => {
  const { brand, mode, resolvedMode, os, tokens, setBrand, setMode, setOS } = useTPTheme();
  const toast = useTPToast();

  const [category, setCategory] = useState<CoreCategoryId>('all');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = previewRef.current?.closest('.tp-phone-body');
    if (body) {
      body.scrollTop = 0;
    }
  }, [category]);

  // Navigation & Controls state
  const [headerVariant, setHeaderVariant] = useState<'standard' | 'floating'>('floating');
  const [btnVariant, setBtnVariant] = useState<
    'primary' | 'secondary' | 'text' | 'alert' | 'tonal' | 'in-card'
  >('primary');
  const [btnSize, setBtnSize] = useState<'lg' | 'md' | 'sm'>('md');
  const [btnLoading, setBtnLoading] = useState(false);
  const [fixedLayout, setFixedLayout] = useState<'single' | 'dual-horizontal' | 'dual-vertical'>(
    'dual-horizontal',
  );
  const [switchOn, setSwitchOn] = useState(true);
  const [sliderVal, setSliderVal] = useState(60);
  const [rangeVal, setRangeVal] = useState<[number, number]>([20, 75]);
  const [segVariant, setSegVariant] = useState<'pill' | 'underline'>('pill');
  const [segVal, setSegVal] = useState('5g');
  const [pageIdx, setPageIdx] = useState(1);
  const [tabVariant, setTabVariant] = useState<'floating-pill' | 'docked'>('floating-pill');
  const [showTabExtra, setShowTabExtra] = useState(true);
  const [activeTabKey, setActiveTabKey] = useState('home');
  const [opticalRefraction, setOpticalRefraction] = useState(true);

  // Display & Lists state
  const [listSwitch, setListSwitch] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>(['5GHz', 'MLO']);
  const [dismissedClosableTag, setDismissedClosableTag] = useState(false);
  const [emptyIllustration, setEmptyIllustration] = useState<TPIllustrationName>('no-devices');
  const [swipeOpen, setSwipeOpen] = useState(false);
  const [progressPct, setProgressPct] = useState(68);
  const [stepperIdx, setStepperIdx] = useState(1);

  // Inputs & Pickers state
  const [inputText, setInputText] = useState('Office_Main_WLAN');
  const [inputPwd, setInputPwd] = useState('Omada@2026');
  const [inputNotes, setInputNotes] = useState('Guest VLAN isolated from LAN subnet.');
  const [listInputVal, setListInputVal] = useState('192.168.0.1');
  const [pinCode, setPinCode] = useState('2468');
  const [checkedBands, setCheckedBands] = useState<string[]>(['5g', '6g']);
  const [radioSecurity, setRadioSecurity] = useState('wpa3');
  const [searchQuery, setSearchQuery] = useState('');
  const [stdIp, setStdIp] = useState('192.168.0.1');
  const [stdMac, setStdMac] = useState('8C-86-DD-A6-A7-5F');
  const [stdPort, setStdPort] = useState('443');
  const [wheelValues, setWheelValues] = useState({ band: '5g', channel: '36' });
  const [pickedDate, setPickedDate] = useState<Date>(() => new Date(2026, 10, 23));
  const [pickedMonth, setPickedMonth] = useState<TPMonthPickerValue>({ year: 2026, month: 11 });
  const [last7Date, setLast7Date] = useState<Date>(() => new Date(2026, 10, 23));
  const [pickedTime, setPickedTime] = useState<{
    hour: number;
    minute: number;
    period?: 'AM' | 'PM';
  }>({ hour: 9, minute: 30, period: 'AM' });
  const [use12Hour, setUse12Hour] = useState(true);
  const [selectedDays, setSelectedDays] = useState<TPDayKey[]>(['mon', 'wed', 'fri']);
  const [dayLocale, setDayLocale] = useState<'en' | 'zh'>('en');
  const [keyboardMode, setKeyboardMode] = useState<'numeric' | 'pin' | 'mac-hex'>('mac-hex');
  const [keyboardBuffer, setKeyboardBuffer] = useState('8C-86');

  // Overlays & Feedback state
  const [tooltipOpen, setTooltipOpen] = useState(true);
  const [fixedToastStatus, setFixedToastStatus] = useState<'info' | 'success' | 'warning' | 'danger'>('warning');
  const [alertState, setAlertState] = useState<{
    open: boolean;
    os: TPPlatformOS;
    withInput: boolean;
  }>({ open: false, os: 'ios', withInput: false });
  const [actionSheetState, setActionSheetState] = useState<{
    open: boolean;
    os: TPPlatformOS;
  }>({ open: false, os: 'ios' });
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [popupState, setPopupState] = useState<{
    open: boolean;
    placement: 'center' | 'top' | 'bottom';
  }>({ open: false, placement: 'center' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSelected, setMenuSelected] = useState('auto');
  const [promptVisible, setPromptVisible] = useState(true);

  const showSection = (id: Exclude<CoreCategoryId, 'all'>) =>
    category === 'all' || category === id;

  const segOptions: readonly TPSegmentOption[] = [
    { key: '24g', label: '2.4 GHz' },
    { key: '5g', label: '5 GHz', badge: 2 },
    { key: '6g', label: '6 GHz' },
  ];

  const wheelColumns: readonly TPWheelPickerColumn[] = [
    {
      key: 'band',
      value: wheelValues.band,
      options: [
        { value: '24g', label: '2.4 GHz' },
        { value: '5g', label: '5 GHz' },
        { value: '6g', label: '6 GHz' },
      ],
    },
    {
      key: 'channel',
      value: wheelValues.channel,
      options: [
        { value: '36', label: 'Ch 36' },
        { value: '44', label: 'Ch 44' },
        { value: '149', label: 'Ch 149' },
        { value: '161', label: 'Ch 161' },
      ],
    },
  ];

  const menuItems: readonly TPMenuItem[] = [
    { key: 'auto', label: 'Auto Channel', selected: menuSelected === 'auto' },
    { key: 'ch36', label: 'Channel 36 (5 GHz)', selected: menuSelected === 'ch36' },
    { key: 'ch149', label: 'Channel 149 (DFS)', selected: menuSelected === 'ch149' },
    { key: 'reset', label: 'Reset Radio Profile', danger: true, dividerBefore: true },
  ];

  const triggerToast = (type: TPToastType) => {
    const labels: Record<TPToastType, string> = {
      default: 'Configuration synced to gateway',
      info: 'New controller firmware available',
      success: 'Wireless settings saved',
      warning: 'High interference detected on Ch 6',
      error: 'Unable to reach 192.168.0.1',
      loading: 'Provisioning Access Points…',
    };
    toast.show({
      type,
      message: labels[type],
      duration: type === 'loading' ? 1800 : 2400,
    });
  };

  return (
    <div className="studio-workbench">
      {/* Left Sidebar Controls */}
      <aside className="studio-sidebar">
        <div className="studio-panel">
          <h3 className="studio-panel-title">Component Categories</h3>
          <div className="studio-screen-list">
            {CORE_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.id}
                type="button"
                className={`studio-screen-btn ${category === cat.id ? 'studio-screen-btn--active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                <span className="studio-screen-btn-main">
                  <span className="studio-screen-index">{idx + 1}</span>
                  <span className="studio-screen-name">{cat.label}</span>
                </span>
                <span className="studio-screen-tag">{cat.countLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="studio-panel">
          <h3 className="studio-panel-title">Live Theme Controls</h3>
          <div className="studio-control-group">
            <div className="studio-control-row">
              <span className="studio-control-label">Brand Preset</span>
              <div className="studio-segmented">
                {TP_BRANDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={`studio-seg-btn ${brand === b.id ? 'studio-seg-btn--active' : ''}`}
                    onClick={() => setBrand(b.id)}
                  >
                    <span className="studio-brand-swatch" style={{ background: b.accent }} />
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="studio-control-row">
              <span className="studio-control-label">Color Mode &amp; OS</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div className="studio-segmented">
                  {(['dark', 'light'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`studio-seg-btn ${mode === m ? 'studio-seg-btn--active' : ''}`}
                      onClick={() => setMode(m)}
                    >
                      {m === 'dark' ? 'Dark' : 'Light'}
                    </button>
                  ))}
                </div>
                <div className="studio-segmented">
                  {(['ios', 'android'] as const).map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      className={`studio-seg-btn ${os === platform ? 'studio-seg-btn--active' : ''}`}
                      onClick={() => {
                        setOS(platform);
                        onPhoneDeviceChange(platform === 'android' ? 'android' : 'iphone16pro');
                      }}
                    >
                      {platform === 'ios' ? 'iOS' : 'Android'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="studio-panel">
          <h3 className="studio-panel-title">Active Theme Tokens</h3>
          <p className="studio-info-desc">
            Every primitive inside the mobile frame reads live CSS variables from{' '}
            <code>TPThemeProvider</code> ({tokens.figmaMode}).
          </p>
          <div className="studio-chip-wrap">
            <span className="studio-code-chip">focus: {tokens.focus}</span>
            <span className="studio-code-chip">btnRadius: {tokens.radiusButton}px</span>
            <span className="studio-code-chip">cardRadius: {tokens.radiusCard}px</span>
            <span className="studio-code-chip">
              2ndStroke: {tokens.buttonSecondaryStroke}px
            </span>
          </div>
        </div>
      </aside>

      {/* Right Mobile Preview Stage */}
      <section className="studio-stage">
        <div className="studio-stage-bar">
          <div className="studio-stage-hint">
            Interactive Core Workbench inside <code>TPPhoneFrame</code> ({phoneDevice})
          </div>
          <div className="studio-segmented">
            {(['iphone16pro', 'iphone14', 'android', 'compact'] as const).map((dev) => (
              <button
                key={dev}
                type="button"
                className={`studio-seg-btn ${phoneDevice === dev ? 'studio-seg-btn--active' : ''}`}
                onClick={() => onPhoneDeviceChange(dev)}
              >
                {dev}
              </button>
            ))}
          </div>
        </div>

        <TPPhoneFrame
          device={phoneDevice}
          statusBar={<TPStatusBar time="10:51" os={os} muted />}
          bottomBar={
            <TPTabBar
              variant={tabVariant}
              items={CORE_TAB_ITEMS}
              activeKey={activeTabKey}
              onChange={(key) => setActiveTabKey(key)}
              extraAction={
                showTabExtra ? (
                  <TPIconButton
                    variant="glass"
                    size="lg"
                    icon="ai"
                    ariaLabel="AI Assistant"
                    onClick={() => toast.show({ type: 'info', message: 'Detached AI Liquid Glass action' })}
                  />
                ) : undefined
              }
            />
          }
        >
          <TPHeader
            variant={headerVariant}
            title="Core UI Kit"
            subtitle={`${tokens.figmaMode} • ${os.toUpperCase()}`}
            showBack
            onBack={() => toast.show({ type: 'info', message: 'Header Back tapped' })}
            rightBadge={3}
            right={
              <button
                type="button"
                className="tp-header-icon-btn"
                aria-label="Refresh preview"
                onClick={() => toast.show({ type: 'success', message: 'Preview refreshed' })}
              >
                <TPIcon name="nav-refresh" size={18} />
              </button>
            }
          />

          <div ref={previewRef} className="studio-core-preview">
            {showSection('nav-controls') && (
              <>
                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPHeader &amp; TPTabBar</h4>
                    <span className="studio-core-section-badge">{headerVariant}</span>
                  </div>
                  <div className="studio-flex-wrap">
                    <TPButton
                      variant={headerVariant === 'floating' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() =>
                        setHeaderVariant((prev) => (prev === 'floating' ? 'standard' : 'floating'))
                      }
                    >
                      Header: {headerVariant}
                    </TPButton>
                    <TPButton
                      variant={tabVariant === 'floating-pill' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() =>
                        setTabVariant((prev) =>
                          prev === 'floating-pill' ? 'docked' : 'floating-pill',
                        )
                      }
                    >
                      TabBar: {tabVariant}
                    </TPButton>
                    <TPTag
                      selected={showTabExtra}
                      size="sm"
                      onClick={() => setShowTabExtra((p) => !p)}
                    >
                      extraAction: {showTabExtra ? 'on' : 'off'}
                    </TPTag>
                  </div>
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">
                      TPLiquidGlass, TPIconButton &amp; Group
                    </h4>
                    <TPButton
                      size="sm"
                      variant={opticalRefraction ? 'tonal' : 'secondary'}
                      onClick={() => setOpticalRefraction((prev) => !prev)}
                    >
                      Optical: {opticalRefraction ? 'On' : 'Off'}
                    </TPButton>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      padding: '18px 12px',
                      borderRadius: 12,
                      overflow: 'hidden',
                      backgroundColor: resolvedMode === 'dark' ? '#14171D' : '#EEF2F8',
                      backgroundImage: [
                        'repeating-linear-gradient(135deg, rgba(0,168,112,0.52) 0 8px, transparent 8px 20px)',
                        'repeating-linear-gradient(-45deg, rgba(51,160,233,0.45) 0 4px, transparent 4px 16px)',
                        'linear-gradient(90deg, rgba(229,125,250,0.42) 0%, rgba(255,159,64,0.34) 100%)',
                      ].join(', '),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <TPLiquidGlass
                      shape="pill"
                      interactive
                      optical={opticalRefraction}
                      refraction={1.25}
                      dispersion={1.2}
                      as="button"
                      onClick={() => toast.show({ type: 'info', message: 'Liquid Glass Pill clicked' })}
                      style={{ padding: '9px 15px', fontSize: 13, fontWeight: 600 }}
                    >
                      Liquid Glass Pill
                    </TPLiquidGlass>
                    <TPLiquidGlass
                      shape="circle"
                      tint="brand"
                      interactive
                      optical={opticalRefraction}
                      refraction={1.15}
                      style={{ width: 42, height: 42 }}
                    >
                      <TPIcon name="settings-network-tools" size={18} color="#FFFFFF" />
                    </TPLiquidGlass>
                    <TPIconButtonGroup variant="glass">
                      <TPIconButton
                        icon="nav-add"
                        variant="glass"
                        ariaLabel="Add"
                        onClick={() => toast.show('Added item')}
                      />
                      <TPIconButton
                        icon="nav-more"
                        variant="glass"
                        badge={2}
                        ariaLabel="More"
                        onClick={() => toast.show('More menu')}
                      />
                    </TPIconButtonGroup>
                  </div>
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPButton</h4>
                    <span className="studio-core-section-badge">
                      {btnVariant} / {btnSize}
                    </span>
                  </div>
                  <div className="studio-flex-wrap">
                    {(['primary', 'secondary', 'text', 'alert', 'tonal', 'in-card'] as const).map(
                      (v) => (
                        <TPTag
                          key={v}
                          selected={btnVariant === v}
                          size="sm"
                          onClick={() => setBtnVariant(v)}
                        >
                          {v}
                        </TPTag>
                      ),
                    )}
                  </div>
                  <div className="studio-flex-wrap">
                    {(['lg', 'md', 'sm'] as const).map((sz) => (
                      <TPTag
                        key={sz}
                        selected={btnSize === sz}
                        size="sm"
                        onClick={() => setBtnSize(sz)}
                      >
                        {sz}
                      </TPTag>
                    ))}
                    <TPTag
                      selected={btnLoading}
                      tone="warning"
                      size="sm"
                      onClick={() => setBtnLoading((p) => !p)}
                    >
                      loading: {btnLoading ? 'on' : 'off'}
                    </TPTag>
                  </div>
                  <div className="studio-flex-wrap">
                    <TPButton
                      variant={btnVariant}
                      size={btnSize}
                      loading={btnLoading}
                      onClick={() =>
                        toast.show({
                          type: 'success',
                          message: `TPButton (${btnVariant}, ${btnSize}) clicked`,
                        })
                      }
                    >
                      Apply Setting
                    </TPButton>
                    <TPButton variant="secondary" size={btnSize} disabled>
                      Disabled
                    </TPButton>
                  </div>
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPSwitch &amp; TPSlider</h4>
                    <span className="studio-core-section-badge">{sliderVal}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13 }}>Smart Roaming (802.11k/v)</span>
                    <TPSwitch checked={switchOn} onChange={setSwitchOn} ariaLabel="Smart Roaming" />
                  </div>
                  <TPSlider
                    value={sliderVal}
                    min={0}
                    max={100}
                    step={5}
                    marks={[
                      { value: 0, label: 'Low' },
                      { value: 50, label: 'Mid' },
                      { value: 100, label: 'High' },
                    ]}
                    showValue
                    unit="%"
                    ariaLabel="Transmit Power"
                    onChange={setSliderVal}
                  />
                  <TPSlider
                    range
                    min={0}
                    max={100}
                    step={5}
                    rangeValue={rangeVal}
                    showValue
                    unit=" dBm"
                    ariaLabel="RSSI Window"
                    onRangeChange={setRangeVal}
                  />
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPSegment &amp; TPPageControl</h4>
                    <span className="studio-core-section-badge">{segVariant}</span>
                  </div>
                  <div className="studio-flex-wrap">
                    <TPTag
                      selected={segVariant === 'pill'}
                      size="sm"
                      onClick={() => setSegVariant('pill')}
                    >
                      pill
                    </TPTag>
                    <TPTag
                      selected={segVariant === 'underline'}
                      size="sm"
                      onClick={() => setSegVariant('underline')}
                    >
                      underline
                    </TPTag>
                  </div>
                  <TPSegment
                    variant={segVariant}
                    options={segOptions}
                    value={segVal}
                    onChange={setSegVal}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 4,
                    }}
                  >
                    <TPButton
                      variant="text"
                      size="sm"
                      onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
                    >
                      Prev
                    </TPButton>
                    <TPPageControl total={5} current={pageIdx} onChange={setPageIdx} />
                    <TPButton
                      variant="text"
                      size="sm"
                      onClick={() => setPageIdx((p) => Math.min(4, p + 1))}
                    >
                      Next
                    </TPButton>
                  </div>
                </div>

                <div className="studio-core-section" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px 4px', display: 'flex', justifyContent: 'space-between' }}>
                    <h4 className="studio-core-section-title">TPFixedButtonBar</h4>
                    <div className="studio-flex-wrap">
                      {(['single', 'dual-horizontal', 'dual-vertical'] as const).map((lay) => (
                        <TPTag
                          key={lay}
                          selected={fixedLayout === lay}
                          size="sm"
                          onClick={() => setFixedLayout(lay)}
                        >
                          {lay}
                        </TPTag>
                      ))}
                    </div>
                  </div>
                  <TPFixedButtonBar
                    layout={fixedLayout}
                    primaryText="Confirm Provision"
                    secondaryText="Cancel"
                    note="Applies profile to 2 managed EAP723 units"
                    onPrimaryClick={() => toast.show({ type: 'success', message: 'Provision confirmed' })}
                    onSecondaryClick={() => toast.show('Cancelled')}
                  />
                </div>
              </>
            )}

            {showSection('display-lists') && (
              <>
                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPText, TPTag &amp; TPBadge</h4>
                  </div>
                  <TPText variant="title2" tone="primary">
                    {tokens.figmaMode} Title
                  </TPText>
                  <TPText variant="body" tone="secondary-alt">
                    Main body scale ({tokens.fontSizeMain}px) with semantic tones.
                  </TPText>
                  <div className="studio-flex-wrap">
                    {(['2.4GHz', '5GHz', 'MLO', 'WPA3'] as const).map((tag) => {
                      const active = selectedTags.includes(tag);
                      return (
                        <TPTag
                          key={tag}
                          selected={active}
                          onClick={() =>
                            setSelectedTags((prev) =>
                              prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag],
                            )
                          }
                        >
                          {tag}
                        </TPTag>
                      );
                    })}
                    {!dismissedClosableTag ? (
                      <TPTag
                        tone="info"
                        closable
                        onClose={() => setDismissedClosableTag(true)}
                      >
                        Closable
                      </TPTag>
                    ) : (
                      <TPTag
                        tone="neutral"
                        onClick={() => setDismissedClosableTag(false)}
                      >
                        Restore Tag
                      </TPTag>
                    )}
                  </div>
                  <div className="studio-flex-wrap" style={{ gap: 14 }}>
                    <TPBadge count={5} tone="alert">
                      <TPIcon name="nav-log" size={24} />
                    </TPBadge>
                    <TPBadge count={128} max={99} tone="focus">
                      <TPIcon name="nav-settings" size={24} />
                    </TPBadge>
                    <TPBadge dot tone="warning">
                      <TPIcon name="qa-ssid" size={24} />
                    </TPBadge>
                    <TPBadge count="NEW" tone="focus" />
                  </div>
                </div>

                <TPSectionHeader title="TPListCard & TPListItem" count={3} action="Edit" />
                <TPListCard divided>
                  <TPListItem
                    leading={<TPIcon name="settings-wireless-settings" size={20} />}
                    title="Wi-Fi 7 MLO"
                    subtitle="2.4 GHz + 5 GHz + 6 GHz"
                    switchProps={{
                      checked: listSwitch,
                      onChange: setListSwitch,
                      ariaLabel: 'Wi-Fi 7 MLO',
                    }}
                  />
                  <TPListItem
                    leading={<TPIcon name="settings-vpn" size={20} />}
                    title="WireGuard VPN"
                    value="Active"
                    badge={2}
                    arrow
                    onClick={() => toast.show({ type: 'info', message: 'Opened VPN list row' })}
                  />
                  <TPListButton
                    tone="alert"
                    onClick={() => toast.show({ type: 'warning', message: 'Reset triggered' })}
                  >
                    Forget Network Configuration
                  </TPListButton>
                </TPListCard>
                <TPSectionNote>
                  TPSectionNote: Rebooting the gateway disconnects active clients for ~35 seconds.
                </TPSectionNote>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPSwipeRow, TPAvatar &amp; TPDivider</h4>
                    <TPTag size="sm" selected={swipeOpen} onClick={() => setSwipeOpen((p) => !p)}>
                      {swipeOpen ? 'Hide Actions' : 'Reveal Swipe'}
                    </TPTag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <TPAvatar name="Lucien Chen" status="online" size="md" />
                    <TPAvatar icon="client-controller" shape="rounded" status="busy" size="md" />
                    <TPAvatar name="Guest" status="offline" size="sm" />
                  </div>
                  <TPDivider label="Swipeable Row" spacing="sm" />
                  <TPSwipeRow
                    open={swipeOpen}
                    onOpenChange={setSwipeOpen}
                    actions={[
                      { key: 'pin', label: 'Pin', tone: 'focus', onClick: () => toast.show('Pinned') },
                      { key: 'del', label: 'Delete', tone: 'alert', onClick: () => toast.show({ type: 'warning', message: 'Deleted' }) },
                    ]}
                  >
                    <TPListItem
                      title="EAP723_Living_Room"
                      subtitle="3C-78-95-F0-45-F1 • Swipe left or tap Reveal"
                      value="Online"
                    />
                  </TPSwipeRow>
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPProgress, TPStepper, TPStepText &amp; TPSkeleton</h4>
                    <TPButton
                      variant="text"
                      size="sm"
                      onClick={() => {
                        setProgressPct((p) => (p >= 100 ? 25 : p + 16));
                        setStepperIdx((s) => (s + 1) % 3);
                      }}
                    >
                      Step
                    </TPButton>
                  </div>
                  <TPStepper
                    current={stepperIdx}
                    steps={[
                      { key: 'scan', title: 'Discover' },
                      { key: 'adopt', title: 'Adopt' },
                      { key: 'ready', title: 'Online' },
                    ]}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <TPProgress variant="circular" percent={progressPct} tone="focus" size={56} />
                    <div style={{ flex: 1 }}>
                      <TPProgress variant="linear" percent={progressPct} tone="success" label="Provisioning" />
                    </div>
                  </div>
                  <TPStepText
                    variant="step"
                    items={[
                      { title: 'Connect PoE+', text: 'Plug EAP723 into LAN5 for 802.3at power.' },
                      { title: 'Auto-Adopt', text: 'Cloud Controller pushes WLAN profiles automatically.' },
                    ]}
                  />
                  <TPSkeleton variant="text" lines={2} />
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPEmptyState</h4>
                    <span className="studio-core-section-badge">{resolvedMode}</span>
                  </div>
                  <div className="studio-flex-wrap">
                    {(['no-devices', 'no-clients', 'no-sites'] as const).map((ill) => (
                      <TPTag
                        key={ill}
                        selected={emptyIllustration === ill}
                        size="sm"
                        onClick={() => setEmptyIllustration(ill)}
                      >
                        {ill}
                      </TPTag>
                    ))}
                  </div>
                  <TPEmptyState
                    illustration={emptyIllustration}
                    title="No Managed Nodes"
                    description="Illustrations automatically swap between Light and Dark SVG/PNG assets."
                    actionText="Scan Network"
                    compact
                    onAction={() => toast.show({ type: 'loading', message: 'Scanning LAN…', duration: 1500 })}
                  />
                </div>
              </>
            )}

            {showSection('inputs-pickers') && (
              <>
                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPSearchBar &amp; TPInput</h4>
                  </div>
                  <TPSearchBar
                    value={searchQuery}
                    placeholder="Search SSID, MAC, or IP"
                    showCancel
                    onChange={setSearchQuery}
                    onCancel={() => setSearchQuery('')}
                  />
                  <TPInput
                    label="WLAN Name (Clearable)"
                    value={inputText}
                    clearable
                    onChange={setInputText}
                    helperText="Broadcast SSID visible to wireless clients"
                  />
                  <TPInput
                    label="WPA3 Passphrase"
                    value={inputPwd}
                    password
                    onChange={setInputPwd}
                    error={inputPwd.length < 8 ? 'Passphrase must be at least 8 characters' : undefined}
                  />
                  <TPInput
                    label="Site Notes (Multiline)"
                    multiline
                    rows={2}
                    value={inputNotes}
                    onChange={setInputNotes}
                  />
                  <TPInput
                    variant="list"
                    label="Gateway IP"
                    value={listInputVal}
                    onChange={setListInputVal}
                  />
                  <TPPinInput
                    length={4}
                    value={pinCode}
                    onChange={setPinCode}
                    ariaLabel="Device PIN"
                  />
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPCheckboxGroup &amp; TPRadioGroup</h4>
                    <span className="studio-core-section-badge">{radioSecurity.toUpperCase()}</span>
                  </div>
                  <TPCheckboxGroup
                    direction="horizontal"
                    value={checkedBands}
                    onChange={setCheckedBands}
                    options={[
                      { value: '24g', label: '2.4G' },
                      { value: '5g', label: '5G' },
                      { value: '6g', label: '6G MLO' },
                    ]}
                  />
                  <TPRadioGroup
                    value={radioSecurity}
                    onChange={setRadioSecurity}
                    options={[
                      { value: 'wpa3', label: 'WPA3-Personal (Recommended)' },
                      { value: 'wpa2', label: 'WPA2 / WPA3 Mixed' },
                    ]}
                  />
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">OmadaStandardInput</h4>
                    <span className="studio-core-section-badge">IPv4 / MAC / Port</span>
                  </div>
                  <OmadaStandardInput
                    type="ip"
                    label="Gateway IPv4 Address"
                    value={stdIp}
                    onChange={setStdIp}
                  />
                  <OmadaStandardInput
                    type="mac"
                    label="Access Point MAC"
                    value={stdMac}
                    onChange={setStdMac}
                  />
                  <OmadaStandardInput
                    type="port"
                    label="HTTPS Management Port"
                    value={stdPort}
                    onChange={setStdPort}
                  />
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPDaySwitcher</h4>
                    <TPTag
                      size="sm"
                      selected={dayLocale === 'zh'}
                      onClick={() => setDayLocale((l) => (l === 'en' ? 'zh' : 'en'))}
                    >
                      locale: {dayLocale}
                    </TPTag>
                  </div>
                  <TPDaySwitcher
                    value={selectedDays}
                    locale={dayLocale}
                    onChange={setSelectedDays}
                  />
                  <div style={{ fontSize: 12, color: 'var(--tp-text-secondary)' }}>
                    Schedule: {selectedDays.length ? selectedDays.join(', ') : 'None'}
                  </div>
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPWheelPicker</h4>
                    <span className="studio-core-section-badge">
                      {wheelValues.band} / Ch {wheelValues.channel}
                    </span>
                  </div>
                  <TPWheelPicker
                    columns={wheelColumns}
                    visibleItems={3}
                    onChange={(key, val) => setWheelValues((prev) => ({ ...prev, [key]: val }))}
                  />
                </div>

                <div className="studio-core-section" style={{ padding: 0, overflow: 'hidden' }}>
                  <TPDatePicker
                    title="Maintenance Date"
                    value={pickedDate}
                    onChange={setPickedDate}
                    onConfirm={(d) =>
                      toast.show({
                        type: 'success',
                        message: `Date set: ${d.toLocaleDateString()}`,
                      })
                    }
                    onCancel={() => toast.show('Date picker cancelled')}
                  />
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPTimePicker</h4>
                    <TPTag
                      size="sm"
                      selected={use12Hour}
                      onClick={() => setUse12Hour((p) => !p)}
                    >
                      {use12Hour ? '12-Hour' : '24-Hour'}
                    </TPTag>
                  </div>
                  <TPTimePicker
                    value={pickedTime}
                    use12Hour={use12Hour}
                    minuteStep={5}
                    onChange={setPickedTime}
                  />
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPMonthPicker &amp; TPLast7DaysPicker</h4>
                    <span className="studio-core-section-badge">
                      {pickedMonth.year}-{String(pickedMonth.month).padStart(2, '0')}
                    </span>
                  </div>
                  <TPLast7DaysPicker
                    value={last7Date}
                    referenceDate={new Date(2026, 10, 23)}
                    markedDates={['2026-11-20', '2026-11-22', '2026-11-23']}
                    onChange={setLast7Date}
                  />
                  <TPMonthPicker value={pickedMonth} onChange={setPickedMonth} />
                </div>

                <div className="studio-core-section" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="studio-core-section-head">
                      <h4 className="studio-core-section-title">TPKeyboard</h4>
                      <span className="studio-core-section-badge">{keyboardBuffer || 'Empty'}</span>
                    </div>
                    <div className="studio-flex-wrap">
                      {(['numeric', 'pin', 'mac-hex'] as const).map((km) => (
                        <TPTag
                          key={km}
                          selected={keyboardMode === km}
                          size="sm"
                          onClick={() => {
                            setKeyboardMode(km);
                            setKeyboardBuffer(km === 'mac-hex' ? '8C-86' : km === 'pin' ? '1234' : '192.168');
                          }}
                        >
                          {km}
                        </TPTag>
                      ))}
                    </div>
                  </div>
                  <TPKeyboard
                    mode={keyboardMode}
                    showDot={keyboardMode === 'numeric'}
                    onKeyPress={(k) => setKeyboardBuffer((prev) => `${prev}${k}`.slice(0, 17))}
                    onBackspace={() => setKeyboardBuffer((prev) => prev.slice(0, -1))}
                    onDone={() =>
                      toast.show({
                        type: 'success',
                        message: `Keypad submitted: ${keyboardBuffer || '(empty)'}`,
                      })
                    }
                  />
                </div>
              </>
            )}

            {showSection('overlays-feedback') && (
              <>
                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPPrompt (4 Tones)</h4>
                    {!promptVisible && (
                      <TPButton variant="text" size="sm" onClick={() => setPromptVisible(true)}>
                        Reset
                      </TPButton>
                    )}
                  </div>
                  {promptVisible && (
                    <TPPrompt
                      tone="info"
                      title="Firmware V2.5.2 is ready for ER7212PC"
                      actionLabel="View Release Notes"
                      onAction={() => toast.show({ type: 'info', message: 'V2.5.2 Release Notes' })}
                      closable
                      onClose={() => setPromptVisible(false)}
                    />
                  )}
                  <TPPrompt tone="focus" title="Cloud Sync Connected" />
                  <TPPrompt tone="warning" title="PoE budget at 82% capacity" />
                  <TPPrompt tone="alert" title="WAN1 link lost failover active" />
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPFixedToast &amp; TPTooltip</h4>
                    <div className="studio-flex-wrap">
                      {(['info', 'success', 'warning', 'danger'] as const).map((st) => (
                        <TPTag
                          key={st}
                          size="sm"
                          selected={fixedToastStatus === st}
                          onClick={() => setFixedToastStatus(st)}
                        >
                          {st}
                        </TPTag>
                      ))}
                    </div>
                  </div>
                  <TPFixedToast
                    status={fixedToastStatus}
                    action="button"
                    actionLabel="Inspect"
                    onAction={() => toast.show(`Inspected ${fixedToastStatus}`)}
                    message={`Persistent ${fixedToastStatus} status notice bar.`}
                  />
                  <div style={{ paddingTop: 72, display: 'flex', justifyContent: 'center' }}>
                    <TPTooltip
                      open={tooltipOpen}
                      onOpenChange={setTooltipOpen}
                      arrowPosition="bottom-left"
                      content="Tap to toggle channel auto-optimization."
                    >
                      <TPButton variant="secondary" size="sm">
                        TPTooltip Target
                      </TPButton>
                    </TPTooltip>
                  </div>
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPMenu (Dropdown)</h4>
                    <span className="studio-core-section-badge">{menuSelected}</span>
                  </div>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <TPButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setMenuOpen((prev) => !prev)}
                    >
                      Radio Channel Menu ▾
                    </TPButton>
                    <TPMenu
                      open={menuOpen}
                      items={menuItems}
                      onSelect={(item) => {
                        setMenuSelected(item.key);
                        toast.show({ type: 'info', message: `Menu selected: ${item.key}` });
                      }}
                      onClose={() => setMenuOpen(false)}
                    />
                  </div>
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPAlert &amp; TPActionSheet</h4>
                  </div>
                  <div className="studio-grid-2">
                    <TPButton
                      variant="primary"
                      size="sm"
                      onClick={() => setAlertState({ open: true, os: 'ios', withInput: false })}
                    >
                      iOS TPAlert
                    </TPButton>
                    <TPButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setAlertState({ open: true, os: 'android', withInput: false })}
                    >
                      Android TPAlert
                    </TPButton>
                    <TPButton
                      variant="tonal"
                      size="sm"
                      onClick={() => setAlertState({ open: true, os, withInput: true })}
                    >
                      Input TPAlert
                    </TPButton>
                    <TPButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setActionSheetState({ open: true, os: 'ios' })}
                    >
                      iOS ActionSheet
                    </TPButton>
                    <TPButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setActionSheetState({ open: true, os: 'android' })}
                    >
                      Android ActionSheet
                    </TPButton>
                    <TPButton
                      variant="primary"
                      size="sm"
                      onClick={() => setBottomSheetOpen(true)}
                    >
                      TPBottomSheet
                    </TPButton>
                  </div>
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">TPPopup &amp; useTPToast()</h4>
                  </div>
                  <div className="studio-flex-wrap">
                    <TPButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setPopupState({ open: true, placement: 'center' })}
                    >
                      Popup Center
                    </TPButton>
                    <TPButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setPopupState({ open: true, placement: 'top' })}
                    >
                      Popup Top
                    </TPButton>
                    <TPButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setPopupState({ open: true, placement: 'bottom' })}
                    >
                      Popup Bottom
                    </TPButton>
                  </div>
                  <div className="studio-flex-wrap">
                    {(['default', 'info', 'success', 'warning', 'error', 'loading'] as const).map(
                      (t) => (
                        <TPButton
                          key={t}
                          variant="in-card"
                          size="sm"
                          onClick={() => triggerToast(t)}
                        >
                          Toast: {t}
                        </TPButton>
                      ),
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </TPPhoneFrame>
      </section>

      {/* Live Overlay Modals */}
      <TPAlert
        open={alertState.open}
        os={alertState.os}
        title={alertState.withInput ? 'Rename Site' : 'Reboot Access Point?'}
        message={
          alertState.withInput
            ? 'Enter a new display name for Site 92.'
            : 'Clients connected to EAP723 will temporarily roam during reboot.'
        }
        inputPlaceholder={alertState.withInput ? 'Site display name' : undefined}
        defaultInputValue={alertState.withInput ? 'Site 92' : ''}
        actions={[
          { label: 'Cancel', role: 'cancel' },
          {
            label: alertState.withInput ? 'Save' : 'Reboot',
            role: alertState.withInput ? 'default' : 'destructive',
            onClick: (val) =>
              toast.show({
                type: 'success',
                message: alertState.withInput
                  ? `Renamed to ${val || 'Site 92'}`
                  : 'Reboot command sent',
              }),
          },
        ]}
        onClose={() => setAlertState((prev) => ({ ...prev, open: false }))}
      />

      <TPActionSheet
        open={actionSheetState.open}
        os={actionSheetState.os}
        title="EAP723 Quick Actions"
        message="3C-78-95-F0-45-F1 • 192.168.0.102"
        options={[
          {
            key: 'locate',
            label: 'Locate LED',
            description: 'Blink status LED for 30s',
            icon: <TPIcon name="qa-wlan-optimization" size={20} />,
            selected: true,
          },
          {
            key: 'rf',
            label: 'RF Channel Scan',
            description: 'Analyze 5 GHz / 6 GHz interference',
            icon: <TPIcon name="tool-wi-fi-scan" size={20} />,
          },
          {
            key: 'forget',
            label: 'Forget Device',
            destructive: true,
          },
        ]}
        onSelect={(opt) => toast.show({ type: 'info', message: `Action: ${opt.key}` })}
        onClose={() => setActionSheetState((prev) => ({ ...prev, open: false }))}
      />

      <TPBottomSheet
        open={bottomSheetOpen}
        title="TPBottomSheet Workbench"
        subtitle="Scrollable sheet with grabber & footer slot"
        onClose={() => setBottomSheetOpen(false)}
        footer={
          <TPButton variant="primary" block onClick={() => setBottomSheetOpen(false)}>
            Apply &amp; Close
          </TPButton>
        }
      >
        <TPListCard divided>
          <TPListItem title="Band Steering" value="Enabled" />
          <TPListItem title="OFDMA" value="802.11ax / be" />
          <TPListItem title="Minimum RSSI" value="-75 dBm" />
        </TPListCard>
      </TPBottomSheet>

      <TPPopup
        open={popupState.open}
        placement={popupState.placement}
        title={`TPPopup (${popupState.placement})`}
        onClose={() => setPopupState((prev) => ({ ...prev, open: false }))}
        footer={
          <TPButton
            variant="primary"
            size="md"
            block
            onClick={() => setPopupState((prev) => ({ ...prev, open: false }))}
          >
            Got It
          </TPButton>
        }
      >
        <TPText variant="body" tone="secondary-alt">
          Supports center modal, top banner drawer, and bottom sheet placements using active{' '}
          <code>--tp-*</code> tokens.
        </TPText>
      </TPPopup>
    </div>
  );
};

const AssetsMotionTab: React.FC = () => {
  const { resolvedMode } = useTPTheme();
  const toast = useTPToast();

  const [subTab, setSubTab] = useState<AssetsSubTabId>('motions');
  const [search, setSearch] = useState('');

  // Motions state
  const [motionPlaying, setMotionPlaying] = useState(true);
  const [motionThemeFilter, setMotionThemeFilter] = useState<'all' | TPResolvedMode>('all');

  // Icons & Illustrations & Logos preview theme
  const [iconCategory, setIconCategory] = useState<string>('all');
  const [assetPreviewMode, setAssetPreviewMode] = useState<TPResolvedMode>(resolvedMode);
  const [illusViewMode, setIllusViewMode] = useState<'swap' | 'all'>('swap');

  const omadaIcons = useMemo(() => TP_ICONS.filter((i) => i.pack === 'omada'), []);
  const generalIcons = useMemo(() => TP_ICONS.filter((i) => i.pack === 'general'), []);

  const uniqueIllustrationNames = useMemo(() => {
    const seen = new Set<string>();
    const list: { name: TPIllustrationName; title: string; category: string; hasDark: boolean }[] = [];
    for (const item of TP_ILLUSTRATIONS) {
      if (!seen.has(item.name)) {
        seen.add(item.name);
        const hasDark = TP_ILLUSTRATIONS.some(
          (entry) => entry.name === item.name && entry.theme === 'dark',
        );
        list.push({
          name: item.name as TPIllustrationName,
          title: item.title,
          category: item.category,
          hasDark,
        });
      }
    }
    return list;
  }, []);

  const filteredMotions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TP_MOTIONS.filter((m) => {
      if (motionThemeFilter !== 'all' && m.theme !== motionThemeFilter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.sourceFile.toLowerCase().includes(q)
      );
    });
  }, [search, motionThemeFilter]);

  const activeIconPool = subTab === 'omada-icons' ? omadaIcons : generalIcons;

  const iconCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const icon of activeIconPool) {
      counts.set(icon.category, (counts.get(icon.category) ?? 0) + 1);
    }
    return Array.from(counts.entries());
  }, [activeIconPool]);

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeIconPool.filter((icon) => {
      if (iconCategory !== 'all' && icon.category !== iconCategory) return false;
      if (!q) return true;
      return (
        icon.name.toLowerCase().includes(q) ||
        icon.title.toLowerCase().includes(q) ||
        icon.category.toLowerCase().includes(q)
      );
    });
  }, [activeIconPool, iconCategory, search]);

  const filteredSwapIllustrations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return uniqueIllustrationNames.filter((item) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [uniqueIllustrationNames, search]);

  const filteredAllIllustrations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TP_ILLUSTRATIONS.filter((item) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.theme.toLowerCase().includes(q)
      );
    });
  }, [search]);

  const filteredLogos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TP_BRAND_LOGOS.filter((logo) => {
      if (!q) return true;
      return logo.name.toLowerCase().includes(q) || logo.title.toLowerCase().includes(q);
    });
  }, [search]);

  const handleSubTabChange = (next: AssetsSubTabId) => {
    setSubTab(next);
    setIconCategory('all');
  };

  return (
    <div>
      <div className="studio-toolbar">
        <div className="studio-toolbar-left">
          <h2 className="studio-toolbar-title">
            Assets &amp; Live PAG Motions
          </h2>
          <div className="studio-toolbar-sub">
            17 Tencent PAG motion files (<code>libpag</code> WASM), 196 Omada Icons, 430 General Icons,
            81 Light/Dark Illustrations, and 16 official App Logos.
          </div>
        </div>

        <div className="studio-segmented" role="tablist" aria-label="Asset Sections">
          {(
            [
              { id: 'motions', label: `Live PAG Motions (${TP_MOTIONS.length})` },
              { id: 'omada-icons', label: `Omada Icons (${omadaIcons.length})` },
              { id: 'general-icons', label: `General Icons (${generalIcons.length})` },
              { id: 'illustrations', label: `Illustrations (${TP_ILLUSTRATIONS.length})` },
              { id: 'logos', label: `App Logos (${TP_BRAND_LOGOS.length})` },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={subTab === item.id}
              className={`studio-seg-btn ${subTab === item.id ? 'studio-seg-btn--active' : ''}`}
              onClick={() => handleSubTabChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="studio-assets-controls">
        <input
          type="search"
          className="studio-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            subTab === 'motions'
              ? 'Search PAG motions (deploy-config, port-card-expand...)'
              : subTab === 'omada-icons' || subTab === 'general-icons'
                ? 'Search icon slug, category, or title...'
                : subTab === 'illustrations'
                  ? 'Search illustrations (no-devices, power-on, mlo...)'
                  : 'Search TP-Link brand logos...'
          }
          aria-label="Search assets"
        />

        <div className="studio-toolbar-controls">
          {subTab === 'motions' && (
            <>
              <TPButton
                variant={motionPlaying ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setMotionPlaying((prev) => !prev)}
              >
                {motionPlaying ? 'Pause All Motions' : 'Play All Motions'}
              </TPButton>
              <div className="studio-segmented">
                {(['all', 'light', 'dark'] as const).map((themeOpt) => (
                  <button
                    key={themeOpt}
                    type="button"
                    className={`studio-seg-btn ${motionThemeFilter === themeOpt ? 'studio-seg-btn--active' : ''}`}
                    onClick={() => setMotionThemeFilter(themeOpt)}
                  >
                    {themeOpt === 'all' ? `All (${TP_MOTIONS.length})` : themeOpt}
                  </button>
                ))}
              </div>
            </>
          )}

          {subTab === 'illustrations' && (
            <>
              <div className="studio-segmented">
                <button
                  type="button"
                  className={`studio-seg-btn ${illusViewMode === 'swap' ? 'studio-seg-btn--active' : ''}`}
                  onClick={() => setIllusViewMode('swap')}
                >
                  Light/Dark Swap ({uniqueIllustrationNames.length})
                </button>
                <button
                  type="button"
                  className={`studio-seg-btn ${illusViewMode === 'all' ? 'studio-seg-btn--active' : ''}`}
                  onClick={() => setIllusViewMode('all')}
                >
                  All Variants ({TP_ILLUSTRATIONS.length})
                </button>
              </div>
              <div className="studio-segmented">
                <button
                  type="button"
                  className={`studio-seg-btn ${assetPreviewMode === 'light' ? 'studio-seg-btn--active' : ''}`}
                  onClick={() => setAssetPreviewMode('light')}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={`studio-seg-btn ${assetPreviewMode === 'dark' ? 'studio-seg-btn--active' : ''}`}
                  onClick={() => setAssetPreviewMode('dark')}
                >
                  Dark
                </button>
              </div>
            </>
          )}

          {(subTab === 'omada-icons' || subTab === 'general-icons' || subTab === 'logos') && (
            <div className="studio-segmented">
              <button
                type="button"
                className={`studio-seg-btn ${assetPreviewMode === 'light' ? 'studio-seg-btn--active' : ''}`}
                onClick={() => setAssetPreviewMode('light')}
              >
                Light Surface
              </button>
              <button
                type="button"
                className={`studio-seg-btn ${assetPreviewMode === 'dark' ? 'studio-seg-btn--active' : ''}`}
                onClick={() => setAssetPreviewMode('dark')}
              >
                Dark Surface
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Pills for Icons */}
      {(subTab === 'omada-icons' || subTab === 'general-icons') && (
        <div className="studio-cat-pills">
          <button
            type="button"
            className={`studio-cat-pill ${iconCategory === 'all' ? 'studio-cat-pill--active' : ''}`}
            onClick={() => setIconCategory('all')}
          >
            All ({activeIconPool.length})
          </button>
          {iconCategories.map(([cat, count]) => (
            <button
              key={cat}
              type="button"
              className={`studio-cat-pill ${iconCategory === cat ? 'studio-cat-pill--active' : ''}`}
              onClick={() => setIconCategory(cat)}
            >
              {cat} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Sub-tab 1: Live PAG Motions */}
      {subTab === 'motions' && (
        <div className="studio-motion-grid">
          {filteredMotions.map((motion) => (
            <button
              key={`${motion.name}-${motion.theme}`}
              type="button"
              className="studio-motion-card"
              onClick={() =>
                copyTextWithToast(
                  `<TPMotion name="${motion.name}" theme="${motion.theme}" />`,
                  (msg) => toast.show({ type: 'success', message: msg }),
                )
              }
            >
              <div className={`studio-motion-canvas studio-motion-canvas--${motion.theme}`}>
                <TPMotion
                  name={motion.name as TPMotionName}
                  theme={motion.theme}
                  playing={motionPlaying}
                  width={110}
                  height={110}
                />
              </div>
              <div className="studio-motion-meta">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <span className="studio-motion-title">{motion.title}</span>
                  <span className="studio-code-chip">{motion.theme}</span>
                </div>
                <span className="studio-motion-sub">{motion.name}</span>
                <span className="studio-motion-sub">
                  {motion.category} • {(motion.bytes / 1024).toFixed(1)} KB
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Sub-tab 2 & 3: Omada Icons & General Icons */}
      {(subTab === 'omada-icons' || subTab === 'general-icons') && (
        <div className="studio-icon-grid">
          {filteredIcons.map((icon) => {
            const snippet =
              icon.pack === 'general'
                ? `<TPIcon name="${icon.name}" pack="general" />`
                : `<TPIcon name="${icon.name}" />`;
            return (
              <button
                key={`${icon.pack}-${icon.name}`}
                type="button"
                className={`studio-icon-tile studio-icon-tile--${assetPreviewMode}`}
                title={`${icon.title} (${icon.category}) — Click to copy JSX`}
                onClick={() =>
                  copyTextWithToast(snippet, (msg) =>
                    toast.show({ type: 'success', message: msg }),
                  )
                }
              >
                <TPIcon name={icon.name as TPIconName} pack={icon.pack} size={28} />
                <span className="studio-icon-name">{icon.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sub-tab 4: Illustrations */}
      {subTab === 'illustrations' && illusViewMode === 'swap' && (
        <div className="studio-illus-grid">
          {filteredSwapIllustrations.map((item) => (
            <button
              key={item.name}
              type="button"
              className="studio-illus-card"
              onClick={() =>
                copyTextWithToast(
                  `<TPIllustration name="${item.name}" theme="${assetPreviewMode}" />`,
                  (msg) => toast.show({ type: 'success', message: msg }),
                )
              }
            >
              <div className={`studio-illus-stage studio-illus-stage--${assetPreviewMode}`}>
                <TPIllustration
                  name={item.name}
                  theme={assetPreviewMode}
                  width={210}
                  height={122}
                />
              </div>
              <div className="studio-motion-meta">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <span className="studio-motion-title">{item.name}</span>
                  <span className="studio-code-chip">
                    {item.hasDark ? assetPreviewMode : 'light fallback'}
                  </span>
                </div>
                <span className="studio-motion-sub">{item.category}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {subTab === 'illustrations' && illusViewMode === 'all' && (
        <div className="studio-illus-grid">
          {filteredAllIllustrations.map((item) => (
            <button
              key={`${item.theme}-${item.name}`}
              type="button"
              className="studio-illus-card"
              onClick={() =>
                copyTextWithToast(
                  `<TPIllustration name="${item.name}" theme="${item.theme}" />`,
                  (msg) => toast.show({ type: 'success', message: msg }),
                )
              }
            >
              <div className={`studio-illus-stage studio-illus-stage--${item.theme}`}>
                <TPIllustration
                  name={item.name as TPIllustrationName}
                  theme={item.theme}
                  width={210}
                  height={122}
                />
              </div>
              <div className="studio-motion-meta">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <span className="studio-motion-title">{item.name}</span>
                  <span className="studio-code-chip">{item.theme}</span>
                </div>
                <span className="studio-motion-sub">
                  {item.width}×{item.height} • {item.format.toUpperCase()}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Sub-tab 5: App Logos */}
      {subTab === 'logos' && (
        <div className="studio-logo-grid">
          {filteredLogos.map((logo) => (
            <button
              key={logo.name}
              type="button"
              className={`studio-logo-card studio-logo-card--${assetPreviewMode}`}
              onClick={() =>
                copyTextWithToast(
                  `<TPBrandLogo name="${logo.name}" />`,
                  (msg) => toast.show({ type: 'success', message: msg }),
                )
              }
            >
              <TPBrandLogo name={logo.name as TPBrandLogoName} size={56} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>{logo.title}</div>
              <span className="studio-code-chip">{logo.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const REPO_URL = 'https://github.com/ChenyqThu/tp-mobile-ui-kit';

const AGENT_SKILL_PATHS: readonly { agent: string; project: string; global: string }[] = [
  { agent: 'Claude Code', project: '.claude/skills/tp-mobile-ui-kit/', global: '~/.claude/skills/tp-mobile-ui-kit/' },
  { agent: 'Cursor', project: '.cursor/skills/tp-mobile-ui-kit/', global: '~/.cursor/skills/tp-mobile-ui-kit/' },
  { agent: 'OpenAI Codex', project: '.agents/skills/tp-mobile-ui-kit/', global: '~/.agents/skills/tp-mobile-ui-kit/' },
  { agent: 'Google Antigravity', project: '.agents/skills/tp-mobile-ui-kit/', global: '~/.gemini/config/skills/tp-mobile-ui-kit/' },
  { agent: 'GitHub Copilot / VS Code', project: '.github/skills/tp-mobile-ui-kit/', global: '~/.copilot/skills/tp-mobile-ui-kit/' },
  { agent: 'Windsurf', project: '.windsurf/skills/tp-mobile-ui-kit/', global: '~/.codeium/windsurf/skills/tp-mobile-ui-kit/' },
  { agent: 'OpenCode', project: '.opencode/skills/tp-mobile-ui-kit/', global: '~/.config/opencode/skills/tp-mobile-ui-kit/' },
];

const AgentSkillTab: React.FC = () => {
  const toast = useTPToast();
  const copy = (label: string, text: string) =>
    copyTextWithToast(text, () => toast.show({ type: 'success', message: `Copied ${label}` }));

  const installProject = 'npx skills add ChenyqThu/tp-mobile-ui-kit';
  const installGlobal = 'npx skills add ChenyqThu/tp-mobile-ui-kit -g';
  const cliCommands = [
    'node skills/tp-mobile-ui-kit/scripts/query-catalog.mjs info',
    'node skills/tp-mobile-ui-kit/scripts/query-catalog.mjs brands omada',
    'node skills/tp-mobile-ui-kit/scripts/query-catalog.mjs search-assets motions',
    'node skills/tp-mobile-ui-kit/scripts/query-catalog.mjs template omada-dashboard --html > demo.html',
    'node skills/tp-mobile-ui-kit/scripts/verify-demo.mjs demo.html',
  ].join('\n');
  const htmlStarter = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chenyqthu/tp-mobile-ui-kit@latest/dist/style.css" />
<script src="https://cdn.jsdelivr.net/npm/@chenyqthu/tp-mobile-ui-kit@latest/dist/standalone.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<div id="root"></div>
<script type="text/babel">
  const { TPThemeProvider, TPToastProvider, OmadaAppDemo } = window.TPMobileUI;
  TPMobileUI.render(
    <TPThemeProvider defaultBrand="omada" defaultMode="dark">
      <TPToastProvider><OmadaAppDemo initialScreen="dashboard" /></TPToastProvider>
    </TPThemeProvider>,
  );
</script>`;

  return (
    <div className="studio-skill-layout" data-testid="agent-skill-tab">
      <div className="studio-toolbar">
        <div className="studio-toolbar-left">
          <h2 className="studio-toolbar-title">Cross-Agent Skill &amp; Zero-Build Prototypes</h2>
          <div className="studio-toolbar-sub">
            Install <code>skills/tp-mobile-ui-kit/</code> across Claude Code, Cursor, Codex, and Antigravity so coding agents query real component props, 6-brand tokens, Figma assets, and PAG motions before generating mobile PRD mockups.
          </div>
        </div>
        <div className="studio-link-row">
          <a className="studio-ext-link" href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub Repo ↗
          </a>
          <a className="studio-ext-link" href={`${REPO_URL}/issues/new?template=missing-component.yml`} target="_blank" rel="noreferrer">
            Request Component ↗
          </a>
          <a className="studio-ext-link" href={`${REPO_URL}/issues/new?template=component-bug.yml`} target="_blank" rel="noreferrer">
            Report Bug ↗
          </a>
        </div>
      </div>

      <div className="studio-skill-grid">
        <div className="studio-panel" style={{ display: 'grid', gap: 12 }}>
          <h3 className="studio-panel-title" style={{ margin: 0 }}>Quick Install (CLI)</h3>
          <div className="studio-code-box">
            <div className="studio-code-box-head">
              <span className="studio-code-box-label">Project Workspace Install</span>
              <TPButton variant="secondary" size="sm" onClick={() => copy('project install CLI', installProject)}>
                Copy
              </TPButton>
            </div>
            <pre><code>{installProject}</code></pre>
          </div>
          <div className="studio-code-box">
            <div className="studio-code-box-head">
              <span className="studio-code-box-label">Global User Install</span>
              <TPButton variant="secondary" size="sm" onClick={() => copy('global install CLI', installGlobal)}>
                Copy
              </TPButton>
            </div>
            <pre><code>{installGlobal}</code></pre>
          </div>
          <div className="studio-code-box">
            <div className="studio-code-box-head">
              <span className="studio-code-box-label">Bundled Catalog &amp; Verifier CLI</span>
              <TPButton variant="secondary" size="sm" onClick={() => copy('catalog CLI commands', cliCommands)}>
                Copy
              </TPButton>
            </div>
            <pre><code>{cliCommands}</code></pre>
          </div>
        </div>

        <div className="studio-panel" style={{ display: 'grid', gap: 12 }}>
          <h3 className="studio-panel-title" style={{ margin: 0 }}>Single-File HTML CDN Starter (Zero Build)</h3>
          <div className="studio-code-box">
            <div className="studio-code-box-head">
              <span className="studio-code-box-label">window.TPMobileUI + @babel/standalone</span>
              <TPButton variant="secondary" size="sm" onClick={() => copy('HTML starter', htmlStarter)}>
                Copy
              </TPButton>
            </div>
            <pre><code>{htmlStarter}</code></pre>
          </div>
          <div style={{ fontSize: 12, color: 'var(--studio-text-muted)', lineHeight: 1.55 }}>
            Includes all 626 Figma icons, 81 Light/Dark illustrations, 16 brand logos, and 17 real Tencent <code>.pag</code> motion files inline with automatic CDN fallback for <code>libpag.wasm</code>.
          </div>
        </div>
      </div>

      <div className="studio-panel">
        <h3 className="studio-panel-title" style={{ marginBottom: 10 }}>Supported Coding Agents &amp; Skill Paths</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="studio-agent-table">
            <thead>
              <tr>
                <th>Coding Agent</th>
                <th>Project / Workspace Path</th>
                <th>Global User Path</th>
              </tr>
            </thead>
            <tbody>
              {AGENT_SKILL_PATHS.map((row) => (
                <tr key={row.agent}>
                  <td style={{ fontWeight: 600 }}>{row.agent}</td>
                  <td><code>{row.project}</code></td>
                  <td><code>{row.global}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ShowcaseStudio: React.FC = () => {
  const { brand, mode, resolvedMode, os, tokens, setBrand, setMode, setOS } = useTPTheme();

  const [activeTab, setActiveTab] = useState<StudioTabId>('omada-app');
  const [activeScreen, setActiveScreen] = useState<OmadaAppScreenId>('dashboard');
  const [phoneDevice, setPhoneDevice] =
    useState<NonNullable<TPPhoneFrameProps['device']>>('iphone16pro');

  const switchTopTab = (nextTab: StudioTabId) => {
    setActiveTab(nextTab);
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0 });
    }
  };

  const activeScreenMeta = useMemo(
    () => OMADA_SCREEN_META.find((s) => s.id === activeScreen) ?? OMADA_SCREEN_META[2],
    [activeScreen],
  );

  const screenshotItems = useMemo(
    () => OMADA_SCREEN_META.filter((item) => item.group === 'screenshot'),
    [],
  );
  const drilldownItems = useMemo(
    () => OMADA_SCREEN_META.filter((item) => item.group === 'drilldown'),
    [],
  );

  const handleApplyBrandFromLab = (
    nextBrand: TPBrand,
    nextMode: TPResolvedMode,
    nextOS: TPPlatformOS,
  ) => {
    setBrand(nextBrand);
    setMode(nextMode);
    setOS(nextOS);
    setPhoneDevice(nextOS === 'android' ? 'android' : 'iphone16pro');
    setActiveTab('omada-app');
  };

  return (
    <div className="studio-shell">
      <header className="studio-topbar">
        <div className="studio-brand">
          <TPBrandLogo name="tp-link" size={28} rounded={6} />
          <div className="studio-brand-text">
            <h1 className="studio-brand-title">TP-Mobile UI Kit</h1>
            <div className="studio-brand-subtitle">
              TP-Design 12-Mode Theme Engine × Omada APP V5.3
            </div>
          </div>
        </div>

        <nav className="studio-nav" aria-label="Showcase Studio Navigation">
          {(
            [
              { id: 'omada-app', label: 'Omada APP 实机还原' },
              { id: 'theme-lab', label: '6-Brand Theme Lab' },
              { id: 'core-kit', label: 'Core Components' },
              { id: 'assets-motion', label: 'Assets & Live PAG Motions' },
              { id: 'agent-skill', label: 'Agent Skill' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`studio-nav-tab ${isActive ? 'studio-nav-tab--active' : ''}`}
                onClick={() => switchTopTab(tab.id)}
              >
                {isActive && <span className="studio-nav-dot" aria-hidden="true" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="studio-topbar-meta">
          <span className="studio-status-pill">
            {tokens.figmaMode} • {resolvedMode.toUpperCase()} • {os.toUpperCase()}
          </span>
        </div>
      </header>

      <main className="studio-main">
        {activeTab === 'omada-app' && (
          <div className="studio-workbench">
            <aside className="studio-sidebar">
              <div className="studio-panel">
                <h3 className="studio-panel-title">Theme &amp; Platform Engine</h3>
                <div className="studio-control-group">
                  <div className="studio-control-row">
                    <span className="studio-control-label">Brand</span>
                    <div className="studio-segmented" role="group" aria-label="Brand Selector">
                      {TP_BRANDS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          className={`studio-seg-btn ${brand === b.id ? 'studio-seg-btn--active' : ''}`}
                          onClick={() => setBrand(b.id)}
                        >
                          <span className="studio-brand-swatch" style={{ background: b.accent }} />
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div className="studio-control-row">
                      <span className="studio-control-label">Mode</span>
                      <div className="studio-segmented" role="group" aria-label="Color Mode">
                        {(['dark', 'light'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            className={`studio-seg-btn ${mode === m ? 'studio-seg-btn--active' : ''}`}
                            onClick={() => setMode(m)}
                          >
                            {m === 'dark' ? 'Dark' : 'Light'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="studio-control-row">
                      <span className="studio-control-label">OS</span>
                      <div className="studio-segmented" role="group" aria-label="Platform OS">
                        {(['ios', 'android'] as const).map((platform) => (
                          <button
                            key={platform}
                            type="button"
                            className={`studio-seg-btn ${os === platform ? 'studio-seg-btn--active' : ''}`}
                            onClick={() => {
                              setOS(platform);
                              setPhoneDevice(platform === 'android' ? 'android' : 'iphone16pro');
                            }}
                          >
                            {platform === 'ios' ? 'iOS' : 'Android'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="studio-panel">
                <h3 className="studio-panel-title">7 Real-Device Screenshots (1:1)</h3>
                <div className="studio-screen-list">
                  {screenshotItems.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`studio-screen-btn ${activeScreen === item.id ? 'studio-screen-btn--active' : ''}`}
                      onClick={() => setActiveScreen(item.id)}
                    >
                      <span className="studio-screen-btn-main">
                        <span className="studio-screen-index">{idx + 1}</span>
                        <span className="studio-screen-name">{item.label}</span>
                      </span>
                      <span className="studio-screen-tag">{item.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="studio-panel">
                <h3 className="studio-panel-title">8 V5.3 Drill-Down &amp; Block Views</h3>
                <div className="studio-screen-list">
                  {drilldownItems.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`studio-screen-btn ${activeScreen === item.id ? 'studio-screen-btn--active' : ''}`}
                      onClick={() => setActiveScreen(item.id)}
                    >
                      <span className="studio-screen-btn-main">
                        <span className="studio-screen-index">{idx + 8}</span>
                        <span className="studio-screen-name">{item.label}</span>
                      </span>
                      <span className="studio-screen-tag">{item.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="studio-panel">
                <h3 className="studio-panel-title">
                  Active Screen: {activeScreenMeta.label}
                </h3>
                <p className="studio-info-desc">{activeScreenMeta.description}</p>
                <div className="studio-chip-wrap">
                  {activeScreenMeta.components.map((comp) => (
                    <span key={comp} className="studio-code-chip">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            <section className="studio-stage">
              <div className="studio-stage-bar">
                <span className="studio-stage-hint">
                  Interactive prototype — tap rows, headers, bottom tabs, Topology, or Network Toolkit FAB
                </span>
                <div className="studio-segmented" role="group" aria-label="Phone Frame Preset">
                  {(['iphone16pro', 'iphone14', 'android', 'compact'] as const).map((dev) => (
                    <button
                      key={dev}
                      type="button"
                      className={`studio-seg-btn ${phoneDevice === dev ? 'studio-seg-btn--active' : ''}`}
                      onClick={() => setPhoneDevice(dev)}
                    >
                      {dev}
                    </button>
                  ))}
                </div>
              </div>

              <TPToastProvider>
                <OmadaAppDemo
                  screen={activeScreen}
                  onScreenChange={setActiveScreen}
                  device={phoneDevice}
                />
              </TPToastProvider>
            </section>
          </div>
        )}

        {activeTab === 'theme-lab' && (
          <ThemeLabTab onApplyBrand={handleApplyBrandFromLab} />
        )}

        {activeTab === 'core-kit' && (
          <CoreKitTab
            phoneDevice={phoneDevice}
            onPhoneDeviceChange={setPhoneDevice}
          />
        )}

        {activeTab === 'assets-motion' && <AssetsMotionTab />}

        {activeTab === 'agent-skill' && <AgentSkillTab />}
      </main>
    </div>
  );
};

export const ShowcaseApp: React.FC = () => {
  return (
    <TPThemeProvider defaultBrand="omada" defaultMode="dark" defaultOS="ios">
      <TPToastProvider>
        <ShowcaseStudio />
      </TPToastProvider>
    </TPThemeProvider>
  );
};

export default ShowcaseApp;
