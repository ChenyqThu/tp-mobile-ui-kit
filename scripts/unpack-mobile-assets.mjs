#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const STEPS_DIR = '/Users/chenyuanquan/.gemini/antigravity/brain/e65259f6-645a-48ab-959b-df82b35e094e/.system_generated/steps';
const TRANSCRIPT_PATH = '/Users/chenyuanquan/.gemini/antigravity/brain/e65259f6-645a-48ab-959b-df82b35e094e/.system_generated/logs/transcript_full.jsonl';
const RAW_13802_PATH = path.join(ROOT, 'src', 'assets', 'illustrations', 'raw-66555-13802.png');

const ASSETS_DIR = path.join(ROOT, 'src', 'assets');
const ASSETS_LIB_DIR = path.join(ROOT, 'src', 'assets-lib');

const ZH_TERM_MAP = new Map([
  ['Mercusys水星', 'mercusys'],
  ['百宝箱', 'toolbox'],
  ['没有查看权限', 'no-permission'],
  ['设备供电不足', 'insufficient-power'],
  ['通用权限', 'general-permission'],
  ['no 网桥', 'no-bridge'],
  ['SN Number_条形码', 'sn-barcode'],
  ['product lable', 'product-label'],
  ['汉堡菜单', 'hamburger-menu'],
  ['日期7', 'calendar-7'],
  ['日期31', 'calendar-31'],
  ['日期', 'calendar'],
  ['信号_', 'signal-'],
  ['堆叠', 'stack'],
  ['成功', 'success'],
  ['错误', 'error'],
  ['警示', 'warning'],
  ['面性', 'solid'],
  ['未全选', 'unselect-all'],
  ['已全选', 'select-all'],
  ['多选', 'multi-select'],
  ['未选', 'unselected'],
  ['单选', 'single-select'],
  ['筛选', 'filter'],
  ['排序-上', 'sort-up'],
  ['排序-下', 'sort-down'],
  ['排序', 'sort'],
  ['虚拟wan口', 'virtual-wan'],
  ['上下topo_24', 'topo-vertical'],
  ['左右topo_24', 'topo-horizontal'],
  ['打勾', 'check'],
  ['大箭头', 'arrow-lg'],
  ['中箭头', 'arrow-md'],
  ['小箭头', 'arrow-sm'],
  ['返回', 'back'],
  ['展开', 'expand'],
  ['收起', 'collapse'],
  ['备份', 'backup'],
  ['播放', 'play'],
  ['删除', 'delete'],
  ['分享', 'share'],
  ['品牌loading', 'brand-loading'],
  ['接听', 'answer'],
  ['挂断', 'hangup'],
  ['缺省图', 'empty-state'],
  ['无在线客户端', 'no-online-clients'],
  ['无搜索结果', 'no-search-results'],
  ['无记录', 'no-records'],
  ['无黑名单', 'no-blacklist'],
  ['鹿小由插图', 'mascot'],
  ['心情', 'mood'],
  ['一般', 'neutral'],
  ['高兴', 'happy'],
  ['哭泣', 'crying'],
  ['难过', 'sad'],
  ['上', 'up'],
  ['下', 'down'],
  ['左', 'left'],
  ['右', 'right'],
  ['焦点色', 'focus'],
  ['状态', 'status'],
  ['样式', 'style'],
  ['类型', 'type'],
  ['图形', 'graphic'],
  ['网桥', 'bridge'],
  ['端口类型', 'port'],
  ['平台', 'platform'],
  ['通用', 'general'],
  ['亮暗模式相同', ''],
  ['图标', ''],
]);

function replaceChinese(input) {
  let out = String(input ?? '');
  for (const [zh, en] of ZH_TERM_MAP.entries()) {
    if (out.includes(zh)) {
      out = out.split(zh).join(en ? `-${en}-` : '-');
    }
  }
  return out;
}

function toAsciiSlug(input, fallback = 'asset') {
  const replaced = replaceChinese(input)
    .normalize('NFKD')
    .replace(/™/g, '')
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/[A-Z]+/g, (m) => (m.length > 1 ? ` ${m.toLowerCase()} ` : ` ${m.toLowerCase()}`))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return replaced.length >= 1 ? replaced : fallback;
}

