import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import '../../styles/tp-omada.css';

export type OmadaStandardInputType = 'ip' | 'mac' | 'text' | 'port';

export interface OmadaStandardInputProps {
  type?: OmadaStandardInputType;
  label?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

const IP_OCTET_COUNT = 4;
const MAC_PAIR_COUNT = 6;

function parseIpSegments(raw: string): string[] {
  const parts = raw.split('.').slice(0, IP_OCTET_COUNT);
  while (parts.length < IP_OCTET_COUNT) parts.push('');
  return parts.map((p) => p.replace(/[^0-9]/g, '').slice(0, 3));
}

function parseMacSegments(raw: string): string[] {
  const cleaned = raw.replace(/[^0-9a-fA-F-:\s]/g, '');
  const splitParts = cleaned.includes('-') || cleaned.includes(':')
    ? cleaned.split(/[-:]/)
    : (cleaned.replace(/[^0-9a-fA-F]/g, '').match(/.{1,2}/g) ?? []);
  const parts = splitParts.slice(0, MAC_PAIR_COUNT);
  while (parts.length < MAC_PAIR_COUNT) parts.push('');
  return parts.map((p) => p.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 2));
}

function validateIpSegments(segments: string[]): string | undefined {
  for (const seg of segments) {
    if (seg === '') continue;
    const num = Number(seg);
    if (!Number.isInteger(num) || num < 0 || num > 255) {
      return 'Each IPv4 octet must be between 0 and 255';
    }
  }
  return undefined;
}

function validatePortValue(raw: string): string | undefined {
  if (!raw.trim()) return undefined;
  const num = Number(raw);
  if (!Number.isInteger(num) || num < 1 || num > 65535) {
    return 'Port must be between 1 and 65535';
  }
  return undefined;
}

/**
 * Figma `【Omada】Standard Input` supporting segmented IPv4 (`0-255`), segmented MAC (`8C-86-DD-A6-A7-5F`), port, and text fields.
 */
