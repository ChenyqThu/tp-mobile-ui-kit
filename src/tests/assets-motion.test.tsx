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
  it('bundles complete Omada icons (with legacy merge), General icons, App Logos, Light/Dark illustrations, and 21 motions (17 PAG + 4 SVG)', () => {
    expect(listTPIcons('omada').length).toBeGreaterThanOrEqual(230);
    expect(listTPIcons('general').length).toBeGreaterThanOrEqual(420);
    expect(TP_ICONS.length).toBeGreaterThanOrEqual(665);
    expect(TP_BRAND_LOGOS.length).toBeGreaterThanOrEqual(14);
    expect(TP_ILLUSTRATIONS.length).toBeGreaterThanOrEqual(80);
    expect(TP_MOTIONS).toHaveLength(21);

    expect(hasTPIcon('tabbar-dashboard-on', 'omada')).toBe(true);
    expect(hasTPIcon('settings-wireless-settings', 'omada')).toBe(true);
    expect(hasTPIcon('cloud-standard', 'omada')).toBe(true);
    expect(hasTPIcon('swipe-delete', 'omada')).toBe(true);
    expect(hasTPIcon('lighting-on', 'omada')).toBe(true);
    expect(hasTPIcon('port-list', 'omada')).toBe(true);
  });

  it('renders TPIcon with dark asset auto-switching, TPBrandLogo, and Light/Dark TPIllustration', () => {
    const { rerender } = render(
      <TPThemeProvider scoped brand="omada" mode="light">
        <TPIcon name="tabbar-dashboard-on" />
        <TPIcon name="client-router" />
        <TPBrandLogo name="omada" />
        <TPIllustration name="no-sites" />
      </TPThemeProvider>,
    );

    const lightIllus = document.querySelector('[data-tp-illustration="no-sites"]') as HTMLImageElement;
    expect(lightIllus).toBeTruthy();
    expect(lightIllus.getAttribute('data-tp-illustration-theme')).toBe('light');
    const lightRouter = document.querySelector('[data-tp-icon="client-router"]') as HTMLElement;
    expect(lightRouter.getAttribute('data-tp-icon-theme')).toBe('light');

    rerender(
      <TPThemeProvider scoped brand="omada" mode="dark">
        <TPIcon name="tabbar-dashboard-on" />
        <TPIcon name="client-router" />
        <TPBrandLogo name="omada" />
        <TPIllustration name="no-sites" />
      </TPThemeProvider>,
    );

    const darkIllus = document.querySelector('[data-tp-illustration="no-sites"]') as HTMLImageElement;
    expect(darkIllus.getAttribute('data-tp-illustration-theme')).toBe('dark');
    const darkRouter = document.querySelector('[data-tp-icon="client-router"]') as HTMLElement;
    expect(darkRouter.getAttribute('data-tp-icon-theme')).toBe('dark');
  });

  it('renders PAG motions with headless fallback and procedural SVG motions directly', () => {
    render(
      <TPThemeProvider scoped brand="omada" mode="dark">
        <TPMotion name="deploy-config" width={96} height={96} />
        <TPMotion name="device-pairing" width={80} height={80} />
      </TPThemeProvider>,
    );

    const motion = document.querySelector('[data-tp-motion="deploy-config"]') as HTMLElement;
    expect(motion).toBeTruthy();
    expect(motion.getAttribute('data-tp-motion-theme')).toBe('dark');
    expect(motion.getAttribute('data-tp-motion-fallback')).toBe('true');
    expect(screen.getByLabelText('Deploy Configuration')).toBeInTheDocument();

    const svgMotion = document.querySelector('[data-tp-motion="device-pairing"]') as HTMLElement;
    expect(svgMotion).toBeTruthy();
    expect(svgMotion.getAttribute('data-tp-motion-format')).toBe('svg');
    expect(svgMotion.getAttribute('data-tp-motion-fallback')).toBe('false');
    expect(screen.getByLabelText('Device Pairing Radar')).toBeInTheDocument();
  });
});
