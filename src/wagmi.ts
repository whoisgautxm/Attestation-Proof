import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';
import { WagmiProvider } from 'wagmi'
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.REACT_APP_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
});
