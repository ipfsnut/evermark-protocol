import { defineChain } from 'viem';

// Define all chains used in the application
export const base = defineChain({
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://basescan.org' },
  },
});

export const mainnet = defineChain({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://eth-mainnet.g.alchemy.com/v2/demo'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
});

export const optimism = defineChain({
  id: 10,
  name: 'OP Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.optimism.io'] },
  },
  blockExplorers: {
    default: { name: 'Optimism Explorer', url: 'https://optimistic.etherscan.io' },
  },
});

export const degen = defineChain({
  id: 666666666,
  name: 'Degen',
  nativeCurrency: { name: 'DEGEN', symbol: 'DEGEN', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.degen.tips'] },
  },
  blockExplorers: {
    default: { name: 'Degen Explorer', url: 'https://explorer.degen.tips' },
  },
});

export const unichain = defineChain({
  id: 1301,
  name: 'Unichain Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.unichain.org'] },
  },
  blockExplorers: {
    default: { name: 'Unichain Explorer', url: 'https://unichain-sepolia.blockscout.com' },
  },
});

// Export all chains as a convenience
export const supportedChains = [base, mainnet, optimism, degen, unichain];