export const OmadaStandardInput: React.FC<OmadaStandardInputProps> = ({
  type = 'text',
  label,
  value: controlledValue,
  defaultValue = '',
  onChange,
  placeholder,
  error: externalError,
  helperText,
  disabled = false,
  readOnly = false,
  id: providedId,
  name,
  className = '',
  style,
}) => {
  const reactId = useId();
  const fieldId = providedId ?? `tp-omada-std-${reactId}`;
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setUncontrolledValue(controlledValue);
    }
  }, [controlledValue]);

  const currentValue = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const ipRefs = useRef<(HTMLInputElement | null)[]>([]);
  const macRefs = useRef<(HTMLInputElement | null)[]>([]);

  const ipSegments = useMemo(
    () => (type === 'ip' ? parseIpSegments(currentValue) : []),
    [type, currentValue],
  );
  const macSegments = useMemo(
    () => (type === 'mac' ? parseMacSegments(currentValue) : []),
    [type, currentValue],
  );

  const builtInError = useMemo(() => {
    if (type === 'ip') return validateIpSegments(ipSegments);
    if (type === 'port') return validatePortValue(currentValue);
    return undefined;
  }, [type, ipSegments, currentValue]);

  const resolvedError = externalError ?? builtInError;
  const labelText = typeof label === 'string' ? label : type.toUpperCase();

  const emitChange = (next: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(next);
    }
    onChange?.(next);
  };

  const handleIpSegmentChange = (index: number, rawInput: string) => {
    if (disabled || readOnly) return;
    if (rawInput.includes('.')) {
      const incoming = parseIpSegments(rawInput);
      if (rawInput.split('.').length >= 2 && index === 0) {
        emitChange(incoming.join('.'));
        const nextFocus = Math.min(IP_OCTET_COUNT - 1, rawInput.split('.').length - 1);
        ipRefs.current[nextFocus]?.focus();
        return;
      }
      const digitsOnly = rawInput.replace(/[^0-9]/g, '').slice(0, 3);
      const nextSegs = [...ipSegments];
      nextSegs[index] = digitsOnly;
      emitChange(nextSegs.join('.'));
      if (index < IP_OCTET_COUNT - 1) {
        ipRefs.current[index + 1]?.focus();
      }
      return;
    }

    const digits = rawInput.replace(/[^0-9]/g, '').slice(0, 3);
    const nextSegs = [...ipSegments];
    nextSegs[index] = digits;
    emitChange(nextSegs.join('.'));

    if (digits.length === 3 && Number(digits) <= 255 && index < IP_OCTET_COUNT - 1) {
      ipRefs.current[index + 1]?.focus();
    }
  };

  const handleMacSegmentChange = (index: number, rawInput: string) => {
    if (disabled || readOnly) return;
    const stripped = rawInput.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
    if (stripped.length > 2) {
      const distributed = parseMacSegments(rawInput);
      emitChange(distributed.join('-'));
      const targetIndex = Math.min(MAC_PAIR_COUNT - 1, Math.floor((stripped.length - 1) / 2));
      macRefs.current[targetIndex]?.focus();
      return;
    }

    const nextSegs = [...macSegments];
    nextSegs[index] = stripped.slice(0, 2);
    emitChange(nextSegs.join('-'));

    if (stripped.length === 2 && index < MAC_PAIR_COUNT - 1) {
      macRefs.current[index + 1]?.focus();
    }
  };

  const handleSegmentedKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    segments: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
  ) => {
    if (e.key === 'Backspace' && segments[index] === '' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0 && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (
      e.key === 'ArrowRight' &&
      e.currentTarget.selectionStart === e.currentTarget.value.length &&
      index < segments.length - 1
    ) {
      refs.current[index + 1]?.focus();
    }
  };

  const shellClass = [
    'tp-omada-std-input-shell',
    resolvedError ? 'tp-omada-std-input-shell--error' : '',
    disabled ? 'tp-omada-std-input-shell--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`tp-omada-std-input ${className}`.trim()}
      data-omada-input-type={type}
      style={style}
    >
      {label !== undefined && (
        <label htmlFor={type === 'text' || type === 'port' ? fieldId : `${fieldId}-0`} className="tp-omada-std-input-label">
          {label}
        </label>
      )}

      {type === 'ip' && (
        <div className={shellClass} role="group" aria-label={labelText}>
          {ipSegments.map((seg, idx) => (
            <React.Fragment key={idx}>
              <input
                ref={(el) => {
                  ipRefs.current[idx] = el;
                }}
                id={`${fieldId}-${idx}`}
                name={name ? `${name}-${idx}` : undefined}
                type="text"
                inputMode="numeric"
                maxLength={3}
                value={seg}
                placeholder="0"
                disabled={disabled}
                readOnly={readOnly}
                aria-label={`${labelText} octet ${idx + 1}`}
                aria-invalid={Boolean(resolvedError)}
                className="tp-omada-std-seg-input"
                onChange={(e) => handleIpSegmentChange(idx, e.target.value)}
                onKeyDown={(e) => handleSegmentedKeyDown(e, idx, ipSegments, ipRefs)}
              />
              {idx < IP_OCTET_COUNT - 1 && (
                <span className="tp-omada-std-sep" aria-hidden="true">
                  .
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {type === 'mac' && (
        <div className={shellClass} role="group" aria-label={labelText}>
          {macSegments.map((seg, idx) => (
            <React.Fragment key={idx}>
              <input
                ref={(el) => {
                  macRefs.current[idx] = el;
                }}
                id={`${fieldId}-${idx}`}
                name={name ? `${name}-${idx}` : undefined}
                type="text"
                maxLength={2}
                value={seg}
                placeholder="00"
                disabled={disabled}
                readOnly={readOnly}
                aria-label={`${labelText} byte ${idx + 1}`}
                aria-invalid={Boolean(resolvedError)}
                className="tp-omada-std-seg-input"
                onChange={(e) => handleMacSegmentChange(idx, e.target.value)}
                onKeyDown={(e) => handleSegmentedKeyDown(e, idx, macSegments, macRefs)}
              />
              {idx < MAC_PAIR_COUNT - 1 && (
                <span className="tp-omada-std-sep" aria-hidden="true">
                  -
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {(type === 'text' || type === 'port') && (
        <div className={shellClass}>
          <input
            id={fieldId}
            name={name}
            type="text"
            inputMode={type === 'port' ? 'numeric' : 'text'}
            value={currentValue}
            placeholder={placeholder ?? (type === 'port' ? '1–65535' : '')}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={Boolean(resolvedError)}
            className="tp-omada-std-seg-input tp-omada-std-seg-input--text"
            onChange={(e) => {
              if (disabled || readOnly) return;
              const val =
                type === 'port' ? e.target.value.replace(/[^0-9]/g, '').slice(0, 5) : e.target.value;
              emitChange(val);
            }}
          />
        </div>
      )}

      {resolvedError ? (
        <div className="tp-omada-std-error" role="alert">
          {resolvedError}
        </div>
      ) : helperText ? (
        <div className="tp-omada-std-helper">{helperText}</div>
      ) : null}
    </div>
  );
};
