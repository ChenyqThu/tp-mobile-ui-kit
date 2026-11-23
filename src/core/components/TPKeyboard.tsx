import React from 'react';
import type { TPKeyboardProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

const NUMERIC_DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
const HEX_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

/**
 * Mobile keypad supporting numeric, PIN, and MAC-address hexadecimal input modes.
 */
export const TPKeyboard: React.FC<TPKeyboardProps> = ({
  mode = 'numeric',
  onKeyPress,
  onBackspace,
  onDone,
  doneLabel = 'Done',
  showDot = false,
  showDash,
  className = '',
  style,
}) => {
  const effectiveShowDash = showDash ?? mode === 'mac-hex';
  const hasBothAux = showDot && effectiveShowDash;
  const singleAuxKey = !hasBothAux ? (showDot ? '.' : effectiveShowDash ? '-' : null) : null;

  const classes = [
    'tp-keyboard',
    `tp-keyboard--${mode}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} role="group" aria-label="Keypad">
      {mode === 'mac-hex' && (
        <div className="tp-keyboard-hex-row">
          {HEX_KEYS.map((hex) => (
            <button
              key={hex}
              type="button"
              className="tp-keyboard-key tp-keyboard-key--hex"
              onClick={() => onKeyPress?.(hex)}
            >
              {hex}
            </button>
          ))}
        </div>
      )}

      {hasBothAux && (
        <div className="tp-keyboard-aux-row">
          <button
            type="button"
            className="tp-keyboard-key tp-keyboard-key--action"
            onClick={() => onKeyPress?.('.')}
          >
            .
          </button>
          <button
            type="button"
            className="tp-keyboard-key tp-keyboard-key--action"
            onClick={() => onKeyPress?.('-')}
          >
            -
          </button>
        </div>
      )}

      <div className="tp-keyboard-grid">
        {NUMERIC_DIGITS.map((digit) => (
          <button
            key={digit}
            type="button"
            className="tp-keyboard-key"
            onClick={() => onKeyPress?.(digit)}
          >
            {digit}
          </button>
        ))}

        {singleAuxKey ? (
          <button
            type="button"
            className="tp-keyboard-key tp-keyboard-key--action"
            onClick={() => onKeyPress?.(singleAuxKey)}
          >
            {singleAuxKey}
          </button>
        ) : (
          <div className="tp-keyboard-spacer" aria-hidden="true" />
        )}

        <button
          type="button"
          className="tp-keyboard-key"
          onClick={() => onKeyPress?.('0')}
        >
          0
        </button>

        <button
          type="button"
          className="tp-keyboard-key tp-keyboard-key--action"
          aria-label="Backspace"
          onClick={onBackspace}
        >
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden="true">
            <path
              d="M8.2 2H19C19.8 2 20.5 2.7 20.5 3.5V14.5C20.5 15.3 19.8 16 19 16H8.2C7.7 16 7.2 15.8 6.9 15.4L2.1 9.6C1.8 9.3 1.8 8.7 2.1 8.4L6.9 2.6C7.2 2.2 7.7 2 8.2 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M11 6.3L16 11.3M16 6.3L11 11.3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <button
        type="button"
        className="tp-keyboard-key tp-keyboard-key--done"
        onClick={onDone}
      >
        {doneLabel}
      </button>
    </div>
  );
};
