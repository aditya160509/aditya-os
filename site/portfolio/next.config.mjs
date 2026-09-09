/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exported as static HTML and served from /portfolio by the desktop's host,
  // so the personal site ships inside the same deployment as AdityaOS.
  output: "export",
  basePath: "/portfolio",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
};

export default nextConfig;
