import { currentIp } from '../lib/ip/ip';
import { currentPort } from '../lib/port/port';

export const NETWORK = {
  devIp: currentIp,
  apiUrl: `http://${currentIp}:${currentPort}/api`,
  wsUrl: `ws://${currentIp}:${currentPort}/ws`,
} as const;