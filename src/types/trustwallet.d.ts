interface TrustWallet {
  request: (args: { method: string }) => Promise<string[]>;
}

declare global {
  interface Window {
    trustwallet?: TrustWallet;
  }
}

export {};