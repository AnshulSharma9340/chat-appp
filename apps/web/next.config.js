/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'http://localhost:8080/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/chat/:path*',
        destination: 'http://localhost:8080/chat/:path*',
      },
      {
        source: '/ws/:path*',
        destination: 'http://localhost:8080/ws/:path*',
      }
    ];
  },
};

export default nextConfig;
