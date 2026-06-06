# Solana Account Info

Get detailed information about a Solana account.

## Usage

```bash
/sol-account <address> [cluster]
```

## Parameters

- `address` (required): Solana account address to query
- `cluster` (optional): Solana cluster. Options: mainnet-beta (default), devnet, testnet

## Examples

```bash
# Check account info on mainnet
/sol-account 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

# Check account info on devnet
/sol-account 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU devnet
```

## Implementation

```javascript
import {
  DEFAULT_CLUSTER,
  createToolService,
  exitWithUsage,
  getArg,
  runCommand,
} from './solanaCommandUtils.js';

runCommand(async () => {
  const address = getArg(2);
  const cluster = getArg(3) || DEFAULT_CLUSTER;

  if (!address) {
    exitWithUsage('account address is required');
  }

  const toolService = createToolService();
  const result = await toolService.getSolanaAccountInfo({ address, cluster });
  console.log(JSON.stringify(result, null, 2));
});
```
