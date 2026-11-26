import type { NextConfig } from 'next';

// Exportação estática: o build gera a pasta /out, que pode ser hospedada de graça
// (GitHub Pages, Netlify, Vercel, Cloudflare Pages). Para GitHub Pages em subpasta,
// defina NEXT_PUBLIC_BASE_PATH=/nome-do-repositorio no build.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
