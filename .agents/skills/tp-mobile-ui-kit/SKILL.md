---
name: tp-mobile-ui-kit
description: >-
  Build TP-Link multi-brand mobile React UI prototypes and Omada APP v5.3–6.3 screens
  using @chenyqthu/tp-mobile-ui-kit (TP-Design 6-brand 12-mode + WCAG High Contrast theme
  engine, OS-adaptive iOS Liquid Glass / Android chrome, mobile TP* primitives, 669 Figma
  icons with 25 dark variants, 42 Light/Dark illustrations, 16 brand logos, 17 Tencent PAG
  .pag + 4 SVG motions, Omada P0/P1/P2 blocks/pages, and single-file zero-build HTML standalone
  bundle). Activate when asked to build a TP-Link mobile UI demo, Omada/Tapo/Tether/Mercusys/Deco
  mobile mockup, or single-file mobile prototype.
---

# TP-Mobile UI Kit — Mobile Prototype & Omada APP Skill

Build authentic TP-Link mobile UI prototypes and **Omada APP v5.3–6.3** screens using verified exports from `@chenyqthu/tp-mobile-ui-kit` (run `node scripts/query-catalog.mjs info` to inspect active version, subpaths, and CDN URLs).

---

## 1. Choose the Output Format

| Need | Mode | Why |
| :--- | :--- | :--- |
| Shareable PRD demo, quick review, zero setup | **Single-File HTML** (`style.css` + `standalone.js` + `@babel/standalone`) | Opens directly via `file://` double-click or any static server |
| Multi-screen app, TypeScript checking, Vite | **React / Vite ESM** (`@chenyqthu/tp-mobile-ui-kit/core`, `/assets`, `/omada`) | Full ESM tree-shaking and `.d.ts` IntelliSense |

---

## 2. Mode A — Zero-Build Single-File HTML Starter

Use classic `<script>` tags (NOT `<script type="module">`) so local `file://` double-click works without CORS failures. Wrap the root UI with `<TPThemeProvider>` and `<TPToastProvider>`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TP-Mobile UI Demo</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chenyqthu/tp-mobile-ui-kit@latest/dist/style.css" />
    <script src="https://cdn.jsdelivr.net/npm/@chenyqthu/tp-mobile-ui-kit@latest/dist/standalone.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body style="margin: 0;">
    <div id="root"></div>
    <script type="text/babel">
      const { useState } = TPMobileUI.React;
      const {
        TPThemeProvider,
        TPToastProvider,
        TPPhoneFrame,
        TPStatusBar,
        TPHeader,
        TPTabBar,
        TPListCard,
        TPListItem,
        TPButton,
        TPIcon,
        useTPTheme,
        useTPToast,
      } = window.TPMobileUI;

      function DemoApp() {
        const [tab, setTab] = useState('home');
        const { resolvedMode, toggleMode } = useTPTheme();
        const toast = useTPToast();
        return (
          <TPPhoneFrame
            device="iphone16pro"
            statusBar={<TPStatusBar time="10:51" />}
            bottomBar={
              <TPTabBar
                variant="floating-pill"
                activeKey={tab}
                onChange={setTab}
                items={[
                  { key: 'home', label: 'Dashboard', icon: 'tabbar-dashboard-off', activeIcon: 'tabbar-dashboard-on' },
                  { key: 'devices', label: 'Devices', icon: 'tabbar-device-off', activeIcon: 'tabbar-device-on' },
                  { key: 'settings', label: 'Settings', icon: 'tabbar-settings-off', activeIcon: 'tabbar-settings-on' },
                ]}
              />
            }
          >
            <TPHeader
              variant="floating"
              title="Site 92"
              subtitle="Controller 62"
              right={
                <button type="button" className="tp-header-icon-btn" onClick={toggleMode} aria-label="Toggle theme">
                  <TPIcon name="nav-refresh" size={18} />
                </button>
              }
            />
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <TPListCard divided>
                <TPListItem title="Theme Mode" value={resolvedMode} />
                <TPListItem title="Gateway" subtitle="ER7212PC" value="Connected" />
              </TPListCard>
              <TPButton variant="primary" block onClick={() => toast.show({ type: 'success', message: 'Synced!' })}>
                Sync Site
              </TPButton>
            </div>
          </TPPhoneFrame>
        );
      }

      TPMobileUI.render(
        <TPThemeProvider defaultBrand="omada" defaultMode="light" defaultOS="ios">
          <TPToastProvider>
            <DemoApp />
          </TPToastProvider>
        </TPThemeProvider>,
        '#root',
      );
    </script>
  </body>
