# Smart Trade AI

An MCP server that lets Claude Code (and other MCP clients) trade crypto, read market data, and manage wallets across EVM chains and Solana.

[![Version](https://img.shields.io/npm/v/@degentic/cc-trading-terminal.svg)](https://www.npmjs.com/package/@degentic/cc-trading-terminal)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What it does

Connect this server to your AI agent and it can:

- **Trade on EVM chains** — get swap quotes, execute trades, and use gasless swaps on 17 networks (Ethereum, Base, Arbitrum, Optimism, Polygon, and others)
- **Trade on Solana** — swap via Jupiter/Raydium/Meteora, place limit orders, check balances, send SOL
- **Research markets** — token prices, trending pools, OHLCV, and pool data via CoinGecko
- **Run memecoin workflows** — PumpFun trending, quick buys, launch scanning, and an optional auto-buy bot
- **Manage wallets** — generate, import, and back up multiple EVM and Solana wallets locally
- **Stream live data** — optional pipeline for ingesting and processing real-time market feeds

Your keys stay on your machine. The server signs transactions locally and never sends private keys anywhere.

## Quick start

**Install**

```bash
npm install @degentic/smart-trade-ai
```

**Add to Claude Code**

```bash
claude mcp add smart-trade-ai \
  -e USER_PRIVATE_KEY=your_evm_private_key \
  -e USER_ADDRESS=0xYourEVMWalletAddress \
  -e COINGECKO_API_KEY=your_coingecko_api_key \
  -e ALCHEMY_API_KEY=your_alchemy_api_key \
  -e SOLANA_PRIVATE_KEY=your_solana_private_key \
  -- npx cc-trading-terminal
```

**Check it’s connected**

```bash
claude mcp list
```

Run the setup wizard for sample configs and a dev `.env` template:

```bash
npm run setup
npm run setup:dev   # copies .env.example → .env for local work
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `USER_PRIVATE_KEY` | Yes | EVM wallet used to sign trades |
| `USER_ADDRESS` | Yes | EVM wallet address |
| `COINGECKO_API_KEY` | Yes | Market data (pools, prices, OHLCV) |
| `ALCHEMY_API_KEY` | No | Better RPC endpoints when available |
| `SOLANA_PRIVATE_KEY` | No | Enables Solana tools (base58, hex, or JSON array) |

Generate a new EVM wallet without leaving the terminal:

```bash
npx cc-trading-terminal --create-wallet
```

## How to use it

Once the MCP server is running, ask your agent in plain language — for example:

- “Get a swap quote for 0.1 ETH → USDC on Base.”
- “Show trending pools on Ethereum.”
- “What’s my SOL balance?”
- “Swap 1 SOL to BONK with low slippage.”

The agent picks the right tool automatically. You don’t need to memorize tool names.

Tools group roughly into: **EVM swaps & portfolio**, **CoinGecko data**, **Solana wallet & DEX**, **memecoin / PumpFun**, **wallet vault**, and **unit conversion helpers**.

## Solana CLI scripts

For quick shell workflows (no MCP required), use the scripts in `solana_commands/`:

```bash
node solana_commands/solana-balance-check.js [address] [cluster]
node solana_commands/solana-transfer.js <recipient> <amount> [cluster]
node solana_commands/solana-airdrop-request.js [amount] [cluster]   # devnet/testnet
```

Set `SOLANA_PRIVATE_KEY` in your environment or `.env` first.

## Data pipeline (optional)

The built-in pipeline pulls live market data over WebSockets, validates and normalizes it, and can store history for backtesting or monitoring. Most users only need the MCP tools; run the pipeline when you want a always-on data feed.

```bash
npm run pipeline:start
```

### Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Sources  │───▶│   Pipeline Core  │───▶│   Consumers     │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • CC Terminal   │    │ • Connection Mgr │    │ • Trading Bots  │
│ • Binance       │    │ • Queue Manager  │    │ • Risk Systems  │
│ • Coinbase      │    │ • Data Processor │    │ • Analytics     │
│ • CoinGecko     │    │ • Validator      │    │ • Monitoring    │
│ • Uniswap       │    │ • Transformer    │    │ • Historical DB │
│ • Custom APIs   │    │ • Enricher       │    │ • Dashboards    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

See `src/pipeline/examples/startDataPipeline.js` for a programmatic setup.

## Security

- Private keys and signing happen **only on your device**
- Use a dedicated trading wallet, not your main holdings
- Encrypted wallet backups use AES-256-CBC — pick a strong password
- Never commit `.env`, keys, or `wallets/` to git

## License

MIT
