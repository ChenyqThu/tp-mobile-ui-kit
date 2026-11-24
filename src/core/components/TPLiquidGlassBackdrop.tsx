import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import type { TPLiquidGlassProps } from '../types';
import {
  getLiquidGlassDisplacementAsset,
  supportsSvgBackdropFilter,
  type LiquidGlassDisplacementAsset,
} from '../utils/liquidGlassEngine';

export interface TPLiquidGlassBackdropProps {
  hostRef?: React.RefObject<HTMLElement | null>;
  shape?: NonNullable<TPLiquidGlassProps['shape']>;
  tint?: NonNullable<TPLiquidGlassProps['tint']>;
  bezelWidth?: number;
  refraction?: number;
  dispersion?: number;
  blur?: number;
  saturation?: number;
  optical?: boolean;
}

/**
 * Measures a glass backdrop's rendered geometry and prepares its cached SVG displacement asset.
 */
export function useLiquidGlassSurface(
  targetRef: React.RefObject<HTMLElement | null>,
  options: Omit<TPLiquidGlassBackdropProps, 'hostRef'>,
): {
  filterId: string;
  asset: LiquidGlassDisplacementAsset | null;
  size: { width: number; height: number };
  opticalEnabled: boolean;
} {
  const rawId = useId();
  const filterId = `tp-lg-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const shape = options.shape ?? 'pill';
  const bezelWidth = options.bezelWidth ?? 14;
  const opticalRequested = options.optical ?? true;

  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [svgSupported, setSvgSupported] = useState<boolean>(false);

  useLayoutEffect(() => {
    setSvgSupported(supportsSvgBackdropFilter());
    const el = targetRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const nextW = Math.round(rect.width);
      const nextH = Math.round(rect.height);
      if (nextW > 0 && nextH > 0) {
        setSize((prev) =>
          Math.abs(prev.width - nextW) <= 1 && Math.abs(prev.height - nextH) <= 1
            ? prev
            : { width: nextW, height: nextH },
        );
      }
    };

    measure();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [targetRef]);

  const opticalEnabled = opticalRequested && svgSupported;
  let asset: LiquidGlassDisplacementAsset | null = null;
  if (opticalEnabled && size.width > 0 && size.height > 0) {
    const minSide = Math.min(size.width, size.height);
    const radius = shape === 'rounded' ? Math.min(20, minSide / 2) : minSide / 2;
    asset = getLiquidGlassDisplacementAsset({
      width: size.width,
      height: size.height,
      radius,
      bezelWidth,
    });
  }

  return { filterId, asset, size, opticalEnabled };
}

/**
 * Optical backdrop layer rendered inside a Liquid Glass container (`z-index: 0`).
 * Never place `isolation: isolate` or `backdrop-filter` on the parent container so Chromium can
 * sample the live scrolling DOM behind this element.
 */
export const TPLiquidGlassBackdrop: React.FC<TPLiquidGlassBackdropProps> = ({
  shape = 'pill',
  tint = 'clear',
  bezelWidth = 14,
  refraction = 1,
  dispersion = 1,
  blur = 1.5,
  saturation = 1.5,
  optical = true,
}) => {
  const backdropRef = useRef<HTMLSpanElement>(null);
  const { filterId, asset, size, opticalEnabled } = useLiquidGlassSurface(backdropRef, {
    shape,
    bezelWidth,
    optical,
  });

  const activeSvg = Boolean(opticalEnabled && asset && asset.maxScale > 0 && size.width > 0);
  const clampedDispersion = Math.max(0, Math.min(2, dispersion));
  const scaleG = asset ? asset.maxScale * Math.max(0, refraction) : 0;
  const scaleR = scaleG * (1 + 0.14 * clampedDispersion);
  const scaleB = scaleG * (1 - 0.14 * clampedDispersion);

  return (
    <>
      {activeSvg && asset && (
        <svg className="tp-lg-svg-defs" width="0" height="0" aria-hidden="true">
          <defs>
            <filter
              id={filterId}
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation={blur}
                edgeMode="duplicate"
                result="softened"
              />
              <feImage
                href={asset.url}
                x="0"
                y="0"
                width={size.width}
                height={size.height}
                preserveAspectRatio="none"
                result="dispMap"
              />
              {clampedDispersion > 0 ? (
                <>
                  <feDisplacementMap
                    in="softened"
                    in2="dispMap"
                    scale={scaleR}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="dispR"
                  />
                  <feColorMatrix
                    in="dispR"
                    type="matrix"
                    values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                    result="chanR"
                  />
                  <feDisplacementMap
                    in="softened"
                    in2="dispMap"
                    scale={scaleG}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="dispG"
                  />
                  <feColorMatrix
                    in="dispG"
                    type="matrix"
                    values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                    result="chanG"
                  />
                  <feDisplacementMap
                    in="softened"
                    in2="dispMap"
                    scale={scaleB}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="dispB"
                  />
                  <feColorMatrix
                    in="dispB"
                    type="matrix"
                    values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                    result="chanB"
                  />
                  <feBlend in="chanR" in2="chanG" mode="screen" result="rg" />
                  <feBlend in="rg" in2="chanB" mode="screen" result="rgbDispersed" />
                  <feColorMatrix in="rgbDispersed" type="saturate" values={String(saturation)} />
                </>
              ) : (
                <>
                  <feDisplacementMap
                    in="softened"
                    in2="dispMap"
                    scale={scaleG}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="refracted"
                  />
                  <feColorMatrix in="refracted" type="saturate" values={String(saturation)} />
                </>
              )}
            </filter>
          </defs>
        </svg>
      )}
      <span
        ref={backdropRef}
        className={`tp-lg-backdrop tp-lg-backdrop--tint-${tint}`}
        aria-hidden="true"
        data-optical={activeSvg ? 'svg-snell' : 'css-fallback'}
        style={
          activeSvg
            ? {
                backdropFilter: `url(#${filterId})`,
                WebkitBackdropFilter: `url(#${filterId})`,
              }
            : undefined
        }
      />
    </>
  );
};
