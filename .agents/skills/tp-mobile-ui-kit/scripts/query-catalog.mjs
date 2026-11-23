#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOG_PATH = path.resolve(__dirname, '../references/catalog.json');
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');

function loadCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`Missing catalog.json at ${CATALOG_PATH}. Run "pnpm build:catalog" in the repo root.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
}

function usage() {
  console.log(`TP Mobile UI Kit Catalog Query CLI

Usage:
  node query-catalog.mjs info
  node query-catalog.mjs list-components [category]
  node query-catalog.mjs component <Name>
  node query-catalog.mjs brands [brand]
  node query-catalog.mjs search-icons <keyword> [limit=25]
  node query-catalog.mjs search-assets <illustrations|logos|motions> [keyword] [limit=25]
  node query-catalog.mjs templates
  node query-catalog.mjs template <id> [--html|--tsx]
  node query-catalog.mjs recipes [keyword]`);
}

function cmdInfo(catalog) {
  console.log(`Package:        ${catalog.package.name}@${catalog.package.version}`);
  console.log(`CDN CSS:        ${catalog.package.cdn.jsdelivrCss}`);
  console.log(`CDN Standalone: ${catalog.package.cdn.jsdelivrStandalone}`);
  console.log(`CDN PAG WASM:   ${catalog.package.cdn.jsdelivrWasm}`);
  console.log('Subpaths:', JSON.stringify(catalog.package.entries));
  console.log('Counts:', JSON.stringify(catalog.counts));
}

function cmdListComponents(catalog, category) {
  const items = catalog.components.filter((c) => {
    if (!category) return c.kind !== 'data';
    return c.category.toLowerCase() === category.toLowerCase();
  });
  if (items.length === 0) {
    const categories = [...new Set(catalog.components.map((c) => c.category))];
    console.log(`No items matched category "${category}". Available: ${categories.join(', ')}`);
    return;
  }
  const grouped = new Map();
  for (const item of items) {
    if (!grouped.has(item.category)) grouped.set(item.category, []);
    grouped.get(item.category).push(item);
  }
  for (const [cat, list] of grouped) {
    console.log(`\n## ${cat} (${list.length})`);
    for (const c of list) {
      const propCount = c.props ? ` (${c.props.length} props)` : '';
      const desc = c.description ? ` — ${c.description}` : '';
      console.log(`- ${c.name} [${c.kind}]${propCount}${desc}`);
    }
  }
}

function cmdComponent(catalog, query) {
  if (!query) {
    console.error('Provide a component name, e.g. node query-catalog.mjs component TPButton');
    process.exit(1);
  }
  const lower = query.toLowerCase();
  const exact = catalog.components.find((c) => c.name.toLowerCase() === lower);
  const matches = exact
    ? [exact]
    : catalog.components.filter((c) => c.name.toLowerCase().includes(lower)).slice(0, 8);

  if (matches.length === 0) {
    console.log(`No exported symbol matches "${query}".`);
    return;
  }
  for (const item of matches) {
    console.log(`\n### ${item.name} (${item.category} / ${item.kind})`);
    if (item.description) console.log(item.description);
    console.log(`Import: import { ${item.name} } from '${item.subpath || catalog.package.name}';`);
    if (item.subpath && item.subpath !== catalog.package.name) {
      console.log(`Root:   import { ${item.name} } from '${catalog.package.name}';`);
    }
    if (item.sourcePath) console.log(`Source: ${item.sourcePath}`);
    if (item.extends) console.log(`Extends: ${item.extends}`);
    if (item.signature) console.log(`Signature: ${item.signature}`);
    if (item.props && item.props.length > 0) {
      console.log('\nProps:');
      for (const p of item.props) {
        const req = p.optional ? '?' : '';
        const desc = p.description ? `  // ${p.description}` : '';
        console.log(`  ${p.name}${req}: ${p.type}${desc}`);
      }
    } else if (item.kind === 'component') {
      console.log('(No dedicated *Props interface extracted.)');
    }
  }
}

