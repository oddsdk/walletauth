import "@rainbow-me/rainbowkit/styles.css"
import { connectorsForWallets, RainbowKitProvider, wallet } from "@rainbow-me/rainbowkit"
import { chain, configureChains, createClient, WagmiConfig } from "wagmi"
import { publicProvider } from "wagmi/providers/public"
import ReactDOM from "react-dom/client";

import App from "./App"

/**
 * I've left the testnet chains commented out here in case we want to test with them
 */
const { chains, provider } = configureChains(
  [chain.mainnet/*, chain.ropsten, chain.rinkeby, chain.goerli*/],
  [publicProvider()]
);

/**
 * I'm limiting the available wallets to MetaMask for now, since it's the only one that
 * supports the RPC methods we need(`eth_decrypt` and `eth_getEncryptionPublicKey`)
 */
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      wallet.metaMask({ chains }),
    ],
  },
])

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

ReactDOM.createRoot(document.getElementById("app")!).render(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider coolMode chains={chains}>
      <App />
    </RainbowKitProvider>
  </WagmiConfig>
);
