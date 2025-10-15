import React from "react";

type SafeFarcasterProviderProps = {
  children: React.ReactNode;
};

// Simplified provider for Base chain only (no Solana needed)
export function SafeFarcasterSolanaProvider({ children }: SafeFarcasterProviderProps) {
  return <>{children}</>;
}

export function useHasSolanaProvider() {
  return false; // Always false since we don't use Solana
}
