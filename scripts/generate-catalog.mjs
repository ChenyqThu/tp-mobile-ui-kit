#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readTsConstant(filePath, constName) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.ES2022, true);
  let result = undefined;
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === constName &&
      node.initializer
    ) {
      const slice = sourceText.slice(node.initializer.getStart(sourceFile), node.initializer.getEnd());
      const normalized = slice.replace(/\s+as\s+const\b/g, '');
      result = Function(`"use strict"; return (${normalized});`)();
    }
    if (result === undefined) {
      ts.forEachChild(node, visit);
    }
  }
  visit(sourceFile);
  return result;
}

const CORE_NAV_CONTROL_FILES = new Set([
  'TPPhoneFrame',
  'TPStatusBar',
  'TPHeader',
  'TPTabBar',
  'TPSegment',
  'TPPageControl',
  'TPButton',
  'TPFixedButtonBar',
  'TPSwitch',
  'TPSlider',
]);

const CORE_LIST_INPUT_FILES = new Set([
  'TPListCard',
  'TPListItem',
  'TPListButton',
  'TPSectionHeader',
  'TPSectionNote',
  'TPText',
  'TPTag',
  'TPBadge',
  'TPEmptyState',
  'TPInput',
  'TPSearchBar',
  'TPWheelPicker',
  'TPDatePicker',
  'TPTimePicker',
  'TPDaySwitcher',
  'TPKeyboard',
]);

const CORE_OVERLAY_FILES = new Set([
  'TPAlert',
  'TPActionSheet',
  'TPBottomSheet',
  'TPPopup',
  'TPMenu',
  'TPToast',
  'TPPrompt',
]);

function classifySourcePath(relPath, symbolName) {
  const normalized = relPath.replace(/\\/g, '/');
  if (normalized.startsWith('src/theme/')) return 'theme';
  if (normalized.startsWith('src/assets-lib/')) return 'assets';
  if (symbolName === 'OmadaDeviceThumb') return 'omada-components';
  if (normalized.startsWith('src/omada/blocks/')) return 'omada-blocks';
  if (normalized.startsWith('src/omada/pages/')) return 'omada-pages';
  if (normalized.startsWith('src/omada/components/')) return 'omada-components';
  if (normalized.startsWith('src/core/')) {
    const base = path.basename(normalized, path.extname(normalized));
    if (CORE_NAV_CONTROL_FILES.has(base)) return 'core-nav-controls';
    if (CORE_LIST_INPUT_FILES.has(base)) return 'core-lists-inputs';
    if (CORE_OVERLAY_FILES.has(base)) return 'core-overlays';
    if (symbolName === 'useTPToast') return 'core-overlays';
    return 'core-nav-controls';
  }
  return 'utility';
}

function subpathForCategory(pkgName, category) {
  if (category === 'assets') return `${pkgName}/assets`;
  if (category.startsWith('omada-')) return `${pkgName}/omada`;
  if (category === 'theme' || category.startsWith('core-')) return `${pkgName}/core`;
  return pkgName;
}

