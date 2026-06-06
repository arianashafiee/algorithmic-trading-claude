# SOL Airdrop

Request SOL airdrop on devnet or testnet for testing purposes.

## Usage

```bash
/sol-airdrop [amount] [cluster]
```

## Parameters

- `amount` (optional): Amount of SOL to airdrop. Default: 1
- `cluster` (optional): Solana cluster. Options: devnet (default), testnet. Note: mainnet airdrops not available.

## Examples

```bash
# Request 1 SOL on devnet
/sol-airdrop

# Request 2 SOL on devnet
/sol-airdrop 2

# Request 1 SOL on testnet
/sol-airdrop 1 testnet
```

## Implementation

```javascript
import {
  DEFAULT_AIRDROP_CLUSTER,
  createToolService,
  exitWithUsage,
  getArg,
  parseOptionalAmount,
  runCommand,
} from './solanaCommandUtils.js';

runCommand(async () => {
  const amount = parseOptionalAmount(getArg(2));
  const cluster = getArg(3) || DEFAULT_AIRDROP_CLUSTER;

  if (cluster === 'mainnet-beta') {
    exitWithUsage('Airdrop not available on mainnet-beta');
  }

  const toolService = createToolService();
  const result = await toolService.airdropSOL({ amount, cluster });
  console.log(JSON.stringify(result, null, 2));
});
```
