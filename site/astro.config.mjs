import { defineConfig } from 'astro/config';

const skipToolbarDependencyOptimization = {
  name: 'skip-toolbar-dependency-optimization',
  configResolved(config) {
    config.optimizeDeps.include = config.optimizeDeps.include.filter(
      (dependency) => !dependency.includes('aria-query') && !dependency.includes('axobject-query'),
    );
  },
};

export default defineConfig({
  output: 'static',
  site: 'https://corn-comp.com',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
  vite: {
    resolve: { preserveSymlinks: true },
    plugins: [skipToolbarDependencyOptimization],
  },
});
