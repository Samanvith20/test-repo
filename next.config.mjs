/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "res.cloudinary.com",
          port: "",
          pathname: "/dniengepd/image/upload/**",
        },
      ],
      unoptimized: true,
    },
    reactStrictMode: false,
  
  };
export default nextConfig;
