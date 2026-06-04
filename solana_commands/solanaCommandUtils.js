import "dotenv/config";
import { ToolService } from '../src/toolService.js';
import { AG_URL } from '../src/constants.js';

export const DEFAULT_CLUSTER = 'mainnet-beta';
export const DEFAULT_AIRDROP_CLUSTER = 'devnet';

export function createToolService() {
  return new ToolService(
    AG_URL,
    process.env.USER_PRIVATE_KEY,
    process.env.USER_ADDRESS,
    process.env.COINGECKO_API_KEY,
    process.env.ALCHEMY_API_KEY,
    process.env.SOLANA_PRIVATE_KEY
  );
}

export function getArg(index) {
  return process.argv[index];
}

export function parseOptionalAmount(value, fallback = 1) {
  return parseFloat(value) || fallback;
}

export function exitWithUsage(message, usage, helpText) {
  console.error(`❌ Error: ${message}`);

  if (usage) {
    console.log(`Usage: ${usage}`);
  }

  if (helpText) {
    console.log(helpText);
  }

  process.exit(1);
}

export async function runCommand(command) {
  try {
    await command();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
