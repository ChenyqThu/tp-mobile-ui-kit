import React, { useMemo, useState } from 'react';
import { TPTag } from '../../core/components/TPTag';
import { TPFixedToast } from '../../core/components/TPFixedToast';
import { TPIcon } from '../../assets-lib';
import {
  DEFAULT_OMADA_PORTS,
  getOmadaPortSpeedColor,
  type OmadaHardwarePort,
} from './OmadaPortPanelBlock';
import '../../styles/tp-omada.css';

export type OmadaPortSelectorMode = 'select' | 'icon-select' | 'lag';

export interface OmadaPortSelectorBlockProps {
  ports?: readonly OmadaHardwarePort[];
  mode?: OmadaPortSelectorMode;
  multiple?: boolean;
  value?: readonly string[];
  defaultValue?: readonly string[];
  lagGroupName?: string;
  minLagPorts?: number;
  maxLagPorts?: number;
  title?: React.ReactNode;
  onChange?: (selectedIds: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Interactive Omada port selector supporting generic port selection, compact icon-grid selection,
 * and Link Aggregation (LAG) member selection with speed mismatch & count validation.
 */
export const OmadaPortSelectorBlock: React.FC<OmadaPortSelectorBlockProps> = ({
  ports = DEFAULT_OMADA_PORTS,
  mode = 'select',
  multiple = true,
  value,
  defaultValue = [],
  lagGroupName = 'LAG1',
  minLagPorts = 2,
  maxLagPorts = 8,
  title,
  onChange,
  className = '',
  style,
}) => {
  const [internalSelected, setInternalSelected] = useState<string[]>(() => [...defaultValue]);
  const isControlled = value !== undefined;
  const selectedIds = isControlled ? [...value] : internalSelected;

  const isMulti = mode === 'lag' ? true : multiple;

  const togglePort = (port: OmadaHardwarePort) => {
    if (port.speed === 'Disabled') return;
    let next: string[];
    const exists = selectedIds.includes(port.id);
    if (exists) {
      next = selectedIds.filter((id) => id !== port.id);
    } else if (!isMulti) {
      next = [port.id];
    } else {
      if (mode === 'lag' && selectedIds.length >= maxLagPorts) return;
      next = [...selectedIds, port.id];
    }
    if (!isControlled) {
      setInternalSelected(next);
    }
    onChange?.(next);
  };

  const selectedPorts = useMemo(
    () => ports.filter((p) => selectedIds.includes(p.id)),
    [ports, selectedIds],
  );

  const lagValidationWarning = useMemo(() => {
    if (mode !== 'lag' || selectedPorts.length === 0) return undefined;
    if (selectedPorts.length < minLagPorts) {
      return `Select at least ${minLagPorts} ports for ${lagGroupName} (${selectedPorts.length}/${minLagPorts}).`;
    }
    const activeSpeeds = new Set(
      selectedPorts
        .filter((p) => p.speed !== 'Down' && p.speed !== 'Disconnected' && p.speed !== 'Disabled')
        .map((p) => p.speed),
    );
    if (activeSpeeds.size > 1) {
      return `LAG ports should run at matching speed (mixed: ${Array.from(activeSpeeds).join(', ')}).`;
    }
    return undefined;
  }, [mode, selectedPorts, minLagPorts, lagGroupName]);

  return (
    <section
      className={`tp-omada-card tp-omada-port-selector tp-omada-port-selector--${mode} ${className}`.trim()}
      data-testid="omada-port-selector-block"
      data-mode={mode}
      style={style}
    >
      <div className="tp-omada-port-selector-head">
        <div className="tp-omada-chart-title">
          {title ?? (mode === 'lag' ? `${lagGroupName} Member Ports` : 'Select Ports')}
        </div>
        <TPTag size="xs" tone={selectedIds.length > 0 ? 'focus' : 'neutral'}>
          {selectedIds.length} selected
        </TPTag>
      </div>

      <div
        className={
          mode === 'icon-select' ? 'tp-omada-port-selector-icon-grid' : 'tp-omada-chassis-grid'
        }
        role={isMulti ? 'group' : 'radiogroup'}
        aria-label={typeof title === 'string' ? title : 'Port selection'}
      >
        {ports.map((port) => {
          const isSelected = selectedIds.includes(port.id);
          const isDisabled = port.speed === 'Disabled';
          const ledColor = getOmadaPortSpeedColor(port.speed);

          return (
            <button
              key={port.id}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={`tp-omada-chassis-port ${
                isSelected ? 'tp-omada-chassis-port--selected' : ''
              }`.trim()}
              onClick={() => togglePort(port)}
            >
              <span
                className="tp-omada-port-led"
                style={{ backgroundColor: ledColor }}
                aria-hidden="true"
              />
              {mode === 'icon-select' ? (
                <>
                  <TPIcon
                    name={port.media === 'sfp' ? 'port-sfp2' : 'port-lan'}
                    size={22}
                  />
                  <span className="tp-omada-port-name">{port.portNumber ?? port.label}</span>
                </>
              ) : (
                <>
                  <span className="tp-omada-port-selector-check" aria-hidden="true">
                    {isSelected ? '✓' : ''}
                  </span>
                  <TPIcon
                    name={port.media === 'sfp' ? 'port-sfp2' : 'port-lan'}
                    size={18}
                  />
                  <span className="tp-omada-port-name">{port.label}</span>
                  <span className="tp-omada-port-speed">{port.speed}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {lagValidationWarning && (
        <div style={{ marginTop: 10 }}>
          <TPFixedToast status="warning" message={lagValidationWarning} />
        </div>
      )}

      {selectedPorts.length > 0 && (
        <div className="tp-omada-port-selector-summary">
          Members: {selectedPorts.map((p) => p.label).join(', ')}
        </div>
      )}
    </section>
  );
};
