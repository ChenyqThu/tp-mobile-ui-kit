import React from 'react';
import { useTPTheme, type TPResolvedMode } from '../theme';
import {
  TP_ILLUSTRATIONS,
  type TPIllustrationMeta,
  type TPIllustrationName,
} from './assetsManifest';
import { resolveRuntimeAssetUrl } from './runtimeUrl';

const ILLUS_URL_MAP = import.meta.glob<string>('../assets/illustrations/**/*.{svg,png}', {
  import: 'default',
  eager: true,
});

interface IllusEntry {
  meta: TPIllustrationMeta;
  url: string;
}

let cachedIllusLookup: Map<string, IllusEntry> | null = null;

function getIllusLookup(): Map<string, IllusEntry> {
  if (cachedIllusLookup) return cachedIllusLookup;
  const map = new Map<string, IllusEntry>();
  for (const meta of TP_ILLUSTRATIONS) {
    const key = `../assets/illustrations/${meta.relPath}`;
    const url = ILLUS_URL_MAP[key];
    if (url) {
      map.set(`${meta.theme}:${meta.name}`, { meta, url });
    }
  }
  cachedIllusLookup = map;
  return map;
}

export function listTPIllustrations(theme?: TPResolvedMode): readonly TPIllustrationMeta[] {
  if (!theme) return TP_ILLUSTRATIONS;
  return TP_ILLUSTRATIONS.filter((item) => item.theme === theme);
}

export interface TPIllustrationProps {
  name: TPIllustrationName;
  theme?: TPResolvedMode;
  width?: number | string;
  height?: number | string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Light/Dark aware mobile illustration component. Auto-follows `useTPTheme().resolvedMode` with fallback to Light.
 */
export const TPIllustration: React.FC<TPIllustrationProps> = ({
  name,
  theme,
  width,
  height,
  alt,
  className = '',
  style,
}) => {
  const ctx = useTPTheme();
  const activeTheme: TPResolvedMode = theme ?? ctx.resolvedMode;
  const lookup = getIllusLookup();
  const entry = lookup.get(`${activeTheme}:${name}`) ?? lookup.get(`light:${name}`) ?? lookup.get(`dark:${name}`);

  if (!entry) return null;

  const w = width ?? entry.meta.width;
  const h = height ?? (width ? 'auto' : entry.meta.height);

  return (
    <img
      src={resolveRuntimeAssetUrl(entry.url)}
      alt={alt ?? entry.meta.title}
      data-tp-illustration={entry.meta.name}
      data-tp-illustration-theme={entry.meta.theme}
      className={`tp-illustration ${className}`.trim()}
      style={{
        display: 'block',
        maxWidth: '100%',
        width: typeof w === 'number' ? `${w}px` : w,
        height: typeof h === 'number' ? `${h}px` : h,
        objectFit: 'contain',
        ...style,
      }}
    />
  );
};
