import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

// ========================================
// INK CHAIN CONFIGURATION
// ========================================

export const ink = defineChain({
  id: 57073,
  name: 'Ink',

  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },

  rpcUrls: {
    default: {
      http: ['https://rpc-gel.inkonchain.com'],
    },
  },

  blockExplorers: {
    default: {
      name: 'Ink Explorer',
      url: 'https://explorer.inkonchain.com',
    },
  },
});

// ========================================
// WAGMI CONFIGURATION
// ========================================

export const config = createConfig({
  chains: [ink],

  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],

  transports: {
    [ink.id]: http('https://rpc-gel.inkonchain.com'),
  },

  ssr: false,
});
