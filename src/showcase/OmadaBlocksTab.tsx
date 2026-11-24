import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TP_BRANDS, useTPTheme } from '../theme';
import {
  TPButton,
  TPHeader,
  TPIconButton,
  TPPhoneFrame,
  TPStatusBar,
  TPTag,
  useTPToast,
  type TPPhoneFrameProps,
} from '../core';
import {
  DEFAULT_OMADA_CLIENT_LIST,
  DEFAULT_OMADA_DEVICES,
  DEFAULT_OMADA_PORTS,
  OmadaChartCard,
  OmadaClientListBlock,
  OmadaCustomOptionList,
  OmadaDeviceListBlock,
  OmadaFirmwareUpdateBlock,
  OmadaFormRepeaterBlock,
  OmadaIncidentsBlock,
  OmadaPortPanelBlock,
  OmadaPortSelectorBlock,
  OmadaScheduleBlock,
  OmadaSidebarDrawer,
  OmadaSiteListBlock,
  OmadaStandardInput,
  OmadaTopologyBlock,
  OmadaVoucherPreviewCard,
  OmadaWirelessNetworkBlock,
  type OmadaChartSeries,
  type OmadaChartType,
  type OmadaClientListItem,
  type OmadaDeviceRecord,
  type OmadaFormRepeaterItem,
  type OmadaHardwarePort,
  type OmadaPortSelectorMode,
  type OmadaVoucherStatus,
} from '../omada';

type OmadaBlockCategoryId =
  | 'all'
  | 'charts'
  | 'ports'
  | 'forms'
  | 'lists-drawer'
  | 'workflows';

type ChartDatasetPreset = 'dual-axis' | 'rssi-dbm';
type InputGroupMode = 'network' | 'classic';
type WorkflowBlockId = 'topology' | 'incidents' | 'schedule' | 'firmware' | 'wireless';

const OMADA_BLOCK_CATEGORIES: readonly {
  id: OmadaBlockCategoryId;
  label: string;
  countLabel: string;
}[] = [
  { id: 'all', label: 'All Omada Blocks & Kit', countLabel: '16' },
  { id: 'charts', label: 'Charts & Telemetry', countLabel: '1' },
  { id: 'ports', label: 'Ports & Hardware', countLabel: '3' },
  { id: 'forms', label: 'Inputs & Dynamic Forms', countLabel: '3' },
  { id: 'lists-drawer', label: 'Lists, Drawer & Voucher', countLabel: '5' },
  { id: 'workflows', label: 'V5.3 Workflow Blocks', countLabel: '5' },
];

const CHART_TYPES: readonly OmadaChartType[] = [
  'line',
  'area',
  'bar',
  'stacked-bar',
  'donut',
  'speed-bar',
];

const SHOWCASE_PORTS_10_SPEEDS: readonly OmadaHardwarePort[] = [
  ...DEFAULT_OMADA_PORTS.slice(0, 6),
  {
    id: 'lan9',
    label: 'LAN9',
    portNumber: 7,
    media: 'rj45',
    speed: '5G',
    badges: ['lag'],
    lagGroup: 'LAG1',
    vlanProfile: 'Trunk (1,10)',
    rxBytes: '9.4 GB',
    txBytes: '5.2 GB',
  },
  {
    id: 'qsfp1',
    label: 'QSFP1',
    portNumber: 11,
    media: 'sfp',
    speed: '25G',
    badges: ['sfp-plus', 'uplink'],
    vlanProfile: 'Core Uplink',
    rxBytes: '412 GB',
    txBytes: '390 GB',
  },
  {
    id: 'qsfp2',
    label: 'QSFP2',
    portNumber: 12,
    media: 'sfp',
    speed: '40G',
    badges: ['stack'],
    vlanProfile: 'Stack Peer',
    rxBytes: '1.2 TB',
    txBytes: '1.1 TB',
  },
  {
    id: 'qsfp3',
    label: '100G',
    portNumber: 13,
    media: 'sfp',
    speed: '100G',
    badges: ['sfp-plus'],
    vlanProfile: 'Spine Link',
    rxBytes: '4.8 TB',
    txBytes: '4.4 TB',
  },
  {
    id: 'lan10',
    label: 'LAN10',
    portNumber: 8,
    media: 'rj45',
    speed: 'Disabled',
    badges: ['disabled'],
    vlanProfile: 'Unused',
    rxBytes: '0 B',
    txBytes: '0 B',
  },
  DEFAULT_OMADA_PORTS[7],
  DEFAULT_OMADA_PORTS[6],
];