</html>
```

> `window.TPMobileUI` exports all `TP*` core primitives, `Omada*` pages & blocks, `TPIcon`, `TPIllustration`, `TPBrandLogo`, `TPMotion`, `React`, `ReactDOM`, and `TPMobileUI.render()`. All SVG/PNG/PAG assets are bundled inline inside `standalone.js`.

---

## 3. Mode B — React / Vite Subpath Imports

Prefer dedicated subpath imports to keep Vite/Rollup bundles lean via tree-shaking:

| Subpath | Contents |
| :--- | :--- |
| `@chenyqthu/tp-mobile-ui-kit/core` | `TPThemeProvider`, `useTPTheme` (`highContrast`, `fontScale`, `os`), `TP_BRANDS`, `TP_THEME_PRESETS`, and all `TP*` mobile core primitives (including `TPLiquidGlass`, `TPIconButton`, `TPIconButtonGroup`, `TPCheckbox`, `TPRadio`, `TPSwipeRow`, `TPTooltip`, `TPFixedToast`, `TPInfoSheet`, `TPLegendSheet`, `TPLoadMore`, `TPMonthPicker`, `TPLast7DaysPicker`, `TPStepText`, `TPProgress`, `TPSkeleton`, `TPStepper`, `TPDivider`, `TPAvatar`, `TPPinInput`, dual-thumb `TPSlider`) + `useTPToast` |
| `@chenyqthu/tp-mobile-ui-kit/assets` | `TPIcon` (669 icons + 25 dark variants), `TPIllustration`, `TPBrandLogo`, `TPMotion` (17 `.pag` + 4 SVG), and manifests (`TP_ICONS`, `TP_ILLUSTRATIONS`, `TP_BRAND_LOGOS`, `TP_MOTIONS`) |
| `@chenyqthu/tp-mobile-ui-kit/omada` | `OmadaStandardInput`, `OmadaDeviceThumb`, P0/P1/P2 blocks (`OmadaChartCard`, `OmadaDeviceListBlock`, `OmadaSiteListBlock`, `OmadaClientListBlock`, `OmadaSidebarDrawer`, `OmadaWirelessNetworkBlock`, `OmadaIncidentsBlock`, `OmadaScheduleBlock`, `OmadaPortPanelBlock`, `OmadaPortSelectorBlock`, `OmadaFormRepeaterBlock`, `OmadaCustomOptionList`, `OmadaTopologyBlock`, `OmadaFirmwareUpdateBlock`, `OmadaVoucherPreviewCard`), APP pages & `OmadaAppDemo` |
| `@chenyqthu/tp-mobile-ui-kit/style.css` | Complete CSS token variables and `.tp-*` component/Omada styles |
| `@chenyqthu/tp-mobile-ui-kit/standalone` | IIFE browser bundle attaching `window.TPMobileUI` |
| `@chenyqthu/tp-mobile-ui-kit/catalog.json` | Machine-readable component, token, and asset catalog |
| `@chenyqthu/tp-mobile-ui-kit` | Convenience root barrel re-exporting everything |

```tsx
import '@chenyqthu/tp-mobile-ui-kit/style.css';
import { TPThemeProvider, TPToastProvider, TPPhoneFrame, TPButton } from '@chenyqthu/tp-mobile-ui-kit/core';
import { TPIcon, TPIllustration, TPBrandLogo, TPMotion } from '@chenyqthu/tp-mobile-ui-kit/assets';
import { OmadaAppDemo, OmadaSiteDashboardPage } from '@chenyqthu/tp-mobile-ui-kit/omada';
```

---

## 4. 6-Brand Theme Engine (12 Presets + Light/Dark/OS)

`<TPThemeProvider>` drives all `--tp-*` CSS variables across **6 brands × 2 modes (12 presets)**:

| Brand (`brand`) | Focus Color | Button Radius | Secondary Button | Main Font Size | Slider Stroke / Tick |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `omada` | `#00A870` | `10px` | `2px` outlined | `16px` | `3px` / `4px` |
| `tapo` | `#0088E3` | `24px` pill | `0px` tinted fill | `17px` | `0px` / `6px` |
| `tether` | `#4ACBD6` | `12px` | `2px` outlined | `17px` | `0px` / `6px` |
| `mercusys` | `#FA3332` | `24px` pill | `0px` tinted fill | `17px` | `3px` / `4px` |
| `deco` | `#1CD0E6` | `24px` pill | `0px` tinted fill | `17px` | `0px` / `6px` |
| `ux` | `#007AFF` | `24px` pill | `0px` tinted fill | `17px` | `0px` / `6px` |