function cmdBrands(catalog, brandQuery) {
  const brands = catalog.tokens?.brands ?? [];
  const presets = catalog.tokens?.presets ?? {};
  const screenDimensions = catalog.tokens?.screenDimensions ?? {};

  if (!brandQuery) {
    console.log(`Supported TP-Design Brands (${brands.length} brands × 2 modes = ${brands.length * 2} presets):\n`);
    for (const b of brands) {
      const light = presets[b.id]?.light;
      const dark = presets[b.id]?.dark;
      console.log(`## ${b.id} (${b.label}) — accent ${b.accent}`);
      console.log(`  ${b.description}`);
      if (light && dark) {
        console.log(
          `  Light: bg=${light.background}, card=${light.card}, text=${light.textPrimary}, btnRadius=${light.radiusButton}px, cardRadius=${light.radiusCard}px, secStroke=${light.buttonSecondaryStroke}px, fontSize=${light.fontSizeMain}px, sliderStroke=${light.sliderStroke}px, tick=${light.sliderTickSize}px`,
        );
        console.log(
          `  Dark:  bg=${dark.background}, card=${dark.card}, text=${dark.textPrimary}, primaryFill=${dark.buttonPrimaryFill}, secFill=${dark.buttonSecondaryFill}`,
        );
      }
    }
    if (Object.keys(screenDimensions).length > 0) {
      console.log('\nScreen Dimensions:', JSON.stringify(screenDimensions));
    }
    return;
  }

  const lower = brandQuery.toLowerCase();
  const brandMeta = brands.find((b) => b.id.toLowerCase() === lower || b.label.toLowerCase() === lower);
  if (!brandMeta) {
    console.error(`Unknown brand "${brandQuery}". Valid brands: ${brands.map((b) => b.id).join(', ')}`);
    process.exit(1);
  }
  console.log(`=== ${brandMeta.label} (${brandMeta.id}) ===`);
  console.log(brandMeta.description);
  console.log('\nLight Preset:');
  console.log(JSON.stringify(presets[brandMeta.id]?.light ?? {}, null, 2));
  console.log('\nDark Preset:');
  console.log(JSON.stringify(presets[brandMeta.id]?.dark ?? {}, null, 2));
}

function cmdSearchIcons(catalog, keyword = '', limitArg = '25') {
  const limit = Math.max(1, Number.parseInt(limitArg, 10) || 25);
  const lower = keyword.toLowerCase();
  const matches = (catalog.assets?.icons ?? []).filter(
    (icon) =>
      !lower ||
      icon.name.toLowerCase().includes(lower) ||
      icon.category.toLowerCase().includes(lower) ||
      icon.pack.toLowerCase().includes(lower) ||
      (icon.title && icon.title.toLowerCase().includes(lower)),
  );
  console.log(
    `Matched ${matches.length} icons${lower ? ` for "${keyword}"` : ''} (showing ${Math.min(limit, matches.length)}):`,
  );
  for (const icon of matches.slice(0, limit)) {
    console.log(`- ${icon.name} [${icon.pack}/${icon.category}, ${icon.width}x${icon.height}, ${icon.format}]`);
  }
  if (matches.length === 0) {
    console.log(`Packs: ${(catalog.assets?.iconPacks ?? []).join(', ')}`);
    console.log(`Categories: ${(catalog.assets?.iconCategories ?? []).join(', ')}`);
  }
}

