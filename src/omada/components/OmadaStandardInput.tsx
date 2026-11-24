import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import '../../styles/tp-omada.css';

export type OmadaStandardInputType =
  | 'ip'
  | 'mac'
  | 'text'
  | 'port'
  | 'ip-range'
  | 'cidr'
  | 'ip-port'
  | 'time-range';

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
  const splitParts =
    cleaned.includes('-') || cleaned.includes(':')
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

function validateFullIpv4(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const parts = trimmed.split('.');
  if (parts.length !== 4 || parts.some((p) => p === '' || !/^\d{1,3}$/.test(p))) {
    return 'Enter a valid IPv4 address (e.g. 192.168.0.1)';
  }
  return validateIpSegments(parts);
}

function ipv4ToInt(raw: string): number | null {
  const parts = raw.trim().split('.');
  if (parts.length !== 4) return null;
  let acc = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    acc = (acc * 256) + n;
  }
  return acc;
}

function validatePortValue(raw: string): string | undefined {
  if (!raw.trim()) return undefined;
  const num = Number(raw);
  if (!Number.isInteger(num) || num < 1 || num > 65535) {
    return 'Port must be between 1 and 65535';
  }
  return undefined;
}

function validateTimeStr(raw: string): string | undefined {
  if (!raw.trim()) return undefined;
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 'Use HH:MM 24-hour format (e.g. 09:00)';
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    return 'Hour must be 00–23 and minute 00–59';
  }
  return undefined;
}

