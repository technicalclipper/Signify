"use client";

import { createConfig, http } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { defineChain } from "viem";

// ✅ Define EduChain Testnet
export const eduChainTestnet = defineChain({
  id: 656476,
  name: "Edu Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "EduChain Token",
    symbol: "EDU",
  },
  rpcUrls: {
    default: { http: ["https://rpc.open-campus-codex.gelato.digital"] },
    public: { http: ["https://rpc.open-campus-codex.gelato.digital"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://edu-chain-testnet.blockscout.com" },
  },
  testnet: true, // ✅ Mark as testnet
} as const);

// ✅ Corrected createConfig function
export const config = createConfig({
  chains: [eduChainTestnet], // 🛠 Fix: Explicitly define chains
  connectors: [
    injected(), // Supports Injected Wallets (MetaMask, Brave, etc.)
    metaMask(), // Direct MetaMask support
  ],
  transports: {
    [eduChainTestnet.id]: http(eduChainTestnet.rpcUrls.default.http[0]), // 🛠 Fix: Proper transport setup
  },
});
