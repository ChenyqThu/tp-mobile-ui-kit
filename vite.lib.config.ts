import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const LIB_STYLE_IMPORTS = [
  '../styles/tp-tokens.css',
  '../styles/tp-components.css',
  '../styles/tp-omada.css',
];

function injectLibStyleImports(): Plugin {
  const entryPath = path.resolve(import.meta.dirname, 'src/lib/index.ts').replace(/\\/g, '/');
  const preamble = LIB_STYLE_IMPORTS.map((spec) => `import '${spec}';`).join('\n');
  return {
    name: 'tp-mobile-inject-lib-styles',
    enforce: 'pre',
    transform(code, id) {
      if (id.replace(/\\/g, '/') === entryPath) {
        return { code: `${preamble}\n${code}`, map: null };
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [injectLibStyleImports(), react(), tailwindcss()],
  assetsInclude: ['**/*.pag'],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    lib: {
      entry: {
        index: path.resolve(import.meta.dirname, 'src/lib/index.ts'),
        core: path.resolve(import.meta.dirname, 'src/lib/core.ts'),
        assets: path.resolve(import.meta.dirname, 'src/lib/assets.ts'),
        omada: path.resolve(import.meta.dirname, 'src/lib/omada.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'style',
    },
    rolldownOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
        'libpag',
        /^lucide-react\//,
        /^libpag\//,
        /^react\//,
        /^react-dom\//,
      ],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
        codeSplitting: {
          groups: [
            {
              name: 'asset-icons',
              priority: 20,
              test: /src\/(assets-lib\/(TPIcon|iconsManifest)|assets\/icons)\/?/,
            },
            {
              name: 'asset-illustrations',
              priority: 20,
              test: /src\/(assets-lib\/(TPIllustration|assetsManifest)|assets\/illustrations)\/?/,
            },
            {
              name: 'asset-logos',
              priority: 20,
              test: /src\/(assets-lib\/TPBrandLogo|assets\/logos)\/?/,
            },
            {
              name: 'asset-motion',
              priority: 20,
              test: /src\/(assets-lib\/(TPMotion|motionsManifest)|assets\/motion)\/?/,
            },
          ],
        },
      },
    },
  },
});