function cleanCamelSlug(raw) {
  let s = replaceChinese(raw)
    .replace(/™/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .replace(/-{2,}/g, '-');
  return s;
}

function parseColorRgb(colorStr) {
  if (!colorStr) return null;
  const s = colorStr.trim().toLowerCase();
  if (
    s === 'none' ||
    s === 'transparent' ||
    s === 'currentcolor' ||
    s === 'inherit' ||
    s.startsWith('url(')
  ) {
    return { skip: true };
  }
  if (s === 'black') return { r: 0, g: 0, b: 0 };
  if (s === 'white') return { r: 255, g: 255, b: 255 };
  if (/^#[0-9a-f]{3}$/.test(s)) {
    return {
      r: parseInt(s[1] + s[1], 16),
      g: parseInt(s[2] + s[2], 16),
      b: parseInt(s[3] + s[3], 16),
    };
  }
  if (/^#[0-9a-f]{6}$/.test(s)) {
    return {
      r: parseInt(s.slice(1, 3), 16),
      g: parseInt(s.slice(3, 5), 16),
      b: parseInt(s.slice(5, 7), 16),
    };
  }
  if (/^#[0-9a-f]{8}$/.test(s)) {
    return {
      r: parseInt(s.slice(1, 3), 16),
      g: parseInt(s.slice(3, 5), 16),
      b: parseInt(s.slice(5, 7), 16),
    };
  }
  const rgbMatch = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
  }
  return null;
}

