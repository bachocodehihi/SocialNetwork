import { currentIp } from '../lib/ip/ip';
import { currentPort } from '../lib/port/port';

const isProduction = process.env.NODE_ENV === 'production';

const productionUrl = 'https://socialnetwork-rkjz.onrender.com';

export const NETWORK = {
  devIp: currentIp,
  apiUrl: isProduction ? `${productionUrl}/api` : `http://${currentIp}:${currentPort}/api`,
  wsUrl: isProduction ? `${productionUrl.replace('https://', 'wss://')}` : `ws://${currentIp}:${currentPort}`,
} as const;
