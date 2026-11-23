import React from 'react';
import { TP_ICONS, type TPIconMeta, type TPIconName, type TPIconPack } from './iconsManifest';
import { resolveRuntimeAssetUrl } from './runtimeUrl';

const OMADA_RAW_SVG = import.meta.glob<string>('../assets/icons/omada/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const OMADA_PNG_URL = import.meta.glob<string>('../assets/icons/omada/*.png', {
  import: 'default',
  eager: true,
});

const GENERAL_RAW_SVG = import.meta.glob<string>('../assets/icons/general/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const GENERAL_PNG_URL = import.meta.glob<string>('../assets/icons/general/*.png', {
  import: 'default',
  eager: true,
});

interface IconEntry {
  meta: TPIconMeta;
  rawSvg?: string;
  imgUrl?: string;
}

let cachedAutoLookup: Map<string, IconEntry> | null = null;
let cachedPackLookup: Map<string, IconEntry> | null = null;

function ensureLookups() {
  if (cachedAutoLookup && cachedPackLookup) {
    return { auto: cachedAutoLookup, byPack: cachedPackLookup };
  }
  const auto = new Map<string, IconEntry>();
  const byPack = new Map<string, IconEntry>();

  for (const meta of TP_ICONS) {
    const key = `../assets/icons/${meta.relPath}`;
    const rawSvg =
      meta.format === 'svg'
        ? (meta.pack === 'omada' ? OMADA_RAW_SVG[key] : GENERAL_RAW_SVG[key])
        : undefined;
    const imgUrl =
      meta.format === 'png'
        ? (meta.pack === 'omada' ? OMADA_PNG_URL[key] : GENERAL_PNG_URL[key])
        : undefined;

    if (!rawSvg && !imgUrl) continue;
    const entry: IconEntry = { meta, rawSvg, imgUrl };
    byPack.set(`${meta.pack}:${meta.name}`, entry);
    // Omada icons take precedence in auto mode
    if (meta.pack === 'omada' || !auto.has(meta.name)) {
      auto.set(meta.name, entry);
    }
  }

  cachedAutoLookup = auto;
  cachedPackLookup = byPack;
  return { auto, byPack };
}

function findIconEntry(name: string, pack: 'auto' | TPIconPack = 'auto'): IconEntry | undefined {
  const { auto, byPack } = ensureLookups();
  if (pack === 'omada' || pack === 'general') {
    return byPack.get(`${pack}:${name}`) ?? auto.get(name);
  }
  return auto.get(name);
}

export function hasTPIcon(name: string, pack: 'auto' | TPIconPack = 'auto'): boolean {
  return Boolean(findIconEntry(name, pack));
}

export function listTPIcons(pack?: TPIconPack): readonly TPIconMeta[] {
  if (!pack) return TP_ICONS;
  return TP_ICONS.filter((item) => item.pack === pack);
}

export interface TPIconProps {
  name: TPIconName;
  pack?: 'auto' | TPIconPack;
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

/**
 * Renders TP-Design & Omada mobile Figma icons. Monochrome SVG icons inherit `currentColor`.
 */
export const TPIcon: React.FC<TPIconProps> = ({
  name,
  pack = 'auto',
  size = 24,
  color,
  className = '',
  style,
  title,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}) => {
  const entry = findIconEntry(name, pack);
  if (!entry) return null;

  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    lineHeight: 1,
    verticalAlign: 'middle',
    width: sizeValue,
    height: sizeValue,
    color,
    ...style,
  };

  if (entry.imgUrl) {
    return (
      <span
        role={ariaLabel ? 'img' : undefined}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden ?? !ariaLabel}
        title={title}
        data-tp-icon={entry.meta.name}
        data-tp-icon-pack={entry.meta.pack}
        data-monochrome="false"
        className={`tp-icon ${className}`.trim()}
        style={baseStyle}
      >
        <img
          src={resolveRuntimeAssetUrl(entry.imgUrl)}
          alt={ariaLabel ?? entry.meta.name}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </span>
    );
  }

  return (
    <span
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden ?? !ariaLabel}
      title={title}
      data-tp-icon={entry.meta.name}
      data-tp-icon-pack={entry.meta.pack}
      data-monochrome={String(entry.meta.monochrome)}
      className={`tp-icon tp-icon--svg ${className}`.trim()}
      style={baseStyle}
      dangerouslySetInnerHTML={{ __html: entry.rawSvg ?? '' }}
    />
  );
};
