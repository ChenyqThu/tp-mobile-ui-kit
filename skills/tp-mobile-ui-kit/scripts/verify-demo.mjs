#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOG_PATH = path.resolve(__dirname, '../references/catalog.json');

function loadCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`Missing catalog.json at ${CATALOG_PATH}. Run "pnpm build:catalog" first.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

/**
 * Finds JSX opening tags `<TagName ...>` handling nested `{...}` expressions and quotes.
 */
function findJsxOpeningTags(source, tagName) {
  const results = [];
  const startRegex = new RegExp(`<${tagName}(?=[\\s/>])`, 'g');
  let match;
  while ((match = startRegex.exec(source)) !== null) {
    let idx = match.index + match[0].length;
    let braceDepth = 0;
    let quote = null;
    while (idx < source.length) {
      const ch = source[idx];
      if (quote) {
        if (ch === '\\') {
          idx += 2;
          continue;
        }
        if (ch === quote) quote = null;
      } else {
        if (ch === '"' || ch === "'" || ch === '`') {
          quote = ch;
        } else if (ch === '{') {
          braceDepth++;
        } else if (ch === '}') {
          if (braceDepth > 0) braceDepth--;
        } else if (ch === '>' && braceDepth === 0) {
          break;
        }
      }
      idx++;
    }
    const attrs = source.slice(match.index + match[0].length, idx);
    results.push({ index: match.index, attrs });
  }
  return results;
}

function extractStringLiteralProp(attrs, propName) {
  const patterns = [
    new RegExp(`\\b${propName}\\s*=\\s*(["'])([^"']+)\\1`),
    new RegExp(`\\b${propName}\\s*=\\s*\\{\\s*(["'])([^"']+)\\1\\s*\\}`),
  ];
  for (const re of patterns) {
    const m = attrs.match(re);
    if (m) return m[2];
  }
  return null;
}

function main() {
  const targetArg = process.argv[2];
  if (!targetArg) {
    console.error('Usage: node verify-demo.mjs <path-to-demo.html|tsx>');
    process.exit(1);
  }

  const targetPath = path.resolve(process.cwd(), targetArg);
  if (!fs.existsSync(targetPath)) {
    console.error(`File not found: ${targetPath}`);
    process.exit(1);
  }

  const catalog = loadCatalog();
  const content = fs.readFileSync(targetPath, 'utf8');
  const isHtml = targetPath.toLowerCase().endsWith('.html');

  const sets = {
    TPIcon: new Set((catalog.assets?.icons ?? []).map((i) => i.name)),
    TPIllustration: new Set((catalog.assets?.illustrations ?? []).map((i) => i.name)),
    TPBrandLogo: new Set((catalog.assets?.logos ?? []).map((l) => l.name)),
    TPMotion: new Set((catalog.assets?.motions ?? []).map((m) => m.name)),
  };
  const validBrands = new Set((catalog.tokens?.brands ?? []).map((b) => b.id));

  const errors = [];
  const warnings = [];
  let checkedAssetSlugs = 0;

  // 1. Validate static asset slug literals against catalog.json
  for (const [tag, validSet] of Object.entries(sets)) {
    for (const opening of findJsxOpeningTags(content, tag)) {
      const slug = extractStringLiteralProp(opening.attrs, 'name');
      if (!slug) continue;
      checkedAssetSlugs++;
      if (!validSet.has(slug)) {
        const line = lineNumberAt(content, opening.index);
        errors.push(
          `Line ${line}: Unknown <${tag} name="${slug}">. Query valid slugs with query-catalog.mjs.`,
        );
      }
    }
  }

  // Also check TPEmptyState illustration="..." slug literals
  for (const opening of findJsxOpeningTags(content, 'TPEmptyState')) {
    const slug = extractStringLiteralProp(opening.attrs, 'illustration');
    if (!slug) continue;
    checkedAssetSlugs++;
    if (!sets.TPIllustration.has(slug)) {
      const line = lineNumberAt(content, opening.index);
      errors.push(
        `Line ${line}: Unknown <TPEmptyState illustration="${slug}">. Query valid illustrations with query-catalog.mjs search-assets illustrations.`,
      );
    }
  }

  // 2. Ensure <TPThemeProvider is present in standalone HTML demos
  if (isHtml && !content.includes('<TPThemeProvider')) {
    errors.push(
      'Missing <TPThemeProvider>: Single-file HTML demos must wrap the root UI with <TPThemeProvider>.',
    );
  }

  // Validate TPThemeProvider brand/defaultBrand string literals
  for (const opening of findJsxOpeningTags(content, 'TPThemeProvider')) {
    for (const attr of ['brand', 'defaultBrand']) {
      const val = extractStringLiteralProp(opening.attrs, attr);
      if (val && !validBrands.has(val)) {
        const line = lineNumberAt(content, opening.index);
        errors.push(
          `Line ${line}: Invalid <TPThemeProvider ${attr}="${val}">. Valid brands: ${[...validBrands].join(', ')}.`,
        );
      }
    }
    if (/\b(themeMode|defaultThemeMode)\s*=/.test(opening.attrs)) {
      const line = lineNumberAt(content, opening.index);
      errors.push(
        `Line ${line}: <TPThemeProvider> uses \`mode=\` / \`defaultMode=\` (not \`themeMode=\` / \`defaultThemeMode=\`).`,
      );
    }
  }

  // 3. Catch <TPButton type=...> mistakes (should be variant= or htmlType=)
  for (const opening of findJsxOpeningTags(content, 'TPButton')) {
    if (/\btype\s*=/.test(opening.attrs)) {
      const line = lineNumberAt(content, opening.index);
      errors.push(
        `Line ${line}: <TPButton> omits \`type=\`; use \`variant="primary" | "secondary" | "text" | "alert" | "tonal" | "in-card"\` or \`htmlType="button" | "submit" | "reset"\`.`,
      );
    }
  }

  // 4. Warn if useTPToast is used without TPToastProvider in standalone HTML
  if (isHtml && content.includes('useTPToast') && !content.includes('<TPToastProvider')) {
    warnings.push(
      'useTPToast() is referenced without <TPToastProvider>; wrap root UI inside <TPToastProvider> so toasts render.',
    );
  }

  // 5. Warn if standalone HTML uses <script type="module"> with standalone.js (breaks file:// CORS)
  if (isHtml && /<script[^>]*type\s*=\s*["']module["'][^>]*>/i.test(content)) {
    warnings.push(
      'Single-file HTML demos should use classic <script> + <script type="text/babel"> (not type="module") so file:// opens without CORS errors.',
    );
  }

  for (const w of warnings) {
    console.warn(`WARN [${targetArg}]: ${w}`);
  }

  if (errors.length > 0) {
    for (const err of errors) {
      console.error(`ERROR [${targetArg}] ${err}`);
    }
    process.exit(1);
  }

  console.log(`PASS [${targetArg}]: verified ${checkedAssetSlugs} static asset slug(s), 0 TP-Mobile violations.`);
}

main();
