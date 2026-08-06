/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
    qualities: [75, 90],
  },
  experimental: {
    /**
     * خط الدفاع الثاني ضدّ «Body exceeded 1 MB limit».
     *
     * رفع الصور نفسه انتقل إلى Route Handler (`/api/admin/media/upload`) وهو
     * غير محدود بهذا السقف، لكن المسودة التي يحفظها الاستوديو تلقائياً تمرّ
     * عبر Server Action وقد تكبر (قصة بـ ٦٠٠ جملة + إعدادات ٤ أسطح). رفع
     * الحد إلى 4MB يمنع فشل الحفظ التلقائي على القصص الطويلة.
     */
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