Switch dynamically via `useTPTheme()`:
- `mode`: `'light' | 'dark' | 'system'` (tracks `prefers-color-scheme: dark` automatically when `'system'`)
- `os`: `'ios' | 'android'` (adapts `TPStatusBar`, `TPAlert`, and `TPActionSheet` geometry)
- `screenSize`: `'base' | 'new' | 'ios27'`

---

## 5. Real Tencent PAG (`.pag`) Motion Usage

`<TPMotion name="..." />` plays authentic `.pag` vector animations via `libpag` WebGL/Canvas2D WASM and automatically follows `useTPTheme().resolvedMode` (`light` / `dark`):

1. **Vite / React apps**: Place `libpag.wasm` in `public/libpag.wasm` (copied from `node_modules/libpag/lib/libpag.wasm`, or already in this repo's `public/libpag.wasm`).
2. **Automatic fallback**: In `file://` standalone HTML or when local `./libpag.wasm` is absent, `TPMotion` falls back to `https://cdn.jsdelivr.net/npm/libpag@4.5.85/lib/libpag.wasm`. In headless/non-WebGL environments (like `jsdom`), it degrades gracefully to a themed SVG indicator (`data-tp-motion-fallback="true"`).
3. Verified motion slugs (query via `search-assets motions`):
   - **PAG (`.pag`)**: `internet-connection`, `link-detection`, `update-network`, `deploy-config`, `discover-device`, `indeterminate-progress`, `connecting`, `tab-dropdown-select`, `tab-dropdown-mask`, `tab-dropdown-unmasked`, `port-card-expand`.
   - **Procedural SVG**: `device-pairing`, `ap-scan`, `search-rotate`, `accessibility-zoom`.

---

## 6. Restored Omada APP Pages, Liquid Glass / Android Chrome & Blocks

- **OS-Adaptive Navigation Chrome**: On `os="ios"`, set `overlayTop` and `overlayBottom` on `TPPhoneFrame` (with `<TPStatusBar transparent />` and `<TPTabBar variant="floating-pill" />`) for Apple Liquid Glass floating headers and pill tabs (`TPLiquidGlass`). On `os="android"`, `TPHeader` and `TPTabBar` automatically render traditional Material-era docked bars and circular solid FABs with zero Liquid Glass.
- **High Contrast & Font Scale**: `TPThemeProvider` supports `highContrast` (WCAG 4.5:1 Omada Light colors, Bold `700` `Title 1`, underlined bold links, and accessible Tags) and `fontScale` (`>= 1.4` enables stacked large-font list form rows).
- **Omada Pages**: `OmadaLaunchLoadingPage`, `OmadaControllerListPage`, `OmadaSiteDashboardPage`, `OmadaSiteInsightsPage`, `OmadaSiteDevicesPage`, `OmadaSiteClientsPage`, `OmadaSiteSettingsPage`, `OmadaHealthDetailPage`, `OmadaDeviceDetailPage`, `OmadaConfigFormPage`, `OmadaLanSettingsPage`, `OmadaPortDetailPage`, `OmadaAccessibilitySettingsPage`, `OmadaPrivacyPolicyPage`, `OmadaAppDemo`.
- **Omada Blocks & Inputs**: `OmadaChartCard`, `OmadaDeviceListBlock`, `OmadaSiteListBlock`, `OmadaClientListBlock`, `OmadaSidebarDrawer`, `OmadaWirelessNetworkBlock`, `OmadaIncidentsBlock`, `OmadaScheduleBlock`, `OmadaPortPanelBlock` (10 speeds + `dual-row` + `OmadaPortLegendSheet`), `OmadaPortSelectorBlock` (`select` / `icon-select` / `lag`), `OmadaFormRepeaterBlock`, `OmadaCustomOptionList`, `OmadaTopologyBlock`, `OmadaFirmwareUpdateBlock`, `OmadaVoucherPreviewCard`, `OmadaStandardInput` (`ip`, `mac`, `port`, `text`, `cidr`, `ip-range`, `ip-port`, `time-range`).

---

## 7. Mandatory Catalog Lookup & Demo Verification

**Never guess component props, icon slugs, illustration names, or `.pag` motion names.** Run the bundled CLI scripts:

```bash
# 1. Inspect package version, subpaths, CDN URLs, and asset counts
node scripts/query-catalog.mjs info

# 2. List components (or filter by category: theme, core-nav-controls, core-lists-inputs, core-overlays, assets, omada-components, omada-blocks, omada-pages)
node scripts/query-catalog.mjs list-components
node scripts/query-catalog.mjs list-components omada-pages

# 3. Inspect exact Props interface for any component
node scripts/query-catalog.mjs component TPButton
node scripts/query-catalog.mjs component OmadaDeviceDetailPage

# 4. Inspect brand presets and CSS token summaries
node scripts/query-catalog.mjs brands
node scripts/query-catalog.mjs brands tapo

# 5. Search verified Figma icons, illustrations, brand logos, and PAG motions
node scripts/query-catalog.mjs search-icons tabbar 20
node scripts/query-catalog.mjs search-assets illustrations no- 20
node scripts/query-catalog.mjs search-assets logos
node scripts/query-catalog.mjs search-assets motions

# 6. List or export starter templates (`omada-dashboard`, `multi-brand`, `omada-device-detail`)
node scripts/query-catalog.mjs templates
node scripts/query-catalog.mjs template omada-dashboard --html > demo.html
node scripts/query-catalog.mjs template multi-brand --tsx

# 7. Verify generated HTML / TSX demos before finishing
node scripts/verify-demo.mjs demo.html
```

---

## 8. Guardrails

1. **Always wrap with `<TPThemeProvider>`** (and `<TPToastProvider>` when calling `useTPToast()`). Use `mode=` / `defaultMode=` and `brand=` / `defaultBrand=`.
2. **Use `<TPButton variant="..." htmlType="...">` — NEVER `type=`**: `TPButtonProps` omits HTML `type` and uses `variant="primary" | "secondary" | "text" | "alert" | "tonal" | "in-card"` plus `htmlType="button" | "submit" | "reset"`.
3. **Never hardcode colors**: Use `--tp-*` CSS variables (`var(--tp-bg-page)`, `var(--tp-bg-card)`, `var(--tp-text-primary)`, `var(--tp-text-secondary)`, `var(--tp-divider)`, `var(--tp-focus)`) or `useTPTheme().tokens`.
4. **Always run `verify-demo.mjs`** on generated `.html` or `.tsx` files to validate every `<TPIcon>`, `<TPIllustration>`, `<TPBrandLogo>`, and `<TPMotion>` slug.
