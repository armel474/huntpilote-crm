/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produit un serveur Node autonome (.next/standalone) déployable sur un VPS
  // derrière Nginx/PM2, sans dépendance à Vercel.
  output: 'standalone',
  reactStrictMode: true,
};

export default nextConfig;
