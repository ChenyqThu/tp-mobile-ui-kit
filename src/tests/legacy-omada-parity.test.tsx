import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TPThemeProvider } from '../theme';
import {
  TPButton,
  TPDatePicker,
  TPFixedButtonBar,
  TPHeader,
  TPInfoSheet,
  TPInput,
  TPLegendSheet,
  TPListItem,
  TPLoadMore,
  TPPageControl,
  TPSearchBar,
  TPSegment,
  TPSkeleton,
  TPTabBar,
  TPTag,
  TPTimePicker,
} from '../core';
import {
  OmadaAccessibilitySettingsPage,
  OmadaAppDemo,
  OmadaChartCard,
  OmadaClientListBlock,
  OmadaConfigFormPage,
  OmadaCustomOptionList,
  OmadaDeviceListBlock,
  OmadaFormRepeaterBlock,
  OmadaLanSettingsPage,
  OmadaPortDetailPage,
  OmadaPortPanelBlock,
  OmadaPortSelectorBlock,
  OmadaPrivacyPolicyPage,
  OmadaSidebarDrawer,
  OmadaSiteListBlock,
  OmadaStandardInput,
  OmadaVoucherPreviewCard,
  computeOmadaAxisScale,
} from '../omada';

describe('Legacy Omada APP Alignment & 8 Conflict Resolutions', () => {
  it('Conflict 2: TPTag supports rect 3px shape, xs size, soft/solid/outline, purple & indigo tones', () => {
    const { container } = render(
      <TPThemeProvider scoped defaultBrand="omada">
        <TPTag size="xs" shape="rect" appearance="solid" tone="purple">
          6 GHz
        </TPTag>
        <TPTag size="sm" shape="rect" appearance="outline" tone="indigo">
          Multi-Gig
        </TPTag>
      </TPThemeProvider>,
    );
    const tags = container.querySelectorAll('.tp-tag');
    expect(tags[0]).toHaveAttribute('data-shape', 'rect');
    expect(tags[0]).toHaveAttribute('data-appearance', 'solid');
    expect(tags[0]).toHaveAttribute('data-size', 'xs');
    expect(tags[0]).toHaveAttribute('data-tone', 'purple');
    expect(tags[1]).toHaveAttribute('data-appearance', 'outline');
    expect(tags[1]).toHaveAttribute('data-tone', 'indigo');
  });

  it('Conflict 3: TPButton supports alert-strong, in-card-alert, progress bar & TPFixedButtonBar triple layout', () => {
    const onTertiary = vi.fn();
    const { container } = render(
      <TPThemeProvider scoped defaultBrand="omada">
        <TPButton variant="alert-strong" size="lg" progress={65}>
          Deleting
        </TPButton>
        <TPButton variant="in-card-alert" size="sm">
          Unbind
        </TPButton>
        <TPFixedButtonBar
          layout="triple"
          primaryText="Apply"
          secondaryText="Save Draft"
          tertiaryText="Cancel"
          onTertiaryClick={onTertiary}
        />
      </TPThemeProvider>,
    );
    const strongBtn = container.querySelector('.tp-btn--alert-strong') as HTMLElement;
    expect(strongBtn).toBeTruthy();
    expect(strongBtn.getAttribute('data-size')).toBe('lg');
    expect(strongBtn.getAttribute('data-progress')).toBe('65');
    expect(strongBtn.querySelector('.tp-btn-progress')).toHaveStyle({ width: '65%' });
    expect(container.querySelector('.tp-btn--in-card-alert')).toBeTruthy();

    fireEvent.click(screen.getByText('Cancel'));
    expect(onTertiary).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.tp-fixed-btn-bar--triple')).toBeTruthy();
  });

  it('Conflict 5: TPHeader & TPTabBar preserve Liquid Glass on iOS and degrade to traditional chrome on Android', () => {
    const tabChange = vi.fn();
    const { container } = render(
      <div>
        <TPThemeProvider scoped defaultBrand="omada" defaultOS="ios">
          <TPHeader variant="floating" title="iOS Glass" />
          <TPHeader variant="large" title="Large Title" subtitle="Light weight" />
          <TPHeader
            variant="tabs"
            title="Analytics"
            tabs={[
              { key: 'a', label: 'WAN' },
              { key: 'b', label: 'LAN', badge: 2 },
            ]}
            activeTab="a"
            onTabChange={tabChange}
          />
          <TPTabBar
            variant="floating-pill"
            activeKey="d"
            onChange={() => {}}
            items={[{ key: 'd', label: 'Dash', icon: 'tabbar-dashboard-on' }]}
            fab={<span>+</span>}
          />
        </TPThemeProvider>

        <TPThemeProvider scoped defaultBrand="omada" defaultOS="android">
          <TPHeader variant="floating" title="Android Chrome" />
          <TPTabBar
            variant="floating-pill"
            activeKey="d"
            onChange={() => {}}
            items={[{ key: 'd', label: 'Dash', icon: 'tabbar-dashboard-on' }]}
            fab={<span>+</span>}
          />
        </TPThemeProvider>
      </div>,
    );

    const headers = container.querySelectorAll('.tp-header');
    expect(headers[0].getAttribute('data-variant')).toBe('floating');
    expect(headers[1].getAttribute('data-variant')).toBe('large');
    expect(headers[2].getAttribute('data-variant')).toBe('tabs');
    fireEvent.click(screen.getByText('LAN'));
    expect(tabChange).toHaveBeenCalledWith('b');

    expect(headers[3].getAttribute('data-variant')).toBe('standard');
    expect(headers[3].getAttribute('data-os')).toBe('android');

    const tabBars = container.querySelectorAll('.tp-tabbar');
    expect(tabBars[0].getAttribute('data-variant')).toBe('floating-pill');
    expect(tabBars[1].getAttribute('data-variant')).toBe('docked');
    expect(tabBars[1].querySelector('.tp-tabbar-android-fab')).toBeTruthy();
    expect(tabBars[1].querySelector('.tp-lg-backdrop')).toBeNull();
  });

  it('Conflict 6, 7 & 8: TPSegment segmented, TPSearchBar shape, TPListItem form-field, TPInput underline, TPSkeleton container shimmer', () => {
    const { container } = render(
      <TPThemeProvider scoped defaultBrand="omada">
        <TPSegment
          variant="segmented"
          value="a"
          onChange={() => {}}
          options={[
            { key: 'a', label: '24H' },
            { key: 'b', label: '7D' },
          ]}
        />
        <TPSearchBar shape="rounded" placeholder="Search IP" />
        <TPListItem layout="form-field" title="Gateway IP" value="192.168.0.1" error="Invalid subnet" />
        <TPInput variant="underline" label="SSID" defaultValue="Omada" maxLength={32} showCount />
        <TPSkeleton variant="card" animated />
        <TPSkeleton variant="text" lines={3} animated />
      </TPThemeProvider>,
    );

    expect(container.querySelector('.tp-segment--segmented')).toBeTruthy();
    expect(container.querySelector('.tp-search-bar--shape-rounded')).toBeTruthy();
    expect(container.querySelector('.tp-list-item--form-field .tp-list-item-form-value')).toHaveTextContent('192.168.0.1');
    expect(container.querySelector('.tp-input-box--variant-underline')).toBeTruthy();
    expect(screen.getByText('5/32')).toBeInTheDocument();

    const skelCard = container.querySelector('.tp-skeleton-card');
    expect(skelCard).toHaveClass('tp-skeleton--animated');
    expect(skelCard?.querySelectorAll('.tp-skeleton-item--animated')).toHaveLength(0);
    expect(container.querySelector('.tp-skeleton-text-group')).toHaveClass('tp-skeleton--animated');
  });

  it('New Core primitives: TPPageControl process, TPDatePicker range, TPTimePicker 12h, TPLoadMore, TPInfoSheet & TPLegendSheet', () => {
    const onLoadMore = vi.fn();
    const onRangeConfirm = vi.fn();
    const { container } = render(
      <TPThemeProvider scoped defaultBrand="omada">
        <TPPageControl total={4} current={2} variant="process" />
        <TPDatePicker mode="range" onRangeConfirm={onRangeConfirm} title="Select Period" />
        <TPTimePicker format="12h" />
        <TPLoadMore status="idle" onLoadMore={onLoadMore} />
        <TPLoadMore status="no-more" noMoreText="End of logs" />
        <TPInfoSheet open title="About PoE" bullets={['Supports 802.3at']} onClose={() => {}} />
        <TPLegendSheet open title="Speed Key" items={[{ key: '1g', label: '1 Gbps' }]} onClose={() => {}} />
      </TPThemeProvider>,
    );

    expect(container.querySelectorAll('.tp-page-control-bar--active')).toHaveLength(3);
    fireEvent.click(screen.getByText('Confirm'));
    expect(onRangeConfirm).toHaveBeenCalledWith(['2026-01-01', '2026-01-07']);
    expect(container.querySelector('.tp-time-picker')).toHaveAttribute('data-format', '12h');

    fireEvent.click(screen.getByText('Load more'));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    expect(screen.getByText('End of logs')).toBeInTheDocument();
    expect(screen.getByText('Supports 802.3at')).toBeInTheDocument();
    expect(screen.getByText('1 Gbps')).toBeInTheDocument();
  });

  it('P0 Omada blocks: axis scale, ChartCard, dual-row PortPanel, PortSelector LAG, StandardInput structured modes, FormRepeater', () => {
    const zeroScale = computeOmadaAxisScale([0, 0, 0]);
    expect(zeroScale.min).toBe(0);
    expect(zeroScale.max).toBeGreaterThan(0);

    const dbmScale = computeOmadaAxisScale([-85, -62, -40]);
    expect(dbmScale.min).toBeLessThanOrEqual(-85);
    expect(dbmScale.max).toBeGreaterThanOrEqual(-40);

    const { container } = render(
      <TPThemeProvider scoped defaultBrand="omada">
        <OmadaChartCard
          title="RSSI Distribution"
          type="bar"
          unit="dBm"
          labels={['AP1', 'AP2']}
          series={[{ key: 'rssi', label: 'Signal', values: [-72, -48] }]}
          secondarySeries={[{ key: 'clients', label: 'Clients', values: [12, 24] }]}
        />
        <OmadaChartCard title="Empty Telemetry" empty series={[]} />
        <OmadaPortPanelBlock layout="dual-row" />
        <OmadaPortSelectorBlock mode="lag" defaultValue={['lan5']} />
        <OmadaStandardInput type="cidr" label="Subnet" defaultValue="192.168.0.1/99" />
        <OmadaStandardInput type="ip-range" label="Pool" defaultValue="192.168.0.200 - 192.168.0.100" />
        <OmadaStandardInput type="ip-port" label="Syslog" defaultValue="10.0.0.5:514" />
        <OmadaStandardInput type="time-range" label="Window" defaultValue="09:00 - 18:00" />
        <OmadaFormRepeaterBlock title="DNS" defaultItems={[{ id: '1', value: '1.1.1.1' }]} />
        <OmadaCustomOptionList
          options={[{ value: 'auto', label: 'Auto' }]}
          defaultValue="custom-val"
        />
      </TPThemeProvider>,
    );

    expect(screen.getByText('No Chart Data')).toBeInTheDocument();
    expect(container.querySelector('.tp-omada-chassis-dual')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Port Legend'));
    expect(screen.getByText('Port Color & Status Legend')).toBeInTheDocument();
    expect(screen.getByText(/Select at least 2 ports for LAG1/)).toBeInTheDocument();
    expect(screen.getByText('CIDR prefix must be between 0 and 32')).toBeInTheDocument();
    expect(screen.getByText('Start IP must not exceed End IP')).toBeInTheDocument();
    fireEvent.click(screen.getByText('+ Add Entry'));
    expect(container.querySelectorAll('.tp-omada-repeater-row')).toHaveLength(2);
  });

  it('P1 & P2 Omada blocks/pages: Device metrics & Display Options, Site/Client lists, Drawer, Dirty-alert FormPage, LAN/Port/A11y/Privacy/Voucher & Android OmadaAppDemo', () => {
    const onBack = vi.fn();
    const { container } = render(
      <TPThemeProvider scoped defaultBrand="omada" defaultOS="android">
        <OmadaDeviceListBlock
          showDisplayOptions
          selectable="multi"
          secondaryMetric="cpu-mem"
          devices={[
            {
              id: 'd1',
              mac: 'AA-BB-CC-DD-EE-FF',
              model: 'SG3428X',
              type: 'switch',
              status: 'adopting',
              ip: '192.168.0.5',
              healthLabel: 'Warn-7',
              cpuPct: 18,
              memoryPct: 45,
            },
          ]}
        />
        <OmadaSiteListBlock />
        <OmadaClientListBlock />
        <OmadaSidebarDrawer open onClose={() => {}} />
        <OmadaConfigFormPage title="Edit Rule" dirty onBack={onBack} onSave={() => {}}>
          <span>Form Content</span>
        </OmadaConfigFormPage>
        <OmadaLanSettingsPage />
        <OmadaPortDetailPage />
        <OmadaAccessibilitySettingsPage />
        <OmadaPrivacyPolicyPage />
        <OmadaVoucherPreviewCard code="VIP-9000-1234" />
        <OmadaAppDemo initialScreen="dashboard" showFrame={false} />
      </TPThemeProvider>,
    );

    expect(screen.getByText('CPU 18% · MEM 45%')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Display Options'));
    expect(screen.getByText('Choose secondary metric and device thumbnail size')).toBeInTheDocument();

    expect(screen.getByTestId('omada-site-list-block')).toBeInTheDocument();
    expect(screen.getByTestId('omada-client-list-block')).toBeInTheDocument();
    expect(screen.getByTestId('omada-sidebar-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('omada-lan-settings-page')).toBeInTheDocument();
    expect(screen.getByTestId('omada-port-detail-page')).toBeInTheDocument();
    expect(screen.getByTestId('omada-accessibility-settings-page')).toBeInTheDocument();
    expect(screen.getByTestId('omada-privacy-policy-page')).toBeInTheDocument();
    expect(screen.getByText('VIP-9000-1234')).toBeInTheDocument();

    // Dirty ConfigFormPage confirms before discarding
    fireEvent.click(container.querySelector('[data-testid="omada-config-form-page"] [aria-label="Back"]') as HTMLElement);
    expect(screen.getByText('Discard Changes?')).toBeInTheDocument();

    // Android OmadaAppDemo uses solid traditional FAB and docked TPTabBar
    expect(container.querySelector('.tp-omada-fab--android')).toBeTruthy();
    expect(container.querySelector('.tp-phone-frame .tp-tabbar--docked')).toBeTruthy();
  });
});
