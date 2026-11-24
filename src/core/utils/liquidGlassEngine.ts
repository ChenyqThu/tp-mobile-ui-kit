export interface LiquidGlassFieldOptions {
  width: number;
  height: number;
  radius: number;
  bezelWidth: number;
  glassThickness?: number;
  refractiveIndex?: number;
}

export interface LiquidGlassFieldResult {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  maxScale: number;
}

export interface LiquidGlassDisplacementAsset {
  url: string;
  width: number;
  height: number;
  maxScale: number;
}

const DISPLACEMENT_ASSET_CACHE = new Map<string, LiquidGlassDisplacementAsset>();
const MAX_CACHE_ENTRIES = 64;

/**
 * Returns true only in Chromium desktop/Android browsers where SVG `backdrop-filter: url(#...)`
 * samples live DOM pixels behind the element. Safari/WebKit and Firefox drop the entire
 * `backdrop-filter` rule when `url(...)` appears, so they receive CSS fallback styling instead.
 */
export function supportsSvgBackdropFilter(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent || '';
  return /(Chrome|Chromium|Edg|OPR)\//.test(ua) && !/(Firefox|CriOS|EdgiOS|FxiOS)/.test(ua);
}

/**
 * Computes a rounded-rectangle SDF displacement field using a convex squircle profile and
 * Snell's law refraction (`n1 = 1.0 -> n2 = 1.5`), keeping interior center pixels neutral
 * (`R = 128, G = 128`) and refracting along the curved bezel rim.
 */
export function computeLiquidGlassDisplacementField(
  options: LiquidGlassFieldOptions,
): LiquidGlassFieldResult {
  const w = Math.max(2, Math.round(options.width));
  const h = Math.max(2, Math.round(options.height));
  const r = Math.max(1, Math.min(options.radius, w / 2, h / 2));
  const bezel = Math.max(2, Math.min(options.bezelWidth, Math.min(w, h) * 0.44));
  const thickness = options.glassThickness ?? Math.max(8, bezel * 0.9);
  const n2 = options.refractiveIndex ?? 1.5;

  const pixelCount = w * h;
  const dxArr = new Float32Array(pixelCount);
  const dyArr = new Float32Array(pixelCount);

  const halfOuterW = w / 2;
  const halfOuterH = h / 2;
  const halfInnerW = halfOuterW - r;
  const halfInnerH = halfOuterH - r;

  let maxMag = 0;

  for (let y = 0; y < h; y += 1) {
    const py = y + 0.5 - halfOuterH;
    const absY = Math.abs(py);
    const qy = absY - halfInnerH;

    for (let x = 0; x < w; x += 1) {
      const px = x + 0.5 - halfOuterW;
      const absX = Math.abs(px);
      const qx = absX - halfInnerW;

      const d =
        Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
      const distFromEdge = -d;

      if (distFromEdge <= 0 || distFromEdge >= bezel) {
        continue;
      }

      let nx = 0;
      let ny = 0;
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy) || 1;
        nx = (px >= 0 ? 1 : -1) * (qx / len);
        ny = (py >= 0 ? 1 : -1) * (qy / len);
      } else if (qx >= qy) {
        nx = px >= 0 ? 1 : -1;
      } else {
        ny = py >= 0 ? 1 : -1;
      }

      const t = Math.max(0.02, Math.min(1, distFromEdge / bezel));
      const u = 1 - t;
      const u4 = u * u * u * u;
      const oneMinusU4 = Math.max(1e-4, 1 - u4);

      // Convex squircle surface profile h(t) = (1 - (1 - t)^4)^(1/4)
      const heightRatio = Math.pow(oneMinusU4, 0.25);
      // Surface slope dh/d(dist) up to a bounded steep bezel tangent
      const slope = Math.pow(u, 3) / Math.pow(oneMinusU4, 0.75);

      const theta1 = Math.atan(slope);
      const sinTheta2 = Math.min(0.999, Math.sin(theta1) / n2);
      const theta2 = Math.asin(sinTheta2);
      const mag = (thickness + bezel * heightRatio) * Math.tan(theta1 - theta2);

      if (mag > maxMag) {
        maxMag = mag;
      }

      const idx = y * w + x;
      // Inward radial lens refraction vector
      dxArr[idx] = -nx * mag;
      dyArr[idx] = -ny * mag;
    }
  }

  const data = new Uint8ClampedArray(pixelCount * 4);
  const norm = maxMag > 1e-6 ? maxMag : 1;

  for (let i = 0; i < pixelCount; i += 1) {
    const offset = i * 4;
    data[offset] = Math.max(0, Math.min(255, Math.round(128 + (dxArr[i] / norm) * 127)));
    data[offset + 1] = Math.max(0, Math.min(255, Math.round(128 + (dyArr[i] / norm) * 127)));
    data[offset + 2] = 128;
    data[offset + 3] = 255;
  }

  return {
    data,
    width: w,
    height: h,
    maxScale: Math.min(maxMag, bezel * 1.25),
  };
}

function quantizeEven(value: number, min = 16): number {
  return Math.max(min, Math.round(value / 2) * 2);
}

/**
 * Generates and memoizes a PNG data URL displacement map for a Liquid Glass bezel contour.
 * Returns null safely in environments without 2D Canvas support (such as jsdom or SSR).
 */
export function getLiquidGlassDisplacementAsset(
  options: LiquidGlassFieldOptions,
): LiquidGlassDisplacementAsset | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const width = quantizeEven(options.width, 16);
  const height = quantizeEven(options.height, 16);
  const radius = quantizeEven(Math.min(options.radius, width / 2, height / 2), 2);
  const bezelWidth = quantizeEven(Math.min(options.bezelWidth, Math.min(width, height) * 0.44), 4);
  const glassThickness = options.glassThickness ?? Math.max(8, bezelWidth * 0.9);
  const refractiveIndex = options.refractiveIndex ?? 1.5;

  const cacheKey = `${width}x${height}:${radius}:${bezelWidth}:${glassThickness.toFixed(1)}:${refractiveIndex.toFixed(2)}`;
  const cached = DISPLACEMENT_ASSET_CACHE.get(cacheKey);
  if (cached) {
    return cached;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  const field = computeLiquidGlassDisplacementField({
    width,
    height,
    radius,
    bezelWidth,
    glassThickness,
    refractiveIndex,
  });

  const imgData =
    typeof ImageData !== 'undefined'
      ? new ImageData(new Uint8ClampedArray(field.data), width, height)
      : ctx.createImageData(width, height);
  if (typeof ImageData === 'undefined') {
    imgData.data.set(field.data);
  }
  ctx.putImageData(imgData, 0, 0);

  const asset: LiquidGlassDisplacementAsset = {
    url: canvas.toDataURL('image/png'),
    width: field.width,
    height: field.height,
    maxScale: field.maxScale,
  };

  if (DISPLACEMENT_ASSET_CACHE.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = DISPLACEMENT_ASSET_CACHE.keys().next().value;
    if (oldestKey !== undefined) {
      DISPLACEMENT_ASSET_CACHE.delete(oldestKey);
    }
  }
  DISPLACEMENT_ASSET_CACHE.set(cacheKey, asset);

  return asset;
}
