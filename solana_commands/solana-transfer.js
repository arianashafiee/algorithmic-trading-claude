#!/usr/bin/env node
// Solana Transfer Slash Command
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
    exitWithUsage(
      'recipient address and amount are required',
      '/sol-transfer <recipient> <amount> [cluster]'
    );
  }

  const toolService = createToolService();

  console.log(`🚀 Sending ${amount} SOL to ${toAddress} on ${cluster}...`);

  const result = await toolService.transferSOL({ toAddress, amount, cluster });

  console.log('✅ Transfer Completed:');
  console.log(`From: ${result.data.from}`);
  console.log(`To: ${result.data.to}`);
  console.log(`Amount: ${result.data.amount} SOL`);
  console.log(`Transaction: ${result.data.signature}`);
  console.log(`Status: ${result.data.status}`);
});
