#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE_JSON = process.argv[2];

if (!SOURCE_JSON || !fs.existsSync(SOURCE_JSON)) {
  console.error('Usage: node scripts/generate-theme-tokens.mjs <tp-design-theme.json>');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(SOURCE_JSON, 'utf8'));
const vars = raw.variables;

function getVal(varName, modeName) {
  return vars[varName]?.values?.[modeName];
}

function toCssVarKey(varName) {
  return varName
    .replace(/[^\x00-\x7F]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const MODE_MAP = [
  { brand: 'omada', mode: 'light', figmaMode: 'Omada' },
  { brand: 'omada', mode: 'dark', figmaMode: 'Omada - Dark' },
  { brand: 'tapo', mode: 'light', figmaMode: 'Tapo' },
  { brand: 'tapo', mode: 'dark', figmaMode: 'Tapo - Dark' },
  { brand: 'tether', mode: 'light', figmaMode: 'Tether' },
  { brand: 'tether', mode: 'dark', figmaMode: 'Tether - Dark' },
  { brand: 'mercusys', mode: 'light', figmaMode: 'Mercusys' },
  { brand: 'mercusys', mode: 'dark', figmaMode: 'Mercusys - Dark' },
  { brand: 'deco', mode: 'light', figmaMode: 'Deco' },
  { brand: 'deco', mode: 'dark', figmaMode: 'Tapo - Dark', overrideBrandLight: 'Deco' },
  { brand: 'ux', mode: 'light', figmaMode: 'UX' },
  { brand: 'ux', mode: 'dark', figmaMode: 'Tapo - Dark', overrideBrandLight: 'UX' },
];

const BRAND_FOCUS_PREFIX = ['Focus/', 'General/Focus', 'Component/Button/Primary Fill', 'Component/Button/Text Button', 'General/Green'];
const BRAND_HUE_VARS = new Set([
  'General/Focus',
  'Focus/4',
  'Focus/10',
  'Focus/16',
  'Focus/20',
  'Focus/40',
  'Focus/60',
  'Focus/80',
  'Component/Button/Primary Fill',
  'Component/Button/Text Button',
  'Component/Button/Secondary Fill',
  'Component/Button/Secondary Stroke',
  'Component/Button/Alert Fill',
  'General/Alert',
  'General/Green',
  'General/Yellow',
  'Corner Radius/Button',
  'Corner Radius/In-card Button',
  'Corner Radius/Card',
  'Font Size/Main Text',
  'Font Weight/Title 1',
  'Font Weight/Title 4',
  'Font Weight/Button text',
  'Component/Slider/Stroke',
  'Component/Slider/Tick Marks 刻度',
  'Font/Fonts',
  'Font/icons',
]);

function hexToRgba(hex, alpha) {
  if (typeof hex !== 'string' || !hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildPreset(entry) {
  const tokens = {};
  for (const varName of Object.keys(vars)) {
    let val;
    if (entry.overrideBrandLight && BRAND_HUE_VARS.has(varName)) {
      val = getVal(varName, entry.overrideBrandLight);
      // Keep dark secondary fill opacity readable for synthesized Deco/UX dark modes
      if (varName === 'Component/Button/Secondary Fill') {
        const focusHex = getVal('General/Focus', entry.overrideBrandLight);
        val = hexToRgba(focusHex, 0.2);
      }
      if (varName === 'Component/Button/Alert Fill') {
        const alertHex = getVal('General/Alert', entry.overrideBrandLight);
        val = hexToRgba(alertHex, 0.16);
      }
    } else {
      val = getVal(varName, entry.figmaMode);
    }
    tokens[varName] = val;
  }

  // Legacy Omada APP library dark-mode brightened functional colors
  if (entry.brand === 'omada' && entry.mode === 'dark') {
    tokens['General/Alert'] = '#FF4D62';
    tokens['Red/10'] = 'rgba(255, 77, 98, 0.16)';
    tokens['General/Yellow'] = '#F19151';
    tokens['Yellow/10'] = 'rgba(241, 145, 81, 0.16)';
  }

  return {
    brand: entry.brand,
    mode: entry.mode,
    figmaMode: entry.overrideBrandLight ? `${entry.overrideBrandLight} (Dark synthesized)` : entry.figmaMode,
    focus: tokens['General/Focus'],
    focusSoft10: tokens['Focus/10'],
    focusSoft16: tokens['Focus/16'],
    focusSoft20: tokens['Focus/20'],
    background: tokens['General/Background'],
    card: tokens['General/Card'],
    modalPanel: tokens['Component/Modal panel'],
    overlay: tokens['Component/Overlay'],
    searchBar: tokens['Component/Search Bar'],
    listDivider: tokens['Component/List Divider'],
    viewBg: tokens['Component/View/View'],
    viewDivider: tokens['Component/View/View Divider'],
    textPrimary: tokens['General/Default - Primary'],
    textSecondary: tokens['General/Default - Secondary'],
    textSecondaryAlt: tokens['General/Default - Secondary 1-Omada'],
    textDisabled: tokens['General/Default - Disabled'],
    textInversePrimary: tokens['General/White - Primary'],
    textInverseSecondary: tokens['General/White - Secondary'],
    textHighlighted: tokens['Component/Highlighted text'],
    alert: tokens['General/Alert'],
    alertSoft10: tokens['Red/10'],
    green: tokens['General/Green'],
    greenSoft10: tokens['Green/10'],
    yellow: tokens['General/Yellow'],
    yellowSoft10: tokens['Yellow/10'],
    buttonPrimaryFill: tokens['Component/Button/Primary Fill'],
    buttonSecondaryFill: tokens['Component/Button/Secondary Fill'],
    buttonSecondaryStroke: Number(tokens['Component/Button/Secondary Stroke'] ?? 0),
    buttonTextColor: tokens['Component/Button/Text Button'],
    buttonAlertFill: tokens['Component/Button/Alert Fill'],
    buttonDisabledFill: tokens['Component/Button/Disabled Fill'],
    buttonDisabledText: tokens['Component/Button/Disabled Text'],
    radiusButton: Number(tokens['Corner Radius/Button'] ?? 24),
    radiusInCardButton: Number(tokens['Corner Radius/In-card Button'] ?? 8),
    radiusCard: Number(tokens['Corner Radius/Card'] ?? 10),
    fontFamily: String(tokens['Font/Fonts'] ?? 'SF Pro'),
    fontSizeMain: Number(tokens['Font Size/Main Text'] ?? 17),
    fontWeightTitle1: String(tokens['Font Weight/Title 1'] ?? 'Semibold'),
    fontWeightTitle4: String(tokens['Font Weight/Title 4'] ?? 'Semibold'),
    fontWeightButton: String(tokens['Font Weight/Button text'] ?? 'Medium'),
    sliderStroke: Number(tokens['Component/Slider/Stroke'] ?? 0),
    sliderTickSize: Number(tokens['Component/Slider/Tick Marks 刻度'] ?? 6),
    segmentTabText: tokens['Component/Segment/Tab Text'],
    toastDefault: tokens['Component/Toast/Default'],
    toastInfo: tokens['Component/Toast/Info'],
    toastBlue: tokens['Component/Toast/Blue'],
    toastYellow: tokens['Component/Toast/Yellow'],
    toastRed: tokens['Component/Toast/Red'],
    toastText: tokens['Component/Toast/Text'],
    iconSet: String(tokens['Font/icons'] ?? 'UX'),
    rawVariables: tokens,
  };
}

function weightToNumber(w) {
  const s = String(w).toLowerCase();
  if (s.includes('bold') && !s.includes('semi')) return 700;
  if (s.includes('semibold') || s.includes('semi bold')) return 600;
  if (s.includes('medium')) return 500;
  if (s.includes('light')) return 300;
  return 400;
}

const presets = {};
for (const entry of MODE_MAP) {
  if (!presets[entry.brand]) presets[entry.brand] = {};
  presets[entry.brand][entry.mode] = buildPreset(entry);
}

const tsSrc = `/* Auto-generated by scripts/generate-theme-tokens.mjs from TP-Design Figma Variables — do not edit manually */

export type TPBrand = 'omada' | 'tapo' | 'tether' | 'mercusys' | 'deco' | 'ux';
export type TPColorMode = 'light' | 'dark' | 'system';
export type TPResolvedMode = 'light' | 'dark';
export type TPScreenSize = 'base' | 'new' | 'ios27';
export type TPPlatformOS = 'ios' | 'android';

export const TP_BRANDS: readonly { id: TPBrand; label: string; accent: string; description: string }[] = [
  { id: 'omada', label: 'Omada', accent: '${presets.omada.light.focus}', description: 'Omada SMB & Enterprise Networking (10px radius, 2px outlined secondary button, 16px body, Light titles)' },
  { id: 'tapo', label: 'Tapo', accent: '${presets.tapo.light.focus}', description: 'Tapo Smart Home (24px pill buttons, 16px cards, filled secondary buttons, 17px body)' },
  { id: 'tether', label: 'Tether', accent: '${presets.tether.light.focus}', description: 'TP-Link Tether Router App (12px buttons, 2px outlined secondary button, cyan focus)' },
  { id: 'mercusys', label: 'Mercusys', accent: '${presets.mercusys.light.focus}', description: 'Mercusys Home Wi-Fi (24px pill buttons, crimson focus, 3px slider stroke)' },
  { id: 'deco', label: 'Deco', accent: '${presets.deco.light.focus}', description: 'Deco Whole-Home Mesh (24px pill buttons, 16px cards, aqua focus)' },
  { id: 'ux', label: 'UX Base', accent: '${presets.ux.light.focus}', description: 'TP-Design UX Baseline Theme (iOS system blue, 24px pill buttons, 10px cards)' },
] as const;

export interface TPThemeTokens {
  brand: TPBrand;
  mode: TPResolvedMode;
  figmaMode: string;
  focus: string;
  focusSoft10: string;
  focusSoft16: string;
  focusSoft20: string;
  background: string;
  card: string;
  modalPanel: string;
  overlay: string;
  searchBar: string;
  listDivider: string;
  viewBg: string;
  viewDivider: string;
  textPrimary: string;
  textSecondary: string;
  textSecondaryAlt: string;
  textDisabled: string;
  textInversePrimary: string;
  textInverseSecondary: string;
  textHighlighted: string;
  alert: string;
  alertSoft10: string;
  green: string;
  greenSoft10: string;
  yellow: string;
  yellowSoft10: string;
  buttonPrimaryFill: string;
  buttonSecondaryFill: string;
  buttonSecondaryStroke: number;
  buttonTextColor: string;
  buttonAlertFill: string;
  buttonDisabledFill: string;
  buttonDisabledText: string;
  radiusButton: number;
  radiusInCardButton: number;
  radiusCard: number;
  fontFamily: string;
  fontSizeMain: number;
  fontWeightTitle1: string;
  fontWeightTitle4: string;
  fontWeightButton: string;
  sliderStroke: number;
  sliderTickSize: number;
  segmentTabText: string;
  toastDefault: string;
  toastInfo: string;
  toastBlue: string;
  toastYellow: string;
  toastRed: string;
  toastText: string;
  iconSet: string;
  rawVariables: Record<string, string | number | boolean | Record<string, unknown>>;
}

export const TP_THEME_PRESETS: Record<TPBrand, Record<TPResolvedMode, TPThemeTokens>> = ${JSON.stringify(presets, null, 2)};

export const TP_SCREEN_DIMENSIONS: Record<TPScreenSize, { width: number; height: number; label: string }> = {
  base: { width: 375, height: 812, label: 'Base (375×812)' },
  new: { width: 402, height: 874, label: 'New (402×874)' },
  ios27: { width: 402, height: 874, label: 'iOS 27 (402×874)' },
};

export interface TPTextStyleSpec {
  name: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
}

export const TP_TEXT_STYLES: readonly TPTextStyleSpec[] = [
  { name: 'Title/Large Title', fontSize: 34, fontWeight: 600, lineHeight: 41 },
  { name: 'Title/Title 1', fontSize: 28, fontWeight: 600, lineHeight: 34 },
  { name: 'Title/Title 2', fontSize: 22, fontWeight: 600, lineHeight: 28 },
  { name: 'Title/Title 3', fontSize: 20, fontWeight: 600, lineHeight: 25 },
  { name: 'Title/Title 4', fontSize: 18, fontWeight: 600, lineHeight: 23 },
  { name: 'Body 1/Regular', fontSize: 17, fontWeight: 400, lineHeight: 22 },
  { name: 'Body 1/Medium', fontSize: 17, fontWeight: 500, lineHeight: 22 },
  { name: 'Body 1/SemiBold', fontSize: 17, fontWeight: 600, lineHeight: 22 },
  { name: 'Body 2/Regular', fontSize: 16, fontWeight: 400, lineHeight: 21 },
  { name: 'Body 2/Medium', fontSize: 16, fontWeight: 500, lineHeight: 21 },
  { name: 'Body 2/Semibold', fontSize: 16, fontWeight: 600, lineHeight: 21 },
  { name: 'Subheadline/Regular', fontSize: 15, fontWeight: 400, lineHeight: 20 },
  { name: 'Subheadline/Medium', fontSize: 15, fontWeight: 500, lineHeight: 20 },
  { name: 'Caption 1/Regular', fontSize: 14, fontWeight: 400, lineHeight: 19 },
  { name: 'Caption 1/Medium', fontSize: 14, fontWeight: 500, lineHeight: 19 },
  { name: 'Caption 2/Regular', fontSize: 13, fontWeight: 400, lineHeight: 18 },
  { name: 'Caption 2/Semibold', fontSize: 13, fontWeight: 600, lineHeight: 18 },
  { name: 'Caption 3/Regular', fontSize: 12, fontWeight: 400, lineHeight: 16 },
];
`;

const cssBlocks = [];
for (const entry of MODE_MAP) {
  const p = presets[entry.brand][entry.mode];
  const selector =
    entry.brand === 'omada' && entry.mode === 'light'
      ? `:root, [data-tp-brand="omada"][data-tp-mode="light"]`
      : `[data-tp-brand="${entry.brand}"][data-tp-mode="${entry.mode}"]`;

  const lines = [
    `  color-scheme: ${entry.mode};`,
    `  --tp-focus: ${p.focus};`,
    `  --tp-focus-10: ${p.focusSoft10};`,
    `  --tp-focus-16: ${p.focusSoft16};`,
    `  --tp-focus-20: ${p.focusSoft20};`,
    `  --tp-bg-page: ${p.background};`,
    `  --tp-bg-card: ${p.card};`,
    `  --tp-bg-modal: ${p.modalPanel};`,
    `  --tp-bg-overlay: ${p.overlay};`,
    `  --tp-bg-search: ${p.searchBar};`,
    `  --tp-bg-view: ${p.viewBg};`,
    `  --tp-divider: ${p.listDivider};`,
    `  --tp-view-divider: ${p.viewDivider};`,
    `  --tp-text-primary: ${p.textPrimary};`,
    `  --tp-text-secondary: ${p.textSecondary};`,
    `  --tp-text-secondary-alt: ${p.textSecondaryAlt};`,
    `  --tp-text-disabled: ${p.textDisabled};`,
    `  --tp-text-inverse-primary: ${p.textInversePrimary};`,
    `  --tp-text-inverse-secondary: ${p.textInverseSecondary};`,
    `  --tp-text-highlighted: ${p.textHighlighted};`,
    `  --tp-color-alert: ${p.alert};`,
    `  --tp-color-alert-10: ${p.alertSoft10};`,
    `  --tp-color-green: ${p.green};`,
    `  --tp-color-green-10: ${p.greenSoft10};`,
    `  --tp-color-yellow: ${p.yellow};`,
    `  --tp-color-yellow-10: ${p.yellowSoft10};`,
    `  --tp-btn-primary-bg: ${p.buttonPrimaryFill};`,
    `  --tp-btn-secondary-bg: ${p.buttonSecondaryFill};`,
    `  --tp-btn-secondary-stroke: ${p.buttonSecondaryStroke}px;`,
    `  --tp-btn-secondary-border: ${p.buttonSecondaryStroke > 0 ? `${p.buttonSecondaryStroke}px solid ${p.buttonTextColor}` : 'none'};`,
    `  --tp-btn-text-color: ${p.buttonTextColor};`,
    `  --tp-btn-alert-bg: ${p.buttonAlertFill};`,
    `  --tp-btn-disabled-bg: ${p.buttonDisabledFill};`,
    `  --tp-btn-disabled-text: ${p.buttonDisabledText};`,
    `  --tp-radius-btn: ${p.radiusButton}px;`,
    `  --tp-radius-in-card-btn: ${p.radiusInCardButton}px;`,
    `  --tp-radius-card: ${p.radiusCard}px;`,
    `  --tp-font-family: -apple-system, BlinkMacSystemFont, "${p.fontFamily}", "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif;`,
    `  --tp-font-size-main: ${p.fontSizeMain}px;`,
    `  --tp-font-weight-title1: ${weightToNumber(p.fontWeightTitle1)};`,
    `  --tp-font-weight-title4: ${weightToNumber(p.fontWeightTitle4)};`,
    `  --tp-font-weight-btn: ${weightToNumber(p.fontWeightButton)};`,
    `  --tp-slider-stroke: ${p.sliderStroke}px;`,
    `  --tp-slider-tick: ${p.sliderTickSize}px;`,
    `  --tp-segment-tab-text: ${p.segmentTabText};`,
    `  --tp-toast-default: ${p.toastDefault};`,
    `  --tp-toast-info: ${p.toastInfo};`,
    `  --tp-toast-blue: ${p.toastBlue};`,
    `  --tp-toast-yellow: ${p.toastYellow};`,
    `  --tp-toast-red: ${p.toastRed};`,
    `  --tp-toast-text: ${p.toastText};`,
    `  --tp-menu-shadow: 0 0 32px rgba(0, 0, 0, ${entry.mode === 'dark' ? '0.48' : '0.2'});`,
    `  --tp-card-shadow: ${entry.mode === 'dark' ? '0 2px 10px rgba(0, 0, 0, 0.28)' : '0 2px 10px rgba(15, 23, 42, 0.04)'};`,
  ];

  // Also emit every raw TP-Design Figma variable under --tp-var-<slug>
  for (const [varName, value] of Object.entries(p.rawVariables)) {
    const slug = toCssVarKey(varName);
    if (!slug || typeof value === 'object') continue;
    const cssVal = typeof value === 'number' ? (varName.includes('Radius') || varName.includes('Size') || varName.includes('Stroke') || varName.includes('Tick') ? `${value}px` : String(value)) : String(value);
    lines.push(`  --tp-var-${slug}: ${cssVal};`);
  }

  cssBlocks.push(`${selector} {\n${lines.join('\n')}\n}`);
}

const cssSrc = `/* Auto-generated by scripts/generate-theme-tokens.mjs from TP-Design Figma Variables — do not edit manually */

${cssBlocks.join('\n\n')}

[data-tp-brand] {
  font-family: var(--tp-font-family);
  color: var(--tp-text-primary);
}
`;

fs.mkdirSync(path.join(ROOT, 'src/theme'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'src/styles'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/theme/tokens.ts'), tsSrc, 'utf8');
fs.writeFileSync(path.join(ROOT, 'src/styles/tp-tokens.css'), cssSrc, 'utf8');

console.log('Generated src/theme/tokens.ts & src/styles/tp-tokens.css for 6 brands × 2 modes (12 presets).');
