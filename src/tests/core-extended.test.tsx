import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '../styles/tp-tokens.css';
import '../styles/tp-components.css';
import { TPThemeProvider } from '../theme';
import { TPPhoneFrame } from '../core/components/TPPhoneFrame';
import { TPTabBar } from '../core/components/TPTabBar';
import { TPLiquidGlass } from '../core/components/TPLiquidGlass';
import { computeLiquidGlassDisplacementField } from '../core/utils/liquidGlassEngine';
import { TPIconButton, TPIconButtonGroup } from '../core/components/TPIconButton';
import { TPCheckbox, TPCheckboxGroup } from '../core/components/TPCheckbox';
import { TPRadioGroup } from '../core/components/TPRadio';
import { TPSwipeRow } from '../core/components/TPSwipeRow';
import { TPTooltip } from '../core/components/TPTooltip';
import { TPFixedToast } from '../core/components/TPFixedToast';
import { TPMonthPicker } from '../core/components/TPMonthPicker';
import { TPLast7DaysPicker } from '../core/components/TPLast7DaysPicker';
import { TPStepText } from '../core/components/TPStepText';
import { TPProgress } from '../core/components/TPProgress';
import { TPSkeleton } from '../core/components/TPSkeleton';
import { TPStepper } from '../core/components/TPStepper';
import { TPDivider } from '../core/components/TPDivider';
import { TPAvatar } from '../core/components/TPAvatar';
import { TPPinInput } from '../core/components/TPPinInput';
import { TPSlider } from '../core/components/TPSlider';
import { TPInput } from '../core/components/TPInput';

