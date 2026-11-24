import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  OMADA_HIGH_CONTRAST_LIGHT_TOKENS,
  TP_BRANDS,
  TP_THEME_PRESETS,
  type TPBrand,
  type TPColorMode,
  type TPPlatformOS,
  type TPResolvedMode,
  type TPScreenSize,
  type TPThemeTokens,
} from './tokens';

export interface TPThemeContextValue {
  brand: TPBrand;
  mode: TPColorMode;
  resolvedMode: TPResolvedMode;
  os: TPPlatformOS;
  screenSize: TPScreenSize;
  highContrast: boolean;
  fontScale: number;
  tokens: TPThemeTokens;
  setBrand: (brand: TPBrand) => void;
  setMode: (mode: TPColorMode) => void;
  setOS: (os: TPPlatformOS) => void;
  setScreenSize: (size: TPScreenSize) => void;
  setHighContrast: (highContrast: boolean) => void;
  toggleHighContrast: () => void;
  setFontScale: (scale: number) => void;
  toggleMode: () => void;
}

const DEFAULT_CONTEXT: TPThemeContextValue = {
  brand: 'omada',
  mode: 'light',
  resolvedMode: 'light',
  os: 'ios',
  screenSize: 'new',
  highContrast: false,
  fontScale: 1,
  tokens: TP_THEME_PRESETS.omada.light,
  setBrand: () => {},
  setMode: () => {},
  setOS: () => {},
  setScreenSize: () => {},
  setHighContrast: () => {},
  toggleHighContrast: () => {},
  setFontScale: () => {},
  toggleMode: () => {},
};

export const TPThemeContext = createContext<TPThemeContextValue>(DEFAULT_CONTEXT);

