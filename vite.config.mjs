export default defineConfig({
  root: '.',
  base: '/', // or change based on deployment
  server: {
    port: 8080,
    hmr: true
  },
  build: {
    outDir: 'dist', // specify output directory
    minify: 'esbuild', // minification for production build
  },
});
