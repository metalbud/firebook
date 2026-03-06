/**
 * Next.js configuration for the server-rendered build served by pm2 on port
 * 4000 behind Apache. We disable the image optimizer to avoid pulling in the
 * optional sharp dependency and to serve the existing static assets directly.
 */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
