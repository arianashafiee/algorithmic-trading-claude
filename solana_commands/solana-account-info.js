#!/usr/bin/env node
// Solana Account Info Slash Command
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
    exitWithUsage(
      'account address is required',
      '/sol-account <address> [cluster]'
    );
  }

  const toolService = createToolService();

  console.log(`🔍 Checking account info for ${address} on ${cluster}...`);

  const result = await toolService.getSolanaAccountInfo({ address, cluster });

  if (result.data.exists) {
    console.log('✅ Account Found:');
    console.log(`Address: ${result.data.address}`);
    console.log(`Balance: ${result.data.lamports} lamports`);
    console.log(`Owner: ${result.data.owner}`);
    console.log(`Executable: ${result.data.executable}`);
    console.log(`Rent Epoch: ${result.data.rentEpoch}`);
    console.log(`Data Size: ${result.data.space} bytes`);
  } else {
    console.log('ℹ️ Account does not exist');
  }
});
