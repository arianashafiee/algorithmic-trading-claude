# Solana Slash Commands

This directory contains slash commands for interacting with the Solana blockchain through your cc-trading-terminal.

## Available Commands

### 💰 `/sol-balance` - Check SOL Balance
Check SOL balance for your wallet or any address.

```bash
node solana-balance-check.js [address] [cluster]
```

### 🚀 `/sol-transfer` - Transfer SOL
Send SOL to another address.

```bash
node solana-transfer.js <recipient> <amount> [cluster]
```

### 🪂 `/sol-airdrop` - Request Airdrop
Get free SOL on devnet/testnet.

```bash
node solana-airdrop-request.js [amount] [cluster]
```

### 📋 `/sol-account` - Account Info
Get detailed account information.

```bash
node solana-account-info.js <address> [cluster]
```

### 🔍 `/sol-tx` - Transaction Info
Check transaction status or get details.

```bash
node solana-transaction-status.js <signature> [cluster] [details]
```

### 👛 `/sol-wallet` - Wallet Info
Show your wallet address or supported clusters.

```bash
node solana-wallet-info.js [clusters]
```

## Shared Helper

`solanaCommandUtils.js` centralizes repeated command setup:

- `dotenv/config` loading
- `ToolService` creation
- default cluster constants
- argument access helpers
- reusable error handling
- reusable async command wrapper

This keeps each command focused on the specific Solana action while preserving the same command behavior.

## Setup

1. Make sure your environment is configured with `SOLANA_PRIVATE_KEY`
2. Make sure the scripts are executable or run them with `node`

## Examples

```bash
# Check your balance on devnet
node solana-balance-check.js "" devnet

# Get 2 SOL airdrop on devnet
node solana-airdrop-request.js 2 devnet

# Send 0.1 SOL to another address on devnet
node solana-transfer.js 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU 0.1 devnet

# Check your wallet address
node solana-wallet-info.js

# See supported clusters
node solana-wallet-info.js clusters
```

## Integration with Claude Code

These commands can be integrated into Claude Code as custom slash commands. Copy the `.js` files to your Claude Code slash commands directory or reference them in your Claude Code configuration.
