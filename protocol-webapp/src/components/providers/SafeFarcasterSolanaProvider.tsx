import React from "react";

type BaseProviderProps = {
  children: React.ReactNode;
};

// Base chain provider (no Solana)
export function BaseProvider({ children }: BaseProviderProps) {
  return <>{children}</>;
}
