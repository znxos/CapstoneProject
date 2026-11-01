/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/student-hub',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
