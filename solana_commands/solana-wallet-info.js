#!/usr/bin/env node
// Solana Wallet Info Slash Command
import {
  createToolService,
  getArg,
  runCommand,
} from './solanaCommandUtils.js';

function printSupportedClusters(clusters) {
  console.log('🌐 Supported Solana Clusters:');
  clusters.forEach((cluster) => {
    console.log(`  • ${cluster}`);
  });
}

function printWalletAddress(result) {
  console.log('👛 Solana Wallet Info:');

  if (result.data && result.data.address) {
    console.log(`Address: ${result.data.address}`);
    console.log('✅ Wallet configured and ready');
  } else {
    console.log('❌ No Solana wallet configured');
    console.log('Set SOLANA_PRIVATE_KEY environment variable to enable Solana functions');
  }
}

runCommand(async () => {
  const showInfo = getArg(2);
  const toolService = createToolService();

  if (showInfo === 'clusters') {
    const result = await toolService.getSolanaSupportedClusters();
    printSupportedClusters(result.data.clusters);
    return;
  }

  const result = toolService.getSolanaWalletAddress();
  printWalletAddress(result);
});
