#!/usr/bin/env node
// Solana Balance Slash Command
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

  console.log(`🔍 Checking SOL balance${address ? ` for ${address}` : ''} on ${cluster}...`);

  const result = await toolService.getSolanaBalance({ address, cluster });

  console.log('✅ Balance Retrieved:');
  console.log(`Address: ${result.data.address}`);
  console.log(`Balance: ${result.data.balanceSOL} SOL`);
  console.log(`Lamports: ${result.data.balance}`);
  console.log(`Cluster: ${result.data.cluster}`);
});
