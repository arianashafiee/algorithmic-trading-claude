// src/services/marketDataService.js
import fetch from 'node-fetch';

export class MarketDataService {
  constructor(apiKey) {
    this.baseUrl = 'https://api.coingecko.com/api/v3/onchain';
    this.apiKey = apiKey;
  }

  async getTokenPrice(network, addresses, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add optional parameters
      if (options.include_market_cap) queryParams.append('include_market_cap', options.include_market_cap);
      if (options.mcap_fdv_fallback) queryParams.append('mcap_fdv_fallback', options.mcap_fdv_fallback);
      if (options.include_24hr_vol) queryParams.append('include_24hr_vol', options.include_24hr_vol);
      if (options.include_24hr_price_change) queryParams.append('include_24hr_price_change', options.include_24hr_price_change);
      if (options.include_total_reserve_in_usd) queryParams.append('include_total_reserve_in_usd', options.include_total_reserve_in_usd);

      const url = `${this.baseUrl}/simple/networks/${network}/token_price/${addresses}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get token price: ${error.message}`);
    }
  }

  async getNetworks(page = 1) {
    try {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page);

      const url = `${this.baseUrl}/networks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get networks: ${error.message}`);
    }
  }

  async getSupportedDexes(network, page = 1) {
    try {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page);

      const url = `${this.baseUrl}/networks/${network}/dexes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get supported DEXes: ${error.message}`);
    }
  }

  async getTrendingPools(options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.include) queryParams.append('include', options.include);
      if (options.page) queryParams.append('page', options.page);
      if (options.duration) queryParams.append('duration', options.duration);

      const url = `${this.baseUrl}/networks/trending_pools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get trending pools: ${error.message}`);
    }
  }