describe('Liquid Glass, Overlay Frame & Extended Core Components', () => {
  it('renders TPLiquidGlass shapes, tints, and button click handling', () => {
    const onClick = vi.fn();
    const { container } = render(
      <TPThemeProvider brand="omada" mode="dark">
        <TPLiquidGlass shape="pill" tint="brand" interactive as="button" onClick={onClick}>
          Glass CTA
        </TPLiquidGlass>
      </TPThemeProvider>,
    );

    const btn = screen.getByRole('button', { name: 'Glass CTA' });
    expect(btn).toHaveClass('tp-liquid-glass', 'tp-liquid-glass--pill', 'tp-liquid-glass--tint-brand');
    expect(container.querySelector('[data-tint="brand"]')).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('configures TPPhoneFrame overlayTop/overlayBottom and TPTabBar extraAction slot', () => {
    const items = [
      { key: 'home', label: 'Dashboard', icon: 'tabbar-dashboard-off', activeIcon: 'tabbar-dashboard-on' },
      { key: 'devices', label: 'Devices', icon: 'tabbar-device-off', activeIcon: 'tabbar-device-on' },
    ];
    const onAiClick = vi.fn();

    const { container, rerender } = render(
      <TPPhoneFrame
        device="iphone16pro"
        overlayTop
        statusBar={<div>Status</div>}
        bottomBar={
          <TPTabBar
            variant="floating-pill"
            items={items}
            activeKey="home"
            onChange={() => {}}
            extraAction={
              <TPIconButton variant="glass" icon="ai" ariaLabel="AI Helper" onClick={onAiClick} />
            }
          />
        }
      >
        <div>Scroll Content</div>
      </TPPhoneFrame>,
    );

    const frame = container.querySelector('.tp-phone-frame') as HTMLElement;
    expect(frame.dataset.overlayTop).toBe('true');
    expect(frame.dataset.overlayBottom).toBe('true');
    expect(container.querySelector('.tp-phone-bottom--overlay')).toBeInTheDocument();
    expect(container.querySelector('.tp-tabbar--has-extra')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'AI Helper' }));
    expect(onAiClick).toHaveBeenCalledTimes(1);

    rerender(
      <TPPhoneFrame
        device="iphone16pro"
        bottomBar={<TPTabBar variant="docked" items={items} activeKey="home" onChange={() => {}} />}
      >
        <div>Docked Content</div>
      </TPPhoneFrame>,
    );
    expect((container.querySelector('.tp-phone-frame') as HTMLElement).dataset.overlayBottom).toBe('false');
  });

  it('supports TPIconButton and TPIconButtonGroup with badges and disabled state', () => {
    const onAdd = vi.fn();
    render(
      <TPIconButtonGroup variant="glass">
        <TPIconButton icon="nav-add" ariaLabel="Add Node" badge={4} onClick={onAdd} />
        <TPIconButton icon="nav-more" ariaLabel="Disabled More" disabled onClick={onAdd} />
      </TPIconButtonGroup>,
    );

    expect(screen.getByText('4')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add Node' }));
    fireEvent.click(screen.getByRole('button', { name: 'Disabled More' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('handles TPCheckbox, TPCheckboxGroup indeterminate/group, and TPRadioGroup', () => {
    const onCheckGroup = vi.fn();
    const onRadio = vi.fn();

    render(
      <>
        <TPCheckbox indeterminate label="Select All" />
        <TPCheckboxGroup
          defaultValue={['5g']}
          onChange={onCheckGroup}
          options={[
            { value: '24g', label: '2.4 GHz' },
            { value: '5g', label: '5 GHz' },
          ]}
        />
        <TPRadioGroup
          defaultValue="wpa3"
          onChange={onRadio}
          options={[
            { value: 'wpa3', label: 'WPA3-Personal' },
            { value: 'open', label: 'Open' },
          ]}
        />
      </>,
    );

    expect(screen.getByRole('checkbox', { name: 'Select All' })).toHaveAttribute('aria-checked', 'mixed');
    fireEvent.click(screen.getByRole('checkbox', { name: '2.4 GHz' }));
    expect(onCheckGroup).toHaveBeenCalledWith(['5g', '24g']);

    fireEvent.click(screen.getByRole('radio', { name: 'Open' }));
    expect(onRadio).toHaveBeenCalledWith('open');
  });

  it('renders TPSwipeRow actions and handles TPTooltip & TPFixedToast interactions', () => {
    const onDelete = vi.fn();
    const onToastAction = vi.fn();
    const onToastClose = vi.fn();

    render(
      <>
        <TPSwipeRow
          open
          actions={[{ key: 'delete', label: 'Delete', tone: 'alert', onClick: onDelete }]}
        >
          <div>Swipe Item</div>
        </TPSwipeRow>
        <TPTooltip arrowPosition="bottom-left" content="Auto channel enabled">
          <span>Channel Info</span>
        </TPTooltip>
        <TPFixedToast
          status="warning"
          action="button"
          actionLabel="Fix"
          onAction={onToastAction}
          message="PoE budget approaching limit"
        />
        <TPFixedToast status="info" action="close" onClose={onToastClose} message="Dismissible bar" />
      </>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('tooltip')).toHaveTextContent('Auto channel enabled');
    fireEvent.click(screen.getByText('Channel Info'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Fix' }));
    expect(onToastAction).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onToastClose).toHaveBeenCalledTimes(1);
  });

  it('renders TPMonthPicker and TPLast7DaysPicker selection', () => {
    const onMonth = vi.fn();
    const onDay = vi.fn();

    render(
      <>
        <TPMonthPicker defaultValue={{ year: 2026, month: 11 }} onChange={onMonth} />
        <TPLast7DaysPicker
          referenceDate={new Date(2026, 10, 23)}
          markedDates={['2026-11-22']}
          onChange={onDay}
        />
      </>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Previous year' }));
    fireEvent.click(screen.getByRole('option', { name: 'Mar' }));
    expect(onMonth).toHaveBeenCalledWith({ year: 2025, month: 3 });

    const daysList = screen.getByRole('listbox', { name: 'Last 7 Days' });
    expect(within(daysList).getAllByRole('option')).toHaveLength(7);
    fireEvent.click(within(daysList).getByRole('option', { name: '2026-11-20' }));
    expect(onDay).toHaveBeenCalledTimes(1);
  });

  it('renders TPStepText, TPProgress, TPSkeleton, TPStepper, TPDivider, and TPAvatar', () => {
    const { container } = render(
      <>
        <TPStepText
          variant="step"
          items={[
            { title: 'Step A', text: 'Plug cable' },
            { title: 'Step B', text: 'Verify link' },
          ]}
        />
        <TPProgress variant="linear" percent={85} label="Upload" />
        <TPProgress variant="circular" percent={42} />
        <TPSkeleton variant="card" />
        <TPStepper
          current={1}
          steps={[
            { key: '1', title: 'Init' },
            { key: '2', title: 'Sync' },
            { key: '3', title: 'Done' },
          ]}
        />
        <TPDivider label="Section" inset />
        <TPAvatar name="Lucien Chen" status="online" />
      </>,
    );

    expect(screen.getByText('Plug cable')).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(2);
    expect(container.querySelector('.tp-skeleton-card')).toBeInTheDocument();
    expect(screen.getByText('Sync').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('separator')).toHaveClass('tp-divider--inset');
    expect(screen.getByText('LC')).toBeInTheDocument();
  });

  it('handles TPPinInput completion, Dual-Thumb TPSlider, and TPInput variants', () => {
    const onComplete = vi.fn();
    const onRangeChange = vi.fn();

    render(
      <>
        <TPPinInput length={4} ariaLabel="OTP" onComplete={onComplete} />
        <TPSlider
          range
          defaultRangeValue={[20, 80]}
          showValue
          unit="%"
          ariaLabel="Power"
          onRangeChange={onRangeChange}
        />
        <TPInput variant="list" label="List Row" defaultValue="eth0" />
        <TPInput variant="borderless" placeholder="Borderless entry" />
      </>,
    );

    const digit1 = screen.getByLabelText('OTP digit 1');
    fireEvent.paste(digit1, {
      clipboardData: { getData: () => '9876' },
    });
    expect(onComplete).toHaveBeenCalledWith('9876');

    const minSlider = screen.getByRole('slider', { name: 'Power minimum' });
    const maxSlider = screen.getByRole('slider', { name: 'Power maximum' });
    fireEvent.change(minSlider, { target: { value: '35' } });
    expect(onRangeChange).toHaveBeenCalledWith([35, 80]);
    fireEvent.change(maxSlider, { target: { value: '90' } });
    expect(onRangeChange).toHaveBeenCalledWith([35, 90]);

    expect(document.querySelector('[data-variant="list"]')).toBeInTheDocument();
    expect(document.querySelector('[data-variant="borderless"]')).toBeInTheDocument();
  });

  it('computes neutral center and symmetric Snell refraction vectors on pill rims', () => {
    const width = 120;
    const height = 48;
    const field = computeLiquidGlassDisplacementField({
      width,
      height,
      radius: 24,
      bezelWidth: 14,
    });

    expect(field.width).toBe(width);
    expect(field.height).toBe(height);
    expect(field.maxScale).toBeGreaterThan(0);

    const readPixel = (x: number, y: number) => {
      const idx = (y * width + x) * 4;
      return {
        r: field.data[idx],
        g: field.data[idx + 1],
        b: field.data[idx + 2],
        a: field.data[idx + 3],
      };
    };

    const center = readPixel(width / 2, height / 2);
    expect(center).toEqual({ r: 128, g: 128, b: 128, a: 255 });

    const topRim = readPixel(width / 2, 2);
    const bottomRim = readPixel(width / 2, height - 3);
    expect(topRim.g).toBeGreaterThan(128);
    expect(bottomRim.g).toBeLessThan(128);

    const leftRim = readPixel(2, height / 2);
    const rightRim = readPixel(width - 3, height / 2);
    expect(leftRim.r).toBeGreaterThan(128);
    expect(rightRim.r).toBeLessThan(128);
  });

  it('renders TPLiquidGlass optical backdrop props and TPTabBar sliding active lens index', () => {
    const items = [
      { key: 'dash', label: 'Dashboard', icon: 'tabbar-dashboard-off' },
      { key: 'dev', label: 'Devices', icon: 'tabbar-device-off' },
      { key: 'set', label: 'Settings', icon: 'tabbar-setting-off' },
    ];

    const { container, rerender } = render(
      <TPThemeProvider brand="omada" mode="dark">
        <TPLiquidGlass shape="pill" refraction={1.4} dispersion={1.2} blur={2} optical={false}>
          Crystal Pill
        </TPLiquidGlass>
        <TPTabBar variant="floating-pill" items={items} activeKey="dash" onChange={() => {}} />
      </TPThemeProvider>,
    );

    const glassBackdrop = container.querySelector('.tp-liquid-glass > .tp-lg-backdrop');
    expect(glassBackdrop).toHaveAttribute('data-optical', 'css-fallback');

    const lens = container.querySelector('.tp-tabbar-active-lens');
    expect(lens).toHaveAttribute('data-active-index', '0');

    rerender(
      <TPThemeProvider brand="omada" mode="dark">
        <TPLiquidGlass shape="pill" refraction={1.4} dispersion={1.2} blur={2} optical={false}>
          Crystal Pill
        </TPLiquidGlass>
        <TPTabBar variant="floating-pill" items={items} activeKey="set" onChange={() => {}} />
      </TPThemeProvider>,
    );

    expect(container.querySelector('.tp-tabbar-active-lens')).toHaveAttribute('data-active-index', '2');
  });
});
