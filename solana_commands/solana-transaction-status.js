#!/usr/bin/env node
// Solana Transaction Slash Command
import {
  DEFAULT_CLUSTER,
  createToolService,
  exitWithUsage,
  getArg,
  runCommand,
} from './solanaCommandUtils.js';

function printTransactionDetails(data) {
  console.log('✅ Transaction Details:');
  console.log(`Signature: ${data.signature}`);
  console.log(`Slot: ${data.slot}`);
  console.log(`Block Time: ${data.blockTime ? new Date(data.blockTime * 1000).toISOString() : 'Unknown'}`);
  console.log(`Success: ${data.success}`);
  console.log(`Fee: ${data.fee} lamports`);

  if (data.error) {
    console.log(`Error: ${data.error}`);
  }
}

function printTransactionStatus(data) {
  console.log('✅ Transaction Status:');
  console.log(`Signature: ${data.signature}`);
  console.log(`Status: ${data.status}`);

  if (data.confirmations) {
    console.log(`Confirmations: ${data.confirmations}`);
  }

  if (data.error) {
    console.log(`Error: ${data.error}`);
  }
}

runCommand(async () => {
  const signature = getArg(2);
  const cluster = getArg(3) || DEFAULT_CLUSTER;
  const showDetails = getArg(4) === 'true';

  if (!signature) {
    exitWithUsage(
      'transaction signature is required',
      '/sol-tx <signature> [cluster] [details]'
    );
  }

  const toolService = createToolService();

  console.log(`🔍 Checking transaction ${signature} on ${cluster}...`);

  const result = showDetails
    ? await toolService.getSolanaTransactionDetails({ signature, cluster })
    : await toolService.getSolanaTransactionStatus({ signature, cluster });

  if (showDetails && result.data.found) {
    printTransactionDetails(result.data);
  } else if (!showDetails) {
    printTransactionStatus(result.data);
  } else {
    console.log('❌ Transaction not found');
  }
});
