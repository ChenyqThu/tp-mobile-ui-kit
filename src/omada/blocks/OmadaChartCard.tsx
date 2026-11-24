import React, { useMemo, useState } from 'react';
import { TPEmptyState } from '../../core/components/TPEmptyState';
import { TPSegment } from '../../core/components/TPSegment';
import { TPSkeleton } from '../../core/components/TPSkeleton';
import '../../styles/tp-omada.css';

export type OmadaChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'stacked-bar'
  | 'donut'
  | 'speed-bar';

export interface OmadaChartSeries {
  key: string;
  label: string;
  color?: string;
  values: readonly number[];
  stack?: string;
}

export interface OmadaChartTimeRangeOption {
  key: string;
  label: string;
}

export interface OmadaChartScaleResult {
  min: number;
  max: number;
  step: number;
  ticks: number[];
}

const DEFAULT_SERIES_COLORS = [
  'var(--tp-focus, #00A870)',
  'var(--tp-text-highlighted, #0069CB)',
  'var(--tp-color-yellow, #FF8C27)',
  'var(--tp-color-purple, #9C4CA3)',
  'var(--tp-color-alert, #EE385C)',
] as const;

function niceNumber(range: number, round: boolean): number {
  if (range <= 0 || !Number.isFinite(range)) return 1;
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * 10 ** exponent;
}

/**
 * Computes nice human-readable axis ticks supporting all-zero datasets and negative dBm ranges.
 */
export function computeOmadaAxisScale(
  values: readonly number[],
  options?: { tickCount?: number; allowNegative?: boolean; zeroBaseline?: boolean },
): OmadaChartScaleResult {
  const tickCount = Math.max(2, options?.tickCount ?? 5);
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) {
    return { min: 0, max: 100, step: 25, ticks: [0, 25, 50, 75, 100] };
  }

  let dataMin = Math.min(...finite);
  let dataMax = Math.max(...finite);
  const hasNegative = dataMin < 0;
  const zeroBaseline = options?.zeroBaseline ?? !hasNegative;

  if (!hasNegative && zeroBaseline) {
    dataMin = 0;
  }
  if (options?.allowNegative === false && dataMin < 0) {
    dataMin = 0;
  }

  if (dataMin === dataMax) {
    if (dataMin === 0) {
      return { min: 0, max: 10, step: 2.5, ticks: [0, 2.5, 5, 7.5, 10] };
    }
    const pad = Math.max(1, Math.abs(dataMin) * 0.2);
    dataMin = hasNegative ? dataMin - pad : Math.max(0, dataMin - pad);
    dataMax = dataMax + pad;
  }

  const rawRange = niceNumber(dataMax - dataMin, false);
  const step = niceNumber(rawRange / (tickCount - 1), true);
  const niceMin = Math.floor(dataMin / step) * step;
  const niceMax = Math.ceil(dataMax / step) * step;

  const ticks: number[] = [];
  const precision = Math.max(0, -Math.floor(Math.log10(step)) + 2);
  for (let v = niceMin; v <= niceMax + step * 0.001; v += step) {
    ticks.push(Number(v.toFixed(precision)));
  }

  return {
    min: ticks[0] ?? niceMin,
    max: ticks[ticks.length - 1] ?? niceMax,
    step,
    ticks,
  };
}

export interface OmadaChartCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  type?: OmadaChartType;
  labels?: readonly string[];
  series: readonly OmadaChartSeries[];
  secondarySeries?: readonly OmadaChartSeries[];
  unit?: string;
  secondaryUnit?: string;
  timeRanges?: readonly OmadaChartTimeRangeOption[];
  activeTimeRange?: string;
  onTimeRangeChange?: (key: string) => void;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  extra?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Omada data-visualization card supporting line, area, bar, stacked-bar, donut,
 * and speed-bar charts with dual Y-axes, negative dBm scaling, tooltips, loading, and empty states.
 */
