# Solana Wallet Info

Display your configured Solana wallet address and supported clusters.

## Usage

```bash
/sol-wallet [info]
```

## Parameters

- `info` (optional): Set to "clusters" to show supported clusters instead of wallet address

## Examples

```bash
# Show wallet address
/sol-wallet

# Show supported clusters
/sol-wallet clusters
```

## Implementation

```javascript
import {
  createToolService,
  getArg,
  runCommand,
} from './solanaCommandUtils.js';

runCommand(async () => {
  const showInfo = getArg(2);
  const toolService = createToolService();

  const result = showInfo === 'clusters'
    ? await toolService.getSolanaSupportedClusters()
    : toolService.getSolanaWalletAddress();

  console.log(JSON.stringify(result, null, 2));
});
```
