import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TPThemeProvider, TP_BRANDS, TP_THEME_PRESETS, useTPTheme } from '../theme';

function ThemeProbe() {
  const { brand, mode, resolvedMode, os, tokens, setBrand, setMode, toggleMode } = useTPTheme();
  return (
    <div>
      <span data-testid="brand">{brand}</span>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedMode}</span>
      <span data-testid="os">{os}</span>
      <span data-testid="focus">{tokens.focus}</span>
      <span data-testid="radius-btn">{tokens.radiusButton}</span>
      <span data-testid="btn-stroke">{tokens.buttonSecondaryStroke}</span>
      <button onClick={() => setBrand('tapo')}>switch-tapo</button>
      <button onClick={() => setMode('dark')}>switch-dark</button>
      <button onClick={toggleMode}>toggle-mode</button>
    </div>
  );
}

describe('TPThemeProvider & TP-Design 12 Theme Presets', () => {
  it('defines all 6 brands in both light and dark modes without missing colors', () => {
    expect(TP_BRANDS).toHaveLength(6);
    for (const brand of TP_BRANDS) {
      const pair = TP_THEME_PRESETS[brand.id];
      expect(pair.light.focus).toMatch(/^#|^rgba?/);
      expect(pair.dark.focus).toMatch(/^#|^rgba?/);
      expect(pair.light.background).not.toBe(pair.dark.background);
    }
    expect(TP_THEME_PRESETS.omada.light.radiusButton).toBe(10);
    expect(TP_THEME_PRESETS.omada.light.buttonSecondaryStroke).toBe(2);
    expect(TP_THEME_PRESETS.tapo.light.radiusButton).toBe(24);
    expect(TP_THEME_PRESETS.tapo.light.buttonSecondaryStroke).toBe(0);
  });

  it('switches brand, light/dark mode, and OS via context in scoped mode without mutating documentElement', () => {
    document.documentElement.removeAttribute('data-tp-brand');
    const { container } = render(
      <TPThemeProvider scoped defaultBrand="omada" defaultMode="light" defaultOS="ios">
        <ThemeProbe />
      </TPThemeProvider>,
    );

    const rootEl = container.querySelector('[data-tp-brand]') as HTMLElement;
    expect(rootEl.getAttribute('data-tp-brand')).toBe('omada');
    expect(rootEl.getAttribute('data-tp-mode')).toBe('light');
    expect(screen.getByTestId('focus').textContent).toBe('#00A870');
    expect(screen.getByTestId('radius-btn').textContent).toBe('10');
    expect(document.documentElement.getAttribute('data-tp-brand')).toBeNull();

    act(() => screen.getByText('switch-tapo').click());
    expect(rootEl.getAttribute('data-tp-brand')).toBe('tapo');
    expect(screen.getByTestId('radius-btn').textContent).toBe('24');
    expect(screen.getByTestId('btn-stroke').textContent).toBe('0');

    act(() => screen.getByText('switch-dark').click());
    expect(rootEl.getAttribute('data-tp-mode')).toBe('dark');

    act(() => screen.getByText('toggle-mode').click());
    expect(rootEl.getAttribute('data-tp-mode')).toBe('light');
  });

  it('supports Omada dark brightened alert/yellow colors, WCAG High Contrast, and Large Font scaling', () => {
    expect(TP_THEME_PRESETS.omada.dark.alert).toBe('#FF4D62');
    expect(TP_THEME_PRESETS.omada.dark.yellow).toBe('#F19151');

    function ContrastProbe() {
      const { highContrast, fontScale, tokens, setHighContrast, setFontScale } = useTPTheme();
      return (
        <div>
          <span data-testid="hc">{String(highContrast)}</span>
          <span data-testid="fs">{String(fontScale)}</span>
          <span data-testid="hc-focus">{tokens.focus}</span>
          <span data-testid="hc-title1">{String(tokens.fontWeightTitle1)}</span>
          <button onClick={() => setHighContrast(true)}>enable-hc</button>
          <button onClick={() => setFontScale(1.4)}>set-large-font</button>
        </div>
      );
    }

    const { container } = render(
      <TPThemeProvider scoped defaultBrand="omada" defaultMode="light">
        <ContrastProbe />
      </TPThemeProvider>,
    );

    const rootEl = container.querySelector('[data-tp-brand]') as HTMLElement;
    expect(rootEl.getAttribute('data-tp-contrast')).toBe('normal');
    expect(rootEl.getAttribute('data-tp-large-font')).toBe('false');
    expect(screen.getByTestId('hc-title1').textContent).toBe('Light');

    act(() => screen.getByText('enable-hc').click());
    expect(rootEl.getAttribute('data-tp-contrast')).toBe('high');
    expect(screen.getByTestId('hc-focus').textContent).toBe('#008055');
    expect(screen.getByTestId('hc-title1').textContent).toBe('Bold');

    act(() => screen.getByText('set-large-font').click());
    expect(rootEl.getAttribute('data-tp-large-font')).toBe('true');
    expect(rootEl.style.getPropertyValue('--tp-font-scale')).toBe('1.4');
  });
});
