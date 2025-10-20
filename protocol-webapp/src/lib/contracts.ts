// src/lib/contracts.ts - Singleton contract instances for non-React contexts
import { getContract } from 'thirdweb';
import type { Abi } from 'abitype';
import { client, chain as CHAIN } from './thirdweb';

// Import all ABIs
import EMARKABI from './abis/EMARK.json';
import WEMARKABBI from './abis/WEMARK.abi.json';
import EvermarkNFTABI from './abis/EvermarkNFT.abi.json';
import EvermarkVotingABI from './abis/EvermarkVoting.abi.json';
import NFTStakingABI from './abis/NFTStaking.abi.json';
import EvermarkRewardsABI from './abis/EvermarkRewards.abi.json';
import FeeCollectorABI from './abis/FeeCollector.abi.json';

// Export the chain from thirdweb.ts so we use the same Thirdweb RPC everywhere
export { CHAIN };

// Contract addresses with fallbacks - same as beta
export const CONTRACTS = {
  EMARK_TOKEN: process.env.NEXT_PUBLIC_EMARK_ADDRESS || '0xf87F3ebbF8CaCF321C2a4027bb66Df639a6f4B07',
  WEMARK: process.env.NEXT_PUBLIC_WEMARK_ADDRESS || '0xDf756488A3A27352ED1Be38A94f6621A6CE2Ce15',
  EVERMARK_NFT: process.env.NEXT_PUBLIC_EVERMARK_NFT_ADDRESS || '0x504a0BDC3aea29237a6f8E53D0ECDA8e4c9009F2',
  EVERMARK_VOTING: process.env.NEXT_PUBLIC_EVERMARK_VOTING_ADDRESS || '0x5089FE55368E40c8990214Ca99bd2214b34A179D',
  NFT_STAKING: process.env.NEXT_PUBLIC_NFT_STAKING_ADDRESS || '0x95f9aaDb35E74aba92DAAFfe1Ae74Cb467149210',
  EVERMARK_REWARDS: process.env.NEXT_PUBLIC_EVERMARK_REWARDS_ADDRESS || '0x88E5C57FFC8De966eD789ebd5A8E3B290Ed2B55C',
  FEE_COLLECTOR: process.env.NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS || '0xaab93405679576ec743fDAA57AA603D949850604',
  MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '0x56b178A3AA23d323Ae9d8E85Bd633f2F5Ff98FAD'
} as const;

// Singleton contract instances - created once and reused
const contractInstances: {
  emarkToken?: ReturnType<typeof getContract>;
  wemark?: ReturnType<typeof getContract>;
  evermarkNFT?: ReturnType<typeof getContract>;
  evermarkVoting?: ReturnType<typeof getContract>;
  nftStaking?: ReturnType<typeof getContract>;
  evermarkRewards?: ReturnType<typeof getContract>;
  feeCollector?: ReturnType<typeof getContract>;
  marketplace?: ReturnType<typeof getContract>;
} = {};

// Test helper to reset singleton instances
export function resetContractInstances() {
  Object.keys(contractInstances).forEach(key => {
    delete (contractInstances as any)[key];
  });
}

// Contract getter functions that return singleton instances
export function getEmarkTokenContract() {
  if (!CONTRACTS.EMARK_TOKEN) {
    throw new Error('EMARK_TOKEN address not configured');
  }
  
  if (!contractInstances.emarkToken) {
    contractInstances.emarkToken = getContract({
      client,
      chain: CHAIN,
      address: CONTRACTS.EMARK_TOKEN as `0x${string}`,
      abi: EMARKABI as Abi,
    });
  }
  
  return contractInstances.emarkToken;
}

export function getWEMARKContract() {
  if (!CONTRACTS.WEMARK) {
    throw new Error('WEMARK address not configured');
  }
  
  if (!contractInstances.wemark) {
    contractInstances.wemark = getContract({
      client,
      chain: CHAIN,
      address: CONTRACTS.WEMARK as `0x${string}`,
      abi: WEMARKABBI as Abi,
    });
  }
  
  return contractInstances.wemark;
}

export function getEvermarkNFTContract() {
  if (!CONTRACTS.EVERMARK_NFT) {
    throw new Error('EVERMARK_NFT address not configured');
  }
  
  if (!contractInstances.evermarkNFT) {
    contractInstances.evermarkNFT = getContract({
      client,
      chain: CHAIN,
      address: CONTRACTS.EVERMARK_NFT as `0x${string}`,
      abi: EvermarkNFTABI as Abi,
    });
  }
  
  return contractInstances.evermarkNFT;
}

export function getEvermarkVotingContract() {
  if (!CONTRACTS.EVERMARK_VOTING) {
    throw new Error('EVERMARK_VOTING address not configured');
  }
  
  if (!contractInstances.evermarkVoting) {
    contractInstances.evermarkVoting = getContract({
      client,
      chain: CHAIN,
      address: CONTRACTS.EVERMARK_VOTING as `0x${string}`,
      abi: ((EvermarkVotingABI as any).abi || EvermarkVotingABI) as unknown as Abi,
    });
  }
  
  return contractInstances.evermarkVoting;
}

export function getNFTStakingContract() {
  if (!CONTRACTS.NFT_STAKING) {
    throw new Error('NFT_STAKING address not configured');
  }
  
  if (!contractInstances.nftStaking) {
    contractInstances.nftStaking = getContract({
      client,
      chain: CHAIN,
      address: CONTRACTS.NFT_STAKING as `0x${string}`,
      abi: NFTStakingABI as Abi,
    });
  }
  
  return contractInstances.nftStaking;
}

export function getEvermarkRewardsContract() {
  if (!CONTRACTS.EVERMARK_REWARDS) {
    throw new Error('EVERMARK_REWARDS address not configured');
  }
  
  if (!contractInstances.evermarkRewards) {
    contractInstances.evermarkRewards = getContract({
      client,
      chain: CHAIN,
      address: CONTRACTS.EVERMARK_REWARDS as `0x${string}`,
      abi: EvermarkRewardsABI as Abi,
    });
  }
  
  return contractInstances.evermarkRewards;
}

export function getFeeCollectorContract() {
  if (!CONTRACTS.FEE_COLLECTOR) {
    throw new Error('FEE_COLLECTOR address not configured');
  }
  
  if (!contractInstances.feeCollector) {
    contractInstances.feeCollector = getContract({
      client,
      chain: CHAIN,
      address: CONTRACTS.FEE_COLLECTOR as `0x${string}`,
      abi: FeeCollectorABI as Abi,
    });
  }
  
  return contractInstances.feeCollector;
}

export function getMarketplaceContract() {
  if (!CONTRACTS.MARKETPLACE) {
    throw new Error('MARKETPLACE address not configured');
  }
  
  if (!contractInstances.marketplace) {
    contractInstances.marketplace = getContract({
      client,
      chain: CHAIN,
      address: CONTRACTS.MARKETPLACE as `0x${string}`,
      // Note: Thirdweb marketplace contracts have standard ABIs
      // We don't need to import the ABI as Thirdweb SDK handles this
    });
  }
  
  return contractInstances.marketplace;
}

// Contract validation
export function validateContractAddresses(): { isValid: boolean; missing: string[] } {
  const missing = Object.entries(CONTRACTS)
    .filter(([_, address]) => !address || address.length !== 42 || !address.startsWith('0x'))
    .map(([name, _]) => name);
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

// Explorer URL helper
export function getContractExplorerUrl(address: string): string {
  return `${CHAIN.blockExplorers?.[0]?.url}/address/${address}`;
}