function cmdSearchAssets(catalog, group, keyword = '', limitArg = '25') {
  const validGroups = ['illustrations', 'logos', 'motions'];
  if (!validGroups.includes(group)) {
    console.error(`Asset group must be one of: ${validGroups.join(', ')}`);
    process.exit(1);
  }
  const limit = Math.max(1, Number.parseInt(limitArg, 10) || 25);
  const lower = keyword.toLowerCase();
  const list = catalog.assets?.[group] ?? [];
  const matches = list.filter(
    (entry) =>
      !lower ||
      entry.name.toLowerCase().includes(lower) ||
      (entry.category && entry.category.toLowerCase().includes(lower)) ||
      (entry.title && entry.title.toLowerCase().includes(lower)),
  );
  console.log(
    `Matched ${matches.length} ${group}${lower ? ` for "${keyword}"` : ''} (showing ${Math.min(limit, matches.length)}):`,
  );
  for (const item of matches.slice(0, limit)) {
    if (group === 'motions') {
      console.log(
        `- ${item.name} [${item.category}, themes: ${item.themes.join('/')}, ${item.format}, ${item.bytes}B]`,
      );
    } else if (group === 'logos') {
      console.log(`- ${item.name} (${item.title}) [${item.width}x${item.height}, ${item.format}]`);
    } else {
      console.log(
        `- ${item.name} [themes: ${item.themes.join('/')}, ${item.width}x${item.height}, ${item.format}]`,
      );
    }
  }
}

function cmdTemplates(catalog) {
  const templates = catalog.templates ?? [];
  console.log(`Available Templates (${templates.length}):`);
  for (const tpl of templates) {
    console.log(`\n## ${tpl.id} — ${tpl.title}`);
    console.log(tpl.summary);
    if (tpl.brands?.length) console.log(`Brands: ${tpl.brands.join(', ')}`);
    if (tpl.pages?.length) console.log(`Pages: ${tpl.pages.join(', ')}`);
    if (tpl.blocks?.length) console.log(`Blocks: ${tpl.blocks.join(', ')}`);
    if (tpl.motions?.length) console.log(`PAG Motions: ${tpl.motions.join(', ')}`);
    console.log(`Components: ${tpl.components.join(', ')}`);
    console.log(`Pull source: node query-catalog.mjs template ${tpl.id} --html | --tsx`);
  }
}

function cmdTemplate(catalog, id, formatFlag = '--html') {
  const templates = catalog.templates ?? [];
  const tpl = templates.find((t) => t.id === id);
  if (!tpl) {
    console.error(`Unknown template "${id}". Available: ${templates.map((t) => t.id).join(', ')}`);
    process.exit(1);
  }
  const ext = formatFlag === '--tsx' ? 'tsx' : 'html';
  const filePath = path.join(TEMPLATES_DIR, `${tpl.id}.${ext}`);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing template file: ${filePath}. Run "pnpm build:catalog" first.`);
    process.exit(1);
  }
  process.stdout.write(fs.readFileSync(filePath, 'utf8'));
}

function cmdRecipes(catalog, keyword = '') {
  const lower = keyword.toLowerCase();
  const matches = (catalog.recipes ?? []).filter(
    (r) =>
      !lower ||
      r.id.toLowerCase().includes(lower) ||
      r.title.toLowerCase().includes(lower) ||
      r.summary.toLowerCase().includes(lower),
  );
  for (const r of matches) {
    console.log(`\n## ${r.title} (${r.id})`);
    console.log(r.summary);
    console.log(`Components: ${r.components.join(', ')}`);
    if (r.cdnUrls) {
      console.log(`CDN CSS: ${r.cdnUrls.css}`);
      console.log(`CDN JS:  ${r.cdnUrls.js}`);
    }
  }
}

const [, , subcmd, ...rest] = process.argv;
const catalog = loadCatalog();

switch (subcmd) {
  case 'info':
    cmdInfo(catalog);
    break;
  case 'list-components':
    cmdListComponents(catalog, rest[0]);
    break;
  case 'component':
    cmdComponent(catalog, rest[0]);
    break;
  case 'brands':
    cmdBrands(catalog, rest[0]);
    break;
  case 'search-icons':
    cmdSearchIcons(catalog, rest[0], rest[1]);
    break;
  case 'search-assets':
    cmdSearchAssets(catalog, rest[0], rest[1], rest[2]);
    break;
  case 'templates':
    cmdTemplates(catalog);
    break;
  case 'template':
    cmdTemplate(catalog, rest[0], rest[1]);
    break;
  case 'recipes':
    cmdRecipes(catalog, rest[0]);
    break;
  default:
    usage();
    if (subcmd) process.exit(1);
}
