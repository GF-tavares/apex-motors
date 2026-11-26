import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  server: { host: '127.0.0.1', port: 4332 },
  image: {
    // Fotos baixadas em src/assets/ viram AVIF/WebP em várias larguras no build.
    responsiveStyles: false,
  },
});
