import React, { useRef, useState } from 'react';
import type { TPPinInputProps } from '../types';
import '../../styles/tp-core-extended.css';

/**
 * Multi-cell OTP / verification PIN code input with auto-advance, backspace stepping, and paste distribution.
 */
export const TPPinInput: React.FC<TPPinInputProps> = ({
  length = 6,
  value,
  defaultValue = '',
  masked = false,
  error,
  disabled = false,
  onChange,
  onComplete,
  ariaLabel = 'Verification code',
  className = '',
  style,
}) => {
  const cellCount = Math.max(2, Math.min(8, length));
  const isControlled = value !== undefined;
  const [internalVal, setInternalVal] = useState(defaultValue.slice(0, cellCount));
  const currentVal = (isControlled ? value : internalVal).slice(0, cellCount);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const chars = Array.from({ length: cellCount }, (_, i) => currentVal[i] ?? '');

  const commit = (next: string) => {
    const trimmed = next.slice(0, cellCount);
    if (!isControlled) {
      setInternalVal(trimmed);
    }
    onChange?.(trimmed);
    if (trimmed.length === cellCount) {
      onComplete?.(trimmed);
    }
  };

  return (
    <div
      className={`tp-pin-wrap ${error ? 'tp-pin-wrap--error' : ''} ${className}`.trim()}
      style={style}
    >
      <div className="tp-pin-cells" role="group" aria-label={ariaLabel}>
        {chars.map((char, idx) => (
          <input
            key={idx}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type={masked ? 'password' : 'text'}
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            aria-label={`${ariaLabel} digit ${idx + 1}`}
            className={`tp-pin-cell ${char ? 'tp-pin-cell--filled' : ''} ${
              error ? 'tp-pin-cell--error' : ''
            }`.trim()}
            value={char}
            onChange={(e) => {
              if (disabled) return;
              const raw = e.target.value.replace(/\s+/g, '');
              if (raw.length > 1) {
                const merged = (currentVal.slice(0, idx) + raw).slice(0, cellCount);
                commit(merged);
                refs.current[Math.min(cellCount - 1, idx + raw.length)]?.focus();
                return;
              }
              const nextChars = [...chars];
              nextChars[idx] = raw;
              commit(nextChars.join(''));
              if (raw && idx < cellCount - 1) {
                refs.current[idx + 1]?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !chars[idx] && idx > 0) {
                refs.current[idx - 1]?.focus();
              }
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData('text').replace(/\s+/g, '');
              if (pasted) {
                e.preventDefault();
                commit(pasted);
                refs.current[Math.min(cellCount - 1, pasted.length)]?.focus();
              }
            }}
          />
        ))}
      </div>
      {error && (
        <div className="tp-pin-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
