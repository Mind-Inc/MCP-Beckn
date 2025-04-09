/**
 * Main entry point for the Beckn-MCP Integration
 */

import { MCPServer } from './mcp-server';
import { KeywordIntentMapper, LLMIntentMapper, ExampleOpenAIService } from './intent-mapper';
import { OrchestratorFactory } from './orchestrator/factory';

// Choose the intent mapper based on environment
let intentMapper;

// For production, use LLM-powered intent mapping
if (process.env.USE_LLM === 'true' && process.env.OPENAI_API_KEY) {
  console.log('Using LLM-powered intent mapping');
  const llmService = new ExampleOpenAIService(process.env.OPENAI_API_KEY);
  intentMapper = new LLMIntentMapper(llmService);
} else {
  console.log('Using keyword-based intent mapping');
  intentMapper = new KeywordIntentMapper();
}

// Create orchestrator based on environment configuration
const orchestrator = OrchestratorFactory.createOrchestrator(process.env.ORCHESTRATOR_TYPE);
console.log(`Using orchestrator: ${process.env.ORCHESTRATOR_TYPE || 'goose'}`);

// Initialize the MCP server with the chosen components
const server = new MCPServer(Number(process.env.PORT) || 3000, intentMapper, orchestrator);

// Start the server
server.start();

console.log(`Beckn-MCP Integration started on port ${process.env.PORT || 3000}!`);

// For graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
