import { http, createConfig } from 'wagmi'
import { base, baseSepolia, mainnet, optimism } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'


export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    metaMask(),
    safe(),
  ],
  transports: {
    [baseSepolia.id]: http(), 
  },
})