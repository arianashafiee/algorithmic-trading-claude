// src/toolService.js
import {
  AgService,
  CoinGeckoApiService,
  BlockchainService,
  SolanaDexService,
  SolanaLimitOrderService,
  MemecoinService,
  PumpFunBotService,
  MarketMakerService,
  WalletManagerService,
} from "./services/index.js";
import { ethers } from "ethers";

export class ToolService {
  constructor(
    agUrl,
    userPrivateKey,
    userAddress,
    coinGeckoApiKey,
    alchemyApiKey,
    solanaPrivateKey
  ) {
    this.agg = new AgService(agUrl);
    this.coinGeckoApi = new CoinGeckoApiService(coinGeckoApiKey);
    this.blockchain = new BlockchainService(userPrivateKey, alchemyApiKey);
    this.userPrivateKey = userPrivateKey;
    this.userAddress = userAddress;
    this.solanaPrivateKey = solanaPrivateKey;
      }

  async getSwapPrice(params) {
    // Validate required parameters
    const { chainId, buyToken, sellToken, sellAmount } = params;

    if (!chainId || !buyToken || !sellToken || !sellAmount) {
      throw new Error(
        "Missing required parameters: chainId, buyToken, sellToken, sellAmount"
      );
    }

    const result = await this.agg.getSwapPrice(params);

    return {
      message: "Swap price retrieved successfully",
      data: result,
    };
  }

  async getSwapQuote(params) {
    // Validate required parameters
    const { chainId, buyToken, sellToken, sellAmount } = params;

    if (!chainId || !buyToken || !sellToken || !sellAmount) {
      throw new Error(
        "Missing required parameters: chainId, buyToken, sellToken, sellAmount"
      );
    }

    // Add taker address if not provided
    const quoteParams = {
      ...params,
      taker: params.taker || this.userAddress,
    };

    const result = await this.agg.getSwapQuote(quoteParams);

    // Add chainId to the result for executeSwap to use
    result.chainId = chainId;

    return {
      message: "Swap quote retrieved successfully",
      data: result,
      nextSteps: [
        "1. Review the quote details including fees and gas estimates",
        "2. Use execute_swap tool to execute this swap",
        "3. The permit2 signature will be handled automatically",
      ],
    };
  }

  async executeSwap(quoteData) {
    if (!quoteData) {
      throw new Error("Quote data is required for swap execution");
    }

    if (!this.userPrivateKey) {
      throw new Error("User private key is required for swap execution");
    }

    try {
      // Extract chain ID from quote data
      const chainId = quoteData.chainId || quoteData.transaction?.chainId;
      if (!chainId) {
        throw new Error("Chain ID not found in quote data");
      }

      console.log("🚀 Executing swap transaction...");

      // Sign and broadcast the transaction using blockchain service
      const result = await this.blockchain.signAndBroadcastTransaction(
        chainId,
        quoteData
      );

      return {
        message: "Swap executed successfully",
        data: result,
        nextSteps: [
          "1. Transaction has been broadcasted to the blockchain",
          "2. Wait for confirmation (usually 1-3 minutes)",
          "3. Check transaction status on block explorer",
          `4. Transaction hash: ${result.hash}`,
        ],
      };
    } catch (error) {
      throw new Error(`Swap execution failed: ${error.message}`);
    }
  }

  async getSupportedChains() {
    const result = await this.agg.getSupportedChains();

    return {
      message: "Supported chains retrieved successfully",
      data: result,
      summary: `Found ${result.chains?.length || 0} supported chains`,
    };
  }

  async getLiquiditySources(chainId) {
    if (!chainId) {
      throw new Error("chainId is required");
    }

    const result = await this.agg.getLiquiditySources(chainId);

    return {
      message: `Liquidity sources for chain ${chainId} retrieved successfully`,
      data: result,
      summary: `Found ${result.sources?.length || 0} liquidity sources`,
    };
  }

  // CoinGecko API Methods
  async getTokenPrice(network, addresses, options = {}) {
    if (!network || !addresses) {
      throw new Error("Missing required parameters: network, addresses");
    }

    const result = await this.coinGeckoApi.getTokenPrice(
      network,
      addresses,
      options
    );

    return {
      message: "Token prices retrieved successfully",
      data: result,
      summary: `Retrieved prices for ${
        addresses.split(",").length
      } token(s) on ${network} network`,
    };
  }

  async getCoinGeckoNetworks(page = 1) {
    const result = await this.coinGeckoApi.getNetworks(page);

    return {
      message: "CoinGecko networks retrieved successfully",
      data: result,
      summary: `Found ${result.data?.length || 0} networks on page ${page}`,
    };
  }

  async getSupportedDexes(network, page = 1) {
    if (!network) {
      throw new Error("network is required");
    }

    const result = await this.coinGeckoApi.getSupportedDexes(network, page);

    return {
      message: `Supported DEXes for ${network} retrieved successfully`,
      data: result,
      summary: `Found ${result.data?.length || 0} DEXes on ${network} network`,
    };
  }

  async getTrendingPools(options = {}) {
    const result = await this.coinGeckoApi.getTrendingPools(options);

    return {
      message: "Trending pools retrieved successfully",
      data: result,
      summary: `Found ${result.data?.length || 0} trending pools`,
      duration: options.duration || "24h",
    };
  }

  async getTrendingPoolsByNetwork(network, options = {}) {
    if (!network) {
      throw new Error("network is required");
    }

    const result = await this.coinGeckoApi.getTrendingPoolsByNetwork(
      network,
      options
    );

    return {
      message: `Trending pools for ${network} retrieved successfully`,
      data: result,
      summary: `Found ${result.data?.length || 0} trending pools on ${network}`,
      duration: options.duration || "24h",
    };
  }