/**
 * Figma `【Omada】Standard Input` supporting segmented IPv4 (`0-255`), segmented MAC (`8C-86-DD-A6-A7-5F`),
 * port, text, IP Range, CIDR subnet, IP:Port, and Time Range structured inputs.
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

  // Compound structured value splits
  const [cidrIp, cidrPrefix] = useMemo(() => {
    if (type !== 'cidr') return ['', ''];
    const [ip = '', prefix = ''] = currentValue.split('/');
    return [ip, prefix.replace(/[^0-9]/g, '').slice(0, 2)];
  }, [type, currentValue]);

  const [rangeStart, rangeEnd] = useMemo(() => {
    if (type !== 'ip-range') return ['', ''];
    const parts = currentValue.split(/\s*-\s*/);
    return [parts[0] ?? '', parts[1] ?? ''];
  }, [type, currentValue]);

  const [hostIp, hostPort] = useMemo(() => {
    if (type !== 'ip-port') return ['', ''];
    const [ip = '', port = ''] = currentValue.split(':');
    return [ip, port.replace(/[^0-9]/g, '').slice(0, 5)];
  }, [type, currentValue]);

  const [timeStart, timeEnd] = useMemo(() => {
    if (type !== 'time-range') return ['', ''];
    const parts = currentValue.split(/\s*-\s*/);
    return [parts[0] ?? '', parts[1] ?? ''];
  }, [type, currentValue]);

  const builtInError = useMemo(() => {
    if (type === 'ip') return validateIpSegments(ipSegments);
    if (type === 'port') return validatePortValue(currentValue);
    if (type === 'cidr') {
      const ipErr = validateFullIpv4(cidrIp);
      if (ipErr) return ipErr;
      if (cidrPrefix !== '') {
        const prefixNum = Number(cidrPrefix);
        if (!Number.isInteger(prefixNum) || prefixNum < 0 || prefixNum > 32) {
          return 'CIDR prefix must be between 0 and 32';
        }
      }
    }
    if (type === 'ip-range') {
      const sErr = validateFullIpv4(rangeStart);
      if (sErr) return sErr;
      const eErr = validateFullIpv4(rangeEnd);
      if (eErr) return eErr;
      if (rangeStart.trim() && rangeEnd.trim()) {
        const sInt = ipv4ToInt(rangeStart);
        const eInt = ipv4ToInt(rangeEnd);
        if (sInt !== null && eInt !== null && sInt > eInt) {
          return 'Start IP must not exceed End IP';
        }
      }
    }
    if (type === 'ip-port') {
      const ipErr = validateFullIpv4(hostIp);
      if (ipErr) return ipErr;
      return validatePortValue(hostPort);
    }
    if (type === 'time-range') {
      return validateTimeStr(timeStart) ?? validateTimeStr(timeEnd);
    }
    return undefined;
  }, [
    type,
    ipSegments,
    currentValue,
    cidrIp,
    cidrPrefix,
    rangeStart,
    rangeEnd,
    hostIp,
    hostPort,
    timeStart,
    timeEnd,
  ]);

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

  const singleFieldTypes = type === 'text' || type === 'port';

  return (
    <div
      className={`tp-omada-std-input ${className}`.trim()}
      data-omada-input-type={type}
      style={style}
    >
      {label !== undefined && (
        <label
          htmlFor={singleFieldTypes ? fieldId : `${fieldId}-0`}
          className="tp-omada-std-input-label"
        >
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

      {type === 'cidr' && (
        <div className={shellClass} role="group" aria-label={labelText}>
          <input
            id={`${fieldId}-0`}
            type="text"
            value={cidrIp}
            placeholder="192.168.0.1"
            disabled={disabled}
            readOnly={readOnly}
            aria-label={`${labelText} network IP`}
            aria-invalid={Boolean(resolvedError)}
            className="tp-omada-std-seg-input tp-omada-std-seg-input--text"
            onChange={(e) => {
              if (disabled || readOnly) return;
              emitChange(`${e.target.value}/${cidrPrefix}`);
            }}
          />
          <span className="tp-omada-std-sep" aria-hidden="true">/</span>
          <input
            id={`${fieldId}-1`}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={cidrPrefix}
            placeholder="24"
            disabled={disabled}
            readOnly={readOnly}
            aria-label={`${labelText} prefix length`}
            aria-invalid={Boolean(resolvedError)}
            className="tp-omada-std-seg-input tp-omada-std-seg-input--short"
            onChange={(e) => {
              if (disabled || readOnly) return;
              const prefix = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
              emitChange(`${cidrIp}/${prefix}`);
            }}
          />
        </div>
      )}

      {type === 'ip-range' && (
        <div className={shellClass} role="group" aria-label={labelText}>
          <input
            id={`${fieldId}-0`}
            type="text"
            value={rangeStart}
            placeholder="192.168.0.100"
            disabled={disabled}
            readOnly={readOnly}
            aria-label={`${labelText} start IP`}
            aria-invalid={Boolean(resolvedError)}
            className="tp-omada-std-seg-input tp-omada-std-seg-input--text"
            onChange={(e) => {
              if (disabled || readOnly) return;
              emitChange(`${e.target.value} - ${rangeEnd}`);
            }}
          />
          <span className="tp-omada-std-sep" aria-hidden="true">–</span>
          <input
            id={`${fieldId}-1`}
            type="text"
            value={rangeEnd}
            placeholder="192.168.0.200"
            disabled={disabled}
            readOnly={readOnly}
            aria-label={`${labelText} end IP`}
            aria-invalid={Boolean(resolvedError)}
            className="tp-omada-std-seg-input tp-omada-std-seg-input--text"
            onChange={(e) => {
              if (disabled || readOnly) return;
              emitChange(`${rangeStart} - ${e.target.value}`);
            }}
          />
        </div>
      )}

      {type === 'ip-port' && (
        <div className={shellClass} role="group" aria-label={labelText}>
          <input
            id={`${fieldId}-0`}
            type="text"
            value={hostIp}
            placeholder="192.168.0.10"
            disabled={disabled}
            readOnly={readOnly}
            aria-label={`${labelText} host IP`}
            aria-invalid={Boolean(resolvedError)}
            className="tp-omada-std-seg-input tp-omada-std-seg-input--text"
            onChange={(e) => {
              if (disabled || readOnly) return;
              emitChange(`${e.target.value}:${hostPort}`);
            }}
          />
          <span className="tp-omada-std-sep" aria-hidden="true">:</span>
          <input
            id={`${fieldId}-1`}
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={hostPort}
            placeholder="8080"
            disabled={disabled}
            readOnly={readOnly}
            aria-label={`${labelText} port`}
            aria-invalid={Boolean(resolvedError)}
            className="tp-omada-std-seg-input tp-omada-std-seg-input--short"
            onChange={(e) => {
              if (disabled || readOnly) return;
              const p = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
              emitChange(`${hostIp}:${p}`);
            }}
          />
        </div>
      )}

      {type === 'time-range' && (
        <div className={shellClass} role="group" aria-label={labelText}>
          <input
            id={`${fieldId}-0`}
            type="text"
            value={timeStart}
            placeholder="09:00"
            disabled={disabled}
            readOnly={readOnly}
            aria-label={`${labelText} start time`}
            aria-invalid={Boolean(resolvedError)}
            className="tp-omada-std-seg-input tp-omada-std-seg-input--text"
            onChange={(e) => {
              if (disabled || readOnly) return;
              emitChange(`${e.target.value} - ${timeEnd}`);
            }}
          />
          <span className="tp-omada-std-sep" aria-hidden="true">–</span>
          <input
            id={`${fieldId}-1`}
            type="text"
            value={timeEnd}
            placeholder="18:00"
            disabled={disabled}
            readOnly={readOnly}
            aria-label={`${labelText} end time`}
            aria-invalid={Boolean(resolvedError)}
            className="tp-omada-std-seg-input tp-omada-std-seg-input--text"
            onChange={(e) => {
              if (disabled || readOnly) return;
              emitChange(`${timeStart} - ${e.target.value}`);
            }}
          />
        </div>
      )}

      {singleFieldTypes && (
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
