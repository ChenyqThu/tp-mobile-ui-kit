import { describe, it, expect } from 'vitest';
import * as rootPkg from '../lib/index';
import * as corePkg from '../lib/core';
import * as assetsPkg from '../lib/assets';
import * as omadaPkg from '../lib/omada';
import * as standalonePkg from '../lib/standalone';

describe('Package Subpath & Standalone Exports', () => {
  it('exposes complete API surface across ., ./core, ./assets, ./omada, and ./standalone', () => {
    expect(rootPkg.TPThemeProvider).toBeDefined();
    expect(rootPkg.TPButton).toBeDefined();
    expect(rootPkg.TPIcon).toBeDefined();
    expect(rootPkg.TPMotion).toBeDefined();
    expect(rootPkg.OmadaAppDemo).toBeDefined();

    expect(corePkg.TPThemeProvider).toBeDefined();
    expect(corePkg.TPAlert).toBeDefined();
    expect(corePkg.TPSwitch).toBeDefined();
    expect(corePkg.TPListCard).toBeDefined();

    expect(assetsPkg.TPIcon).toBeDefined();
    expect(assetsPkg.TPIllustration).toBeDefined();
    expect(assetsPkg.TPBrandLogo).toBeDefined();
    expect(assetsPkg.TPMotion).toBeDefined();
    expect(assetsPkg.TP_MOTIONS).toHaveLength(17);

    expect(omadaPkg.OmadaStandardInput).toBeDefined();
    expect(omadaPkg.OmadaSiteDashboardPage).toBeDefined();
    expect(omadaPkg.OmadaDeviceListBlock).toBeDefined();

    expect(standalonePkg.React).toBeDefined();
    expect(standalonePkg.ReactDOM).toBeDefined();
    expect(typeof standalonePkg.render).toBe('function');
    expect(document.getElementById('tp-mobile-ui-standalone-styles')).toBeTruthy();
  });
});
