import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TPThemeProvider } from '../theme';
import { OmadaStandardInput } from '../omada/components/OmadaStandardInput';
import { OmadaDeviceListBlock } from '../omada/blocks/OmadaDeviceListBlock';
import { OmadaWirelessNetworkBlock } from '../omada/blocks/OmadaWirelessNetworkBlock';
import { OmadaIncidentsBlock } from '../omada/blocks/OmadaIncidentsBlock';
import { OmadaLaunchLoadingPage } from '../omada/pages/OmadaLaunchLoadingPage';
import { OmadaControllerListPage } from '../omada/pages/OmadaControllerListPage';
import { OmadaSiteDashboardPage } from '../omada/pages/OmadaSiteDashboardPage';
import { OmadaSiteInsightsPage } from '../omada/pages/OmadaSiteInsightsPage';
import { OmadaSiteDevicesPage } from '../omada/pages/OmadaSiteDevicesPage';
import { OmadaSiteClientsPage } from '../omada/pages/OmadaSiteClientsPage';
import { OmadaSiteSettingsPage } from '../omada/pages/OmadaSiteSettingsPage';
import { OmadaHealthDetailPage } from '../omada/pages/OmadaHealthDetailPage';
import { OmadaDeviceDetailPage } from '../omada/pages/OmadaDeviceDetailPage';
import { OmadaAppDemo } from '../omada/pages/OmadaAppDemo';

function renderOmada(ui: React.ReactElement, mode: 'dark' | 'light' = 'dark') {
  return render(
    <TPThemeProvider brand="omada" mode={mode} scoped>
      {ui}
    </TPThemeProvider>,
  );
}

describe('OmadaStandardInput', () => {
  it('renders 4 IPv4 octet boxes and validates 0-255 bounds', () => {
    const onChange = vi.fn();
    renderOmada(<OmadaStandardInput type="ip" label="Gateway IP" value="192.168.0.1" onChange={onChange} />);

    const octet1 = screen.getByLabelText('Gateway IP octet 1') as HTMLInputElement;
    const octet4 = screen.getByLabelText('Gateway IP octet 4') as HTMLInputElement;
    expect(octet1.value).toBe('192');
    expect(octet4.value).toBe('1');

    fireEvent.change(octet4, { target: { value: '300' } });
    expect(onChange).toHaveBeenCalledWith('192.168.0.300');

    // Re-render with invalid octet to verify built-in error display
    renderOmada(<OmadaStandardInput type="ip" label="Bad IP" value="192.168.0.300" />);
    expect(screen.getByRole('alert')).toHaveTextContent('0 and 255');
  });

  it('renders 6 MAC hex-pair boxes, uppercases input, and auto-advances on 2 hex chars', () => {
    const onChange = vi.fn();
    renderOmada(<OmadaStandardInput type="mac" label="Device MAC" defaultValue="8C-86-DD-A6-A7-5F" onChange={onChange} />);

    const byte1 = screen.getByLabelText('Device MAC byte 1') as HTMLInputElement;
    const byte2 = screen.getByLabelText('Device MAC byte 2') as HTMLInputElement;
    expect(byte1.value).toBe('8C');
    expect(byte2.value).toBe('86');

    fireEvent.change(byte1, { target: { value: 'ab' } });
    expect(onChange).toHaveBeenCalledWith('AB-86-DD-A6-A7-5F');
    expect(document.activeElement).toBe(byte2);
  });

  it('validates port number range 1-65535', () => {
    renderOmada(<OmadaStandardInput type="port" label="Mgmt Port" defaultValue="70000" />);
    expect(screen.getByRole('alert')).toHaveTextContent('1 and 65535');
  });
});