export interface TPThemeProviderProps {
  brand?: TPBrand;
  defaultBrand?: TPBrand;
  mode?: TPColorMode;
  defaultMode?: TPColorMode;
  os?: TPPlatformOS;
  defaultOS?: TPPlatformOS;
  screenSize?: TPScreenSize;
  highContrast?: boolean;
  defaultHighContrast?: boolean;
  fontScale?: number;
  defaultFontScale?: number;
  /** When true, applies theme attributes only on the wrapper element instead of `document.documentElement`. */
  scoped?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

function detectSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export const TPThemeProvider: React.FC<TPThemeProviderProps> = ({
  brand: controlledBrand,
  defaultBrand = 'omada',
  mode: controlledMode,
  defaultMode = 'light',
  os: controlledOS,
  defaultOS = 'ios',
  screenSize: controlledScreenSize,
  highContrast: controlledHighContrast,
  defaultHighContrast = false,
  fontScale: controlledFontScale,
  defaultFontScale = 1,
  scoped = false,
  className = '',
  style,
  children,
}) => {
  const [uncontrolledBrand, setUncontrolledBrand] = useState<TPBrand>(defaultBrand);
  const [uncontrolledMode, setUncontrolledMode] = useState<TPColorMode>(defaultMode);
  const [uncontrolledOS, setUncontrolledOS] = useState<TPPlatformOS>(defaultOS);
  const [uncontrolledScreenSize, setUncontrolledScreenSize] = useState<TPScreenSize>('new');
  const [uncontrolledHighContrast, setUncontrolledHighContrast] = useState<boolean>(defaultHighContrast);
  const [uncontrolledFontScale, setUncontrolledFontScale] = useState<number>(defaultFontScale);
  const [systemDark, setSystemDark] = useState<boolean>(detectSystemPrefersDark);

  // Keep internal state aligned if parent transitions controlled props
  useEffect(() => {
    if (controlledBrand !== undefined) setUncontrolledBrand(controlledBrand);
  }, [controlledBrand]);

  useEffect(() => {
    if (controlledMode !== undefined) setUncontrolledMode(controlledMode);
  }, [controlledMode]);

  useEffect(() => {
    if (controlledOS !== undefined) setUncontrolledOS(controlledOS);
  }, [controlledOS]);

  useEffect(() => {
    if (controlledScreenSize !== undefined) setUncontrolledScreenSize(controlledScreenSize);
  }, [controlledScreenSize]);

  useEffect(() => {
    if (controlledHighContrast !== undefined) setUncontrolledHighContrast(controlledHighContrast);
  }, [controlledHighContrast]);

  useEffect(() => {
    if (controlledFontScale !== undefined) setUncontrolledFontScale(controlledFontScale);
  }, [controlledFontScale]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    let mql: MediaQueryList;
    try {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return;
    }
    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    setSystemDark(mql.matches);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', listener);
      return () => mql.removeEventListener('change', listener);
    }
    return undefined;
  }, []);

  const brand = controlledBrand ?? uncontrolledBrand;
  const mode = controlledMode ?? uncontrolledMode;
  const os = controlledOS ?? uncontrolledOS;
  const screenSize = controlledScreenSize ?? uncontrolledScreenSize;
  const highContrast = controlledHighContrast ?? uncontrolledHighContrast;
  const rawScale = controlledFontScale ?? uncontrolledFontScale;
  const fontScale = Number.isFinite(rawScale) ? Math.min(2, Math.max(0.85, rawScale)) : 1;
  const isLargeFont = fontScale >= 1.4;

  const resolvedMode: TPResolvedMode =
    mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  const tokens = useMemo<TPThemeTokens>(() => {
    const presetGroup = TP_THEME_PRESETS[brand] ?? TP_THEME_PRESETS.omada;
    const baseTokens = presetGroup[resolvedMode] ?? presetGroup.light;
    if (highContrast && brand === 'omada' && resolvedMode === 'light') {
      return { ...baseTokens, ...OMADA_HIGH_CONTRAST_LIGHT_TOKENS };
    }
    return baseTokens;
  }, [brand, resolvedMode, highContrast]);

  useEffect(() => {
    if (scoped || typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-tp-brand', brand);
    root.setAttribute('data-tp-mode', resolvedMode);
    root.setAttribute('data-tp-os', os);
    root.setAttribute('data-tp-screen', screenSize);
    root.setAttribute('data-tp-contrast', highContrast ? 'high' : 'normal');
    root.setAttribute('data-tp-large-font', isLargeFont ? 'true' : 'false');
    root.style.setProperty('--tp-font-scale', String(fontScale));
  }, [scoped, brand, resolvedMode, os, screenSize, highContrast, isLargeFont, fontScale]);

  const setBrand = useCallback((next: TPBrand) => {
    setUncontrolledBrand(next);
  }, []);

  const setMode = useCallback((next: TPColorMode) => {
    setUncontrolledMode(next);
  }, []);

  const setOS = useCallback((next: TPPlatformOS) => {
    setUncontrolledOS(next);
  }, []);

  const setScreenSize = useCallback((next: TPScreenSize) => {
    setUncontrolledScreenSize(next);
  }, []);

  const setHighContrast = useCallback((next: boolean) => {
    setUncontrolledHighContrast(next);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setUncontrolledHighContrast((prev) => !prev);
  }, []);

  const setFontScale = useCallback((next: number) => {
    setUncontrolledFontScale(Math.min(2, Math.max(0.85, next)));
  }, []);

  const toggleMode = useCallback(() => {
    setUncontrolledMode((prev) => {
      const current = prev === 'system' ? (systemDark ? 'dark' : 'light') : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [systemDark]);

  const value = useMemo<TPThemeContextValue>(
    () => ({
      brand,
      mode,
      resolvedMode,
      os,
      screenSize,
      highContrast,
      fontScale,
      tokens,
      setBrand,
      setMode,
      setOS,
      setScreenSize,
      setHighContrast,
      toggleHighContrast,
      setFontScale,
      toggleMode,
    }),
    [
      brand,
      mode,
      resolvedMode,
      os,
      screenSize,
      highContrast,
      fontScale,
      tokens,
      setBrand,
      setMode,
      setOS,
      setScreenSize,
      setHighContrast,
      toggleHighContrast,
      setFontScale,
      toggleMode,
    ],
  );

  return (
    <TPThemeContext.Provider value={value}>
      <div
        data-tp-brand={brand}
        data-tp-mode={resolvedMode}
        data-tp-os={os}
        data-tp-screen={screenSize}
        data-tp-contrast={highContrast ? 'high' : 'normal'}
        data-tp-large-font={isLargeFont ? 'true' : 'false'}
        className={`tp-theme-root ${className}`.trim()}
        style={{
          fontFamily: tokens.fontFamily.includes('SF Pro')
            ? '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif'
            : tokens.fontFamily,
          color: tokens.textPrimary,
          '--tp-font-scale': String(fontScale),
          ...style,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </TPThemeContext.Provider>
  );
};

export function useTPTheme(): TPThemeContextValue {
  return useContext(TPThemeContext);
}

export { TP_BRANDS, TP_THEME_PRESETS };
