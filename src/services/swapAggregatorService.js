// src/services/swapAggregatorService.js
import fetch from 'node-fetch';

export class SwapAggregatorService {
  constructor(agUrl) {
    this.baseUrl = agUrl;
  }

  async getSwapPrice(params) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseUrl}/api/swap/price?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get swap price: ${error.message}`);
    }
  }

  async getSwapQuote(params) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseUrl}/api/swap/quote?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get swap quote: ${error.message}`);
    }
  }

  async executeSwap(swapData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(swapData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Swap execution failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to execute swap: ${error.message}`);
    }
  }

  async getSupportedChains() {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/chains`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get supported chains: ${error.message}`);
    }
  }

  async getLiquiditySources(chainId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/sources?chainId=${chainId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get liquidity sources: ${error.message}`);
    }
  }

  // Gasless API Methods
  async getGaslessPrice(params) {
    try {
      const queryParams = new URLSearchParams(params);
