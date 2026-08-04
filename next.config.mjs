/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [75, 90], // أضفنا الجودات المصرح بها هنا
  },
}

export default nextConfig