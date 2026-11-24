import React, { useState } from 'react';
import { TPButton } from '../../core/components/TPButton';
import { TPEmptyState } from '../../core/components/TPEmptyState';
import { TPInput } from '../../core/components/TPInput';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPIcon } from '../../assets-lib';
import '../../styles/tp-omada.css';

export interface OmadaFormRepeaterItem {
  id: string;
  keyLabel?: string;
  value: string;
}

export interface OmadaFormRepeaterBlockProps {
  title?: React.ReactNode;
  items?: readonly OmadaFormRepeaterItem[];
  defaultItems?: readonly OmadaFormRepeaterItem[];
  keyLabel?: string;
  keyPlaceholder?: string;
  valueLabel?: string;
  valuePlaceholder?: string;
  addText?: string;
  minItems?: number;
  maxItems?: number;
  onChange?: (next: OmadaFormRepeaterItem[]) => void;
  renderRow?: (
    item: OmadaFormRepeaterItem,
    index: number,
    update: (patch: Partial<OmadaFormRepeaterItem>) => void,
  ) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Repeatable dynamic form row block (`Add Item` / delete row / bounded count) for DNS servers,
 * DHCP options, VLAN subnets, or ACL match rules.
 */
export const OmadaFormRepeaterBlock: React.FC<OmadaFormRepeaterBlockProps> = ({
  title = 'Entries',
  items: controlledItems,
  defaultItems = [],
  keyLabel,
  keyPlaceholder = 'Option Code',
  valueLabel = 'Value',
  valuePlaceholder = 'Enter value',
  addText = 'Add Entry',
  minItems = 0,
  maxItems = 12,
  onChange,
  renderRow,
  className = '',
  style,
}) => {
  const [internalItems, setInternalItems] = useState<OmadaFormRepeaterItem[]>(() => [
    ...defaultItems,
  ]);
  const isControlled = controlledItems !== undefined;
  const activeItems = isControlled ? [...controlledItems] : internalItems;

  const commit = (next: OmadaFormRepeaterItem[]) => {
    if (!isControlled) {
      setInternalItems(next);
    }
    onChange?.(next);
  };

  const handleAdd = () => {
    if (activeItems.length >= maxItems) return;
    const nextItem: OmadaFormRepeaterItem = {
      id: `item-${Date.now()}-${activeItems.length + 1}`,
      ...(keyLabel !== undefined ? { keyLabel: '' } : {}),
      value: '',
    };
    commit([...activeItems, nextItem]);
  };

  const handleRemove = (id: string) => {
    if (activeItems.length <= minItems) return;
    commit(activeItems.filter((item) => item.id !== id));
  };

  const handleUpdate = (id: string, patch: Partial<OmadaFormRepeaterItem>) => {
    commit(activeItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  return (
    <section
      className={`tp-omada-repeater ${className}`.trim()}
      data-testid="omada-form-repeater-block"
      style={style}
    >
      <TPSectionHeader
        title={title}
        count={activeItems.length}
        action={
          activeItems.length < maxItems ? (
            <TPButton variant="in-card" size="sm" onClick={handleAdd}>
              + {addText}
            </TPButton>
          ) : undefined
        }
      />

      {activeItems.length === 0 ? (
        <div className="tp-omada-card">
          <TPEmptyState
            size="compact"
            title="No entries configured"
            actionText={addText}
            onAction={handleAdd}
          />
        </div>
      ) : (
        <TPListCard divided>
          {activeItems.map((item, idx) => (
            <div key={item.id} className="tp-omada-repeater-row">
              <div className="tp-omada-repeater-fields">
                {renderRow ? (
                  renderRow(item, idx, (patch) => handleUpdate(item.id, patch))
                ) : (
                  <div className="tp-omada-repeater-default-inputs">
                    {keyLabel !== undefined && (
                      <TPInput
                        variant="underline"
                        label={keyLabel}
                        value={item.keyLabel ?? ''}
                        placeholder={keyPlaceholder}
                        onChange={(nextVal) => handleUpdate(item.id, { keyLabel: nextVal })}
                      />
                    )}
                    <TPInput
                      variant="underline"
                      label={valueLabel}
                      value={item.value}
                      placeholder={valuePlaceholder}
                      onChange={(nextVal) => handleUpdate(item.id, { value: nextVal })}
                    />
                  </div>
                )}
              </div>

              {activeItems.length > minItems && (
                <button
                  type="button"
                  className="tp-omada-repeater-del"
                  aria-label={`Remove entry ${idx + 1}`}
                  onClick={() => handleRemove(item.id)}
                >
                  <TPIcon name="clear-circle" size={18} />
                </button>
              )}
            </div>
          ))}
        </TPListCard>
      )}
    </section>
  );
};

export interface OmadaCustomOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
}

export interface OmadaCustomOptionListProps {
  title?: React.ReactNode;
  options: readonly OmadaCustomOption[];
  value?: string;
  defaultValue?: string;
  customLabel?: string;
  customPlaceholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Single-select option list with preset choices plus an inline Custom value entry row.
 */
export const OmadaCustomOptionList: React.FC<OmadaCustomOptionListProps> = ({
  title,
  options,
  value: controlledValue,
  defaultValue,
  customLabel = 'Custom',
  customPlaceholder = 'Enter custom value',
  onChange,
  className = '',
  style,
}) => {
  const [internalVal, setInternalVal] = useState<string>(
    defaultValue ?? options[0]?.value ?? '',
  );
  const activeValue = controlledValue !== undefined ? controlledValue : internalVal;
  const matchesPreset = options.some((opt) => opt.value === activeValue);
  const [customActive, setCustomActive] = useState<boolean>(!matchesPreset);
  const [customDraft, setCustomDraft] = useState<string>(!matchesPreset ? activeValue : '');

  const selectValue = (next: string, isCustom: boolean) => {
    setCustomActive(isCustom);
    if (controlledValue === undefined) {
      setInternalVal(next);
    }
    onChange?.(next);
  };

  return (
    <div
      className={`tp-omada-custom-options ${className}`.trim()}
      data-testid="omada-custom-option-list"
      style={style}
    >
      {title && <TPSectionHeader title={title} />}
      <TPListCard divided>
        {options.map((opt) => {
          const isChecked = !customActive && activeValue === opt.value;
          return (
            <TPListItem
              key={opt.value}
              title={opt.label}
              subtitle={opt.description}
              checked={isChecked}
              onClick={() => selectValue(opt.value, false)}
            />
          );
        })}
        <TPListItem
          title={customLabel}
          checked={customActive}
          onClick={() => selectValue(customDraft, true)}
        />
        {customActive && (
          <div style={{ padding: '8px 16px 12px' }}>
            <TPInput
              variant="underline"
              value={customDraft}
              placeholder={customPlaceholder}
              onChange={(nextVal) => {
                setCustomDraft(nextVal);
                selectValue(nextVal, true);
              }}
            />
          </div>
        )}
      </TPListCard>
    </div>
  );
};
