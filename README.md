# TP-Mobile UI Kit (`@chenyqthu/tp-mobile-ui-kit`)

High-fidelity **TP-Link multi-brand mobile React UI component library** powered by the **TP-Design 12-Mode Theme Engine** (6 brands × Light/Dark + OS-adaptive iOS/Android geometry), **626 Figma icons**, **42 Light/Dark illustrations**, **16 brand logos**, **11 real Tencent PAG (`.pag`) vector animations**, **7 restored Omada APP v5.3–6.3 screens + V5.3 blocks**, and a zero-build single-file HTML standalone bundle.

---

## 1. React / Vite Usage (ESM + Tree-Shaking)

```bash
pnpm add @chenyqthu/tp-mobile-ui-kit
```

Import the stylesheet once at app entry and mount `<TPThemeProvider>` (plus `<TPToastProvider>` if using `useTPToast()`):

```tsx
import '@chenyqthu/tp-mobile-ui-kit/style.css';
import {
  TPThemeProvider,
  TPToastProvider,
  TPPhoneFrame,
  TPStatusBar,
  TPButton,
} from '@chenyqthu/tp-mobile-ui-kit/core';
import { TPIcon, TPMotion } from '@chenyqthu/tp-mobile-ui-kit/assets';
import { OmadaAppDemo } from '@chenyqthu/tp-mobile-ui-kit/omada';

export function App() {
  return (
    <TPThemeProvider defaultBrand="omada" defaultMode="light" defaultOS="ios">
      <TPToastProvider>
        <OmadaAppDemo initialScreen="dashboard" />
      </TPToastProvider>
    </TPThemeProvider>
  );
}
```

### Subpath Entrypoints

| Subpath | Contents |
| :--- | :--- |
| `@chenyqthu/tp-mobile-ui-kit` | Root barrel re-exporting theme, core, assets, and Omada modules |
| `@chenyqthu/tp-mobile-ui-kit/core` | `TPThemeProvider`, `useTPTheme`, `TP_BRANDS`, `TP_THEME_PRESETS`, and all `TP*` core mobile primitives (`TPPhoneFrame` with Liquid Glass `overlayTop`/`overlayBottom`, `TPLiquidGlass`, `TPStatusBar`, `TPHeader`, `TPTabBar`, `TPIconButton`, `TPSegment`, `TPButton`, `TPSwitch`, dual-thumb `TPSlider`, `TPCheckbox`, `TPRadio`, `TPListCard`, `TPListItem`, `TPSwipeRow`, `TPAlert`, `TPActionSheet`, `TPBottomSheet`, `TPFixedToast`, `TPTooltip`, `TPToast`, `useTPToast`, `TPProgress`, `TPSkeleton`, `TPStepper`, `TPDivider`, `TPAvatar`, `TPPinInput`, pickers, inputs) |
| `@chenyqthu/tp-mobile-ui-kit/assets` | `TPIcon`, `TPIllustration`, `TPBrandLogo`, `TPMotion`, and asset manifests (`TP_ICONS`, `TP_ILLUSTRATIONS`, `TP_BRAND_LOGOS`, `TP_MOTIONS`) |
| `@chenyqthu/tp-mobile-ui-kit/omada` | 7 restored Omada APP pages, `OmadaHealthDetailPage`, `OmadaDeviceDetailPage`, `OmadaAppDemo`, 7 V5.3 blocks (`OmadaDeviceListBlock`, `OmadaWirelessNetworkBlock`, `OmadaIncidentsBlock`, `OmadaScheduleBlock`, `OmadaPortPanelBlock`, `OmadaTopologyBlock`, `OmadaFirmwareUpdateBlock`), and `OmadaStandardInput` |
| `@chenyqthu/tp-mobile-ui-kit/style.css` | All `--tp-*` CSS token definitions and `.tp-*` component/Omada stylesheets |
| `@chenyqthu/tp-mobile-ui-kit/standalone` | Browser IIFE bundle attaching everything to `window.TPMobileUI` |
| `@chenyqthu/tp-mobile-ui-kit/catalog.json` | Machine-readable component, prop, token, asset, and template catalog |

---

## 2. Single-File HTML Prototype (Zero Build)

For shareable PRD prototypes that open cleanly via `file://` double-click or any static server, use classic `<script>` tags (`dist/style.css`, `dist/standalone.js`, and `@babel/standalone`):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Omada Mobile Demo</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chenyqthu/tp-mobile-ui-kit@latest/dist/style.css" />
    <script src="https://cdn.jsdelivr.net/npm/@chenyqthu/tp-mobile-ui-kit@latest/dist/standalone.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body style="margin: 0;">
    <div id="root"></div>
    <script type="text/babel">
      const { TPThemeProvider, TPToastProvider, OmadaAppDemo } = window.TPMobileUI;

      TPMobileUI.render(
        <TPThemeProvider defaultBrand="omada" defaultMode="light" defaultOS="ios">
          <TPToastProvider>
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <OmadaAppDemo initialScreen="dashboard" />
            </div>
          </TPToastProvider>
        </TPThemeProvider>,
        '#root',
      );
    </script>
  </body>
