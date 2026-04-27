import { AgService, BlockchainService } from "./services/index.js";

export class ToolService {
  constructor(agUrl, userPrivateKey, userAddress, _coinGeckoApiKey, alchemyApiKey) {
    this.agg = new AgService(agUrl);
    this.blockchain = new BlockchainService(userPrivateKey, alchemyApiKey);
    this.userAddress = userAddress;
    this.userPrivateKey = userPrivateKey;
  }

  async getSwapPrice(params) {
    const { chainId, buyToken, sellToken, sellAmount } = params;
    if (!chainId || !buyToken || !sellToken || !sellAmount) {
      throw new Error("Missing required swap parameters");
    }
    return { message: "Swap price retrieved", data: await this.agg.getSwapPrice(params) };
  }

  async getSwapQuote(params) {
    const quoteParams = { ...params, taker: params.taker || this.userAddress };
    const result = await this.agg.getSwapQuote(quoteParams);
    result.chainId = params.chainId;
    return { message: "Swap quote retrieved", data: result };
  }

  async getSupportedChains() {
    return { message: "Supported chains", data: await this.agg.getSupportedChains() };
  }
}
