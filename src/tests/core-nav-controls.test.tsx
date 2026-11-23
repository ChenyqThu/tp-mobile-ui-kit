import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '../styles/tp-tokens.css';
import { TPThemeProvider } from '../theme';
import { TPPhoneFrame } from '../core/components/TPPhoneFrame';
import { TPStatusBar } from '../core/components/TPStatusBar';
import { TPHeader } from '../core/components/TPHeader';
import { TPTabBar } from '../core/components/TPTabBar';
import { TPSegment } from '../core/components/TPSegment';
import { TPPageControl } from '../core/components/TPPageControl';
import { TPButton } from '../core/components/TPButton';
import { TPFixedButtonBar } from '../core/components/TPFixedButtonBar';
import { TPSwitch } from '../core/components/TPSwitch';
import { TPSlider } from '../core/components/TPSlider';

describe('TPPhoneFrame & TPStatusBar', () => {
  it('supports device presets and toggles Dynamic Island & Home Indicator with showFrame', () => {
    const { container, rerender } = render(
      <TPPhoneFrame
        device="iphone16pro"
        showFrame
        statusBar={<TPStatusBar time="10:51" muted locationActive battery={85} />}
        bottomBar={<div>Bottom Bar</div>}
        floatingAction={<button type="button">FAB</button>}
      >
        <div>Body Content</div>
      </TPPhoneFrame>,
    );

    const frame = container.querySelector('.tp-phone-frame') as HTMLElement;
    const screenEl = container.querySelector('.tp-phone-screen') as HTMLElement;
    expect(frame.dataset.device).toBe('iphone16pro');
    expect(screenEl.style.width).toBe('393px');
    expect(screenEl.style.height).toBe('852px');
    expect(screen.getByTestId('tp-phone-dynamic-island')).toBeInTheDocument();
    expect(screen.getByTestId('tp-phone-home-indicator')).toBeInTheDocument();
    expect(screen.getByText('10:51')).toBeInTheDocument();
    expect(screen.getByLabelText('Muted')).toBeInTheDocument();
    expect(screen.getByLabelText('Location active')).toBeInTheDocument();
    expect(screen.getByLabelText('Battery 85%')).toBeInTheDocument();
    expect(screen.getByText('Body Content')).toBeInTheDocument();
    expect(screen.getByText('Bottom Bar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'FAB' })).toBeInTheDocument();

    rerender(
      <TPPhoneFrame device="iphone14" showFrame={false}>
        <div>iPhone 14</div>
      </TPPhoneFrame>,
    );
    const screen14 = container.querySelector('.tp-phone-screen') as HTMLElement;
    expect(screen14.style.width).toBe('375px');
    expect(screen14.style.height).toBe('812px');
    expect(screen.queryByTestId('tp-phone-dynamic-island')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tp-phone-home-indicator')).not.toBeInTheDocument();

    rerender(
      <TPPhoneFrame device="android" showFrame>
        <div>Android</div>
      </TPPhoneFrame>,
    );
    const screenAndroid = container.querySelector('.tp-phone-screen') as HTMLElement;
    expect(screenAndroid.style.width).toBe('360px');
    expect(screenAndroid.style.height).toBe('800px');
    expect(screen.queryByTestId('tp-phone-dynamic-island')).not.toBeInTheDocument();
    expect(screen.getByTestId('tp-phone-home-indicator')).toBeInTheDocument();

    rerender(
      <TPPhoneFrame device="compact">
        <div>Compact</div>
      </TPPhoneFrame>,
    );
    const screenCompact = container.querySelector('.tp-phone-screen') as HTMLElement;
    expect(screenCompact.style.width).toBe('360px');
    expect(screenCompact.style.height).toBe('720px');
  });

  it('renders Android battery percentage and transparent status bar modifier', () => {
    const { container } = render(
      <TPStatusBar os="android" time="09:30" battery={42} transparent carrier="5G" />,
    );
    expect(screen.getByText('09:30')).toBeInTheDocument();
    expect(screen.getByText('5G')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(container.querySelector('.tp-statusbar--transparent')).toBeInTheDocument();
  });
});

describe('TPHeader', () => {
  it('renders standard variant with back button and floating variant with glass wells & badge', () => {
    const onBack = vi.fn();
    const onTitleClick = vi.fn();

    const { container, rerender } = render(
      <TPHeader
        variant="standard"
        title="Device Settings"
        showBack
        onBack={onBack}
        right={<span>Save</span>}
      />,
    );

    expect(screen.getByText('Device Settings')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.tp-header--standard')).toBeInTheDocument();

    rerender(
      <TPHeader
        variant="floating"
        title="My Office"
        subtitle="92 / 62"
        titleDropdown
        onTitleClick={onTitleClick}
        left={<button type="button" aria-label="Menu">M</button>}
        right={<button type="button" aria-label="Alerts">A</button>}
        rightBadge={7}
      />,
    );

    expect(container.querySelector('.tp-header--floating')).toBeInTheDocument();
    expect(container.querySelectorAll('.tp-header-well')).toHaveLength(2);
    expect(screen.getByText('92 / 62')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /My Office/ }));
    expect(onTitleClick).toHaveBeenCalledTimes(1);
  });
});

describe('TPTabBar', () => {
  it('renders floating-pill and docked variants with TPIcon names, ReactNode icons, and badges', () => {
    const onChange = vi.fn();
    const items = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'tabbar-dashboard-off',
        activeIcon: 'tabbar-dashboard-on',
      },
      {
        key: 'devices',
        label: 'Devices',
        icon: 'tabbar-device-off',
        activeIcon: 'tabbar-device-on',
        badge: 120,
      },
      {
        key: 'custom',
        label: 'Custom',
        icon: <span data-testid="custom-tab-icon">*</span>,
        badge: true,
      },
    ];

    const { container, rerender } = render(
      <TPTabBar
        items={items}
        activeKey="dashboard"
        onChange={onChange}
        variant="floating-pill"
      />,
    );

    expect(container.querySelector('.tp-tabbar--floating-pill')).toBeInTheDocument();
    expect(container.querySelector('[data-tp-icon="tabbar-dashboard-on"]')).toBeInTheDocument();
    expect(container.querySelector('[data-tp-icon="tabbar-device-off"]')).toBeInTheDocument();
    expect(screen.getByTestId('custom-tab-icon')).toBeInTheDocument();
    expect(screen.getByText('99+')).toBeInTheDocument();
    expect(container.querySelector('.tp-tabbar-badge--dot')).toBeInTheDocument();

    const devicesTab = screen.getByRole('tab', { name: /Devices/ });
    fireEvent.click(devicesTab);
    expect(onChange).toHaveBeenCalledWith('devices');

    rerender(
      <TPTabBar
        items={items}
        activeKey="devices"
        onChange={onChange}
        variant="docked"
      />,
    );

    expect(container.querySelector('.tp-tabbar--docked')).toBeInTheDocument();
    expect(container.querySelector('[data-tp-icon="tabbar-dashboard-off"]')).toBeInTheDocument();
    expect(container.querySelector('[data-tp-icon="tabbar-device-on"]')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Devices/ })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('TPSegment & TPPageControl', () => {
  it('supports underline and pill TPSegment variants and skips disabled items', () => {
    const onChange = vi.fn();
    const options = [
      { key: 'all', label: 'All', badge: 12 },
      { key: 'wireless', label: 'Wireless' },
      { key: 'wired', label: 'Wired', disabled: true },
    ];

    const { container, rerender } = render(
      <TPSegment options={options} value="all" onChange={onChange} variant="underline" />,
    );

    expect(container.querySelector('.tp-segment--underline')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /All/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('12')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Wireless' }));
    expect(onChange).toHaveBeenCalledWith('wireless');

    fireEvent.click(screen.getByRole('tab', { name: 'Wired' }));
    expect(onChange).toHaveBeenCalledTimes(1);

    rerender(
      <TPSegment
        options={options}
        value="wireless"
        onChange={onChange}
        variant="pill"
        fullWidth={false}
      />,
    );
    expect(container.querySelector('.tp-segment--pill')).toBeInTheDocument();
    expect(container.querySelector('.tp-segment--full')).not.toBeInTheDocument();
  });

  it('renders TPPageControl dots and triggers onChange', () => {
    const onChange = vi.fn();
    render(<TPPageControl total={4} current={1} onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    expect(buttons[1]).toHaveAttribute('aria-current', 'page');
    fireEvent.click(buttons[3]);
    expect(onChange).toHaveBeenCalledWith(3);
  });
});

describe('TPButton & TPFixedButtonBar', () => {
  it('renders all variants, sizes, loading state, disabled state, and brand wrapper', () => {
    const onClick = vi.fn();
    const variants = ['primary', 'secondary', 'text', 'alert', 'tonal', 'in-card'] as const;

    const { container } = render(
      <TPThemeProvider brand="tapo" mode="light">
        <div>
          {variants.map((variant) => (
            <TPButton key={variant} variant={variant} size="md" onClick={onClick}>
              {variant}
            </TPButton>
          ))}
          <TPButton variant="primary" size="lg" block loading onClick={onClick}>
            Saving
          </TPButton>
          <TPButton variant="secondary" size="sm" disabled onClick={onClick}>
            Disabled
          </TPButton>
        </div>
      </TPThemeProvider>,
    );

    expect(container.querySelector('[data-tp-brand="tapo"]')).toBeInTheDocument();
    for (const variant of variants) {
      const btn = screen.getByRole('button', { name: variant });
      expect(btn).toHaveClass(`tp-btn--${variant}`, 'tp-btn--md');
      fireEvent.click(btn);
    }
    expect(onClick).toHaveBeenCalledTimes(variants.length);

    const loadingBtn = screen.getByRole('button', { name: 'Saving' });
    expect(loadingBtn).toBeDisabled();
    expect(loadingBtn).toHaveAttribute('aria-busy', 'true');
    expect(loadingBtn).toHaveClass('tp-btn--block', 'tp-btn--lg', 'tp-btn--loading');
    expect(loadingBtn.querySelector('.tp-btn-spinner')).toBeInTheDocument();
    fireEvent.click(loadingBtn);

    const disabledBtn = screen.getByRole('button', { name: 'Disabled' });
    expect(disabledBtn).toBeDisabled();
    fireEvent.click(disabledBtn);

    expect(onClick).toHaveBeenCalledTimes(variants.length);
  });

  it('renders TPFixedButtonBar layouts', () => {
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();

    const { container, rerender } = render(
      <TPFixedButtonBar
        layout="dual-horizontal"
        primaryText="Confirm"
        onPrimaryClick={onPrimary}
        secondaryText="Cancel"
        onSecondaryClick={onSecondary}
        note="Applies immediately"
      />,
    );

    expect(container.querySelector('.tp-fixed-btn-bar--dual-horizontal')).toBeInTheDocument();
    expect(screen.getByText('Applies immediately')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);

    rerender(
      <TPFixedButtonBar
        layout="dual-vertical"
        primaryText="Continue"
        secondaryText="Skip"
        secondaryVariant="text"
      />,
    );
    expect(container.querySelector('.tp-fixed-btn-bar--dual-vertical')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip' })).toHaveClass('tp-btn--text');
  });
});

describe('TPSwitch', () => {
  it('supports uncontrolled and controlled toggle, disabled, and loading states', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TPSwitch defaultChecked={false} onChange={onChange} ariaLabel="Wi-Fi Radio" />,
    );

    const toggle = screen.getByRole('switch', { name: 'Wi-Fi Radio' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(
      <TPSwitch checked={true} onChange={onChange} disabled ariaLabel="Wi-Fi Radio" />,
    );
    expect(toggle).toBeDisabled();
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledTimes(1);

    rerender(
      <TPSwitch checked={false} onChange={onChange} loading ariaLabel="Wi-Fi Radio" />,
    );
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute('aria-busy', 'true');
    expect(toggle.querySelector('.tp-switch-spinner')).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('TPSlider', () => {
  it('supports uncontrolled/controlled changes, marks, value readout with unit, and disabled state', () => {
    const onChange = vi.fn();
    const onAfterChange = vi.fn();
    const marks = [
      { value: 0, label: 'Low' },
      { value: 50, label: 'Med' },
      { value: 100, label: 'High' },
    ];

    const { container, rerender } = render(
      <TPSlider
        defaultValue={25}
        min={0}
        max={100}
        step={5}
        marks={marks}
        showValue
        unit="%"
        ariaLabel="Tx Power"
        onChange={onChange}
        onAfterChange={onAfterChange}
      />,
    );

    const slider = screen.getByRole('slider', { name: 'Tx Power' });
    expect(slider).toHaveValue('25');
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(container.querySelectorAll('.tp-slider-tick')).toHaveLength(3);

    fireEvent.change(slider, { target: { value: '75' } });
    expect(onChange).toHaveBeenCalledWith(75);
    expect(screen.getByText('75%')).toBeInTheDocument();

    fireEvent.pointerUp(slider);
    expect(onAfterChange).toHaveBeenCalledWith(75);

    fireEvent.click(screen.getByRole('button', { name: 'Med' }));
    expect(onChange).toHaveBeenCalledWith(50);
    expect(onAfterChange).toHaveBeenCalledWith(50);

    rerender(
      <TPSlider
        value={40}
        disabled
        showValue
        unit=" dBm"
        ariaLabel="Tx Power"
        onChange={onChange}
      />,
    );
    expect(slider).toBeDisabled();
    expect(screen.getByText('40 dBm')).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: '80' } });
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
