import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PAGInit, type types as PAGTypes } from 'libpag';
import { useTPTheme, type TPResolvedMode } from '../theme';
import { TP_MOTIONS, type TPMotionMeta, type TPMotionName } from './motionsManifest';
import { resolveRuntimeAssetUrl } from './runtimeUrl';

const PAG_ASSET_URLS = import.meta.glob<string>('../assets/motion/**/*.pag', {
  import: 'default',
  eager: true,
});

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

  const assetUrl = meta ? PAG_ASSET_URLS[`../assets/motion/${meta.relPath}`] : undefined;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !assetUrl) return;
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
          await pagView.flush();
        }
        if (playing) {
          void pagView.play();
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
      try {
        viewRef.current?.stop(false);
        viewRef.current?.destroy();
      } catch {
        // Ignore teardown errors
      }
      try {
        fileRef.current?.destroy();
      } catch {
        // Ignore teardown errors
      }
      viewRef.current = null;
      fileRef.current = null;
    };
  }, [assetUrl, useCanvas2D, wasmUrl]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    try {
      view.setRepeatCount(loop ? 0 : 1);
      if (typeof progress === 'number') {
        view.setProgress(Math.max(0, Math.min(1, progress)));
        void view.flush();
      }
      if (playing) {
        void view.play();
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

  if (!meta || !assetUrl) {
    return null;
  }

  return (
    <div
      data-tp-motion={meta.name}
      data-tp-motion-theme={meta.theme}
      data-tp-motion-fallback={fallback ? 'true' : 'false'}
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
      {fallback ? (
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
