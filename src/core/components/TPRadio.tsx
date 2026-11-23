import React, { useId, useState } from 'react';
import type { TPRadioGroupProps, TPRadioProps } from '../types';
import '../../styles/tp-core-extended.css';

/**
 * TP-Design theme-adaptive radio selection button.
 */
export const TPRadio: React.FC<TPRadioProps> = ({
  checked,
  defaultChecked = false,
  disabled = false,
  label,
  description,
  value,
  name,
  onChange,
  ariaLabel,
  className = '',
  style,
}) => {
  const inputId = useId();
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : internalChecked;

  const handleChange = () => {
    if (disabled) return;
    if (!isControlled) {
      setInternalChecked(true);
    }
    onChange?.(true);
  };

  const classes = [
    'tp-check-row',
    isChecked ? 'tp-check-row--checked' : '',
    disabled ? 'tp-check-row--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label htmlFor={inputId} className={classes} style={style}>
      <input
        id={inputId}
        type="radio"
        name={name}
        value={value}
        className="tp-check-native"
        checked={isChecked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={handleChange}
      />
      <span
        className={`tp-radio-ring ${isChecked ? 'tp-radio-ring--active' : ''}`.trim()}
        aria-hidden="true"
      >
        {isChecked && <span className="tp-radio-dot" />}
      </span>
      {(label !== undefined || description !== undefined) && (
        <span className="tp-check-texts">
          {label !== undefined && <span className="tp-check-label">{label}</span>}
          {description !== undefined && <span className="tp-check-desc">{description}</span>}
        </span>
      )}
    </label>
  );
};

/**
 * Exclusive selection TPRadioGroup supporting vertical and horizontal layouts.
 */
export const TPRadioGroup: React.FC<TPRadioGroupProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  direction = 'vertical',
  disabled = false,
  name,
  className = '',
  style,
}) => {
  const autoName = useId();
  const groupName = name ?? `tp-radio-group-${autoName}`;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue ?? options[0]?.value ?? '',
  );
  const activeValue = isControlled ? value : internalValue;

  const selectOption = (optValue: string) => {
    if (!isControlled) {
      setInternalValue(optValue);
    }
    onChange?.(optValue);
  };

  return (
    <div
      role="radiogroup"
      className={`tp-choice-group tp-choice-group--${direction} ${className}`.trim()}
      style={style}
    >
      {options.map((opt) => (
        <TPRadio
          key={opt.value}
          name={groupName}
          value={opt.value}
          label={opt.label}
          description={opt.description}
          disabled={disabled || opt.disabled}
          checked={activeValue === opt.value}
          onChange={() => selectOption(opt.value)}
        />
      ))}
    </div>
  );
};
