import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PAGInit, type types as PAGTypes } from 'libpag';
import { useTPTheme, type TPResolvedMode } from '../theme';
import { TP_MOTIONS, type TPMotionMeta, type TPMotionName } from './motionsManifest';
import { resolveRuntimeAssetUrl } from './runtimeUrl';

const PAG_ASSET_URLS = import.meta.glob<string>('../assets/motion/**/*.pag', {
  import: 'default',
  eager: true,
});

const ProceduralSvgMotion: React.FC<{
  name: string;
  title: string;
  playing: boolean;
}> = ({ name, title, playing }) => {
  switch (name) {
    case 'device-pairing':
      return (
        <svg width="100%" height="100%" viewBox="0 0 80 80" fill="none" aria-label={title}>
          <circle cx="40" cy="40" r="14" stroke="var(--tp-focus, #00A870)" strokeWidth="2.5">
            {playing && (
              <>
                <animate attributeName="r" values="14;34" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
              </>
            )}
          </circle>
          <circle cx="40" cy="40" r="14" stroke="var(--tp-focus, #00A870)" strokeWidth="2" strokeOpacity="0.45">
            {playing && (
              <>
                <animate attributeName="r" values="14;34" begin="0.9s" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.65;0" begin="0.9s" dur="1.8s" repeatCount="indefinite" />
              </>
            )}
          </circle>
          <rect x="30" y="30" width="20" height="20" rx="5" fill="var(--tp-focus, #00A870)" />
          <circle cx="40" cy="40" r="3" fill="#FFFFFF" />
        </svg>
      );
    case 'ap-scan':
      return (
        <svg width="100%" height="100%" viewBox="0 0 80 80" fill="none" aria-label={title}>
          <circle cx="40" cy="40" r="28" stroke="var(--tp-divider, #ECECEC)" strokeWidth="2" />
          <circle cx="40" cy="40" r="18" stroke="var(--tp-divider, #ECECEC)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path
            d="M40 40 L40 12 A28 28 0 0 1 65 27 Z"
            fill="var(--tp-focus, #00A870)"
            fillOpacity="0.28"
          >
            {playing && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 40 40"
                to="360 40 40"
                dur="2.2s"
                repeatCount="indefinite"
              />
            )}
          </path>
          <circle cx="40" cy="40" r="4" fill="var(--tp-focus, #00A870)" />
        </svg>
      );
    case 'accessibility-zoom':
      return (
        <svg width="100%" height="100%" viewBox="0 0 80 80" fill="none" aria-label={title}>
          <rect x="14" y="18" width="52" height="44" rx="10" stroke="var(--tp-focus, #00A870)" strokeWidth="2" strokeOpacity="0.4" />
          <text
            x="40"
            y="47"
            textAnchor="middle"
            fill="var(--tp-focus, #00A870)"
            fontWeight="700"
            fontSize="22"
          >
            Aa
            {playing && (
              <animate attributeName="font-size" values="18;25;18" dur="2.2s" repeatCount="indefinite" />
            )}
          </text>
        </svg>
      );
    case 'search-rotate':
    default:
      return (
        <svg width="100%" height="100%" viewBox="0 0 80 80" fill="none" aria-label={title}>
          <circle
            cx="40"
            cy="40"
            r="26"
            stroke="var(--tp-focus, #00A870)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="64 96"
          >
            {playing && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 40 40"
                to="360 40 40"
                dur="1.4s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="37" cy="37" r="9" stroke="var(--tp-text-primary, #2B2B2B)" strokeWidth="2.2" />
          <path d="M44 44 L51 51" stroke="var(--tp-text-primary, #2B2B2B)" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
  }
};

const CDN_WASM_URL = 'https://cdn.jsdelivr.net/npm/libpag@4.5.85/lib/libpag.wasm';

let pagPromise: Promise<PAGTypes.PAG> | null = null;
const pagBufferCache = new Map<string, Promise<ArrayBuffer>>();

function hasWebGLSupport(): boolean {
  if (typeof document === 'undefined' || typeof WebGLRenderingContext === 'undefined') {
    return false;
  }
  try {
    const probe = document.createElement('canvas');
    return Boolean(
      probe.getContext('webgl2') ||
        probe.getContext('webgl') ||
        probe.getContext('experimental-webgl'),
    );
  } catch {
    return false;
  }
}

function getDefaultLocalWasmUrl(): string {
  const g = globalThis as { __TP_MOBILE_WASM_URL__?: string };
  if (g.__TP_MOBILE_WASM_URL__) return g.__TP_MOBILE_WASM_URL__;
  if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
    return CDN_WASM_URL;
  }
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    try {
      return new URL('libpag.wasm', document.baseURI || window.location.href).href;
    } catch {
      return './libpag.wasm';
    }
  }
  return './libpag.wasm';
}

