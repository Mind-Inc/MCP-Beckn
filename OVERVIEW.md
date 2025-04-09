# Beckn-MCP Integration: Overview

This project connects AI assistants to real-world services through Beckn Protocol networks using Anthropic's Model Context Protocol (MCP) and a pluggable orchestration framework.

## What Problem Does This Solve?

Currently, AI assistants struggle to perform real-world transactions without proprietary integrations to each service provider. This creates walled gardens and reinforces platform monopolies.

By integrating MCP with Beckn Protocol:

1. **Any** AI assistant supporting MCP can connect to **any** service on Beckn networks
2. Users can complete transactions entirely through natural language conversations
3. Service providers can reach AI users without building custom AI integrations
4. The ecosystem remains open, decentralized, and interoperable

## How It Works

![Architecture Overview](./docs/assets/beckn-mcp-architecture.png)

1. **User to AI**: The user expresses their intent in natural language
2. **AI to MCP Server**: The AI sends a structured MCP request
3. **Intent Mapping**: Natural language is converted to structured Beckn operations
4. **Orchestration**: Complex workflows are managed across multiple steps (supports multiple engines)
5. **Beckn Client**: The system communicates with appropriate Beckn networks
6. **Service Fulfillment**: Beckn networks connect with actual service providers

## Key Features

- **Multi-Domain Support**: Works with mobility, retail, food delivery, and more
- **Full Transaction Lifecycle**: Supports search, select, init, confirm operations
- **Conversation Context**: Maintains state across multi-step transactions
- **LLM-Powered Intent Mapping**: Option to use advanced NLU via LLMs
- **Modular Architecture**: Components can be replaced or upgraded independently
- **Pluggable Orchestration**: Support for different orchestration engines (Goose, MindNet, etc.)
- **Testing Tools**: MCP shell server, testing dashboard, and validation utilities

## Current Status

This project is a functional prototype demonstrating the integration concept. It includes:

- MCP server implementation with proper request/response handling
- Intent mapping for mobility, retail, and food domains
- Orchestration abstraction with pluggable engines
- Simplified Beckn client with domain-specific request generation
- Comprehensive documentation and examples
- Testing utilities and simulation tools

## Next Steps

1. **Real-world testing** with specific Beckn networks
2. **Enhanced NLU** for more sophisticated intent parsing
3. **Production deployment** with monitoring and scaling
4. **Community-driven enhancements** for additional domains
5. **Implementation of additional orchestration engines**

## Contributing

This is a community-driven initiative to connect the AI and Beckn ecosystems. Contributors of all experience levels are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details on how to get involved.

## Quick Demo

```bash
# Start the server
npm install
npm run dev

# In another terminal, test with:
curl -X POST http://localhost:3000/mcp/v1 \
  -H "Content-Type: application/json" \
  -d '{"query": "Book me a cab from MG Road to the airport", "context": {"user_id": "user123"}}'
```

## Documentation

- [Technical Proposal](./docs/technical-proposal.md): Detailed architecture and rationale
- [Implementation Guide](./docs/implementation-guide.md): Technical details for developers
- [Developer Quickstart](./docs/developer-quickstart.md): Get up and running quickly
- [MCP-Goose-Beckn Integration](./docs/mcp-goose-beckn-integration.md): How the technologies work together
- [Custom Orchestrators](./docs/custom-orchestrators.md): Creating your own orchestration engines
- [Testing with Shell Server](./docs/testing/shell-server.md): Using the MCP Shell for testing
