import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TPThemeProvider } from '../theme';
import {
  TP_ICONS,
  TP_ILLUSTRATIONS,
  TP_BRAND_LOGOS,
  TP_MOTIONS,
  TPIcon,
  TPIllustration,
  TPBrandLogo,
  TPMotion,
  hasTPIcon,
  listTPIcons,
} from '../assets-lib';

describe('TP-Design Mobile Assets & Real PAG Motions', () => {
  it('bundles complete Omada icons, General icons, App Logos, Light/Dark illustrations, and 17 PAG files', () => {
    expect(listTPIcons('omada').length).toBeGreaterThanOrEqual(190);
    expect(listTPIcons('general').length).toBeGreaterThanOrEqual(420);
    expect(TP_ICONS.length).toBeGreaterThanOrEqual(615);
    expect(TP_BRAND_LOGOS.length).toBeGreaterThanOrEqual(14);
    expect(TP_ILLUSTRATIONS.length).toBeGreaterThanOrEqual(80);
    expect(TP_MOTIONS).toHaveLength(17);

    expect(hasTPIcon('tabbar-dashboard-on', 'omada')).toBe(true);
    expect(hasTPIcon('settings-wireless-settings', 'omada')).toBe(true);
  });

  it('renders TPIcon, TPBrandLogo, and Light/Dark auto-switching TPIllustration', () => {
    const { rerender } = render(
      <TPThemeProvider scoped brand="omada" mode="light">
        <TPIcon name="tabbar-dashboard-on" />
        <TPBrandLogo name="omada" />
        <TPIllustration name="no-sites" />
      </TPThemeProvider>,
    );

    const lightIllus = document.querySelector('[data-tp-illustration="no-sites"]') as HTMLImageElement;
    expect(lightIllus).toBeTruthy();
    expect(lightIllus.getAttribute('data-tp-illustration-theme')).toBe('light');

    rerender(
      <TPThemeProvider scoped brand="omada" mode="dark">
        <TPIcon name="tabbar-dashboard-on" />
        <TPBrandLogo name="omada" />
        <TPIllustration name="no-sites" />
      </TPThemeProvider>,
    );

    const darkIllus = document.querySelector('[data-tp-illustration="no-sites"]') as HTMLImageElement;
    expect(darkIllus.getAttribute('data-tp-illustration-theme')).toBe('dark');
  });

  it('renders TPMotion safely with headless/no-WebGL fallback in jsdom', () => {
    render(
      <TPThemeProvider scoped brand="omada" mode="dark">
        <TPMotion name="deploy-config" width={96} height={96} />
      </TPThemeProvider>,
    );

    const motion = document.querySelector('[data-tp-motion="deploy-config"]') as HTMLElement;
    expect(motion).toBeTruthy();
    expect(motion.getAttribute('data-tp-motion-theme')).toBe('dark');
    expect(motion.getAttribute('data-tp-motion-fallback')).toBe('true');
    expect(screen.getByLabelText('Deploy Configuration')).toBeInTheDocument();
  });
});