export const OmadaChartCard: React.FC<OmadaChartCardProps> = ({
  title,
  subtitle,
  type = 'line',
  labels = [],
  series,
  secondarySeries,
  unit = '',
  secondaryUnit = '',
  timeRanges,
  activeTimeRange,
  onTimeRangeChange,
  loading = false,
  empty = false,
  emptyTitle = 'No Chart Data',
  emptyDescription = 'Metrics will appear once devices report telemetry.',
  extra,
  className = '',
  style,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const hasData =
    !empty &&
    series.length > 0 &&
    series.some((s) => s.values.length > 0);

  const pointCount = useMemo(() => {
    const counts = [labels.length, ...series.map((s) => s.values.length)];
    if (secondarySeries) {
      counts.push(...secondarySeries.map((s) => s.values.length));
    }
    return Math.max(0, ...counts);
  }, [labels.length, series, secondarySeries]);

  const primaryScale = useMemo(() => {
    if (!hasData) return computeOmadaAxisScale([]);
    if (type === 'stacked-bar') {
      const totals: number[] = [];
      for (let i = 0; i < pointCount; i++) {
        totals.push(series.reduce((sum, s) => sum + Math.max(0, s.values[i] ?? 0), 0));
      }
      return computeOmadaAxisScale(totals, { zeroBaseline: true });
    }
    const flat = series.flatMap((s) => s.values);
    return computeOmadaAxisScale(flat);
  }, [hasData, pointCount, series, type]);

  const secondaryScale = useMemo(() => {
    if (!secondarySeries || secondarySeries.length === 0) return null;
    const flat = secondarySeries.flatMap((s) => s.values);
    return flat.length > 0 ? computeOmadaAxisScale(flat) : null;
  }, [secondarySeries]);

  const resolvedLabels = useMemo(() => {
    if (labels.length >= pointCount) return labels;
    return Array.from({ length: pointCount }, (_, i) => labels[i] ?? `#${i + 1}`);
  }, [labels, pointCount]);

  const activeIdx =
    selectedIndex !== null && selectedIndex < pointCount ? selectedIndex : null;

  const mapY = (val: number, scale: OmadaChartScaleResult, top: number, bottom: number) => {
    const span = Math.max(1e-6, scale.max - scale.min);
    const ratio = (val - scale.min) / span;
    return bottom - ratio * (bottom - top);
  };

  return (
    <section
      className={`tp-omada-card tp-omada-chart-card ${className}`.trim()}
      data-testid="omada-chart-card"
      data-chart-type={type}
      style={style}
    >
      <div className="tp-omada-chart-header">
        <div className="tp-omada-chart-heading">
          <div className="tp-omada-chart-title">{title}</div>
          {subtitle !== undefined && subtitle !== null && (
            <div className="tp-omada-chart-subtitle">{subtitle}</div>
          )}
        </div>
        {extra && <div className="tp-omada-chart-extra">{extra}</div>}
      </div>

      {timeRanges && timeRanges.length > 0 && activeTimeRange !== undefined && onTimeRangeChange && (
        <div style={{ marginTop: 8 }}>
          <TPSegment
            variant="segmented"
            options={timeRanges}
            value={activeTimeRange}
            onChange={onTimeRangeChange}
          />
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 10 }}>
          <TPSkeleton variant="card" animated />
        </div>
      ) : !hasData ? (
        <TPEmptyState
          size="compact"
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : type === 'donut' ? (
        <div className="tp-omada-chart-donut-wrap">
          {(() => {
            const totals = series.map((s, idx) => ({
              key: s.key,
              label: s.label,
              value: s.values.reduce((acc, n) => acc + Math.max(0, n), 0),
              color: s.color ?? DEFAULT_SERIES_COLORS[idx % DEFAULT_SERIES_COLORS.length],
            }));
            const grandTotal = totals.reduce((acc, item) => acc + item.value, 0);
            const radius = 38;
            const circumference = 2 * Math.PI * radius;
            let offsetAcc = 0;

            return (
              <>
                <svg
                  className="tp-omada-chart-donut-svg"
                  viewBox="0 0 110 110"
                  role="img"
                  aria-label="Distribution donut chart"
                >
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="none"
                    stroke="var(--tp-divider)"
                    strokeWidth="14"
                  />
                  {grandTotal > 0 &&
                    totals.map((seg, idx) => {
                      const len = (seg.value / grandTotal) * circumference;
                      const dashOffset = -offsetAcc;
                      offsetAcc += len;
                      return (
                        <circle
                          key={seg.key}
                          cx="55"
                          cy="55"
                          r={radius}
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="14"
                          strokeDasharray={`${len} ${circumference}`}
                          strokeDashoffset={dashOffset}
                          transform="rotate(-90 55 55)"
                          onClick={() => setSelectedIndex(idx)}
                          style={{ cursor: 'pointer' }}
                        />
                      );
                    })}
                  <text
                    x="55"
                    y="53"
                    textAnchor="middle"
                    className="tp-omada-chart-donut-total"
                  >
                    {grandTotal}
                  </text>
                  {unit && (
                    <text
                      x="55"
                      y="67"
                      textAnchor="middle"
                      className="tp-omada-chart-donut-unit"
                    >
                      {unit}
                    </text>
                  )}
                </svg>

                <div className="tp-omada-chart-donut-legend">
                  {totals.map((seg) => (
                    <div key={seg.key} className="tp-omada-chart-legend-row">
                      <span
                        className="tp-omada-chart-dot"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="tp-omada-chart-legend-name">{seg.label}</span>
                      <span className="tp-omada-chart-legend-val">
                        {seg.value}
                        {unit ? ` ${unit}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      ) : type === 'speed-bar' ? (
        <div className="tp-omada-speed-bars">
          {resolvedLabels.map((label, idx) => {
            const val = series[0]?.values[idx] ?? 0;
            const scaleRange = Math.max(1e-6, primaryScale.max - primaryScale.min);
            const pct =
              primaryScale.min < 0 && primaryScale.max <= 0
                ? Math.max(8, Math.min(100, ((val - primaryScale.min) / scaleRange) * 100))
                : Math.max(0, Math.min(100, (val / Math.max(1, primaryScale.max)) * 100));
            const barColor =
              series[0]?.color ?? DEFAULT_SERIES_COLORS[idx % DEFAULT_SERIES_COLORS.length];
            return (
              <button
                key={label + idx}
                type="button"
                className="tp-omada-speed-bar-row"
                onClick={() => setSelectedIndex(idx)}
              >
                <span className="tp-omada-speed-bar-label">{label}</span>
                <span className="tp-omada-speed-bar-track">
                  <span
                    className="tp-omada-speed-bar-fill"
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                  />
                </span>
                <span className="tp-omada-speed-bar-val">
                  {val}
                  {unit ? ` ${unit}` : ''}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="tp-omada-chart-body">
          {activeIdx !== null && (
            <div className="tp-omada-chart-tooltip" role="status">
              <strong>{resolvedLabels[activeIdx]}</strong>
              {series.map((s) => (
                <span key={s.key}>
                  {s.label}: {s.values[activeIdx] ?? 0}
                  {unit ? ` ${unit}` : ''}
                </span>
              ))}
              {secondarySeries?.map((s) => (
                <span key={s.key}>
                  {s.label}: {s.values[activeIdx] ?? 0}
                  {secondaryUnit ? ` ${secondaryUnit}` : ''}
                </span>
              ))}
            </div>
          )}

          {(() => {
            const w = 320;
            const h = 156;
            const leftPad = 38;
            const rightPad = secondaryScale ? 38 : 12;
            const topPad = 12;
            const bottomPad = 24;
            const plotW = w - leftPad - rightPad;
            const plotBottom = h - bottomPad;
            const stepX = pointCount > 1 ? plotW / (pointCount - 1) : plotW;
            const barBand = pointCount > 0 ? plotW / pointCount : plotW;

            return (
              <svg
                className="tp-omada-chart-svg"
                viewBox={`0 0 ${w} ${h}`}
                role="img"
                aria-label={typeof title === 'string' ? title : 'Omada telemetry chart'}
              >
                {primaryScale.ticks.map((tick) => {
                  const y = mapY(tick, primaryScale, topPad, plotBottom);
                  return (
                    <g key={`grid-${tick}`}>
                      <line
                        x1={leftPad}
                        y1={y}
                        x2={w - rightPad}
                        y2={y}
                        stroke="var(--tp-divider)"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={leftPad - 5}
                        y={y + 3}
                        textAnchor="end"
                        className="tp-omada-chart-axis-text"
                      >
                        {tick}
                      </text>
                    </g>
                  );
                })}

                {secondaryScale &&
                  secondaryScale.ticks.map((tick) => {
                    const y = mapY(tick, secondaryScale, topPad, plotBottom);
                    return (
                      <text
                        key={`sec-grid-${tick}`}
                        x={w - rightPad + 5}
                        y={y + 3}
                        textAnchor="start"
                        className="tp-omada-chart-axis-text"
                      >
                        {tick}
                      </text>
                    );
                  })}

                {(type === 'line' || type === 'area') &&
                  series.map((s, sIdx) => {
                    const color =
                      s.color ?? DEFAULT_SERIES_COLORS[sIdx % DEFAULT_SERIES_COLORS.length];
                    const coords = s.values.map((val, idx) => ({
                      x: leftPad + (pointCount === 1 ? plotW / 2 : idx * stepX),
                      y: mapY(val, primaryScale, topPad, plotBottom),
                    }));
                    const polyline = coords.map((p) => `${p.x},${p.y}`).join(' ');
                    const areaPath =
                      coords.length > 0
                        ? `M ${coords[0].x},${plotBottom} L ${coords
                            .map((p) => `${p.x},${p.y}`)
                            .join(' L ')} L ${coords[coords.length - 1].x},${plotBottom} Z`
                        : '';

                    return (
                      <g key={s.key}>
                        {type === 'area' && areaPath && (
                          <path d={areaPath} fill={color} fillOpacity={0.14} />
                        )}
                        <polyline
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          points={polyline}
                        />
                        {coords.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.x}
                            cy={pt.y}
                            r={activeIdx === idx ? 4.5 : 3}
                            fill={color}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedIndex(idx)}
                          />
                        ))}
                      </g>
                    );
                  })}

                {type === 'bar' &&
                  Array.from({ length: pointCount }, (_, idx) => {
                    const groupW = barBand * 0.72;
                    const singleW = Math.max(4, groupW / Math.max(1, series.length));
                    const startX = leftPad + idx * barBand + (barBand - groupW) / 2;
                    const baseY = mapY(
                      Math.max(primaryScale.min, Math.min(primaryScale.max, 0)),
                      primaryScale,
                      topPad,
                      plotBottom,
                    );
                    return (
                      <g key={`bar-group-${idx}`}>
                        {series.map((s, sIdx) => {
                          const val = s.values[idx] ?? 0;
                          const color =
                            s.color ?? DEFAULT_SERIES_COLORS[sIdx % DEFAULT_SERIES_COLORS.length];
                          const yVal = mapY(val, primaryScale, topPad, plotBottom);
                          const top = Math.min(baseY, yVal);
                          const barH = Math.max(1.5, Math.abs(baseY - yVal));
                          return (
                            <rect
                              key={s.key}
                              x={startX + sIdx * singleW}
                              y={top}
                              width={Math.max(2, singleW - 1.5)}
                              height={barH}
                              rx="2.5"
                              fill={color}
                              opacity={activeIdx === null || activeIdx === idx ? 1 : 0.45}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedIndex(idx)}
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                {type === 'stacked-bar' &&
                  Array.from({ length: pointCount }, (_, idx) => {
                    const barW = Math.max(6, barBand * 0.56);
                    const x = leftPad + idx * barBand + (barBand - barW) / 2;
                    let running = 0;
                    return (
                      <g key={`stack-${idx}`}>
                        {series.map((s, sIdx) => {
                          const val = Math.max(0, s.values[idx] ?? 0);
                          const y0 = mapY(running, primaryScale, topPad, plotBottom);
                          running += val;
                          const y1 = mapY(running, primaryScale, topPad, plotBottom);
                          const color =
                            s.color ?? DEFAULT_SERIES_COLORS[sIdx % DEFAULT_SERIES_COLORS.length];
                          return (
                            <rect
                              key={s.key}
                              x={x}
                              y={y1}
                              width={barW}
                              height={Math.max(1, y0 - y1)}
                              fill={color}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedIndex(idx)}
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                {secondaryScale &&
                  secondarySeries?.map((s, sIdx) => {
                    const color =
                      s.color ??
                      DEFAULT_SERIES_COLORS[(series.length + sIdx) % DEFAULT_SERIES_COLORS.length];
                    const coords = s.values.map((val, idx) => ({
                      x: leftPad + (pointCount === 1 ? plotW / 2 : idx * stepX),
                      y: mapY(val, secondaryScale, topPad, plotBottom),
                    }));
                    return (
                      <polyline
                        key={`sec-${s.key}`}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.8"
                        strokeDasharray="4 3"
                        points={coords.map((p) => `${p.x},${p.y}`).join(' ')}
                      />
                    );
                  })}

                {resolvedLabels.map((lbl, idx) => {
                  const shouldShow =
                    pointCount <= 6 ||
                    idx === 0 ||
                    idx === pointCount - 1 ||
                    idx === Math.floor(pointCount / 2);
                  if (!shouldShow) return null;
                  const x =
                    type === 'bar' || type === 'stacked-bar'
                      ? leftPad + idx * barBand + barBand / 2
                      : leftPad + (pointCount === 1 ? plotW / 2 : idx * stepX);
                  return (
                    <text
                      key={`x-${idx}`}
                      x={x}
                      y={h - 6}
                      textAnchor="middle"
                      className="tp-omada-chart-axis-text"
                    >
                      {lbl}
                    </text>
                  );
                })}
              </svg>
            );
          })()}

          <div className="tp-omada-chart-legend">
            {series.map((s, idx) => (
              <span key={s.key} className="tp-omada-chart-legend-pill">
                <span
                  className="tp-omada-chart-dot"
                  style={{
                    backgroundColor:
                      s.color ?? DEFAULT_SERIES_COLORS[idx % DEFAULT_SERIES_COLORS.length],
                  }}
                />
                <span>
                  {s.label}
                  {unit ? ` (${unit})` : ''}
                </span>
              </span>
            ))}
            {secondarySeries?.map((s, idx) => (
              <span key={`sec-leg-${s.key}`} className="tp-omada-chart-legend-pill">
                <span
                  className="tp-omada-chart-dot"
                  style={{
                    backgroundColor:
                      s.color ??
                      DEFAULT_SERIES_COLORS[(series.length + idx) % DEFAULT_SERIES_COLORS.length],
                  }}
                />
                <span>
                  {s.label}
                  {secondaryUnit ? ` (${secondaryUnit})` : ''}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