const SHOWCASE_EXTENDED_DEVICES: readonly OmadaDeviceRecord[] = [
  ...DEFAULT_OMADA_DEVICES,
  {
    id: 'dev-sw-adopting',
    mac: 'B0-BE-76-18-92-4A',
    name: 'Core-SG3428XMP',
    model: 'SG3428XMP',
    type: 'switch',
    status: 'adopting',
    ip: '192.168.0.10',
    healthLabel: 'Adopting',
    healthTone: 'warn',
    firmwareVersion: 'v3.20.4',
    uptime: '12m',
    cpuPct: 48,
    memoryPct: 62,
    clientsCount: 14,
    trafficRate: '620 Mbps',
  },
  {
    id: 'dev-ap-isolated',
    mac: '50-91-E3-44-11-C8',
    name: 'Warehouse-AP-North',
    model: 'EAP670',
    type: 'ap',
    status: 'isolated',
    ip: '192.168.0.44',
    healthLabel: 'Isolated',
    healthTone: 'alert',
    firmwareVersion: 'v1.0.9',
    uptime: '3d 02h',
    cpuPct: 12,
    memoryPct: 35,
    clientsCount: 0,
    trafficRate: '0 Mbps',
  },
  {
    id: 'dev-ap-hb',
    mac: '98-DA-C4-7E-20-19',
    name: 'Patio-Mesh-EAP650',
    model: 'EAP650-Outdoor',
    type: 'ap',
    status: 'heartbeat-missed',
    ip: '192.168.0.51',
    healthLabel: 'Heartbeat Missed',
    healthTone: 'warn',
    firmwareVersion: 'v1.1.4',
    uptime: '9d 17h',
    cpuPct: 9,
    memoryPct: 44,
    clientsCount: 3,
    trafficRate: '18 Mbps',
  },
];

export interface OmadaBlocksTabProps {
  phoneDevice: NonNullable<TPPhoneFrameProps['device']>;
  onPhoneDeviceChange: (device: NonNullable<TPPhoneFrameProps['device']>) => void;
}

/**
 * Interactive Workbench showcasing Omada v5.3-6.3 Components, Blocks, and Workflow Modules inside `TPPhoneFrame`.
 */