</html>
```

All icons, illustrations, brand logos, and `.pag` motion buffers are bundled inline in `dist/standalone.js`. Ready-to-run templates live in [templates/](./templates/):
- [templates/omada-dashboard.html](./templates/omada-dashboard.html) / [templates/omada-dashboard.tsx](./templates/omada-dashboard.tsx)
- [templates/multi-brand.html](./templates/multi-brand.html) / [templates/multi-brand.tsx](./templates/multi-brand.tsx)
- [templates/omada-device-detail.html](./templates/omada-device-detail.html) / [templates/omada-device-detail.tsx](./templates/omada-device-detail.tsx)

---

## 3. 6-Brand Theme Engine (Light / Dark / System + iOS / Android)

`TPThemeProvider` drives `--tp-*` CSS variables across **6 TP-Link brands** (`omada`, `tapo`, `tether`, `mercusys`, `deco`, `ux`) × **Light / Dark** (12 presets) plus `mode="system"` (`prefers-color-scheme`) and `os="ios" | "android"`:

| Brand | Focus | Button Radius | Secondary Button | Body Font Size |
| :--- | :--- | :--- | :--- | :--- |
| `omada` | `#00A870` | `10px` | `2px` outlined | `16px` |
| `tapo` | `#0088E3` | `24px` pill | `0px` tinted fill | `17px` |
| `tether` | `#4ACBD6` | `12px` | `2px` outlined | `17px` |
| `mercusys` | `#FA3332` | `24px` pill | `0px` tinted fill | `17px` |
| `deco` | `#1CD0E6` | `24px` pill | `0px` tinted fill | `17px` |
| `ux` | `#007AFF` | `24px` pill | `0px` tinted fill | `17px` |

Control theme dynamically with `useTPTheme()`:
```tsx
const { brand, mode, resolvedMode, os, tokens, setBrand, setMode, setOS, toggleMode } = useTPTheme();
```

Note: `<TPButton>` uses `variant="primary" | "secondary" | "text" | "alert" | "tonal" | "in-card"` and `htmlType="button" | "submit" | "reset"` (never `type=`).

---

## 4. Real Tencent PAG (`.pag`) Motion Assets

`<TPMotion name="..." />` plays real `.pag` vector animations via `libpag` WASM and switches Light/Dark `.pag` files automatically with `useTPTheme().resolvedMode`:

- **Local Vite/React apps**: serve `libpag.wasm` at `./libpag.wasm` (included at `public/libpag.wasm` and `dist/libpag.wasm`).
- **CDN & `file://` fallback**: when running over `file://` or when local `./libpag.wasm` is unreachable, `TPMotion` automatically falls back to `https://cdn.jsdelivr.net/npm/libpag@4.5.85/lib/libpag.wasm` (or override via `wasmUrl`).
- **Headless / non-WebGL fallback**: gracefully renders an animated `--tp-focus` SVG fallback (`data-tp-motion-fallback="true"`).

Available motion slugs: `internet-connection`, `link-detection`, `update-network`, `deploy-config`, `discover-device`, `indeterminate-progress`, `connecting`, `tab-dropdown-select`, `tab-dropdown-mask`, `tab-dropdown-unmasked`, `port-card-expand`.

---

## 5. Restored Omada APP Pages & V5.3 Blocks

- **7 Restored Omada APP Screens**:
  - `OmadaLaunchLoadingPage` — floating glass header, dismissible `V2.5.2` upgrade prompt, animated skeleton cards, Toolkit FAB
  - `OmadaControllerListPage` — `All Systems` filter menu, live search, `Cloud Management (5)` controller cards
  - `OmadaSiteDashboardPage` — site switcher (`92 ⌄ / 62`), 4 KPI tiles, Topology sheet, Site Health `100` scrubber, ISP Activity, Internet Activity chart, Toolkit diagnostics
  - `OmadaSiteInsightsPage` — `Wired | Wireless | Client | Apps` segments, `ISP Load` histogram + latency waveform, WAN/Gateway/Switch health trends
  - `OmadaSiteDevicesPage` — `+ | ⋮` glass capsule, `Device List | Device Group` segment, expandable filter chips, firmware upgrade badges
  - `OmadaSiteClientsPage` — `Online | Offline | Blocked | All` tabs, `All | Wired | Wireless` chips, dBm RSSI status, client detail & block actions
  - `OmadaSiteSettingsPage` — 4 grouped `TPListCard` sections with Omada `settings-*` icons and drill-downs
- **Drill-Downs & Orchestrator**: `OmadaHealthDetailPage`, `OmadaDeviceDetailPage` (Ports `port-card-expand` + Firmware Upgrade `update-network` PAG motions), `OmadaAppDemo` (Apple Liquid Glass floating overlay navigation)
- **V5.3 Blocks & Inputs**: `OmadaDeviceListBlock`, `OmadaWirelessNetworkBlock` (`deploy-config` PAG motion), `OmadaIncidentsBlock`, `OmadaScheduleBlock`, `OmadaPortPanelBlock`, `OmadaTopologyBlock`, `OmadaFirmwareUpdateBlock`, `OmadaStandardInput` (segmented IPv4, MAC, Port, Text)

