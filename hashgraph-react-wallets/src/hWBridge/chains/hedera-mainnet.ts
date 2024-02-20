import { Chain } from 'viem'

export default {
  id: 295,
  name: 'Hedera Mainnet',
  nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'Hashscan', url: 'https://hashscan.io/mainnet' },
  },
} as Chain
