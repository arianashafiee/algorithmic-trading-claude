import fetch from "node-fetch";

export class SwapAggregatorService {
  constructor(agUrl) {
    this.baseUrl = agUrl;
  }

  async getSwapPrice(params) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${this.baseUrl}/api/swap/price?${queryParams}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success) throw new Error(data.error || "API request failed");
    return data.data;
  }

  async getSwapQuote(params) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${this.baseUrl}/api/swap/quote?${queryParams}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success) throw new Error(data.error || "API request failed");
    return data.data;
  }
}
