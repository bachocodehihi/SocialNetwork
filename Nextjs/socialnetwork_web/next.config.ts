import type { NextConfig } from 'next';
import { currentIp } from './src/lib/ip/ip';

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [currentIp],
};

export default nextConfig;