#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOL_NAMES, AG_URL } from "./constants.js";
import { ToolService } from "./toolService.js";
import "dotenv/config";

const toolService = new ToolService(
  AG_URL,
  process.env.USER_PRIVATE_KEY,
  process.env.USER_ADDRESS,
  process.env.COINGECKO_API_KEY,
  process.env.ALCHEMY_API_KEY
);

const server = new Server(
  { name: "cc-trading-terminal", version: "0.2.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: TOOL_NAMES.GET_SWAP_PRICE,
      description: "Get indicative price for a token swap",
      inputSchema: {
        type: "object",
        properties: {
          chainId: { type: "integer" },
          buyToken: { type: "string" },
          sellToken: { type: "string" },
          sellAmount: { type: "string" },
        },
        required: ["chainId", "buyToken", "sellToken", "sellAmount"],
      },
    },
    {
      name: TOOL_NAMES.GET_SWAP_QUOTE,
      description: "Get executable swap quote with transaction data",
      inputSchema: {
        type: "object",
        properties: {
          chainId: { type: "integer" },
          buyToken: { type: "string" },
          sellToken: { type: "string" },
          sellAmount: { type: "string" },
          taker: { type: "string" },
        },
        required: ["chainId", "buyToken", "sellToken", "sellAmount"],
      },
    },
    {
      name: TOOL_NAMES.GET_SUPPORTED_CHAINS,
      description: "List EVM chains supported by the swap aggregator",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  let result;
  switch (name) {
    case TOOL_NAMES.GET_SWAP_PRICE:
      result = await toolService.getSwapPrice(args);
      break;
    case TOOL_NAMES.GET_SWAP_QUOTE:
      result = await toolService.getSwapQuote(args);
      break;
    case TOOL_NAMES.GET_SUPPORTED_CHAINS:
      result = await toolService.getSupportedChains();
      break;
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