export const OmadaBlocksTab: React.FC<OmadaBlocksTabProps> = ({
  phoneDevice,
  onPhoneDeviceChange,
}) => {
  const {
    brand,
    mode,
    os,
    highContrast,
    fontScale,
    tokens,
    setBrand,
    setMode,
    setOS,
    setHighContrast,
    setFontScale,
  } = useTPTheme();
  const toast = useTPToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const [category, setCategory] = useState<OmadaBlockCategoryId>('all');

  useEffect(() => {
    const body = previewRef.current?.closest('.tp-phone-body');
    if (body) body.scrollTop = 0;
  }, [category]);

  // Charts state
  const [chartType, setChartType] = useState<OmadaChartType>('line');
  const [chartPreset, setChartPreset] = useState<ChartDatasetPreset>('dual-axis');
  const [chartLoading, setChartLoading] = useState(false);
  const [chartEmpty, setChartEmpty] = useState(false);
  const [chartRange, setChartRange] = useState('24h');

  // Ports & Hardware state
  const [portLayout, setPortLayout] = useState<'single-row' | 'dual-row'>('dual-row');
  const [selectorMode, setSelectorMode] = useState<OmadaPortSelectorMode>('lag');
  const [selectedPortIds, setSelectedPortIds] = useState<string[]>(['wan3', 'sfp1']);

  // Forms & Inputs state
  const [inputGroup, setInputGroup] = useState<InputGroupMode>('network');
  const [cidrVal, setCidrVal] = useState('192.168.10.0/24');
  const [ipRangeVal, setIpRangeVal] = useState('192.168.10.100-192.168.10.200');
  const [ipPortVal, setIpPortVal] = useState('192.168.0.1:8043');
  const [timeRangeVal, setTimeRangeVal] = useState('08:30-18:00');
  const [stdIp, setStdIp] = useState('192.168.0.1');
  const [stdMac, setStdMac] = useState('8C-86-DD-A6-A7-5F');
  const [stdPort, setStdPort] = useState('443');
  const [stdHostname, setStdHostname] = useState('omada-core-gw');
  const [repeaterItems, setRepeaterItems] = useState<OmadaFormRepeaterItem[]>([
    { id: 'opt-66', keyLabel: '66', value: '192.168.0.50' },
    { id: 'opt-138', keyLabel: '138', value: '192.168.0.10' },
  ]);
  const [dnsMode, setDnsMode] = useState('auto');

  // Lists, Drawer & Voucher state
  const [devicesGrouped, setDevicesGrouped] = useState(false);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>(['dev-gw-1']);
  const [clientItems, setClientItems] = useState<OmadaClientListItem[]>(() => [
    ...DEFAULT_OMADA_CLIENT_LIST,
  ]);
  const [activeSiteId, setActiveSiteId] = useState('site-default');
  const [voucherStatus, setVoucherStatus] = useState<OmadaVoucherStatus>('valid');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // V5.3 Workflow switcher state
  const [workflowTab, setWorkflowTab] = useState<WorkflowBlockId>('topology');

  const showSection = (id: Exclude<OmadaBlockCategoryId, 'all'>) =>
    category === 'all' || category === id;

  const chartSeries: readonly OmadaChartSeries[] = useMemo(() => {
    if (chartPreset === 'rssi-dbm') {
      return [
        { key: 'ap1', label: 'EAP723-Lobby', values: [-44, -46, -49, -52, -48, -45] },
        { key: 'ap2', label: 'EAP723-Hall', values: [-58, -62, -66, -61, -59, -57] },
      ];
    }
    return [
      { key: 'rx', label: 'Download', values: [320, 480, 610, 540, 790, 680] },
      { key: 'tx', label: 'Upload', values: [110, 145, 220, 190, 260, 215] },
    ];
  }, [chartPreset]);

  const secondarySeries: readonly OmadaChartSeries[] | undefined = useMemo(() => {
    if (chartPreset !== 'dual-axis' || chartType === 'donut' || chartType === 'stacked-bar') {
      return undefined;
    }
    return [{ key: 'util', label: 'CPU %', color: '#FF8C27', values: [18, 24, 38, 31, 46, 39] }];
  }, [chartPreset, chartType]);

  return (
    <div className="studio-workbench" data-testid="omada-blocks-tab">
      <aside className="studio-sidebar">
        <div className="studio-panel">
          <h3 className="studio-panel-title">Omada Block Categories</h3>
          <div className="studio-screen-list">
            {OMADA_BLOCK_CATEGORIES.map((cat, idx) => (
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
              </div>
              <div className="studio-control-row">
                <span className="studio-control-label">OS</span>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="studio-control-row">
                <span className="studio-control-label">Contrast</span>
                <div className="studio-segmented">
                  {([false, true] as const).map((hc) => (
                    <button
                      key={String(hc)}
                      type="button"
                      className={`studio-seg-btn ${highContrast === hc ? 'studio-seg-btn--active' : ''}`}
                      onClick={() => setHighContrast(hc)}
                    >
                      {hc ? 'High' : 'Normal'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="studio-control-row">
                <span className="studio-control-label">Font Scale</span>
                <div className="studio-segmented">
                  {([1, 1.4] as const).map((fs) => (
                    <button
                      key={fs}
                      type="button"
                      className={`studio-seg-btn ${Math.abs(fontScale - fs) < 0.1 ? 'studio-seg-btn--active' : ''}`}
                      onClick={() => setFontScale(fs)}
                    >
                      {fs === 1 ? '100%' : '140%'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="studio-panel">
          <h3 className="studio-panel-title">Omada APP Parity Inventory</h3>
          <p className="studio-info-desc">
            Full 3-layer Omada APP system mapped from Figma <code>商用APP组件库</code>:
          </p>
          <div className="studio-chip-wrap">
            <span className="studio-code-chip">OmadaStandardInput (8 types)</span>
            <span className="studio-code-chip">16 Omada Blocks</span>
            <span className="studio-code-chip">15 Omada Pages (21 views)</span>
            <span className="studio-code-chip">10 Port Speeds • 17 Badges</span>
          </div>
        </div>
      </aside>

      <section className="studio-stage">
        <div className="studio-stage-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <TPButton variant="tonal" size="sm" onClick={() => setDrawerOpen(true)}>
              Open Sidebar Drawer
            </TPButton>
            <span className="studio-stage-hint">
              Interactive Omada Blocks inside <code>TPPhoneFrame</code> ({phoneDevice})
            </span>
          </div>
          <div className="studio-segmented" role="group" aria-label="Phone Frame Preset">
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
        >
          <TPHeader
            variant="standard"
            title="Omada Blocks"
            subtitle={`${tokens.figmaMode} • ${os.toUpperCase()}`}
            right={
              <TPIconButton
                variant="tonal"
                size="sm"
                icon="nav-more"
                ariaLabel="Open Omada Sidebar Drawer"
                onClick={() => setDrawerOpen(true)}
              />
            }
          />

          <div ref={previewRef} className="studio-core-preview">
            {showSection('charts') && (
              <div className="studio-core-section">
                <div className="studio-core-section-head">
                  <h4 className="studio-core-section-title">OmadaChartCard (6 Chart Types)</h4>
                  <span className="studio-core-section-badge">{chartType}</span>
                </div>
                <div className="studio-flex-wrap">
                  {CHART_TYPES.map((ct) => (
                    <TPTag
                      key={ct}
                      size="sm"
                      selected={chartType === ct}
                      onClick={() => {
                        setChartType(ct);
                        if ((ct === 'donut' || ct === 'stacked-bar') && chartPreset === 'rssi-dbm') {
                          setChartPreset('dual-axis');
                        }
                      }}
                    >
                      {ct}
                    </TPTag>
                  ))}
                </div>
                <div className="studio-flex-wrap">
                  <TPTag
                    size="sm"
                    tone="info"
                    selected={chartPreset === 'dual-axis'}
                    onClick={() => setChartPreset('dual-axis')}
                  >
                    Dual-Axis Mbps/%
                  </TPTag>
                  <TPTag
                    size="sm"
                    tone="purple"
                    selected={chartPreset === 'rssi-dbm'}
                    onClick={() => {
                      setChartPreset('rssi-dbm');
                      if (chartType === 'donut' || chartType === 'stacked-bar') {
                        setChartType('line');
                      }
                    }}
                  >
                    Negative dBm RSSI
                  </TPTag>
                  <TPTag
                    size="sm"
                    tone="warning"
                    selected={chartLoading}
                    onClick={() => setChartLoading((p) => !p)}
                  >
                    loading: {chartLoading ? 'on' : 'off'}
                  </TPTag>
                  <TPTag
                    size="sm"
                    tone="alert"
                    selected={chartEmpty}
                    onClick={() => setChartEmpty((p) => !p)}
                  >
                    empty: {chartEmpty ? 'on' : 'off'}
                  </TPTag>
                </div>
                <OmadaChartCard
                  title={chartPreset === 'rssi-dbm' ? 'Wi-Fi Signal Strength' : 'Gateway Throughput'}
                  subtitle={chartPreset === 'rssi-dbm' ? 'AP average RSSI (-dBm)' : 'WAN3 traffic & CPU load'}
                  type={chartType}
                  labels={['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']}
                  series={chartSeries}
                  secondarySeries={secondarySeries}
                  unit={chartPreset === 'rssi-dbm' ? 'dBm' : 'Mbps'}
                  secondaryUnit="%"
                  loading={chartLoading}
                  empty={chartEmpty}
                  timeRanges={[
                    { key: '24h', label: '24H' },
                    { key: '7d', label: '7D' },
                    { key: '30d', label: '30D' },
                  ]}
                  activeTimeRange={chartRange}
                  onTimeRangeChange={setChartRange}
                />
              </div>
            )}

            {showSection('ports') && (
              <>
                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">OmadaPortPanelBlock &amp; LegendSheet</h4>
                    <div className="studio-flex-wrap">
                      {(['single-row', 'dual-row'] as const).map((lay) => (
                        <TPTag
                          key={lay}
                          size="sm"
                          selected={portLayout === lay}
                          onClick={() => setPortLayout(lay)}
                        >
                          {lay}
                        </TPTag>
                      ))}
                    </div>
                  </div>
                  <OmadaPortPanelBlock
                    deviceModel="SG3428XMP · 10 Speeds"
                    layout={portLayout}
                    ports={SHOWCASE_PORTS_10_SPEEDS}
                    showHeader={false}
                    showLegendButton
                  />
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">OmadaPortSelectorBlock</h4>
                    <span className="studio-core-section-badge">
                      {selectorMode} ({selectedPortIds.length})
                    </span>
                  </div>
                  <div className="studio-flex-wrap">
                    {(['select', 'icon-select', 'lag'] as const).map((m) => (
                      <TPTag
                        key={m}
                        size="sm"
                        selected={selectorMode === m}
                        onClick={() => setSelectorMode(m)}
                      >
                        {m}
                      </TPTag>
                    ))}
                  </div>
                  <OmadaPortSelectorBlock
                    title={
                      selectorMode === 'lag'
                        ? 'LAG1 Port Bonding (Tap ports to test mismatch)'
                        : 'Select Switch Ports'
                    }
                    mode={selectorMode}
                    value={selectedPortIds}
                    onChange={setSelectedPortIds}
                  />
                </div>
              </>
            )}

            {showSection('forms') && (
              <>
                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">OmadaStandardInput (8 Types)</h4>
                    <div className="studio-flex-wrap">
                      <TPTag
                        size="sm"
                        selected={inputGroup === 'network'}
                        onClick={() => setInputGroup('network')}
                      >
                        CIDR / Range / Time
                      </TPTag>
                      <TPTag
                        size="sm"
                        selected={inputGroup === 'classic'}
                        onClick={() => setInputGroup('classic')}
                      >
                        IP / MAC / Port / Text
                      </TPTag>
                    </div>
                  </div>
                  {inputGroup === 'network' ? (
                    <>
                      <OmadaStandardInput
                        type="cidr"
                        label="Subnet CIDR"
                        value={cidrVal}
                        onChange={setCidrVal}
                      />
                      <OmadaStandardInput
                        type="ip-range"
                        label="DHCP Pool Range"
                        value={ipRangeVal}
                        onChange={setIpRangeVal}
                      />
                      <OmadaStandardInput
                        type="ip-port"
                        label="RADIUS Server (IP:Port)"
                        value={ipPortVal}
                        onChange={setIpPortVal}
                      />
                      <OmadaStandardInput
                        type="time-range"
                        label="Access Window"
                        value={timeRangeVal}
                        onChange={setTimeRangeVal}
                      />
                    </>
                  ) : (
                    <>
                      <OmadaStandardInput
                        type="ip"
                        label="Gateway IPv4"
                        value={stdIp}
                        onChange={setStdIp}
                      />
                      <OmadaStandardInput
                        type="mac"
                        label="Device MAC"
                        value={stdMac}
                        onChange={setStdMac}
                      />
                      <OmadaStandardInput
                        type="port"
                        label="Management Port"
                        value={stdPort}
                        onChange={setStdPort}
                      />
                      <OmadaStandardInput
                        type="text"
                        label="Hostname"
                        value={stdHostname}
                        onChange={setStdHostname}
                      />
                    </>
                  )}
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">
                      OmadaFormRepeaterBlock &amp; CustomOptionList
                    </h4>
                  </div>
                  <OmadaFormRepeaterBlock
                    title="DHCP Options"
                    keyLabel="Code"
                    keyPlaceholder="e.g. 66"
                    valueLabel="Value"
                    valuePlaceholder="IP or ASCII string"
                    addText="Add Option"
                    items={repeaterItems}
                    onChange={setRepeaterItems}
                  />
                  <OmadaCustomOptionList
                    title="DNS Server Mode"
                    value={dnsMode}
                    onChange={setDnsMode}
                    customPlaceholder="e.g. 1.1.1.1"
                    options={[
                      { value: 'auto', label: 'Auto (From ISP)', description: 'Obtain DNS via WAN DHCP' },
                      { value: 'google', label: 'Google DNS', description: '8.8.8.8 / 8.8.4.4' },
                    ]}
                  />
                </div>
              </>
            )}

            {showSection('lists-drawer') && (
              <>
                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">
                      OmadaDeviceListBlock (6 Statuses + Display Options)
                    </h4>
                    <TPTag
                      size="sm"
                      selected={devicesGrouped}
                      onClick={() => setDevicesGrouped((p) => !p)}
                    >
                      grouped: {devicesGrouped ? 'on' : 'off'}
                    </TPTag>
                  </div>
                  <OmadaDeviceListBlock
                    devices={SHOWCASE_EXTENDED_DEVICES}
                    grouped={devicesGrouped}
                    showDisplayOptions
                    selectable="multi"
                    selectedIds={selectedDeviceIds}
                    onSelectionChange={setSelectedDeviceIds}
                  />
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">
                      OmadaClientListBlock (Dark Icons + Quick Block)
                    </h4>
                  </div>
                  <OmadaClientListBlock
                    clients={clientItems}
                    onToggleBlock={(client) => {
                      const nextStatus = client.status === 'blocked' ? 'online' : 'blocked';
                      setClientItems((prev) =>
                        prev.map((c) => (c.id === client.id ? { ...c, status: nextStatus } : c)),
                      );
                      toast.show({
                        type: nextStatus === 'blocked' ? 'warning' : 'success',
                        message: `${client.name} -> ${nextStatus}`,
                      });
                    }}
                  />
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">OmadaSiteListBlock</h4>
                  </div>
                  <OmadaSiteListBlock
                    activeSiteId={activeSiteId}
                    onSelectSite={(site) => {
                      setActiveSiteId(site.id);
                      toast.show({ type: 'info', message: `Switched site: ${site.name}` });
                    }}
                  />
                </div>

                <div className="studio-core-section">
                  <div className="studio-core-section-head">
                    <h4 className="studio-core-section-title">
                      OmadaVoucherPreviewCard &amp; SidebarDrawer
                    </h4>
                  </div>
                  <div className="studio-flex-wrap">
                    {(['valid', 'in-use', 'expired'] as const).map((st) => (
                      <TPTag
                        key={st}
                        size="sm"
                        selected={voucherStatus === st}
                        onClick={() => setVoucherStatus(st)}
                      >
                        {st}
                      </TPTag>
                    ))}
                    <TPButton variant="secondary" size="sm" onClick={() => setDrawerOpen(true)}>
                      Open SidebarDrawer
                    </TPButton>
                  </div>
                  <OmadaVoucherPreviewCard
                    code="OMADA-8842-9104"
                    status={voucherStatus}
                    notes="VIP Visitor Lounge · Bandwidth profile Gold"
                    onCopy={(code) =>
                      toast.show({ type: 'success', message: `Copied voucher: ${code}` })
                    }
                  />
                </div>
              </>
            )}

            {showSection('workflows') && (
              <div className="studio-core-section">
                <div className="studio-core-section-head">
                  <h4 className="studio-core-section-title">V5.3 Functional Workflow Blocks</h4>
                  <span className="studio-core-section-badge">{workflowTab}</span>
                </div>
                <div className="studio-flex-wrap">
                  {(
                    [
                      { id: 'topology', label: 'Topology' },
                      { id: 'incidents', label: 'Incidents' },
                      { id: 'schedule', label: 'Schedule' },
                      { id: 'firmware', label: 'Firmware' },
                      { id: 'wireless', label: 'Wireless Config' },
                    ] as const
                  ).map((item) => (
                    <TPTag
                      key={item.id}
                      size="sm"
                      selected={workflowTab === item.id}
                      onClick={() => setWorkflowTab(item.id)}
                    >
                      {item.label}
                    </TPTag>
                  ))}
                </div>
                {workflowTab === 'topology' && <OmadaTopologyBlock showHeader={false} />}
                {workflowTab === 'incidents' && <OmadaIncidentsBlock showHeader={false} />}
                {workflowTab === 'schedule' && <OmadaScheduleBlock showHeader={false} />}
                {workflowTab === 'firmware' && <OmadaFirmwareUpdateBlock showHeader={false} />}
                {workflowTab === 'wireless' && <OmadaWirelessNetworkBlock showHeader={false} />}
              </div>
            )}
          </div>

          <OmadaSidebarDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            controllerName="Omada Cloud Controller"
            siteName="HQ Campus — Bldg 2"
            activeKey="sites"
            onSelectItem={(key) => {
              toast.show({ type: 'info', message: `Drawer selected: ${key}` });
              setDrawerOpen(false);
            }}
            onSwitchSite={() => toast.show({ type: 'info', message: 'Site switcher triggered' })}
          />
        </TPPhoneFrame>
      </section>
    </div>
  );
};

export default OmadaBlocksTab;
