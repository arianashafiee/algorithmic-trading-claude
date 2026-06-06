#!/usr/bin/env node
// Solana Airdrop Slash Command
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
    exitWithUsage(
      'Airdrop not available on mainnet-beta',
      null,
      'Use devnet or testnet for airdrops'
    );
  }

  const toolService = createToolService();

  console.log(`🪂 Requesting ${amount} SOL airdrop on ${cluster}...`);

  const result = await toolService.airdropSOL({ amount, cluster });

  console.log('✅ Airdrop Completed:');
  console.log(`Address: ${result.data.address}`);
  console.log(`Amount: ${result.data.amount} SOL`);
  console.log(`Transaction: ${result.data.signature}`);
  console.log(`Status: ${result.data.status}`);
});
