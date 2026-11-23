import tokensCss from '../styles/tp-tokens.css?inline';
import navControlsCss from '../styles/tp-core-nav-controls.css?inline';
import listsInputsCss from '../styles/tp-core-lists-inputs.css?inline';
import overlaysCss from '../styles/tp-core-overlays.css?inline';
import extendedCss from '../styles/tp-core-extended.css?inline';
import omadaCss from '../styles/tp-omada.css?inline';

const standaloneGlobal = globalThis as unknown as {
  __TP_MOBILE_ASSET_BASE__?: string;
  React?: typeof ReactNS;
  ReactDOM?: typeof ReactDOMNS;
};

if (!standaloneGlobal.__TP_MOBILE_ASSET_BASE__ && typeof document !== 'undefined') {
  const currentScript = document.currentScript as HTMLScriptElement | null;
  if (currentScript?.src) {
    try {
      standaloneGlobal.__TP_MOBILE_ASSET_BASE__ = new URL('./', currentScript.src).href;
    } catch {
      // Ignore invalid script URLs
    }
  }
}

if (typeof document !== 'undefined') {
  const STYLE_ID = 'tp-mobile-ui-standalone-styles';
  const hasExternalSheet = Boolean(document.querySelector('link[href*="tp-mobile-ui-kit"][href*="style.css"]'));
  if (!hasExternalSheet && !document.getElementById(STYLE_ID)) {
    const styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = [tokensCss, navControlsCss, listsInputsCss, overlaysCss, extendedCss, omadaCss].join('\n');
    document.head.appendChild(styleEl);
  }
}

import * as ReactNS from 'react';
import * as ReactDOMNS from 'react-dom/client';

standaloneGlobal.React ??= ReactNS;
standaloneGlobal.ReactDOM ??= ReactDOMNS;

export * from './index';
export { ReactNS as React, ReactDOMNS as ReactDOM };

const mountedRoots = new WeakMap<HTMLElement, ReactDOMNS.Root>();

/**
 * Convenience mount helper for zero-build single-file HTML demos (`window.TPMobileUI.render(...)`).
 */
export function render(
  element: ReactNS.ReactElement,
  target: string | HTMLElement = '#root',
): ReactDOMNS.Root {
  const container =
    typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!container) {
    throw new Error(`TPMobileUI.render: target container not found (${String(target)}).`);
  }
  let root = mountedRoots.get(container);
  if (!root) {
    root = ReactDOMNS.createRoot(container);
    mountedRoots.set(container, root);
  }
  root.render(element);
  return root;
}
