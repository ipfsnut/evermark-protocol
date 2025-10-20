import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";
import { createConnector } from 'wagmi';
import { APP_NAME, APP_ICON_URL } from "~/lib/constants";
import { base, mainnet } from "~/lib/chains";
import { useEffect, useState } from "react";
import { useConnect, useAccount } from "wagmi";
import React from "react";

// Add window.ethereum types
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isCoinbaseWallet?: boolean;
      isCoinbaseWalletExtension?: boolean;
      isCoinbaseWalletBrowser?: boolean;
    };
  }
}

// Custom hook for Coinbase Wallet detection and auto-connection
function useCoinbaseWalletAutoConnect() {
  const [isCoinbaseWallet, setIsCoinbaseWallet] = useState(false);
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    // Check if we're running in Coinbase Wallet
    const checkCoinbaseWallet = () => {
      const isInCoinbaseWallet = window.ethereum?.isCoinbaseWallet || 
        window.ethereum?.isCoinbaseWalletExtension ||
        window.ethereum?.isCoinbaseWalletBrowser;
      setIsCoinbaseWallet(!!isInCoinbaseWallet);
    };
    
    checkCoinbaseWallet();
    window.addEventListener('ethereum#initialized', checkCoinbaseWallet);
    
    return () => {
      window.removeEventListener('ethereum#initialized', checkCoinbaseWallet);
    };
  }, []);

  useEffect(() => {
    // Auto-connect if in Coinbase Wallet and not already connected
    if (isCoinbaseWallet && !isConnected) {
      connect({ connector: connectors[1] }); // Injected connector
    }
  }, [isCoinbaseWallet, isConnected, connect, connectors]);

  return isCoinbaseWallet;
}

// Create a basic injected connector manually to avoid importing problematic connectors
const basicInjected = createConnector((config) => ({
  id: 'injected',
  name: 'Injected',
  type: 'injected',
  async connect() {
    const provider = window.ethereum;
    if (!provider) throw new Error('No injected provider found');
    
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    const chainId = await provider.request({ method: 'eth_chainId' });
    
    return {
      accounts: accounts.map((account: string) => account as `0x${string}`),
      chainId: Number(chainId),
    };
  },
  async disconnect() {
    // Most injected wallets don't support programmatic disconnect
  },
  async getAccounts() {
    const provider = window.ethereum;
    if (!provider) return [];
    
    const accounts = await provider.request({ method: 'eth_accounts' });
    return accounts.map((account: string) => account as `0x${string}`);
  },
  async getChainId() {
    const provider = window.ethereum;
    if (!provider) throw new Error('No injected provider found');
    
    const chainId = await provider.request({ method: 'eth_chainId' });
    return Number(chainId);
  },
  async isAuthorized() {
    const provider = window.ethereum;
    if (!provider) return false;
    
    const accounts = await provider.request({ method: 'eth_accounts' });
    return accounts.length > 0;
  },
  onAccountsChanged(accounts) {
    config.emitter.emit('change', { accounts: accounts.map((account: string) => account as `0x${string}`) });
  },
  onChainChanged(chainId) {
    config.emitter.emit('change', { chainId: Number(chainId) });
  },
  onConnect(connectInfo) {
    config.emitter.emit('connect', connectInfo);
  },
  onDisconnect(error) {
    config.emitter.emit('disconnect', error);
  },
}));

export const config = createConfig({
  chains: [base, mainnet],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [
    farcasterFrame(),
    basicInjected(),
  ],
});

const queryClient = new QueryClient();

// Wrapper component that provides Coinbase Wallet auto-connection
function CoinbaseWalletAutoConnect({ children }: { children: React.ReactNode }) {
  useCoinbaseWalletAutoConnect();
  return <>{children}</>;
}

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <CoinbaseWalletAutoConnect>
          {children}
        </CoinbaseWalletAutoConnect>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
