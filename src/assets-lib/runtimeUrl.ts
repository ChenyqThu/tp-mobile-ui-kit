const globalState = globalThis as { __TP_MOBILE_ASSET_BASE__?: string };

/**
 * Resolves asset URLs across Vite dev server, ESM chunk imports, and standalone zero-build HTML bundles.
 */
export function resolveRuntimeAssetUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  if (
    rawUrl.startsWith('data:') ||
    rawUrl.startsWith('blob:') ||
    /^https?:\/\//i.test(rawUrl)
  ) {
    return rawUrl;
  }
  const base = globalState.__TP_MOBILE_ASSET_BASE__;
  if (base) {
    try {
      return new URL(rawUrl.replace(/^\/+/, ''), base).href;
    } catch {
      return rawUrl;
    }
  }
  return rawUrl;
}