function normalizeIconSvg(svgRaw, width, height) {
  let svg = svgRaw.trim();
  const openTagMatch = svg.match(/<svg\b([^>]*)>/i);
  if (openTagMatch) {
    let attrs = openTagMatch[1];
    const hasViewBox = /\bviewBox\s*=/i.test(attrs);
    const wMatch = attrs.match(/\bwidth\s*=\s*["']([^"']+)["']/i);
    const hMatch = attrs.match(/\bheight\s*=\s*["']([^"']+)["']/i);
    const vbW = Math.round(Number(wMatch?.[1]) || width || 24);
    const vbH = Math.round(Number(hMatch?.[1]) || height || 24);
    attrs = attrs
      .replace(/\s*\bwidth\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\s*\bheight\s*=\s*["'][^"']*["']/gi, '');
    if (!hasViewBox) {
      attrs += ` viewBox="0 0 ${vbW} ${vbH}"`;
    }
    svg = svg.replace(/<svg\b[^>]*>/i, `<svg${attrs}>`);
  }

  const colorMatches = [];
  for (const m of svg.matchAll(/\b(fill|stroke)\s*=\s*["']([^"']+)["']/gi)) {
    colorMatches.push(m[2]);
  }
  for (const m of svg.matchAll(/\b(fill|stroke)\s*:\s*([^;"']+)/gi)) {
    colorMatches.push(m[2]);
  }

  let hasChromatic = false;
  let hasNeutralDark = false;
  for (const rawColor of colorMatches) {
    const rgb = parseColorRgb(rawColor);
    if (!rgb || rgb.skip) continue;
    if (rgb.r >= 245 && rgb.g >= 245 && rgb.b >= 245) continue;
    const chroma = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
    if (chroma > 18) {
      hasChromatic = true;
      break;
    }
    hasNeutralDark = true;
  }

  const monochrome = !hasChromatic && (hasNeutralDark || colorMatches.length === 0);
  if (monochrome) {
    svg = svg.replace(/\b(fill|stroke)\s*=\s*["']([^"']+)["']/gi, (full, prop, val) => {
      const rgb = parseColorRgb(val);
      if (!rgb || rgb.skip || (rgb.r >= 245 && rgb.g >= 245 && rgb.b >= 245)) return full;
      return `${prop}="currentColor"`;
    });
    svg = svg.replace(/\b(fill|stroke)\s*:\s*([^;"']+)/gi, (full, prop, val) => {
      const rgb = parseColorRgb(val);
      if (!rgb || rgb.skip || (rgb.r >= 245 && rgb.g >= 245 && rgb.b >= 245)) return full;
      return `${prop}:currentColor`;
    });
  }

  return { svg, monochrome };
}

function slugOmadaIcon(item) {
  let raw = String(item.name ?? '')
    .replace(/^omada-图标-[^/]+\//i, '')
    .replace(/^icon\//i, '')
    .replace(/^(Property\s*\d+|状态|图标|样式|类型)\s*=\s*/gi, '')
    .trim();

  // Fix typo in Figma source
  raw = raw.replace(/guest nwtwork/i, 'guest-network');

  const prefixMap = {
    tabbar: 'tabbar',
    settings: 'settings',
    dashboard: 'dashboard',
    nav: 'nav',
    log: 'log',
    '状态': 'status',
    'Wi-Fi signal': 'wifi',
    '选择': 'select',
    'quick action': 'qa',
    'network tools': 'tool',
    '端口类型': 'port',
    '平台': 'platform',
  };

  let prefix = prefixMap[item.category] ?? '';
  if (!prefix && /^omada-图标-clients\//i.test(item.name)) prefix = 'client';
  if (!prefix && /^omada-图标-头像\//i.test(item.name)) prefix = 'avatar';

  let base = cleanCamelSlug(raw);
  base = base.replace(/^invisable$/, 'invisible').replace(/^visable$/, 'visible');
  if (!base) base = `omada-${String(item.id).replace(/[^0-9]+/g, '-')}`;

  if (prefix && !base.startsWith(`${prefix}-`) && base !== prefix) {
    return `${prefix}-${base}`;
  }
  return base;
}

function slugGeneralIcon(item) {
  let raw = String(item.name ?? '')
    .replace(/^Property\s*\d+\s*=\s*/i, '')
    .replace(/\bStyle=/gi, '')
    .replace(/\b类型=/gi, '')
    .replace(/\b样式=/gi, '')
    .replace(/\b已全选=/gi, 'checked-')
    .replace(/Button\/(Default|图形)\//i, 'btn-')
    .replace(/^Picker\//i, 'picker-')
    .replace(/^Empty state 缺省图\//i, 'empty-')
    .trim();

  let slug = cleanCamelSlug(raw);
  if (!slug) slug = `icon-${String(item.id).replace(/[^0-9]+/g, '-')}`;
  return slug;
}

function slugLogo(item) {
  const raw = String(item.name ?? '').trim();
  if (raw === 'TP') return 'tp-link';
  if (raw === 'Mercusys水星') return 'mercusys';
  if (raw === '百宝箱') return 'toolbox';
  const s = cleanCamelSlug(raw);
  return s || `logo-${String(item.id).replace(/[^0-9]+/g, '-')}`;
}

function slugIllustration(item) {
  let raw = String(item.name ?? '')
    .replace(/^Property\s*1\s*=\s*empt(?:y)?,\s*Property\s*2\s*=\s*/i, '')
    .replace(/^Property\s*1\s*=\s*/i, '')
    .replace(/^image\//i, '')
    .trim();

  // Canonicalize Light vs Dark naming discrepancies so theme auto-switching pairs 1:1
  const lower = raw.toLowerCase();
  if (lower === 'email1' || lower === 'email 1') return 'email-1';
  if (lower === 'gateway_router 1' || lower === 'gateway_router 2') return 'gateway-router';
  if (lower === 'mlo_network 1' || lower === 'mlo_network 2') return 'mlo-network';
  if (lower === 'product lable') return 'product-label';

  const s = cleanCamelSlug(raw);
  return s || `illus-${String(item.id).replace(/[^0-9]+/g, '-')}`;
}

function ensureUnique(usedSet, baseSlug) {
  if (!usedSet.has(baseSlug)) {
    usedSet.add(baseSlug);
    return baseSlug;
  }
  let n = 2;
  while (usedSet.has(`${baseSlug}-${n}`)) n++;
  const next = `${baseSlug}-${n}`;
  usedSet.add(next);
  return next;
}

function collectExports() {
  const omadaIcons = new Map();
  const iconLibrary = new Map();
  const illustrations = new Map();

  function feed(obj) {
    if (!obj || !Array.isArray(obj.items)) return;
    if (obj.group === 'omada-icons') {
      for (const it of obj.items) omadaIcons.set(it.id, it);
    } else if (obj.group === 'icon-library') {
      for (const it of obj.items) iconLibrary.set(it.id, it);
    } else if (
      obj.group === 'illustrations' &&
      obj.items.some((i) => String(i.id).startsWith('66555:'))
    ) {
      for (const it of obj.items) illustrations.set(it.id, it);
    }
  }

  for (const dir of fs.readdirSync(STEPS_DIR)) {
    const p = path.join(STEPS_DIR, dir, 'output.txt');
    if (!fs.existsSync(p)) continue;
    const txt = fs.readFileSync(p, 'utf8').trim();
    if (!txt.startsWith('{')) continue;
    try {
      feed(JSON.parse(txt));
    } catch {
      // Ignore non-JSON files
    }
  }

  const lines = fs.readFileSync(TRANSCRIPT_PATH, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const row = JSON.parse(line);
      if (row.type === 'GENERIC' && typeof row.content === 'string') {
        const idx = row.content.indexOf('{"group":');
        if (idx !== -1) {
          feed(JSON.parse(row.content.slice(idx)));
        }
      }
    } catch {
      // Ignore malformed lines
    }
  }

  if (fs.existsSync(RAW_13802_PATH)) {
    const b64 = fs.readFileSync(RAW_13802_PATH).toString('base64');
    illustrations.set('66555:13802', {
      id: '66555:13802',
      name: 'image/Go to Settings_android',
      category: 'onboarding',
      theme: 'light',
      w: 335,
      h: 120,
      format: 'png',
      data: b64,
    });
  }

  return { omadaIcons, iconLibrary, illustrations };
}

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function writeAssetFile(absPath, item, isIcon = false) {
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  if (item.format === 'svg') {
    if (isIcon) {
      const { svg, monochrome } = normalizeIconSvg(item.data, item.w, item.h);
      fs.writeFileSync(absPath, `${svg}\n`, 'utf8');
      return { monochrome };
    }
    fs.writeFileSync(absPath, `${item.data.trim()}\n`, 'utf8');
    return { monochrome: false };
  }
  const buf = Buffer.from(item.data, 'base64');
  fs.writeFileSync(absPath, buf);
  return { monochrome: false };
}

function main() {
  const { omadaIcons, iconLibrary, illustrations } = collectExports();

  const omadaDir = path.join(ASSETS_DIR, 'icons', 'omada');
  const generalDir = path.join(ASSETS_DIR, 'icons', 'general');
  const logosDir = path.join(ASSETS_DIR, 'logos');
  const illusLightDir = path.join(ASSETS_DIR, 'illustrations', 'light');
  const illusDarkDir = path.join(ASSETS_DIR, 'illustrations', 'dark');

  resetDir(omadaDir);
  resetDir(generalDir);
  resetDir(logosDir);
  resetDir(illusLightDir);
  resetDir(illusDarkDir);
  fs.mkdirSync(ASSETS_LIB_DIR, { recursive: true });

  const iconsManifest = [];
  const usedOmadaSlugs = new Set();
  for (const item of omadaIcons.values()) {
    const slug = ensureUnique(usedOmadaSlugs, slugOmadaIcon(item));
    const ext = item.format === 'png' ? 'png' : 'svg';
    const relPath = `omada/${slug}.${ext}`;
    const { monochrome } = writeAssetFile(path.join(omadaDir, `${slug}.${ext}`), item, true);
    iconsManifest.push({
      name: slug,
      pack: 'omada',
      category: String(item.category ?? 'general'),
      title: String(item.name ?? slug),
      relPath,
      format: ext,
      monochrome,
      width: item.w ?? 24,
      height: item.h ?? 24,
    });
  }

  const logosManifest = [];
  const usedGeneralSlugs = new Set();
  const usedLogoSlugs = new Set();

  for (const item of iconLibrary.values()) {
    if (item.category === 'app-logo') {
      const slug = ensureUnique(usedLogoSlugs, slugLogo(item));
      const ext = item.format === 'png' ? 'png' : 'svg';
      const relPath = `${slug}.${ext}`;
      writeAssetFile(path.join(logosDir, relPath), item, false);
      logosManifest.push({
        name: slug,
        title: String(item.name ?? slug),
        relPath,
        format: ext,
        width: item.w ?? 60,
        height: item.h ?? 60,
      });
    } else {
      const slug = ensureUnique(usedGeneralSlugs, slugGeneralIcon(item));
      const ext = item.format === 'png' ? 'png' : 'svg';
      const relPath = `general/${slug}.${ext}`;
      const { monochrome } = writeAssetFile(path.join(generalDir, `${slug}.${ext}`), item, true);
      iconsManifest.push({
        name: slug,
        pack: 'general',
        category: String(item.category ?? 'general'),
        title: String(item.name ?? slug),
        relPath,
        format: ext,
        monochrome,
        width: item.w ?? 24,
        height: item.h ?? 24,
      });
    }
  }

  const illusManifest = [];
  const usedIllusByTheme = { light: new Set(), dark: new Set() };
  for (const item of illustrations.values()) {
    const theme = item.theme === 'dark' ? 'dark' : 'light';
    const slug = ensureUnique(usedIllusByTheme[theme], slugIllustration(item));
    const ext = item.format === 'png' ? 'png' : 'svg';
    const relPath = `${theme}/${slug}.${ext}`;
    const outDir = theme === 'dark' ? illusDarkDir : illusLightDir;
    writeAssetFile(path.join(outDir, `${slug}.${ext}`), item, false);
    illusManifest.push({
      name: slug,
      theme,
      category: String(item.category ?? 'general'),
      title: String(item.name ?? slug),
      relPath,
      format: ext,
      width: item.w ?? 300,
      height: item.h ?? 160,
    });
  }

  // Sort deterministically
  iconsManifest.sort((a, b) => a.pack.localeCompare(b.pack) || a.name.localeCompare(b.name));
  logosManifest.sort((a, b) => a.name.localeCompare(b.name));
  illusManifest.sort((a, b) => a.name.localeCompare(b.name) || a.theme.localeCompare(b.theme));

  const iconsTs = `/* Auto-generated by scripts/unpack-mobile-assets.mjs from TP-Design Figma — do not edit manually */

export type TPIconPack = 'omada' | 'general';

export interface TPIconMeta {
  name: string;
  pack: TPIconPack;
  category: string;
  title: string;
  relPath: string;
  format: 'svg' | 'png';
  monochrome: boolean;
  width: number;
  height: number;
}

export const TP_ICONS: readonly TPIconMeta[] = ${JSON.stringify(iconsManifest, null, 2)};

export type TPIconName = (typeof TP_ICONS)[number]['name'];
`;

  const assetsTs = `/* Auto-generated by scripts/unpack-mobile-assets.mjs from TP-Design Figma — do not edit manually */

export interface TPIllustrationMeta {
  name: string;
  theme: 'light' | 'dark';
  category: string;
  title: string;
  relPath: string;
  format: 'svg' | 'png';
  width: number;
  height: number;
}

export interface TPBrandLogoMeta {
  name: string;
  title: string;
  relPath: string;
  format: 'svg' | 'png';
  width: number;
  height: number;
}

export const TP_ILLUSTRATIONS: readonly TPIllustrationMeta[] = ${JSON.stringify(illusManifest, null, 2)};

export const TP_BRAND_LOGOS: readonly TPBrandLogoMeta[] = ${JSON.stringify(logosManifest, null, 2)};

export type TPIllustrationName = (typeof TP_ILLUSTRATIONS)[number]['name'];
export type TPBrandLogoName = (typeof TP_BRAND_LOGOS)[number]['name'];
`;

  fs.writeFileSync(path.join(ASSETS_LIB_DIR, 'iconsManifest.ts'), iconsTs, 'utf8');
  fs.writeFileSync(path.join(ASSETS_LIB_DIR, 'assetsManifest.ts'), assetsTs, 'utf8');

  const omadaCount = iconsManifest.filter((i) => i.pack === 'omada').length;
  const generalCount = iconsManifest.filter((i) => i.pack === 'general').length;
  const lightIllus = illusManifest.filter((i) => i.theme === 'light').length;
  const darkIllus = illusManifest.filter((i) => i.theme === 'dark').length;

  console.log('Unpacked TP-Design mobile assets:');
  console.log(`  Omada icons: ${omadaCount}`);
  console.log(`  General icons: ${generalCount}`);
  console.log(`  App logos: ${logosManifest.length}`);
  console.log(`  Illustrations: ${illusManifest.length} (light: ${lightIllus}, dark: ${darkIllus})`);
}

main();
