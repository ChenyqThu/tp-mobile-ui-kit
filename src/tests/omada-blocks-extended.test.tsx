import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TPThemeProvider } from '../theme';
import { OmadaScheduleBlock } from '../omada/blocks/OmadaScheduleBlock';
import { OmadaPortPanelBlock } from '../omada/blocks/OmadaPortPanelBlock';
import { OmadaTopologyBlock } from '../omada/blocks/OmadaTopologyBlock';
import { OmadaFirmwareUpdateBlock } from '../omada/blocks/OmadaFirmwareUpdateBlock';
import { OmadaAppDemo } from '../omada/pages/OmadaAppDemo';

function renderOmada(ui: React.ReactElement, mode: 'dark' | 'light' = 'dark') {
  return render(
    <TPThemeProvider brand="omada" mode={mode} scoped>
      {ui}
    </TPThemeProvider>,
  );
}

describe('Extended Omada V5.3 Mobile Blocks', () => {
  it('toggles, edits, and adds schedules in OmadaScheduleBlock', () => {
    const onChange = vi.fn();
    renderOmada(<OmadaScheduleBlock onChange={onChange} />);

    expect(screen.getByText('Nighttime Wi-Fi Off (Guest)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Toggle Nighttime Wi-Fi Off (Guest)' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'sch-1', enabled: false })]),
    );

    fireEvent.click(screen.getByText('Nighttime Wi-Fi Off (Guest)'));
    expect(screen.getByRole('dialog')).toHaveTextContent('Trigger Start Time');
    fireEvent.click(screen.getByRole('button', { name: 'Save Schedule' }));

    fireEvent.click(screen.getByRole('button', { name: '+ Add Schedule Rule' }));
    expect(screen.getAllByText('Custom PoE Window #4').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('dialog')).toHaveTextContent('Custom PoE Window #4');
  });

  it('inspects ports, toggles PoE, and assigns VLAN profile in OmadaPortPanelBlock', () => {
    const onPortUpdate = vi.fn();
    const { container } = renderOmada(
      <OmadaPortPanelBlock deviceModel="ER7212PC" onPortUpdate={onPortUpdate} />,
    );

    expect(container.querySelector('[data-tp-motion="port-card-expand"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Toggle PoE on LAN5' }));
    expect(onPortUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'lan5', poeEnabled: false }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'IoT (VLAN 20)' }));
    expect(onPortUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'lan5', vlanProfile: 'IoT (VLAN 20)' }),
    );
  });

  it('selects nodes and displays telemetry in OmadaTopologyBlock', () => {
    const onSelect = vi.fn();
    renderOmada(<OmadaTopologyBlock showHeader siteName="92" onSelectNode={onSelect} />);

    expect(screen.getByText('Loop Protection On')).toBeInTheDocument();
    fireEvent.click(screen.getByText('EAP723 (3C-78-95-F0-45-F1)'));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'topo-ap1', ip: '192.168.0.2' }),
    );
    expect(screen.getByText('192.168.0.2')).toBeInTheDocument();
  });

  it('selects devices and tracks upgrade progress in OmadaFirmwareUpdateBlock', () => {
    const onUpgradeStart = vi.fn();
    const { container } = renderOmada(<OmadaFirmwareUpdateBlock onUpgradeStart={onUpgradeStart} />);

    fireEvent.click(screen.getByRole('button', { name: 'Upgrade Selected (2)' }));
    expect(onUpgradeStart).toHaveBeenCalledWith(['fw-ap1', 'fw-ap2']);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '72');
    expect(container.querySelector('[data-tp-motion="update-network"]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Complete Verification' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('Selected Access Points upgraded to v1.3.2.')).toBeInTheDocument();
  });

  it('drills down into Schedules and Firmware Updates from Settings in OmadaAppDemo', () => {
    const onScreen = vi.fn();
    renderOmada(<OmadaAppDemo initialScreen="settings" onScreenChange={onScreen} />);

    fireEvent.click(screen.getByText('Schedules'));
    expect(onScreen).toHaveBeenCalledWith('schedule');
    expect(screen.getByTestId('omada-schedule-block')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Back'));
    expect(onScreen).toHaveBeenCalledWith('settings');

    fireEvent.click(screen.getByText('Firmware Updates'));
    expect(onScreen).toHaveBeenCalledWith('firmware');
    expect(screen.getByTestId('omada-firmware-update-block')).toBeInTheDocument();
  });
});