---

## 6. Live Showcase & Online Demos

- **Interactive Showcase (GitHub Pages)**: **https://pages.chenge.ink/tp-mobile-ui-kit/**
- Includes all **7 restored Omada APP real-device pages + 7 V5.3 blocks**, **6-Brand Theme Lab**, **Core Components (Liquid Glass & full TP-Design kit)**, **Assets & Live PAG Motions**, and **Agent Skill Setup**.

---

## 7. Agent Skill Installation & Usage (`tp-mobile-ui-kit`)

This repository ships an Agent Skill under [skills/tp-mobile-ui-kit/](./skills/tp-mobile-ui-kit/) (and mirrored to [.agents/skills/tp-mobile-ui-kit/](./.agents/skills/tp-mobile-ui-kit/)).

### Quick Install (CLI)

```bash
# Project-level install
npx skills add ChenyqThu/tp-mobile-ui-kit

# Global user-level install (available across all repositories)
npx skills add ChenyqThu/tp-mobile-ui-kit -g
```

### Supported Agents & Skill Directory Paths

| Coding Agent | Project / Workspace Path | Global User Path |
| :--- | :--- | :--- |
| **Claude Code** | `.claude/skills/tp-mobile-ui-kit/` | `~/.claude/skills/tp-mobile-ui-kit/` |
| **Cursor** | `.cursor/skills/tp-mobile-ui-kit/` | `~/.cursor/skills/tp-mobile-ui-kit/` |
| **OpenAI Codex** | `.agents/skills/tp-mobile-ui-kit/` | `~/.agents/skills/tp-mobile-ui-kit/` |
| **Google Antigravity** | `.agents/skills/tp-mobile-ui-kit/` | `~/.gemini/config/skills/tp-mobile-ui-kit/` |
| **GitHub Copilot / VS Code** | `.github/skills/tp-mobile-ui-kit/` | `~/.copilot/skills/tp-mobile-ui-kit/` |
| **Windsurf** | `.windsurf/skills/tp-mobile-ui-kit/` | `~/.codeium/windsurf/skills/tp-mobile-ui-kit/` |
| **OpenCode** | `.opencode/skills/tp-mobile-ui-kit/` | `~/.config/opencode/skills/tp-mobile-ui-kit/` |

### Query Catalog & Verify Demos

```bash
# Inspect version, subpaths, CDN URLs, and counts
node skills/tp-mobile-ui-kit/scripts/query-catalog.mjs info

# Explore components, props, and brand tokens
node skills/tp-mobile-ui-kit/scripts/query-catalog.mjs list-components omada-pages
node skills/tp-mobile-ui-kit/scripts/query-catalog.mjs component TPButton
node skills/tp-mobile-ui-kit/scripts/query-catalog.mjs brands omada

# Search verified icons, illustrations, brand logos, and PAG motions
node skills/tp-mobile-ui-kit/scripts/query-catalog.mjs search-icons tabbar 20
node skills/tp-mobile-ui-kit/scripts/query-catalog.mjs search-assets motions

# Pull starter templates and verify generated HTML/TSX demos
node skills/tp-mobile-ui-kit/scripts/query-catalog.mjs templates
node skills/tp-mobile-ui-kit/scripts/query-catalog.mjs template omada-dashboard --html > demo.html
node skills/tp-mobile-ui-kit/scripts/verify-demo.mjs demo.html
```

---

## 8. Missing Components & Bug Reports

- **Request Missing Component / Asset**: https://github.com/ChenyqThu/tp-mobile-ui-kit/issues/new?template=missing-component.yml
- **Report Component Bug / Visual Issue**: https://github.com/ChenyqThu/tp-mobile-ui-kit/issues/new?template=component-bug.yml
- **Browse All Issues**: https://github.com/ChenyqThu/tp-mobile-ui-kit/issues

---

## 9. Development & Build Scripts

- `pnpm dev` — Start Vite dev server
- `pnpm build:lib` — Build ESM subpaths, CSS bundle, IIFE standalone bundle, `.d.ts` declarations, and `catalog.json` (plus skill sync)
- `pnpm build:catalog` — Generate `dist/catalog.json`, update skill `references/catalog.json` + `templates/`, and sync `.agents/skills/tp-mobile-ui-kit/` + `~/.gemini/config/skills/tp-mobile-ui-kit/`
- `pnpm build:pages` — Build static site for GitHub Pages (`dist-app/` with `/tp-mobile-ui-kit/` base path)
- `pnpm build:app` — Build showcase web app to `dist-app/`
- `pnpm typecheck` — Run strict TypeScript checks
- `pnpm test` — Run Vitest suite
