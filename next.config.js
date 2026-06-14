/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', 'nodemailer'],
  },
};

module.exports = nextConfig;