async function initPAGModule(wasmUrl?: string): Promise<PAGTypes.PAG> {
  if (!hasWebGLSupport()) {
    throw new Error('WebGL is not available in the current environment.');
  }
  const primary = wasmUrl ?? getDefaultLocalWasmUrl();
  try {
    return await PAGInit({ locateFile: () => primary });
  } catch (err) {
    if (primary !== CDN_WASM_URL) {
      return PAGInit({ locateFile: () => CDN_WASM_URL });
    }
    throw err;
  }
}

function getPAG(wasmUrl?: string): Promise<PAGTypes.PAG> {
  if (wasmUrl) {
    return initPAGModule(wasmUrl);
  }
  if (!pagPromise) {
    pagPromise = initPAGModule().catch((err) => {
      pagPromise = null;
      throw err;
    });
  }
  return pagPromise;
}

function decodeBase64DataUrl(dataUrl: string): ArrayBuffer {
  const commaIdx = dataUrl.indexOf(',');
  const b64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes.buffer;
}

function loadPagBuffer(rawUrl: string): Promise<ArrayBuffer> {
  const resolved = resolveRuntimeAssetUrl(rawUrl);
  const cached = pagBufferCache.get(resolved);
  if (cached) return cached;

  const task = (async () => {
    if (resolved.startsWith('data:')) {
      return decodeBase64DataUrl(resolved);
    }
    const res = await fetch(resolved);
    if (!res.ok) {
      throw new Error(`Failed to load PAG motion (${res.status}): ${resolved}`);
    }
    return res.arrayBuffer();
  })().catch((err) => {
    pagBufferCache.delete(resolved);
    throw err;
  });

  pagBufferCache.set(resolved, task);
  return task;
}

export function listTPMotions(theme?: TPResolvedMode): readonly TPMotionMeta[] {
  if (!theme) return TP_MOTIONS;
  return TP_MOTIONS.filter((m) => m.theme === theme);
}