const DESCRIPTION_FALLBACKS = {
  TPThemeProvider: 'Multi-brand TP-Design theme provider supporting 6 brands, light/dark/system modes, iOS/Android OS styles, and scoped attributes.',
  useTPTheme: 'Hook returning current brand, color mode, resolvedMode, os, screenSize, theme tokens, and theme setters.',
  TPThemeContext: 'React context powering TPThemeProvider and useTPTheme.',
  TP_BRANDS: 'Metadata array of the 6 supported TP-Design brands (omada, tapo, tether, mercusys, deco, ux).',
  TP_THEME_PRESETS: 'Complete 12-mode (6 brands x light/dark) TP-Design variable preset dictionary.',
  TPPhoneFrame: 'Device preview shell supporting iphone16pro, iphone14, android, and compact presets with statusBar, floatingAction, bottomBar, Dynamic Island, and Home Indicator.',
  TPStatusBar: 'Platform-adaptive iOS/Android status bar with time, mute/location indicators, signal bars, Wi-Fi icon, and battery gauge.',
  TPHeader: 'Mobile navigation header supporting standard docked bar and Omada floating glass action wells with dropdown title, subtitle, and rightBadge.',
  TPTabBar: 'Bottom navigation tab bar supporting iOS frosted floating-pill and docked modes with TPIcon strings or custom nodes and badges.',
  TPSegment: 'Segmented tab switcher supporting full-width/auto underline tabs and rounded pill track variants.',
  TPPageControl: 'Carousel/onboarding pagination dot indicator with optional interactive step selection.',
  TPButton: 'Brand-adaptive button respecting --tp-radius-btn and secondary outline/fill tokens; uses variant= and htmlType= (never type=).',
  TPFixedButtonBar: 'Sticky bottom action footer supporting single, dual-horizontal, and dual-vertical button layouts with optional note.',
  TPSwitch: 'Accessible role="switch" toggle driven by --tp-focus with controlled/uncontrolled, disabled, and loading states.',
  TPSlider: 'Range slider driven by --tp-slider-stroke and --tp-slider-tick with optional marks, unit, and live value header.',
  TPAlert: 'Platform-adaptive modal alert dialog (frosted centered iOS dialog vs Material Android dialog) with optional inline prompt input.',
  TPActionSheet: 'Platform-adaptive action sheet (iOS floating grouped cards vs Android bottom sheet) supporting rich options, icons, and destructive role.',
  TPBottomSheet: 'Draggable-style modal bottom sheet with grabber, title/subtitle, close button, scrollable body, and sticky footer.',
  TPPopup: 'Generic overlay popup dialog supporting center, top, and bottom placements.',
  TPMenu: 'Floating dropdown menu card anchored left, right, or center with selection checkmarks, icons, dividers, and danger tone.',
  TPToast: 'Non-blocking toast notification supporting default, info, success, warning, error, and loading spinners.',
  TPToastProvider: 'Context provider mounting global TPToast notifications for useTPToast().',
  useTPToast: 'Hook returning { show, dismiss } to trigger imperative TPToast notifications.',
  TPPrompt: 'Inline announcement banner supporting info, focus, warning, and alert tones with optional action CTA and dismiss button.',
  OmadaDeviceThumb: 'Device thumbnail icon helper rendering Omada access point, switch, or gateway icons.',
};

function getJsDocSummary(checker, symbol) {
  if (!symbol) return '';
  const docs = symbol.getDocumentationComment(checker);
  if (!docs || docs.length === 0) return '';
  return ts.displayPartsToString(docs).replace(/\s+/g, ' ').trim();
}

function getDeclarationJsDoc(decl) {
  if (!decl) return '';
  const targets = [decl];
  if (ts.isVariableDeclaration(decl) && decl.parent?.parent) {
    targets.push(decl.parent.parent);
  }
  for (const target of targets) {
    const jsDocs = ts.getJSDocCommentsAndTags(target);
    for (const doc of jsDocs) {
      if (typeof doc.comment === 'string' && doc.comment.trim()) {
        return doc.comment.replace(/\s+/g, ' ').trim();
      }
      if (Array.isArray(doc.comment)) {
        const text = doc.comment.map((part) => part.text ?? '').join('').replace(/\s+/g, ' ').trim();
        if (text) return text;
      }
    }
  }
  return '';
}

