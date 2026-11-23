import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
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
  tokens: TPThemeTokens;
  setBrand: (brand: TPBrand) => void;
  setMode: (mode: TPColorMode) => void;
  setOS: (os: TPPlatformOS) => void;
  setScreenSize: (size: TPScreenSize) => void;
  toggleMode: () => void;
}

const DEFAULT_CONTEXT: TPThemeContextValue = {
  brand: 'omada',
  mode: 'light',
  resolvedMode: 'light',
  os: 'ios',
  screenSize: 'new',
  tokens: TP_THEME_PRESETS.omada.light,
  setBrand: () => {},
  setMode: () => {},
  setOS: () => {},
  setScreenSize: () => {},
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
  scoped = false,
  className = '',
  style,
  children,
}) => {
  const [uncontrolledBrand, setUncontrolledBrand] = useState<TPBrand>(defaultBrand);
  const [uncontrolledMode, setUncontrolledMode] = useState<TPColorMode>(defaultMode);
  const [uncontrolledOS, setUncontrolledOS] = useState<TPPlatformOS>(defaultOS);
  const [uncontrolledScreenSize, setUncontrolledScreenSize] = useState<TPScreenSize>('new');
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

  const resolvedMode: TPResolvedMode =
    mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  const tokens = useMemo<TPThemeTokens>(() => {
    const presetGroup = TP_THEME_PRESETS[brand] ?? TP_THEME_PRESETS.omada;
    return presetGroup[resolvedMode] ?? presetGroup.light;
  }, [brand, resolvedMode]);

  useEffect(() => {
    if (scoped || typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-tp-brand', brand);
    root.setAttribute('data-tp-mode', resolvedMode);
    root.setAttribute('data-tp-os', os);
    root.setAttribute('data-tp-screen', screenSize);
  }, [scoped, brand, resolvedMode, os, screenSize]);

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
      tokens,
      setBrand,
      setMode,
      setOS,
      setScreenSize,
      toggleMode,
    }),
    [brand, mode, resolvedMode, os, screenSize, tokens, setBrand, setMode, setOS, setScreenSize, toggleMode],
  );

  return (
    <TPThemeContext.Provider value={value}>
      <div
        data-tp-brand={brand}
        data-tp-mode={resolvedMode}
        data-tp-os={os}
        data-tp-screen={screenSize}
        className={`tp-theme-root ${className}`.trim()}
        style={{
          fontFamily: tokens.fontFamily.includes('SF Pro')
            ? '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif'
            : tokens.fontFamily,
          color: tokens.textPrimary,
          ...style,
        }}
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