export interface TPMotionProps {
  name: TPMotionName;
  theme?: TPResolvedMode;
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  playing?: boolean;
  progress?: number;
  /** Shares libpag global WebGL context across instances (prevents browser WebGL context exhaustion). */
  useCanvas2D?: boolean;
  wasmUrl?: string;
  className?: string;
  style?: React.CSSProperties;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Plays authentic TP-Link Tencent `.pag` animation files via `libpag` WASM,
 * automatically matching Light/Dark theme and degrading gracefully without WebGL (e.g. jsdom).
 */
export const TPMotion: React.FC<TPMotionProps> = ({
  name,
  theme,
  width = 120,
  height = 120,
  loop = true,
  playing = true,
  progress,
  useCanvas2D = true,
  wasmUrl,
  className = '',
  style,
  onReady,
  onError,
}) => {
  const ctx = useTPTheme();
  const activeTheme: TPResolvedMode = theme ?? ctx.resolvedMode;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef<InstanceType<PAGTypes.PAG['PAGView']> | null>(null);
  const fileRef = useRef<InstanceType<PAGTypes.PAG['PAGFile']> | null>(null);
  const [fallback, setFallback] = useState<boolean>(!hasWebGLSupport());

  const meta = useMemo(() => {
    return (
      TP_MOTIONS.find((m) => m.name === name && m.theme === activeTheme) ??
      TP_MOTIONS.find((m) => m.name === name && m.theme === 'light') ??
      TP_MOTIONS.find((m) => m.name === name)
    );
  }, [name, activeTheme]);

  const isSvgMotion = meta?.format === 'svg';
  const assetUrl =
    meta && !isSvgMotion ? PAG_ASSET_URLS[`../assets/motion/${meta.relPath}`] : undefined;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (isSvgMotion || !canvas || !assetUrl) return;
    if (!hasWebGLSupport()) {
      setFallback(true);
      return;
    }

    let cancelled = false;
    setFallback(false);

    (async () => {
      try {
        const [PAG, buffer] = await Promise.all([getPAG(wasmUrl), loadPagBuffer(assetUrl)]);
        if (cancelled) return;

        const pagFile = await PAG.PAGFile.load(buffer);
        if (cancelled) {
          pagFile.destroy();
          return;
        }

        const pagView = await PAG.PAGView.init(pagFile, canvas, {
          useCanvas2D,
          firstFrame: true,
        });
        if (!pagView || cancelled) {
          pagView?.destroy();
          pagFile.destroy();
          return;
        }

        fileRef.current = pagFile;
        viewRef.current = pagView;
        pagView.setRepeatCount(loop ? 0 : 1);
        if (typeof progress === 'number') {
          pagView.setProgress(Math.max(0, Math.min(1, progress)));
          await pagView.flush().catch(() => {});
          if (cancelled) {
            try {
              pagView.destroy();
            } catch {
              // Ignore teardown errors
            }
            try {
              pagFile.destroy();
            } catch {
              // Ignore teardown errors
            }
            viewRef.current = null;
            fileRef.current = null;
            return;
          }
        }
        if (playing) {
          void pagView.play().catch(() => {});
        }
        onReady?.();
      } catch (err) {
        if (!cancelled) {
          setFallback(true);
          onError?.(err instanceof Error ? err : new Error(String(err)));
        }
      }
    })();

    return () => {
      cancelled = true;
      const view = viewRef.current;
      const file = fileRef.current;
      viewRef.current = null;
      fileRef.current = null;

      if (view) {
        try {
          view.pause();
        } catch {
          // Ignore pause errors
        }
      }

      const destroyResources = () => {
        try {
          view?.destroy();
        } catch {
          // Ignore teardown errors
        }
        try {
          file?.destroy();
        } catch {
          // Ignore teardown errors
        }
      };

      const isFlushing = Boolean((view as { flushingNextFrame?: boolean } | null)?.flushingNextFrame);
      if (isFlushing && typeof window !== 'undefined') {
        window.setTimeout(destroyResources, 60);
      } else {
        destroyResources();
      }
    };
  }, [assetUrl, useCanvas2D, wasmUrl]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || (view as { isDestroyed?: boolean }).isDestroyed) return;
    try {
      view.setRepeatCount(loop ? 0 : 1);
      if (typeof progress === 'number') {
        view.setProgress(Math.max(0, Math.min(1, progress)));
        void view.flush().catch(() => {});
      }
      if (playing) {
        void view.play().catch(() => {});
      } else {
        view.pause();
      }
    } catch {
      // Ignore transient view update errors
    }
  }, [loop, playing, progress]);

  const wCss = typeof width === 'number' ? `${width}px` : width;
  const hCss = typeof height === 'number' ? `${height}px` : height;
  const pixelW = typeof width === 'number' ? width : 160;
  const pixelH = typeof height === 'number' ? height : 160;

  if (!meta || (!isSvgMotion && !assetUrl)) {
    return null;
  }

  return (
    <div
      data-tp-motion={meta.name}
      data-tp-motion-theme={meta.theme}
      data-tp-motion-format={meta.format}
      data-tp-motion-fallback={isSvgMotion ? 'false' : fallback ? 'true' : 'false'}
      className={`tp-motion ${className}`.trim()}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: wCss,
        height: hCss,
        ...style,
      }}
    >
      {isSvgMotion ? (
        <ProceduralSvgMotion name={meta.name} title={meta.title} playing={playing} />
      ) : fallback ? (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 64 64"
          fill="none"
          aria-label={meta.title}
        >
          <circle
            cx="32"
            cy="32"
            r="22"
            stroke="var(--tp-focus, #00A870)"
            strokeWidth="3"
            strokeOpacity="0.22"
          />
          <circle
            cx="32"
            cy="32"
            r="22"
            stroke="var(--tp-focus, #00A870)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="44 96"
          >
            {playing && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 32 32"
                to="360 32 32"
                dur="1.2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="32" cy="32" r="6" fill="var(--tp-focus, #00A870)" fillOpacity="0.85" />
        </svg>
      ) : (
        <canvas
          ref={canvasRef}
          width={pixelW * 2}
          height={pixelH * 2}
          aria-label={meta.title}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />
      )}
    </div>
  );
};
