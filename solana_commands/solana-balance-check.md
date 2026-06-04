# Check Solana Balance

Check SOL balance for your wallet or any Solana address.

## Usage

```bash
/sol-balance [address] [cluster]
```

## Parameters

- `address` (optional): Solana wallet address to check. If not provided, uses your configured wallet.
- `cluster` (optional): Solana cluster to query. Options: mainnet-beta (default), devnet, testnet

## Examples

```bash
# Check your own wallet balance on mainnet
/sol-balance

# Check your wallet balance on devnet
/sol-balance "" devnet

# Check specific address on mainnet
/sol-balance 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

# Check specific address on devnet
/sol-balance 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU devnet
```

## Implementation

```javascript
import {
  DEFAULT_CLUSTER,
  createToolService,
  getArg,
  runCommand,
} from './solanaCommandUtils.js';

runCommand(async () => {
  const address = getArg(2);
  const cluster = getArg(3) || DEFAULT_CLUSTER;
  const toolService = createToolService();

  const result = await toolService.getSolanaBalance({ address, cluster });
  console.log(JSON.stringify(result, null, 2));
});
```
