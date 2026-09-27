import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "@prisma/client", "stripe", "nodemailer"],
  // The dev server is bound on 0.0.0.0 and opened at 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
