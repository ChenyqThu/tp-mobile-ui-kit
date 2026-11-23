import type React from 'react';
import type { TPPlatformOS, TPResolvedMode, TPScreenSize } from '../theme';
import type { TPIconName, TPIllustrationName } from '../assets-lib';

export interface TPPhoneFrameProps {
  device?: 'iphone16pro' | 'iphone14' | 'android' | 'compact';
  width?: number;
  height?: number;
  screenSize?: TPScreenSize;
  showFrame?: boolean;
  showDynamicIsland?: boolean;
  showHomeIndicator?: boolean;
  statusBar?: React.ReactNode;
  bottomBar?: React.ReactNode;
  floatingAction?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export interface TPStatusBarProps {
  time?: string;
  os?: TPPlatformOS;
  carrier?: string;
  signalStrength?: 1 | 2 | 3 | 4;
  wifiStrength?: 1 | 2 | 3;
  battery?: number;
  muted?: boolean;
  locationActive?: boolean;
  transparent?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  variant?: 'standard' | 'floating';
  left?: React.ReactNode;
  right?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  titleDropdown?: boolean;
  onTitleClick?: () => void;
  rightBadge?: number | string;
  translucent?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPTabBarItem {
  key: string;
  label: string;
  icon: TPIconName | React.ReactNode;
  activeIcon?: TPIconName | React.ReactNode;
  badge?: number | string | boolean;
}

export interface TPTabBarProps {
  items: readonly TPTabBarItem[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: 'floating-pill' | 'docked';
  className?: string;
  style?: React.CSSProperties;
}

export interface TPSegmentOption {
  key: string;
  label: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

export interface TPSegmentProps {
  options: readonly TPSegmentOption[];
  value: string;
  onChange: (key: string) => void;
  variant?: 'underline' | 'pill';
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPPageControlProps {
  total: number;
  current: number;
  onChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: 'primary' | 'secondary' | 'text' | 'alert' | 'tonal' | 'in-card';
  size?: 'lg' | 'md' | 'sm';
  block?: boolean;
  loading?: boolean;
  htmlType?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export interface TPFixedButtonBarProps {
  layout?: 'single' | 'dual-horizontal' | 'dual-vertical';
  primaryText: string;
  onPrimaryClick?: () => void;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  secondaryText?: string;
  onSecondaryClick?: () => void;
  secondaryVariant?: 'secondary' | 'text' | 'alert';
  note?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPSliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  marks?: readonly { value: number; label?: string }[];
  showValue?: boolean;
  unit?: string;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onAfterChange?: (value: number) => void;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPListCardProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  radius?: 'theme' | 'lg';
  padding?: 'none' | 'sm' | 'md';
  divided?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export interface TPListItemProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  value?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  badge?: number | string;
  arrow?: boolean;
  checked?: boolean;
  switchProps?: TPSwitchProps;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPListButtonProps {
  children: React.ReactNode;
  tone?: 'primary' | 'alert' | 'neutral' | 'focus';
  align?: 'center' | 'left';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPSectionHeaderProps {
  title: React.ReactNode;
  count?: number | string;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPSectionNoteProps {
  children: React.ReactNode;
  tone?: 'default' | 'warning' | 'alert';
  className?: string;
  style?: React.CSSProperties;
}

export interface TPTextProps {
  variant?: 'title1' | 'title2' | 'title3' | 'title4' | 'body' | 'subhead' | 'caption' | 'footnote';
  tone?: 'primary' | 'secondary' | 'secondary-alt' | 'disabled' | 'focus' | 'highlighted' | 'alert' | 'success' | 'warning';
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export interface TPTagProps {
  children: React.ReactNode;
  tone?: 'focus' | 'neutral' | 'success' | 'warning' | 'alert' | 'info';
  selected?: boolean;
  size?: 'sm' | 'md';
  closable?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPBadgeProps {
  count?: number | string;
  dot?: boolean;
  tone?: 'alert' | 'focus' | 'warning' | 'neutral';
  max?: number;
  showZero?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPEmptyStateProps {
  illustration?: TPIllustrationName;
  theme?: TPResolvedMode;
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'prefix'> {
  label?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  clearable?: boolean;
  password?: boolean;
  multiline?: boolean;
  rows?: number;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  containerClassName?: string;
}

export interface TPSearchBarProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onCancel?: () => void;
  showCancel?: boolean;
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPWheelPickerColumn {
  key: string;
  options: readonly { value: string; label: string }[];
  value: string;
}

export interface TPWheelPickerProps {
  columns: readonly TPWheelPickerColumn[];
  onChange: (key: string, value: string) => void;
  itemHeight?: number;
  visibleItems?: 3 | 5;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPDatePickerProps {
  value?: Date;
  defaultValue?: Date;
  minYear?: number;
  maxYear?: number;
  onChange?: (date: Date) => void;
  onConfirm?: (date: Date) => void;
  onCancel?: () => void;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPTimePickerProps {
  value?: { hour: number; minute: number; period?: 'AM' | 'PM' };
  use12Hour?: boolean;
  minuteStep?: number;
  onChange?: (val: { hour: number; minute: number; period?: 'AM' | 'PM' }) => void;
  className?: string;
  style?: React.CSSProperties;
}

export type TPDayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface TPDaySwitcherProps {
  value?: readonly TPDayKey[];
  defaultValue?: readonly TPDayKey[];
  onChange?: (days: TPDayKey[]) => void;
  disabled?: boolean;
  locale?: 'en' | 'zh';
  className?: string;
  style?: React.CSSProperties;
}

export interface TPKeyboardProps {
  mode?: 'numeric' | 'pin' | 'mac-hex';
  onKeyPress?: (key: string) => void;
  onBackspace?: () => void;
  onDone?: () => void;
  doneLabel?: string;
  showDot?: boolean;
  showDash?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPAlertAction {
  label: string;
  role?: 'default' | 'cancel' | 'destructive';
  onClick?: (inputValue?: string) => void;
}

export interface TPAlertProps {
  open: boolean;
  title?: React.ReactNode;
  message?: React.ReactNode;
  actions: readonly TPAlertAction[];
  os?: TPPlatformOS;
  inputPlaceholder?: string;
  defaultInputValue?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}

export interface TPActionSheetOption {
  key: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  selected?: boolean;
}

export interface TPActionSheetProps {
  open: boolean;
  title?: React.ReactNode;
  message?: React.ReactNode;
  options: readonly TPActionSheetOption[];
  cancelText?: string;
  os?: TPPlatformOS;
  onSelect: (option: TPActionSheetOption) => void;
  onClose: () => void;
}

export interface TPBottomSheetProps {
  open: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  showCloseButton?: boolean;
  showGrabber?: boolean;
  footer?: React.ReactNode;
  maxHeight?: number | string;
  children: React.ReactNode;
}

export interface TPPopupProps {
  open: boolean;
  placement?: 'center' | 'top' | 'bottom';
  title?: React.ReactNode;
  closable?: boolean;
  maskClosable?: boolean;
  onClose: () => void;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export interface TPMenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  selected?: boolean;
  danger?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
}

export interface TPMenuProps {
  open: boolean;
  items: readonly TPMenuItem[];
  onSelect: (item: TPMenuItem) => void;
  onClose: () => void;
  align?: 'left' | 'right' | 'center';
  className?: string;
  style?: React.CSSProperties;
}

export type TPToastType = 'default' | 'info' | 'success' | 'warning' | 'error' | 'loading';

export interface TPToastProps {
  open?: boolean;
  type?: TPToastType;
  message: React.ReactNode;
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface TPPromptProps {
  tone?: 'info' | 'focus' | 'warning' | 'alert';
  title: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
