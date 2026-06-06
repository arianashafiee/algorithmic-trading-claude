# Solana Transaction Info

Get status and details of a Solana transaction.

## Usage

```bash
/sol-tx <signature> [cluster] [details]
```

## Parameters

- `signature` (required): Transaction signature to query
- `cluster` (optional): Solana cluster. Options: mainnet-beta (default), devnet, testnet
- `details` (optional): Set to "true" for detailed transaction info, otherwise shows status only

## Examples

```bash
# Check transaction status on mainnet
/sol-tx 2ZE7dhzJTmNw1zc8Cx2ykfMAuNQ4KykGvUhKqPnwzKD3F4v2FeVCYngKfpPTHdNfmJzEgJzZVCxhd2KqgHvDnhko

# Check detailed transaction info on devnet
/sol-tx 2ZE7dhzJTmNw1zc8Cx2ykfMAuNQ4KykGvUhKqPnwzKD3F4v2FeVCYngKfpPTHdNfmJzEgJzZVCxhd2KqgHvDnhko devnet true
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
  const signature = getArg(2);
  const cluster = getArg(3) || DEFAULT_CLUSTER;
  const showDetails = getArg(4) === 'true';

  if (!signature) {
    exitWithUsage('transaction signature is required');
  }

  const toolService = createToolService();
  const result = showDetails
    ? await toolService.getSolanaTransactionDetails({ signature, cluster })
    : await toolService.getSolanaTransactionStatus({ signature, cluster });

  console.log(JSON.stringify(result, null, 2));
});
```
