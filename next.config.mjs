import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for Docker images (migration = pull image).
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default withNextIntl(nextConfig);
