import React, { useState } from 'react';
import type { TPDayKey } from '../../core/types';
import { TPHeader } from '../../core/components/TPHeader';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPSwitch } from '../../core/components/TPSwitch';
import { TPDaySwitcher } from '../../core/components/TPDaySwitcher';
import { TPTimePicker } from '../../core/components/TPTimePicker';
import { TPBottomSheet } from '../../core/components/TPBottomSheet';
import { TPButton } from '../../core/components/TPButton';
import { TPTag } from '../../core/components/TPTag';
import { TPIcon } from '../../assets-lib';
import '../../styles/tp-omada.css';

export type OmadaScheduleTarget = 'wlan' | 'poe' | 'reboot';

export interface OmadaScheduleRule {
  id: string;
  name: string;
  target: OmadaScheduleTarget;
  enabled: boolean;
  days: TPDayKey[];
  startTime: { hour: number; minute: number };
  endTime?: { hour: number; minute: number };
}

export const DEFAULT_OMADA_SCHEDULES: readonly OmadaScheduleRule[] = [
  {
    id: 'sch-1',
    name: 'Nighttime Wi-Fi Off (Guest)',
    target: 'wlan',
    enabled: true,
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    startTime: { hour: 23, minute: 0 },
    endTime: { hour: 7, minute: 0 },
  },
  {
    id: 'sch-2',
    name: 'PoE Power Saving — Desk APs',
    target: 'poe',
    enabled: false,
    days: ['sat', 'sun'],
    startTime: { hour: 20, minute: 30 },
    endTime: { hour: 8, minute: 0 },
  },
  {
    id: 'sch-3',
    name: 'Weekly Gateway Auto-Reboot',
    target: 'reboot',
    enabled: true,
    days: ['sun'],
    startTime: { hour: 4, minute: 0 },
  },
];

function formatClock(t: { hour: number; minute: number }): string {
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
}

export interface OmadaScheduleBlockProps {
  rules?: readonly OmadaScheduleRule[];
  showHeader?: boolean;
  onBack?: () => void;
  onChange?: (rules: OmadaScheduleRule[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Omada v5.3+ Schedule block (`SMBNET-3501`) supporting WLAN, PoE, and Reboot schedules
 * with `TPDaySwitcher` weekday selection and `TPTimePicker` bottom sheet editing.
 */
export const OmadaScheduleBlock: React.FC<OmadaScheduleBlockProps> = ({
  rules: initialRules = DEFAULT_OMADA_SCHEDULES,
  showHeader = true,
  onBack,
  onChange,
  className = '',
  style,
}) => {
  const [rules, setRules] = useState<OmadaScheduleRule[]>(() =>
    initialRules.map((r) => ({ ...r, days: [...r.days], startTime: { ...r.startTime } })),
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingRule = rules.find((r) => r.id === editingId) ?? null;

  const commitRules = (next: OmadaScheduleRule[]) => {
    setRules(next);
    onChange?.(next);
  };

  const toggleRule = (id: string, nextEnabled: boolean) => {
    commitRules(rules.map((r) => (r.id === id ? { ...r, enabled: nextEnabled } : r)));
  };

  const updateEditingDays = (days: TPDayKey[]) => {
    if (!editingRule) return;
    commitRules(rules.map((r) => (r.id === editingRule.id ? { ...r, days } : r)));
  };

  const updateEditingStartTime = (time: { hour: number; minute: number }) => {
    if (!editingRule) return;
    commitRules(
      rules.map((r) =>
        r.id === editingRule.id
          ? { ...r, startTime: { hour: time.hour, minute: time.minute } }
          : r,
      ),
    );
  };

  const handleAddRule = () => {
    const newRule: OmadaScheduleRule = {
      id: `sch-${rules.length + 1}`,
      name: `Custom PoE Window #${rules.length + 1}`,
      target: 'poe',
      enabled: true,
      days: ['mon', 'wed', 'fri'],
      startTime: { hour: 22, minute: 0 },
      endTime: { hour: 6, minute: 30 },
    };
    commitRules([...rules, newRule]);
    setEditingId(newRule.id);
  };

  return (
    <div className={`tp-omada-screen ${className}`.trim()} data-testid="omada-schedule-block" style={style}>
      {showHeader && (
        <div className="tp-omada-header-wrap">
          <TPHeader
            variant="floating"
            title="Schedules"
            subtitle="WLAN • PoE • Reboot"
            left={
              onBack ? (
                <button
                  type="button"
                  className="tp-header-icon-btn"
                  aria-label="Back"
                  onClick={onBack}
                >
                  <TPIcon name="nav-back" size={20} />
                </button>
              ) : undefined
            }
            right={
              <button
                type="button"
                className="tp-header-icon-btn"
                aria-label="Add schedule"
                onClick={handleAddRule}
              >
                <TPIcon name="nav-add" size={20} />
              </button>
            }
          />
        </div>
      )}

      <div className="tp-omada-scroll">
        <div className={`tp-omada-body ${showHeader ? '' : 'tp-omada-body--no-header'}`.trim()}>
          <TPSectionHeader title="Active Policies" count={rules.length} />

          <TPListCard divided>
            {rules.map((rule) => (
              <TPListItem
                key={rule.id}
                leading={
                  <TPTag tone={rule.target === 'poe' ? 'warning' : 'focus'} size="sm">
                    {rule.target.toUpperCase()}
                  </TPTag>
                }
                title={rule.name}
                subtitle={`${rule.days.map((d) => d.toUpperCase()).join(', ') || 'Once'} • ${formatClock(
                  rule.startTime,
                )}${rule.endTime ? `–${formatClock(rule.endTime)}` : ''}`}
                switchProps={{
                  checked: rule.enabled,
                  onChange: (val) => toggleRule(rule.id, val),
                  ariaLabel: `Toggle ${rule.name}`,
                }}
                onClick={() => setEditingId(rule.id)}
              />
            ))}
          </TPListCard>

          <TPButton variant="secondary" block onClick={handleAddRule}>
            + Add Schedule Rule
          </TPButton>
        </div>
      </div>

      <TPBottomSheet
        open={Boolean(editingRule)}
        title={editingRule?.name ?? 'Edit Schedule'}
        subtitle="Select active weekdays and start time"
        onClose={() => setEditingId(null)}
      >
        {editingRule && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TPListCard divided>
              <TPListItem
                title="Enable Schedule"
                trailing={
                  <TPSwitch
                    checked={editingRule.enabled}
                    onChange={(val) => toggleRule(editingRule.id, val)}
                    ariaLabel="Enable rule"
                  />
                }
              />
            </TPListCard>
            <TPSectionHeader title="Repeat Days" />
            <TPDaySwitcher value={editingRule.days} onChange={updateEditingDays} />
            <TPSectionHeader title="Trigger Start Time" />
            <TPTimePicker
              use12Hour={false}
              minuteStep={5}
              value={editingRule.startTime}
              onChange={updateEditingStartTime}
            />
            <TPButton variant="primary" block onClick={() => setEditingId(null)}>
              Save Schedule
            </TPButton>
          </div>
        )}
      </TPBottomSheet>
    </div>
  );
};
