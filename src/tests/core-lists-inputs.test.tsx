import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '../styles/tp-tokens.css';
import '../styles/tp-core-lists-inputs.css';

import { TPThemeProvider } from '../theme';
import { TPListCard } from '../core/components/TPListCard';
import { TPListItem } from '../core/components/TPListItem';
import { TPListButton } from '../core/components/TPListButton';
import { TPSectionHeader } from '../core/components/TPSectionHeader';
import { TPSectionNote } from '../core/components/TPSectionNote';
import { TPText } from '../core/components/TPText';
import { TPTag } from '../core/components/TPTag';
import { TPBadge } from '../core/components/TPBadge';
import { TPEmptyState } from '../core/components/TPEmptyState';
import { TPInput } from '../core/components/TPInput';
import { TPSearchBar } from '../core/components/TPSearchBar';
import { TPWheelPicker } from '../core/components/TPWheelPicker';
import { TPDatePicker } from '../core/components/TPDatePicker';
import { TPTimePicker } from '../core/components/TPTimePicker';
import { TPDaySwitcher } from '../core/components/TPDaySwitcher';
import { TPKeyboard } from '../core/components/TPKeyboard';

describe('Data Display, Lists & Form Input Primitives', () => {
  describe('TPListCard, TPListItem & TPListButton', () => {
    it('renders TPListCard with title, extra, radius, padding and divided classes', () => {
      const { container } = render(
        <TPListCard title="Devices" extra={<span>Manage</span>} radius="lg" padding="md" divided>
          <TPListItem title="ER7212PC" />
          <TPListItem title="EAP723" />
        </TPListCard>,
      );

      const card = container.firstElementChild as HTMLElement;
      expect(card).toHaveClass('tp-list-card');
      expect(card).toHaveClass('tp-list-card--radius-lg');
      expect(card).toHaveClass('tp-list-card--pad-md');
      expect(card).toHaveClass('tp-list-card--divided');
      expect(screen.getByText('Devices')).toBeInTheDocument();
      expect(screen.getByText('Manage')).toBeInTheDocument();
    });

    it('renders TPListItem slots, inline switch toggle, click, keyboard and disabled guards', () => {
      const onItemClick = vi.fn();
      const onSwitchChange = vi.fn();

      const { rerender } = render(
        <TPListItem
          leading={<span data-testid="lead">L</span>}
          title="Wireless Network"
          subtitle="192.168.0.1"
          description="Main office SSID"
          value="Connected"
          trailing={<span data-testid="trail">T</span>}
          badge={2}
          arrow
          checked
          switchProps={{ defaultChecked: false, onChange: onSwitchChange }}
          onClick={onItemClick}
        />,
      );

      expect(screen.getByTestId('lead')).toBeInTheDocument();
      expect(screen.getByText('Wireless Network')).toBeInTheDocument();
      expect(screen.getByText('192.168.0.1')).toBeInTheDocument();
      expect(screen.getByText('Main office SSID')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByTestId('trail')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(document.querySelector('.tp-list-item-arrow svg')).toBeInTheDocument();
      expect(document.querySelector('.tp-list-item-check svg')).toBeInTheDocument();

      const toggle = screen.getByRole('switch', { name: 'Wireless Network' });
      expect(toggle).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'true');
      expect(onSwitchChange).toHaveBeenCalledWith(true);
      expect(onItemClick).not.toHaveBeenCalled();

      const row = screen.getByRole('button', { name: /Wireless Network/i });
      fireEvent.click(row);
      expect(onItemClick).toHaveBeenCalledTimes(1);
      fireEvent.keyDown(row, { key: 'Enter' });
      expect(onItemClick).toHaveBeenCalledTimes(2);

      rerender(<TPListItem title="Disabled Row" danger disabled onClick={onItemClick} />);
      const disabledRow = screen.getByRole('button', { name: 'Disabled Row' });
      expect(disabledRow).toHaveClass('tp-list-item--danger');
      expect(disabledRow).toHaveClass('tp-list-item--disabled');
      expect(disabledRow).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(disabledRow);
      expect(onItemClick).toHaveBeenCalledTimes(2);
    });

    it('renders TPListButton tones, alignments and disabled state', () => {
      const onClick = vi.fn();
      const { rerender } = render(
        <TPListButton tone="alert" align="left" onClick={onClick}>
          Remove Device
        </TPListButton>,
      );

      const btn = screen.getByRole('button', { name: 'Remove Device' });
      expect(btn).toHaveClass('tp-list-button--tone-alert');
      expect(btn).toHaveClass('tp-list-button--align-left');
      fireEvent.click(btn);
      expect(onClick).toHaveBeenCalledTimes(1);

      rerender(
        <TPListButton tone="focus" disabled onClick={onClick}>
          Disabled Action
        </TPListButton>,
      );
      const disabledBtn = screen.getByRole('button', { name: 'Disabled Action' });
      expect(disabledBtn).toBeDisabled();
      fireEvent.click(disabledBtn);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('TPSectionHeader, TPSectionNote, TPText, TPTag, TPBadge & TPEmptyState', () => {
    it('renders TPSectionHeader and TPSectionNote variants', () => {
      render(
        <>
          <TPSectionHeader title="Cloud Management" count={5} action={<button type="button">Filter</button>} />
          <TPSectionNote tone="warning">Firmware update recommended</TPSectionNote>
        </>,
      );

      expect(screen.getByText('Cloud Management')).toBeInTheDocument();
      expect(screen.getByText('(5)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
      const note = screen.getByText('Firmware update recommended');
      expect(note).toHaveClass('tp-section-note--warning');
    });

    it('renders TPText variants, tones, weights and polymorphic element', () => {
      render(
        <TPText variant="title1" tone="focus" weight="semibold" as="h2">
          Site Health
        </TPText>,
      );

      const el = screen.getByText('Site Health');
      expect(el.tagName).toBe('H2');
      expect(el).toHaveClass('tp-text--title1');
      expect(el).toHaveClass('tp-text--tone-focus');
      expect(el).toHaveClass('tp-text--weight-semibold');
    });

    it('renders TPTag selected/unselected chips, semantic tones and closable behavior', () => {
      const onTagClick = vi.fn();
      const onClose = vi.fn();

      render(
        <>
          <TPTag selected onClick={onTagClick}>
            All
          </TPTag>
          <TPTag selected={false} onClick={onTagClick}>
            Wired
          </TPTag>
          <TPTag tone="alert" size="sm" closable onClose={onClose} onClick={onTagClick}>
            Blocked
          </TPTag>
        </>,
      );

      const allChip = screen.getByRole('button', { name: 'All' });
      expect(allChip).toHaveClass('tp-tag--selected');
      expect(allChip).toHaveAttribute('aria-pressed', 'true');

      const wiredChip = screen.getByRole('button', { name: 'Wired' });
      expect(wiredChip).toHaveClass('tp-tag--unselected');
      expect(wiredChip).toHaveAttribute('aria-pressed', 'false');

      const closeBtn = screen.getByRole('button', { name: 'Remove tag' });
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onTagClick).not.toHaveBeenCalled();
    });

    it('renders TPBadge counts, max overflow, dot, showZero and wrapped child', () => {
      const { rerender } = render(
        <TPBadge count={120} max={99}>
          <span>Alerts</span>
        </TPBadge>,
      );
      expect(screen.getByText('Alerts')).toBeInTheDocument();
      expect(screen.getByText('99+')).toBeInTheDocument();

      rerender(<TPBadge count={0} />);
      expect(document.querySelector('.tp-badge')).toBeNull();

      rerender(<TPBadge count={0} showZero />);
      expect(screen.getByText('0')).toBeInTheDocument();

      rerender(<TPBadge dot tone="focus" />);
      const dotBadge = document.querySelector('.tp-badge');
      expect(dotBadge).toHaveClass('tp-badge--dot');
      expect(dotBadge).toHaveClass('tp-badge--tone-focus');
    });

    it('renders TPEmptyState with TPIllustration, icon fallback, and action button', () => {
      const onAction = vi.fn();
      const { rerender } = render(
        <TPThemeProvider brand="omada" mode="dark" scoped>
          <TPEmptyState
            illustration="no-devices"
            title="No Devices Found"
            description="Add a gateway or access point to get started."
            actionText="Add Device"
            onAction={onAction}
          />
        </TPThemeProvider>,
      );

      const img = document.querySelector('img[data-tp-illustration="no-devices"]');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('data-tp-illustration-theme', 'dark');
      expect(screen.getByText('No Devices Found')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Add Device' }));
      expect(onAction).toHaveBeenCalledTimes(1);

      rerender(
        <TPEmptyState
          icon={<span data-testid="empty-icon">!</span>}
          title="Nothing Here"
          compact
        />,
      );
      expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
      expect(document.querySelector('.tp-empty-state--compact')).toBeInTheDocument();
    });
  });

  describe('TPInput & TPSearchBar', () => {
    it('supports TPInput label, clearable, password toggle, helper/error and multiline', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <TPInput
          label="Wi-Fi Password"
          defaultValue="secret123"
          clearable
          password
          prefix={<span data-testid="in-pre">PW</span>}
          suffix={<span data-testid="in-suf">WPA3</span>}
          helperText="8-63 characters"
          onChange={onChange}
        />,
      );

      const input = screen.getByLabelText('Wi-Fi Password') as HTMLInputElement;
      expect(input.type).toBe('password');
      expect(screen.getByTestId('in-pre')).toBeInTheDocument();
      expect(screen.getByTestId('in-suf')).toBeInTheDocument();
      expect(screen.getByText('8-63 characters')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
      expect(input.type).toBe('text');

      fireEvent.click(screen.getByRole('button', { name: 'Clear input' }));
      expect(input.value).toBe('');
      expect(onChange).toHaveBeenCalledWith('');

      rerender(
        <TPInput
          label="Notes"
          multiline
          rows={4}
          value="Line 1"
          error="Required field"
          onChange={onChange}
        />,
      );
      const textarea = screen.getByLabelText('Notes') as HTMLTextAreaElement;
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('alert')).toHaveTextContent('Required field');
    });

    it('supports TPSearchBar typing, clear button, Enter search and Cancel', () => {
      const onChange = vi.fn();
      const onSearch = vi.fn();
      const onCancel = vi.fn();

      render(
        <TPSearchBar
          placeholder="Search devices"
          showCancel
          onChange={onChange}
          onSearch={onSearch}
          onCancel={onCancel}
        />,
      );

      const input = screen.getByPlaceholderText('Search devices') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'EAP723' } });
      expect(input.value).toBe('EAP723');
      expect(onChange).toHaveBeenCalledWith('EAP723');

      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onSearch).toHaveBeenCalledWith('EAP723');

      fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
      expect(input.value).toBe('');
      expect(onChange).toHaveBeenLastCalledWith('');

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('TPWheelPicker, TPDatePicker, TPTimePicker, TPDaySwitcher & TPKeyboard', () => {
    it('supports click, step controls and keyboard navigation on TPWheelPicker', () => {
      const onChange = vi.fn();
      const columns = [
        {
          key: 'channel',
          value: '6',
          options: [
            { value: '1', label: 'Ch 1' },
            { value: '6', label: 'Ch 6' },
            { value: '11', label: 'Ch 11' },
          ],
        },
      ];

      render(<TPWheelPicker columns={columns} visibleItems={3} onChange={onChange} />);
      expect(document.querySelector('.tp-wheel-highlight')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('option', { name: 'Ch 11' }));
      expect(onChange).toHaveBeenCalledWith('channel', '11');

      fireEvent.click(screen.getByRole('button', { name: 'Previous channel' }));
      expect(onChange).toHaveBeenCalledWith('channel', '1');

      const listbox = screen.getByRole('listbox', { name: 'channel' });
      fireEvent.keyDown(listbox, { key: 'ArrowDown' });
      expect(onChange).toHaveBeenLastCalledWith('channel', '11');
    });

    it('handles TPDatePicker day clamping for February and confirm/cancel callbacks', () => {
      const onChange = vi.fn();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <TPDatePicker
          title="Schedule Date"
          defaultValue={new Date(2026, 0, 31)}
          minYear={2024}
          maxYear={2028}
          onChange={onChange}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />,
      );

      expect(screen.getByText('Schedule Date')).toBeInTheDocument();
      const monthListbox = screen.getByRole('listbox', { name: 'month' });
      fireEvent.click(within(monthListbox).getByRole('option', { name: '02' }));

      const updatedDate = onChange.mock.calls[0][0] as Date;
      expect(updatedDate.getFullYear()).toBe(2026);
      expect(updatedDate.getMonth()).toBe(1);
      expect(updatedDate.getDate()).toBe(28);

      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('supports TPTimePicker 12-hour AM/PM and minuteStep', () => {
      const onChange = vi.fn();
      render(
        <TPTimePicker
          use12Hour
          minuteStep={15}
          value={{ hour: 9, minute: 0, period: 'AM' }}
          onChange={onChange}
        />,
      );

      const minuteBox = screen.getByRole('listbox', { name: 'minute' });
      expect(within(minuteBox).getAllByRole('option')).toHaveLength(4);
      fireEvent.click(within(minuteBox).getByRole('option', { name: '30' }));
      expect(onChange).toHaveBeenCalledWith({ hour: 9, minute: 30, period: 'AM' });

      const periodBox = screen.getByRole('listbox', { name: 'period' });
      fireEvent.click(within(periodBox).getByRole('option', { name: 'PM' }));
      expect(onChange).toHaveBeenLastCalledWith({ hour: 9, minute: 0, period: 'PM' });
    });

    it('toggles weekdays in TPDaySwitcher for en and zh locales', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <TPDaySwitcher defaultValue={['mon', 'fri']} onChange={onChange} />,
      );

      const wedBtn = screen.getByRole('button', { name: 'W' });
      fireEvent.click(wedBtn);
      expect(onChange).toHaveBeenCalledWith(['mon', 'wed', 'fri']);

      rerender(<TPDaySwitcher locale="zh" value={['sun']} disabled onChange={onChange} />);
      expect(screen.getByRole('button', { name: '日' })).toHaveAttribute('aria-pressed', 'true');
      fireEvent.click(screen.getByRole('button', { name: '一' }));
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('renders TPKeyboard numeric and mac-hex modes and fires key/backspace/done handlers', () => {
      const onKeyPress = vi.fn();
      const onBackspace = vi.fn();
      const onDone = vi.fn();

      const { rerender } = render(
        <TPKeyboard
          mode="numeric"
          showDot
          onKeyPress={onKeyPress}
          onBackspace={onBackspace}
          onDone={onDone}
          doneLabel="Apply"
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: '7' }));
      fireEvent.click(screen.getByRole('button', { name: '.' }));
      expect(onKeyPress).toHaveBeenNthCalledWith(1, '7');
      expect(onKeyPress).toHaveBeenNthCalledWith(2, '.');

      fireEvent.click(screen.getByRole('button', { name: 'Backspace' }));
      expect(onBackspace).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
      expect(onDone).toHaveBeenCalledTimes(1);

      rerender(<TPKeyboard mode="mac-hex" onKeyPress={onKeyPress} />);
      fireEvent.click(screen.getByRole('button', { name: 'F' }));
      fireEvent.click(screen.getByRole('button', { name: '-' }));
      expect(onKeyPress).toHaveBeenCalledWith('F');
      expect(onKeyPress).toHaveBeenCalledWith('-');
    });
  });
});
