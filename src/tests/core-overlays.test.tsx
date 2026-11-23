import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TPThemeProvider } from '../theme';
import { TPAlert } from '../core/components/TPAlert';
import { TPActionSheet } from '../core/components/TPActionSheet';
import { TPBottomSheet } from '../core/components/TPBottomSheet';
import { TPPopup } from '../core/components/TPPopup';
import { TPMenu } from '../core/components/TPMenu';
import { TPToast, TPToastProvider, useTPToast } from '../core/components/TPToast';
import { TPPrompt } from '../core/components/TPPrompt';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('TPAlert', () => {
  it('renders iOS frosted layout with row actions for 2 buttons and adapts from TPThemeProvider', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const { container } = render(
      <TPThemeProvider brand="omada" mode="dark" os="ios">
        <TPAlert
          open
          title="Reboot Device"
          message="Traffic will pause briefly."
          onClose={onClose}
          actions={[
            { label: 'Cancel', role: 'cancel' },
            { label: 'Reboot', role: 'destructive', onClick: onConfirm },
          ]}
        />
      </TPThemeProvider>,
    );

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('data-os', 'ios');
    expect(dialog).toHaveClass('tp-alert--ios');
    expect(container.querySelector('.tp-alert-actions')).toHaveClass('tp-alert-actions--row');

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    const rebootBtn = screen.getByRole('button', { name: 'Reboot' });
    expect(cancelBtn).toHaveAttribute('data-role', 'cancel');
    expect(rebootBtn).toHaveAttribute('data-role', 'destructive');

    fireEvent.click(rebootBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders Android Material layout when os="android" or provider os="android"', () => {
    const { container } = render(
      <TPThemeProvider brand="omada" mode="light" os="android">
        <TPAlert
          open
          title="Delete Site"
          message="All site configurations will be removed."
          actions={[
            { label: 'Cancel', role: 'cancel' },
            { label: 'Delete', role: 'destructive' },
            { label: 'Learn More', role: 'default' },
          ]}
        />
      </TPThemeProvider>,
    );

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('data-os', 'android');
    expect(dialog).toHaveClass('tp-alert--android');
    expect(container.querySelector('.tp-alert-actions')).toHaveClass('tp-alert-actions--android');
  });

  it('stacks 3+ actions vertically on iOS and supports prompt input value', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const { container, rerender } = render(
      <TPAlert
        open
        os="ios"
        title="Rename Device"
        inputPlaceholder="Enter device name"
        defaultInputValue="ER7212PC"
        onClose={onClose}
        actions={[
          { label: 'Save', role: 'default', onClick: onSave },
          { label: 'Reset', role: 'destructive' },
          { label: 'Cancel', role: 'cancel' },
        ]}
      />,
    );

    expect(container.querySelector('.tp-alert-actions')).toHaveClass('tp-alert-actions--col');
    const input = screen.getByPlaceholderText('Enter device name') as HTMLInputElement;
    expect(input.value).toBe('ER7212PC');

    fireEvent.change(input, { target: { value: 'Main Gateway' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith('Main Gateway');
    expect(onClose).toHaveBeenCalledTimes(1);

    // Pressing Escape closes when open
    rerender(
      <TPAlert
        open
        os="ios"
        title="Rename Device"
        onClose={onClose}
        actions={[{ label: 'OK' }]}
      />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('returns null when open is false', () => {
    render(<TPAlert open={false} title="Hidden" actions={[{ label: 'OK' }]} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});

describe('TPActionSheet', () => {
  const options = [
    { key: 'restart', label: 'Restart Device', description: 'Soft reboot' },
    { key: 'locate', label: 'Locate LED', selected: true },
    { key: 'disabled', label: 'Disabled Action', disabled: true },
    { key: 'forget', label: 'Forget Device', destructive: true },
  ];

  it('renders iOS floating grouped list + detached Cancel card', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const { container } = render(
      <TPActionSheet
        open
        os="ios"
        title="Device Actions"
        message="Choose an operation"
        options={options}
        cancelText="Dismiss"
        onSelect={onSelect}
        onClose={onClose}
      />,
    );

    const sheet = screen.getByRole('dialog');
    expect(sheet).toHaveAttribute('data-os', 'ios');
    expect(container.querySelector('.tp-actionsheet-group')).toBeInTheDocument();
    expect(container.querySelector('.tp-actionsheet-cancel-card')).toBeInTheDocument();

    // Disabled item does nothing
    const disabledBtn = screen.getByRole('button', { name: 'Disabled Action' });
    expect(disabledBtn).toBeDisabled();
    fireEvent.click(disabledBtn);
    expect(onSelect).not.toHaveBeenCalled();

    // Enabled item selects and closes
    fireEvent.click(screen.getByRole('button', { name: /Restart Device/i }));
    expect(onSelect).toHaveBeenCalledWith(options[0]);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Cancel closes
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('renders Android unified flat bottom sheet', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const { container } = render(
      <TPThemeProvider os="android">
        <TPActionSheet
          open
          title="Select Band"
          options={[
            { key: '24g', label: '2.4 GHz', selected: true },
            { key: '5g', label: '5 GHz' },
          ]}
          onSelect={onSelect}
          onClose={onClose}
        />
      </TPThemeProvider>,
    );

    const sheet = screen.getByRole('dialog');
    expect(sheet).toHaveAttribute('data-os', 'android');
    expect(sheet).toHaveClass('tp-actionsheet--android');
    expect(container.querySelector('.tp-actionsheet-cancel-card')).not.toBeInTheDocument();
    expect(container.querySelector('.tp-actionsheet-cancel-row')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('TPBottomSheet', () => {
  it('renders grabber, title, subtitle, close button, scrollable body, and footer', () => {
    const onClose = vi.fn();
    const { container } = render(
      <TPBottomSheet
        open
        title="Network Topology"
        subtitle="1 Gateway, 2 Access Points"
        showGrabber
        showCloseButton
        maxHeight={480}
        footer={<button type="button">Apply</button>}
        onClose={onClose}
      >
        <div>Topology Details</div>
      </TPBottomSheet>,
    );

    expect(container.querySelector('.tp-bottomsheet-grabber')).toBeInTheDocument();
    expect(screen.getByText('Network Topology')).toBeInTheDocument();
    expect(screen.getByText('1 Gateway, 2 Access Points')).toBeInTheDocument();
    expect(screen.getByText('Topology Details')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();

    const sheet = screen.getByRole('dialog');
    expect(sheet).toHaveStyle({ maxHeight: '480px' });

    // Clicking inside sheet does not close
    fireEvent.click(screen.getByText('Topology Details'));
    expect(onClose).not.toHaveBeenCalled();

    // Clicking close button closes
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Clicking backdrop closes
    fireEvent.click(container.querySelector('.tp-bottomsheet-backdrop')!);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('TPPopup', () => {
  it('supports center, top, and bottom placements and maskClosable control', () => {
    const onClose = vi.fn();
    const { container, rerender } = render(
      <TPPopup
        open
        placement="top"
        title="Quick Notice"
        maskClosable={false}
        footer={<span>Footer content</span>}
        onClose={onClose}
      >
        <div>Top panel body</div>
      </TPPopup>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-placement', 'top');
    expect(dialog).toHaveClass('tp-popup--top');
    expect(screen.getByText('Footer content')).toBeInTheDocument();

    // Mask click blocked when maskClosable=false
    fireEvent.click(container.querySelector('.tp-popup-backdrop--top')!);
    expect(onClose).not.toHaveBeenCalled();

    // Close button still closes
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <TPPopup open placement="bottom" closable={false} onClose={onClose}>
        <div>Bottom body</div>
      </TPPopup>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('tp-popup--bottom');
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });
});

describe('TPMenu', () => {
  const items = [
    { key: 'all', label: 'All Systems', selected: true, icon: <span data-testid="icon-all">*</span> },
    { key: 'cloud', label: 'Cloud Based' },
    { key: 'disabled', label: 'Unavailable', disabled: true },
    { key: 'remove', label: 'Remove Controller', danger: true, dividerBefore: true },
  ];

  it('renders items, checkmark, dividerBefore, danger, disabled, and handles Esc / outside click', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const { container } = render(
      <div>
        <button type="button">Outside</button>
        <TPMenu open items={items} align="right" onSelect={onSelect} onClose={onClose} />
      </div>,
    );

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('tp-menu--align-right');
    expect(screen.getByTestId('icon-all')).toBeInTheDocument();
    expect(container.querySelector('.tp-menu-divider')).toBeInTheDocument();

    const selectedItem = screen.getByRole('menuitem', { name: /All Systems/i });
    expect(selectedItem).toHaveAttribute('data-selected', 'true');
    expect(selectedItem).toHaveClass('tp-menu-item--selected');

    const dangerItem = screen.getByRole('menuitem', { name: 'Remove Controller' });
    expect(dangerItem).toHaveClass('tp-menu-item--danger');

    const disabledItem = screen.getByRole('menuitem', { name: 'Unavailable' });
    expect(disabledItem).toBeDisabled();
    fireEvent.click(disabledItem);
    expect(onSelect).not.toHaveBeenCalled();

    // Selecting enabled item triggers onSelect and onClose
    fireEvent.click(screen.getByRole('menuitem', { name: 'Cloud Based' }));
    expect(onSelect).toHaveBeenCalledWith(items[1]);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Outside click triggers onClose
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }));
    fireEvent.click(screen.getByRole('button', { name: 'Outside' }));
    expect(onClose).toHaveBeenCalledTimes(2);

    // Escape triggers onClose
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});

describe('TPToast & useTPToast', () => {
  it('renders all toast types via TPToast', () => {
    const types = ['default', 'info', 'success', 'warning', 'error', 'loading'] as const;
    for (const type of types) {
      const { unmount } = render(<TPToast type={type} message={`Toast ${type}`} />);
      const toastEl = screen.getByText(`Toast ${type}`).closest('.tp-toast');
      expect(toastEl).toHaveAttribute('data-type', type);
      expect(toastEl).toHaveClass(`tp-toast--${type}`);
      unmount();
    }
  });

  it('supports show(string | opts), dismiss(), and cleans up auto-dismiss timers', () => {
    vi.useFakeTimers();

    const ToastHarness: React.FC = () => {
      const toast = useTPToast();
      return (
        <div>
          <button type="button" onClick={() => toast.show('Saved changes')}>
            Show Default
          </button>
          <button
            type="button"
            onClick={() => toast.show({ type: 'success', message: 'Connected', duration: 1200 })}
          >
            Show Timed
          </button>
          <button
            type="button"
            onClick={() => toast.show({ type: 'loading', message: 'Syncing...' })}
          >
            Show Loading
          </button>
          <button type="button" onClick={() => toast.dismiss()}>
            Dismiss
          </button>
        </div>
      );
    };

    const { unmount } = render(
      <TPToastProvider>
        <ToastHarness />
      </TPToastProvider>,
    );

    // show(string)
    fireEvent.click(screen.getByRole('button', { name: 'Show Default' }));
    expect(screen.getByText('Saved changes')).toBeInTheDocument();

    // Repeated show() replaces toast and resets timer
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Show Timed' }));
    expect(screen.getByText('Connected')).toBeInTheDocument();

    // Still visible after 1100ms (new 1200ms timer shouldn't be cut short by old timer)
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByText('Connected')).toBeInTheDocument();

    // Auto-dismisses after remaining 100ms
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.queryByText('Connected')).not.toBeInTheDocument();

    // Loading stays visible until dismiss()
    fireEvent.click(screen.getByRole('button', { name: 'Show Loading' }));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Syncing...')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Syncing...')).not.toBeInTheDocument();

    // Unmount with active timer does not throw
    fireEvent.click(screen.getByRole('button', { name: 'Show Timed' }));
    unmount();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
  });
});

describe('TPPrompt', () => {
  it('renders Omada upgrade banner and handles action and close clicks across tones', () => {
    const onAction = vi.fn();
    const onClose = vi.fn();
    const { rerender } = render(
      <TPPrompt
        tone="info"
        title="New version found: V2.5.2"
        actionLabel="Upgrade Now"
        onAction={onAction}
        onClose={onClose}
      />,
    );

    const banner = screen.getByRole('region');
    expect(banner).toHaveAttribute('data-tone', 'info');
    expect(banner).toHaveClass('tp-prompt--info');
    expect(screen.getByText('New version found: V2.5.2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Upgrade Now' }));
    expect(onAction).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    for (const tone of ['focus', 'warning', 'alert'] as const) {
      rerender(<TPPrompt tone={tone} title={`Banner ${tone}`} closable={false} />);
      expect(screen.getByRole('region')).toHaveClass(`tp-prompt--${tone}`);
      expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
    }
  });
});
