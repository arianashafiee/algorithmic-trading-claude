# Transfer SOL

Send SOL to another Solana address.

## Usage

```bash
/sol-transfer <recipient> <amount> [cluster]
```

## Parameters

- `recipient` (required): Recipient's Solana wallet address
- `amount` (required): Amount of SOL to transfer (e.g., 0.1, 1.5)
- `cluster` (optional): Solana cluster. Options: mainnet-beta (default), devnet, testnet

## Examples

```bash
# Send 0.1 SOL on mainnet
/sol-transfer 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU 0.1

# Send 1 SOL on devnet
/sol-transfer 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU 1 devnet
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
  const toAddress = getArg(2);
  const amount = parseFloat(getArg(3));
  const cluster = getArg(4) || DEFAULT_CLUSTER;

  if (!toAddress || !amount) {
    exitWithUsage('recipient address and amount are required');
  }

  const toolService = createToolService();
  const result = await toolService.transferSOL({ toAddress, amount, cluster });
  console.log(JSON.stringify(result, null, 2));
});
```