function collectOwnPropsFromType(checker, sourceFile, typeNode) {
  const props = [];
  const seen = new Set();

  function addProp(propName, typeText, optional, description) {
    if (seen.has(propName)) return;
    seen.add(propName);
    props.push({
      name: propName,
      type: typeText.replace(/\s+/g, ' ').trim(),
      optional,
      ...(description ? { description } : {}),
    });
  }

  function extractFromMembers(members) {
    for (const member of members) {
      if (ts.isPropertySignature(member) && member.name) {
        const propName = member.name.getText(sourceFile).replace(/^['"]|['"]$/g, '');
        const typeText = member.type ? member.type.getText(sourceFile) : 'unknown';
        const optional = Boolean(member.questionToken);
        const sym = checker.getSymbolAtLocation(member.name);
        const description = (sym ? getJsDocSummary(checker, sym) : '') || getDeclarationJsDoc(member);
        addProp(propName, typeText, optional, description);
      } else if (ts.isMethodSignature(member) && member.name) {
        const propName = member.name.getText(sourceFile).replace(/^['"]|['"]$/g, '');
        const sigText = member.getText(sourceFile).replace(/;$/, '');
        addProp(propName, sigText, Boolean(member.questionToken), getDeclarationJsDoc(member));
      }
    }
  }

  if (ts.isInterfaceDeclaration(typeNode)) {
    extractFromMembers(typeNode.members);
  } else if (ts.isTypeLiteralNode(typeNode)) {
    extractFromMembers(typeNode.members);
  } else if (ts.isTypeAliasDeclaration(typeNode)) {
    const visitType = (node) => {
      if (ts.isTypeLiteralNode(node)) {
        extractFromMembers(node.members);
      } else if (ts.isIntersectionTypeNode(node)) {
        for (const sub of node.types) visitType(sub);
      }
    };
    visitType(typeNode.type);
  }

  return props;
}

function extractInlineReactFcProps(checker, decl, sf) {
  if (!ts.isVariableDeclaration(decl) || !decl.type || !ts.isTypeReferenceNode(decl.type)) {
    return null;
  }
  const typeArg = decl.type.typeArguments?.[0];
  if (!typeArg) return null;
  if (ts.isTypeLiteralNode(typeArg)) {
    return {
      propsTypeName: 'InlineProps',
      props: collectOwnPropsFromType(checker, sf, typeArg),
      extendsText: '',
    };
  }
  return null;
}

function buildComponentCatalog(pkgName) {
  const entryPath = path.join(ROOT_DIR, 'src/lib/index.ts');
  const coreTypesPath = path.join(ROOT_DIR, 'src/core/types.ts');
  const configPath = path.join(ROOT_DIR, 'tsconfig.lib.json');
  const rawConfig = readJson(configPath);
  const parsed = ts.parseJsonConfigFileContent(rawConfig, ts.sys, ROOT_DIR);
  const program = ts.createProgram([entryPath, coreTypesPath], parsed.options);
  const checker = program.getTypeChecker();

  const entrySource = program.getSourceFile(entryPath);
  if (!entrySource) {
    throw new Error(`Could not load entry file: ${entryPath}`);
  }
  const entrySymbol = checker.getSymbolAtLocation(entrySource);
  if (!entrySymbol) {
    throw new Error(`Could not resolve exports of ${entryPath}`);
  }

  const exports = checker.getExportsOfModule(entrySymbol);
  const propsMap = new Map();
  const valueEntries = [];

  for (const sym of exports) {
    const resolved = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
    const decl = resolved.declarations?.[0] ?? sym.declarations?.[0];
    if (!decl) continue;
    const sf = decl.getSourceFile();
    const relPath = path.relative(ROOT_DIR, sf.fileName).replace(/\\/g, '/');

    if (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl)) {
      if (sym.name.endsWith('Props') && !relPath.startsWith('node_modules/')) {
        propsMap.set(sym.name, {
          propsTypeName: sym.name,
          props: collectOwnPropsFromType(checker, sf, decl),
          extendsText:
            ts.isInterfaceDeclaration(decl) && decl.heritageClauses
              ? decl.heritageClauses.map((h) => h.getText(sf)).join(' ')
              : '',
        });
      }
      continue;
    }

    const category = classifySourcePath(relPath, sym.name);
    const isDataConstant =
      sym.name.startsWith('TP_') ||
      sym.name.startsWith('OMADA_') ||
      sym.name.startsWith('DEFAULT_');
    const isHook = sym.name.startsWith('use');
    const isContext = sym.name.endsWith('Context');
    const kind = isDataConstant
      ? 'data'
      : isHook
        ? 'hook'
        : isContext
          ? 'helper'
          : /^[A-Z]/.test(sym.name)
            ? 'component'
            : 'helper';

    const description =
      getJsDocSummary(checker, resolved) ||
      getDeclarationJsDoc(decl) ||
      DESCRIPTION_FALLBACKS[sym.name] ||
      '';

    let signature = '';
    if (kind === 'hook' || (kind === 'helper' && !isContext)) {
      const symbolType = checker.getTypeOfSymbolAtLocation(resolved, decl);
      const callSigs = symbolType.getCallSignatures();
      if (callSigs.length > 0) {
        signature = checker.signatureToString(callSigs[0]);
      }
    }

    const inlineProps =
      kind === 'component' && !propsMap.has(`${sym.name}Props`)
        ? extractInlineReactFcProps(checker, decl, sf)
        : null;

    valueEntries.push({
      name: sym.name,
      category,
      kind,
      subpath: subpathForCategory(pkgName, category),
      sourcePath: relPath,
      description,
      ...(signature ? { signature } : {}),
      ...(inlineProps ? { inlineProps } : {}),
    });
  }

  return valueEntries
    .map((entry) => {
      const exactProps = propsMap.get(`${entry.name}Props`) ?? entry.inlineProps ?? null;
      const { inlineProps: _ignored, ...rest } = entry;
      return {
        ...rest,
        ...(exactProps ? { propsType: exactProps.propsTypeName, props: exactProps.props } : {}),
        ...(exactProps?.extendsText ? { extends: exactProps.extendsText } : {}),
      };
    })
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

function summarizePresets(presets) {
  const out = {};
  for (const [brand, modes] of Object.entries(presets)) {
    out[brand] = {};
    for (const [mode, tokenObj] of Object.entries(modes)) {
      const { rawVariables: _omit, ...summary } = tokenObj;
      out[brand][mode] = summary;
    }
  }
  return out;
}

function dedupeIllustrations(entries) {
  const map = new Map();
  for (const entry of entries) {
    const existing = map.get(entry.name);
    if (!existing) {
      map.set(entry.name, {
        name: entry.name,
        category: entry.category,
        title: entry.title,
        themes: [entry.theme],
        width: entry.width,
        height: entry.height,
        format: entry.format,
      });
    } else if (!existing.themes.includes(entry.theme)) {
      existing.themes.push(entry.theme);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function dedupeMotions(entries) {
  const map = new Map();
  for (const entry of entries) {
    const existing = map.get(entry.name);
    if (!existing) {
      map.set(entry.name, {
        name: entry.name,
        title: entry.title,
        category: entry.category,
        themes: [entry.theme],
        format: entry.format,
        bytes: entry.bytes,
      });
    } else {
      if (!existing.themes.includes(entry.theme)) {
        existing.themes.push(entry.theme);
      }
      existing.bytes = Math.max(existing.bytes, entry.bytes);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function buildTemplatesMetadata() {
  return [
    {
      id: 'omada-dashboard',
      title: 'Omada Site Dashboard & Interactive App Shell',
      summary:
        'Full Omada APP v5.3–6.3 mobile prototype using OmadaAppDemo & OmadaSiteDashboardPage inside TPPhoneFrame with live site switching, Light/Dark toggle, Toolkit diagnostics sheet, and floating pill TPTabBar.',
      blocks: ['OmadaDeviceListBlock', 'OmadaIncidentsBlock'],
      pages: ['OmadaAppDemo', 'OmadaSiteDashboardPage', 'OmadaSiteDevicesPage', 'OmadaSiteClientsPage', 'OmadaSiteSettingsPage', 'OmadaSiteInsightsPage', 'OmadaHealthDetailPage'],
      components: ['TPThemeProvider', 'TPToastProvider', 'TPPhoneFrame', 'TPStatusBar', 'TPHeader', 'TPTabBar', 'TPButton', 'TPSwitch', 'TPIcon'],
      brands: ['omada'],
      htmlFile: 'templates/omada-dashboard.html',
      tsxFile: 'templates/omada-dashboard.tsx',
    },
    {
      id: 'multi-brand',
      title: 'Multi-Brand TP-Design 12-Mode Theme Showcase',
      summary:
        'Interactive 6-brand switcher (omada, tapo, tether, mercusys, deco, ux) + Light/Dark/OS mode + iOS/Android toggle showing automatic corner radius, secondary button stroke/fill, slider tick, typography, TPBrandLogo, TPIllustration, TPAlert, and TPToast adaptation.',
      blocks: [],
      pages: [],
      components: ['TPThemeProvider', 'TPToastProvider', 'TPPhoneFrame', 'TPStatusBar', 'TPHeader', 'TPTabBar', 'TPSegment', 'TPButton', 'TPSwitch', 'TPSlider', 'TPListCard', 'TPListItem', 'TPTag', 'TPBadge', 'TPAlert', 'TPBrandLogo', 'TPIllustration', 'TPIcon', 'useTPTheme', 'useTPToast'],
      brands: ['omada', 'tapo', 'tether', 'mercusys', 'deco', 'ux'],
      htmlFile: 'templates/multi-brand.html',
      tsxFile: 'templates/multi-brand.tsx',
    },
    {
      id: 'omada-device-detail',
      title: 'Omada Device Detail + Real PAG Motion & Config',
      summary:
        'Mobile device inspector combining OmadaDeviceDetailPage, interactive port grid with real Tencent PAG port-card-expand motion, firmware upgrade update-network PAG sheet, and segmented IPv4/MAC/Port OmadaStandardInput.',
      blocks: ['OmadaWirelessNetworkBlock', 'OmadaDeviceListBlock'],
      pages: ['OmadaDeviceDetailPage'],
      components: ['TPThemeProvider', 'TPToastProvider', 'TPPhoneFrame', 'TPStatusBar', 'TPHeader', 'TPSegment', 'TPListCard', 'TPListItem', 'TPButton', 'TPSwitch', 'TPMotion', 'TPIcon', 'OmadaStandardInput'],
      motions: ['port-card-expand', 'update-network', 'deploy-config'],
      brands: ['omada'],
      htmlFile: 'templates/omada-device-detail.html',
      tsxFile: 'templates/omada-device-detail.tsx',
    },
  ];
}

function buildRecipes(pkgName, pkgVersion) {
  return [
    {
      id: 'single-file-html',
      title: 'Zero-Build Single-File HTML Prototype',
      summary:
        'Classic <script> tags loading dist/style.css + dist/standalone.js + @babel/standalone so file:// double-click works without CORS or Vite.',
      components: ['TPThemeProvider', 'TPToastProvider', 'TPPhoneFrame', 'TPStatusBar', 'TPHeader', 'TPTabBar', 'TPButton'],
      cdnUrls: {
        css: `https://cdn.jsdelivr.net/npm/${pkgName}@latest/dist/style.css`,
        js: `https://cdn.jsdelivr.net/npm/${pkgName}@latest/dist/standalone.js`,
      },
      pinnedUrls: {
        css: `https://cdn.jsdelivr.net/npm/${pkgName}@${pkgVersion}/dist/style.css`,
        js: `https://cdn.jsdelivr.net/npm/${pkgName}@${pkgVersion}/dist/standalone.js`,
      },
    },
    {
      id: 'multi-brand-theming',
      title: '6-Brand TP-Design + Light/Dark/System + iOS/Android Switching',
      summary:
        'Wrap root UI in <TPThemeProvider defaultBrand="omada" defaultMode="light" defaultOS="ios"> and read/mutate via useTPTheme().',
      components: ['TPThemeProvider', 'useTPTheme', 'TPBrandLogo', 'TPButton', 'TPSlider', 'TPAlert'],
    },
    {
      id: 'omada-app-emulator',
      title: 'Omada APP v5.3–6.3 7-Screen Mobile Prototype',
      summary:
        'Mount <OmadaAppDemo /> or individual pages (OmadaLaunchLoadingPage, OmadaControllerListPage, OmadaSiteDashboardPage, OmadaSiteInsightsPage, OmadaSiteDevicesPage, OmadaSiteClientsPage, OmadaSiteSettingsPage) inside TPPhoneFrame.',
      components: ['OmadaAppDemo', 'OmadaSiteDashboardPage', 'OmadaSiteDevicesPage', 'OmadaDeviceDetailPage', 'OmadaWirelessNetworkBlock', 'OmadaIncidentsBlock'],
    },
    {
      id: 'pag-motion-assets',
      title: 'Tencent PAG (.pag) Vector Motion Integration',
      summary:
        'Render <TPMotion name="port-card-expand" /> or <TPMotion name="update-network" /> backed by libpag WASM (public/libpag.wasm with jsDelivr CDN fallback and SVG fallback).',
      components: ['TPMotion', 'TPIllustration', 'TPIcon', 'TPBrandLogo'],
    },
  ];
}

function copyDirClean(srcDir, destDir) {
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirClean(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  const pkg = readJson(path.join(ROOT_DIR, 'package.json'));
  const tokensPath = path.join(ROOT_DIR, 'src/theme/tokens.ts');
  const iconsManifestPath = path.join(ROOT_DIR, 'src/assets-lib/iconsManifest.ts');
  const assetsManifestPath = path.join(ROOT_DIR, 'src/assets-lib/assetsManifest.ts');
  const motionsManifestPath = path.join(ROOT_DIR, 'src/assets-lib/motionsManifest.ts');

  const components = buildComponentCatalog(pkg.name);
  const brands = readTsConstant(tokensPath, 'TP_BRANDS') ?? [];
  const rawPresets = readTsConstant(tokensPath, 'TP_THEME_PRESETS') ?? {};
  const screenDimensions = readTsConstant(tokensPath, 'TP_SCREEN_DIMENSIONS') ?? {};
  const textStyles = readTsConstant(tokensPath, 'TP_TEXT_STYLES') ?? [];

  const iconsRaw = readTsConstant(iconsManifestPath, 'TP_ICONS') ?? [];
  const illustrationsRaw = readTsConstant(assetsManifestPath, 'TP_ILLUSTRATIONS') ?? [];
  const logosRaw = readTsConstant(assetsManifestPath, 'TP_BRAND_LOGOS') ?? [];
  const motionsRaw = readTsConstant(motionsManifestPath, 'TP_MOTIONS') ?? [];

  const iconCategories = [...new Set(iconsRaw.map((i) => i.category))].sort();
  const iconPacks = [...new Set(iconsRaw.map((i) => i.pack))].sort();
  const illustrations = dedupeIllustrations(illustrationsRaw);
  const motions = dedupeMotions(motionsRaw);
  const logos = logosRaw.map((l) => ({
    name: l.name,
    title: l.title,
    format: l.format,
    width: l.width,
    height: l.height,
  }));
  const templates = buildTemplatesMetadata();

  const libpagVersionRaw = pkg.dependencies?.libpag ?? '4.5.85';
  const libpagVersion = libpagVersionRaw.replace(/^[^\d]*/, '') || '4.5.85';

  const catalog = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    package: {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description ?? '',
      entries: {
        '.': pkg.name,
        './core': `${pkg.name}/core`,
        './assets': `${pkg.name}/assets`,
        './omada': `${pkg.name}/omada`,
        './style.css': `${pkg.name}/style.css`,
        './standalone': `${pkg.name}/standalone`,
        './catalog.json': `${pkg.name}/catalog.json`,
      },
      cdn: {
        jsdelivrCss: `https://cdn.jsdelivr.net/npm/${pkg.name}@latest/dist/style.css`,
        jsdelivrStandalone: `https://cdn.jsdelivr.net/npm/${pkg.name}@latest/dist/standalone.js`,
        jsdelivrWasm: `https://cdn.jsdelivr.net/npm/libpag@${libpagVersion}/lib/libpag.wasm`,
        pinnedCss: `https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/dist/style.css`,
        pinnedStandalone: `https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/dist/standalone.js`,
      },
    },
    counts: {
      components: components.filter((c) => c.kind === 'component').length,
      blocks: components.filter((c) => c.category === 'omada-blocks' && c.kind === 'component').length,
      pages: components.filter((c) => c.category === 'omada-pages' && c.kind === 'component').length,
      hooksAndHelpers: components.filter((c) => c.kind === 'hook' || c.kind === 'helper').length,
      brands: brands.length,
      themePresets: Object.values(rawPresets).reduce((acc, m) => acc + Object.keys(m).length, 0),
      templates: templates.length,
      icons: iconsRaw.length,
      illustrations: illustrations.length,
      logos: logos.length,
      motions: motions.length,
      motionFiles: motionsRaw.length,
    },
    components,
    templates,
    tokens: {
      brands,
      presets: summarizePresets(rawPresets),
      screenDimensions,
      textStyles,
    },
    assets: {
      iconPacks,
      iconCategories,
      icons: iconsRaw.map((entry) => ({
        name: entry.name,
        pack: entry.pack,
        category: entry.category,
        title: entry.title,
        format: entry.format,
        monochrome: entry.monochrome,
        width: entry.width,
        height: entry.height,
      })),
      illustrations,
      logos,
      motions,
    },
    recipes: buildRecipes(pkg.name, pkg.version),
  };

  const jsonPayload = `${JSON.stringify(catalog, null, 2)}\n`;

  const distCatalogPath = path.join(ROOT_DIR, 'dist/catalog.json');
  fs.mkdirSync(path.dirname(distCatalogPath), { recursive: true });
  fs.writeFileSync(distCatalogPath, jsonPayload, 'utf8');

  const skillRefPath = path.join(ROOT_DIR, 'skills/tp-mobile-ui-kit/references/catalog.json');
  fs.mkdirSync(path.dirname(skillRefPath), { recursive: true });
  fs.writeFileSync(skillRefPath, jsonPayload, 'utf8');

  const templatesSrcDir = path.join(ROOT_DIR, 'templates');
  const skillTemplatesDir = path.join(ROOT_DIR, 'skills/tp-mobile-ui-kit/templates');
  if (fs.existsSync(templatesSrcDir)) {
    copyDirClean(templatesSrcDir, skillTemplatesDir);
  }

  // Mirror canonical skill bundle (`skills/tp-mobile-ui-kit`) to `.agents/skills/` and (locally) `~/.gemini/config/skills/`
  const canonicalSkillDir = path.join(ROOT_DIR, 'skills/tp-mobile-ui-kit');
  const syncTargets = [path.join(ROOT_DIR, '.agents/skills/tp-mobile-ui-kit')];
  if (!process.env.CI) {
    syncTargets.push(path.join(os.homedir(), '.gemini/config/skills/tp-mobile-ui-kit'));
  }
  for (const targetDir of syncTargets) {
    copyDirClean(canonicalSkillDir, targetDir);
  }

  console.log(
    `Generated catalog.json: ${catalog.counts.components} components (${catalog.counts.blocks} blocks, ${catalog.counts.pages} pages), ` +
      `${catalog.counts.brands} brands / ${catalog.counts.themePresets} theme presets, ` +
      `${catalog.counts.icons} icons, ${catalog.counts.illustrations} illustrations, ` +
      `${catalog.counts.logos} brand logos, ${catalog.counts.motions} PAG motions (${catalog.counts.motionFiles} files).`,
  );
  console.log(`Synced skill bundle to ${syncTargets.join(', ')}`);
}

main();
