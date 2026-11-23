import React, { useState } from 'react';
import type { TPSwitchProps } from '../types';
import '../../styles/tp-core-nav-controls.css';

export const TPSwitch: React.FC<TPSwitchProps> = ({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  loading = false,
  ariaLabel,
  className = '',
  style,
}) => {
  const [internalChecked, setInternalChecked] = useState<boolean>(defaultChecked);
  const isControlled = checked !== undefined;
  const resolvedChecked = isControlled ? checked : internalChecked;
  const isBlocked = disabled || loading;

  const handleToggle = () => {
    if (isBlocked) return;
    const next = !resolvedChecked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onChange?.(next);
  };

  const rootClass = [
    'tp-switch',
    resolvedChecked ? 'tp-switch--checked' : '',
    disabled ? 'tp-switch--disabled' : '',
    loading ? 'tp-switch--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="switch"
      aria-checked={resolvedChecked}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      disabled={isBlocked}
      className={rootClass}
      style={style}
      onClick={handleToggle}
    >
      <span className="tp-switch-thumb" aria-hidden="true">
        {loading && <span className="tp-switch-spinner" />}
      </span>
    </button>
  );
};