  async getMultiplePoolsData(network, addresses, options = {}) {
    if (!network || !addresses) {
      throw new Error("Missing required parameters: network, addresses");
    }

    const result = await this.coinGeckoApi.getMultiplePoolsData(
      network,
      addresses,
      options
    );

    return {
      message: "Multiple pools data retrieved successfully",
      data: result,
      summary: `Retrieved data for ${
        addresses.split(",").length
      } pool(s) on ${network}`,
    };
  }

  async getTopPoolsByDex(network, dex, options = {}) {
    if (!network || !dex) {
      throw new Error("Missing required parameters: network, dex");
    }

    const result = await this.coinGeckoApi.getTopPoolsByDex(
      network,
      dex,
      options
    );

    return {
      message: `Top pools for ${dex} on ${network} retrieved successfully`,
      data: result,
      summary: `Found ${result.data?.length || 0} pools on ${dex}`,
      sort: options.sort || "h24_tx_count_desc",
    };
  }

  async getNewPools(options = {}) {
    const result = await this.coinGeckoApi.getNewPools(options);

    return {
      message: "New pools retrieved successfully",
      data: result,
      summary: `Found ${
        result.data?.length || 0
      } new pools across all networks`,
    };
  }

  async searchPools(query, options = {}) {
    if (!query) {
      throw new Error("query is required");
    }

    const result = await this.coinGeckoApi.searchPools(query, options);

    return {
      message: `Pool search for "${query}" completed successfully`,
      data: result,
      summary: `Found ${result.data?.length || 0} pools matching "${query}"${
        options.network ? ` on ${options.network}` : ""
      }`,
    };
  }

  // Additional CoinGecko API Methods from coingeckoendpoints-2.txt
  async getTopPoolsByToken(network, tokenAddress, options = {}) {
    if (!network || !tokenAddress) {
      throw new Error("Missing required parameters: network, tokenAddress");
    }

    const result = await this.coinGeckoApi.getTopPoolsByToken(
      network,
      tokenAddress,
      options
    );

    return {
      message: `Top pools for token ${tokenAddress} on ${network} retrieved successfully`,
      data: result,
      summary: `Found ${
        result.data?.length || 0
      } pools for token ${tokenAddress}`,
      sort: options.sort || "h24_volume_usd_liquidity_desc",
    };
  }

  async getTokenData(network, address, options = {}) {
    if (!network || !address) {
      throw new Error("Missing required parameters: network, address");
    }

    const result = await this.coinGeckoApi.getTokenData(
      network,
      address,
      options
    );

    return {
      message: `Token data for ${address} on ${network} retrieved successfully`,
      data: result,
      summary: `Retrieved data for token ${
        result.data?.attributes?.symbol || address
      }`,
      includes: options.include ? options.include.split(",") : [],
    };
  }

  async getMultipleTokensData(network, addresses, options = {}) {
    if (!network || !addresses) {
      throw new Error("Missing required parameters: network, addresses");
    }

    const result = await this.coinGeckoApi.getMultipleTokensData(
      network,
      addresses,
      options
    );

    return {
      message: "Multiple tokens data retrieved successfully",
      data: result,
      summary: `Retrieved data for ${
        addresses.split(",").length
      } token(s) on ${network}`,
      includes: options.include ? options.include.split(",") : [],
    };
  }

  async getTokenInfo(network, address) {
    if (!network || !address) {
      throw new Error("Missing required parameters: network, address");
    }

    const result = await this.coinGeckoApi.getTokenInfo(network, address);

    return {
      message: `Token info for ${address} on ${network} retrieved successfully`,
      data: result,
      summary: `Retrieved detailed info for token ${
        result.data?.attributes?.symbol || address
      }`,
      note: "This endpoint provides additional token information like socials, websites, and description",
    };
  }

  async getRecentlyUpdatedTokens(options = {}) {
    const result = await this.coinGeckoApi.getRecentlyUpdatedTokens(options);

    return {
      message: "Recently updated tokens retrieved successfully",
      data: result,
      summary: `Found ${result.data?.length || 0} recently updated tokens${
        options.network ? ` on ${options.network}` : " across all networks"
      }`,
      includes: options.include ? options.include.split(",") : [],
    };
  }

  async getPoolOHLCV(network, poolAddress, timeframe, options = {}) {
    if (!network || !poolAddress || !timeframe) {
      throw new Error(
        "Missing required parameters: network, poolAddress, timeframe"
      );
    }

    const result = await this.coinGeckoApi.getPoolOHLCV(
      network,
      poolAddress,
      timeframe,
      options
    );

    return {
      message: `OHLCV data for pool ${poolAddress} retrieved successfully`,
      data: result,
      summary: `Retrieved ${timeframe} OHLCV data for pool on ${network}`,
      timeframe: timeframe,
      aggregate: options.aggregate || "1",
      currency: options.currency || "usd",
      token: options.token || "base",
    };
  }

  async getPoolTrades(network, poolAddress, options = {}) {
    if (!network || !poolAddress) {
      throw new Error("Missing required parameters: network, poolAddress");
    }

    const result = await this.coinGeckoApi.getPoolTrades(
      network,
      poolAddress,
      options
    );

    return {
      message: `Pool trades for ${poolAddress} on ${network} retrieved successfully`,
      data: result,
      summary: `Found ${result.data?.length || 0} trades for pool`,
      minVolumeFilter: options.trade_volume_in_usd_greater_than || "none",
    };
  }
