import { currentIp } from '../lib/ip/ip';
import { currentPort } from '../lib/port/port';

const isProduction = typeof window !== 'undefined' 
  ? (window.location.hostname !== 'localhost' && !window.location.hostname.includes('192.168.') && !window.location.hostname.includes('10.'))
  : true;

const productionUrl = 'https://socialnetwork-rkjz.onrender.com';

export const NETWORK = {
  devIp: currentIp,
  apiUrl: isProduction ? `${productionUrl}/api` : `http://${currentIp}:${currentPort}/api`,
  wsUrl: isProduction ? `${productionUrl.replace('https://', 'wss://')}` : `ws://${currentIp}:${currentPort}`,
} as const;