describe('Omada 7 Real-Device Screens', () => {
  it('renders OmadaLaunchLoadingPage and dismisses blue V2.5.2 upgrade banner', () => {
    const onUpgrade = vi.fn();
    renderOmada(<OmadaLaunchLoadingPage onUpgrade={onUpgrade} />);

    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText('New version found: V2.5.2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Upgrade Now'));
    expect(onUpgrade).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByText('New version found: V2.5.2')).not.toBeInTheDocument();
  });

  it('renders OmadaControllerListPage with all 5 controllers, live search, and filter menu', () => {
    const onSelect = vi.fn();
    renderOmada(<OmadaControllerListPage onSelectController={onSelect} />);

    expect(screen.getByText('Cloud Management').closest('.tp-section-header-left')).toHaveTextContent(
      'Cloud Management (5)',
    );
    expect(screen.getByText('26-PD自测-CBC-MSP')).toBeInTheDocument();
    expect(screen.getByText('26楼-PD自测-MSP')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText('Omada Controller_F84012')).toBeInTheDocument();
    expect(screen.getByText('Omada Controller_office')).toBeInTheDocument();

    fireEvent.click(screen.getByText('62'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: '62', edition: 'ER7212PC' }));

    // Interactive TPMenu dropdown filter
    fireEvent.click(screen.getByText('All Systems'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Omada Essentials' }));
    expect(screen.getByText('Omada Controller_F84012')).toBeInTheDocument();
    expect(screen.queryByText('Omada Controller_office')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Omada Essentials'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'All Systems' }));

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'F84012' } });
    expect(screen.getByText('Cloud Management').closest('.tp-section-header-left')).toHaveTextContent(
      'Cloud Management (1)',
    );
    expect(screen.queryByText('Omada Controller_office')).not.toBeInTheDocument();
  });

  it('renders OmadaSiteDashboardPage with KPI tiles, Topology sheet, Site Health 100, ISP & Internet Activity', () => {
    const onHealth = vi.fn();
    renderOmada(<OmadaSiteDashboardPage onOpenHealthDetail={onHealth} />);

    expect(screen.getByText('Site Health Score')).toBeInTheDocument();
    expect(screen.getByText('SFP WAN/LAN1')).toBeInTheDocument();
    expect(screen.getByText('8 Kbps')).toBeInTheDocument();
    expect(screen.getByText('24 Mbps')).toBeInTheDocument();
    expect(screen.getByText('12 Clients')).toBeInTheDocument();

    // Interactive site selector TPMenu
    fireEvent.click(screen.getByText('92'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: '92-Lab' }));
    expect(screen.getByText('92-Lab')).toBeInTheDocument();

    // Toolkit FAB opens diagnostics sheet
    fireEvent.click(screen.getByLabelText('Network Toolkit'));
    expect(screen.getByRole('dialog')).toHaveTextContent('Network Toolkit');
    fireEvent.click(screen.getByText('Speed Test'));
    expect(screen.getByRole('dialog')).toHaveTextContent('942 Mbps');
    fireEvent.click(screen.getByLabelText('Close'));

    fireEvent.click(screen.getByText('Topology'));
    expect(screen.getByRole('dialog')).toHaveTextContent('ER7212PC (Gateway)');
    fireEvent.click(screen.getByLabelText('Close'));

    fireEvent.click(screen.getByText('Site Health Score'));
    expect(onHealth).toHaveBeenCalledTimes(1);
  });

  it('renders OmadaSiteInsightsPage and switches across Wired, Wireless, Client, Apps tabs', () => {
    renderOmada(<OmadaSiteInsightsPage />);

    expect(screen.getByText('ISP Load')).toBeInTheDocument();
    expect(screen.getByText('WAN Health Trend')).toBeInTheDocument();
    expect(screen.getByText('Gateway Utilization')).toBeInTheDocument();
    expect(screen.getByText('Switch Health Trend')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Wireless' }));
    expect(screen.getByText('Wi-Fi Channel Utilization')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Apps' }));
    expect(screen.getByText('Application Traffic')).toBeInTheDocument();
  });

  it('renders OmadaSiteDevicesPage and OmadaDeviceListBlock with live search and group view', () => {
    const onSelectDevice = vi.fn();
    renderOmada(<OmadaSiteDevicesPage onSelectDevice={onSelectDevice} />);

    expect(screen.getByText('8C-86-DD-A6-A7-5F')).toBeInTheDocument();
    expect(screen.getByText('3C-78-95-F0-45-F1')).toBeInTheDocument();
    expect(screen.getByText('3C-78-95-F0-46-0C')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Device Group' }));
    expect(screen.getByText('Gateway').closest('.tp-section-header-left')).toHaveTextContent(
      'Gateway (1)',
    );
    expect(screen.getByText('Access Points').closest('.tp-section-header-left')).toHaveTextContent(
      'Access Points (2)',
    );

    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'ER7212PC' } });
    expect(screen.getByText('8C-86-DD-A6-A7-5F')).toBeInTheDocument();
    expect(screen.queryByText('3C-78-95-F0-45-F1')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('8C-86-DD-A6-A7-5F'));
    expect(onSelectDevice).toHaveBeenCalledWith(expect.objectContaining({ model: 'ER7212PC' }));
  });

  it('renders OmadaSiteClientsPage with 4 real clients and supports tab filtering and blocking', () => {
    renderOmada(<OmadaSiteClientsPage />);

    expect(screen.getByText('92-Sarabande')).toBeInTheDocument();
    expect(screen.getByText('-28 dBm')).toBeInTheDocument();
    expect(screen.getByText('ChimePro-19')).toBeInTheDocument();
    expect(screen.getByText('Mac')).toBeInTheDocument();
    expect(screen.getByText('appleiPad')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Blocked' }));
    expect(screen.getByText('No Blocked Clients')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Online' }));
    fireEvent.click(screen.getByText('Mac'));
    fireEvent.click(screen.getByText('Block Client'));
    expect(screen.queryByText('Mac')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Blocked' }));
    expect(screen.getByText('Mac')).toBeInTheDocument();
  });

  it('renders OmadaSiteSettingsPage with 4 grouped cards, live search, and drill-downs', () => {
    const onWireless = vi.fn();
    const onLogs = vi.fn();
    renderOmada(
      <OmadaSiteSettingsPage
        logsCount={1}
        onOpenWirelessNetworks={onWireless}
        onOpenLogs={onLogs}
      />,
    );

    for (const label of [
      'Internet Settings',
      'LAN Settings',
      'Wireless Networks',
      'VPN',
      'Network Security',
      'Transmission',
      'Authentication',
      'Dynamic DNS',
      'Profiles',
      'Site Settings',
      'Logs',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    fireEvent.click(screen.getByText('Wireless Networks'));
    expect(onWireless).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Logs'));
    expect(onLogs).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'Dynamic' } });
    expect(screen.getByText('Dynamic DNS')).toBeInTheDocument();
    expect(screen.queryByText('VPN')).not.toBeInTheDocument();
  });
});

