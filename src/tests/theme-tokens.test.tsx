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
});
