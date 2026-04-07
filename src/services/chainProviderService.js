import { ethers } from "ethers";

export class ChainProviderService {
  constructor(privateKey, alchemyApiKey) {
    this.wallet = null;
    this.providers = {};
    this.alchemyApiKey = alchemyApiKey;
    if (privateKey) this.initializeWallet(privateKey);
    this.initializeProviders();
  }

  initializeWallet(privateKey) {
    this.wallet = new ethers.Wallet(privateKey);
  }

  initializeProviders() {
    const rpcUrls = {
      1: "https://rpc.flashbots.net",
      10: "https://mainnet.optimism.io",
      137: "https://polygon.llamarpc.com",
      8453: "https://mainnet.base.org",
      42161: "https://arb1.arbitrum.io/rpc",
    };
    for (const [chainId, rpcUrl] of Object.entries(rpcUrls)) {
      this.providers[chainId] = new ethers.JsonRpcProvider(rpcUrl);
    }
  }

  getProvider(chainId) {
    return this.providers[String(chainId)] || null;
  }

  getWalletAddress() {
    return this.wallet?.address || null;
  }
}