describe('Omada Sub-Pages, V5.3 Blocks & OmadaAppDemo', () => {
  it('renders OmadaDeviceDetailPage with Ports motion and Firmware Upgrade motion', () => {
    const { container } = renderOmada(<OmadaDeviceDetailPage />);

    fireEvent.click(screen.getByRole('tab', { name: 'Ports' }));
    expect(container.querySelector('[data-tp-motion="port-card-expand"]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    fireEvent.click(screen.getByText(/Upgrade Firmware/i));
    expect(container.querySelector('[data-tp-motion="update-network"]')).toBeInTheDocument();
  });

  it('renders OmadaHealthDetailPage cleanly in light mode as well', () => {
    renderOmada(<OmadaHealthDetailPage siteName="92" score={100} />, 'light');
    expect(screen.getByText('24-Hour Health Trend')).toBeInTheDocument();
    expect(screen.getByText('Gateway & AP Availability')).toBeInTheDocument();
  });

  it('renders OmadaWirelessNetworkBlock and triggers deploy-config motion on save', () => {
    const onSave = vi.fn();
    const { container } = renderOmada(<OmadaWirelessNetworkBlock onSave={onSave} />);

    fireEvent.click(screen.getByText('Save & Deploy Configuration'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ ssid: 'Sara Banday', security: 'WPA3-Personal' }),
    );
    expect(container.querySelector('[data-tp-motion="deploy-config"]')).toBeInTheDocument();
  });

  it('renders OmadaIncidentsBlock and updates unread count via Mark All Read', () => {
    const onUnread = vi.fn();
    renderOmada(<OmadaIncidentsBlock onUnreadCountChange={onUnread} />);

    expect(screen.getByText('Firmware Update Available (v1.3.2)')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Mark All Read'));
    expect(onUnread).toHaveBeenCalledWith(0);
  });

  it('supports OmadaDeviceListBlock empty state', () => {
    renderOmada(<OmadaDeviceListBlock devices={[]} emptyTitle="No Gateways" />);
    expect(screen.getByText('No Gateways')).toBeInTheDocument();
  });

  it('navigates end-to-end across screens inside OmadaAppDemo', () => {
    const onScreenChange = vi.fn();
    renderOmada(<OmadaAppDemo initialScreen="controllers" onScreenChange={onScreenChange} />);

    fireEvent.click(screen.getByText('62'));
    expect(onScreenChange).toHaveBeenCalledWith('dashboard');
    expect(screen.getByTestId('omada-site-dashboard-page')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Devices' }));
    expect(onScreenChange).toHaveBeenCalledWith('devices');
    expect(screen.getByTestId('omada-site-devices-page')).toBeInTheDocument();

    fireEvent.click(screen.getByText('3C-78-95-F0-45-F1'));
    expect(onScreenChange).toHaveBeenCalledWith('device-detail');
    expect(screen.getByTestId('omada-device-detail-page')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Back'));
    expect(onScreenChange).toHaveBeenCalledWith('devices');

    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    fireEvent.click(screen.getByText('Wireless Networks'));
    expect(onScreenChange).toHaveBeenCalledWith('wireless-settings');
    expect(screen.getByText('Basic Wireless Settings')).toBeInTheDocument();
  });

  it('supports controlled screen prop on OmadaAppDemo in light mode', () => {
    const onScreenChange = vi.fn();
    renderOmada(
      <OmadaAppDemo screen="launch" onScreenChange={onScreenChange} />,
      'light',
    );
    expect(screen.getByTestId('omada-launch-loading-page')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Insights' }));
    expect(onScreenChange).toHaveBeenCalledWith('insights');
    expect(screen.getByTestId('omada-launch-loading-page')).toBeInTheDocument();
  });
});
