/**
 * Main entry point for the Beckn-MCP Integration
 */

import { MCPServer } from './mcp-server';

// Initialize the MCP server
const server = new MCPServer();

// Start the server
server.start();

console.log('Beckn-MCP Integration started!');
