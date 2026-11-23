import React from 'react';
import { TP_BRAND_LOGOS, type TPBrandLogoMeta, type TPBrandLogoName } from './assetsManifest';
import { resolveRuntimeAssetUrl } from './runtimeUrl';

const LOGO_URL_MAP = import.meta.glob<string>('../assets/logos/*.{svg,png}', {
  import: 'default',
  eager: true,
});

let cachedLogos: Map<string, { meta: TPBrandLogoMeta; url: string }> | null = null;

function getLogoLookup() {
  if (cachedLogos) return cachedLogos;
  const map = new Map<string, { meta: TPBrandLogoMeta; url: string }>();
  for (const meta of TP_BRAND_LOGOS) {
    const url = LOGO_URL_MAP[`../assets/logos/${meta.relPath}`];
    if (url) {
      map.set(meta.name, { meta, url });
    }
  }
  cachedLogos = map;
  return map;
}

export function listTPBrandLogos(): readonly TPBrandLogoMeta[] {
  return TP_BRAND_LOGOS;
}

export interface TPBrandLogoProps {
  name: TPBrandLogoName;
  size?: number | string;
  rounded?: boolean | number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Official TP-Link app & product brand mark (Omada, Tapo, Tether, Deco, Mercusys, VIGI, Aginet, etc.).
 */
export const TPBrandLogo: React.FC<TPBrandLogoProps> = ({
  name,
  size = 40,
  rounded = true,
  alt,
  className = '',
  style,
}) => {
  const entry = getLogoLookup().get(name);
  if (!entry) return null;

  const sizePx = typeof size === 'number' ? `${size}px` : size;
  const radius =
    typeof rounded === 'number' ? `${rounded}px` : rounded ? '22%' : '0px';

  return (
    <img
      src={resolveRuntimeAssetUrl(entry.url)}
      alt={alt ?? entry.meta.title}
      data-tp-brand-logo={entry.meta.name}
      className={`tp-brand-logo ${className}`.trim()}
      style={{
        display: 'inline-block',
        width: sizePx,
        height: sizePx,
        borderRadius: radius,
        objectFit: 'contain',
        flexShrink: 0,
        ...style,
      }}
    />
  );
};
