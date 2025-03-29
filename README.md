# Beckn-MCP Integration

A bridge between AI systems (via the Model Context Protocol) and Beckn's interoperable transaction networks.

## Project Overview

This project implements a server that enables AI assistants to interact with real-world services through Beckn Protocol networks. It uses Model Context Protocol (MCP) to receive requests from AI models and Block's Goose framework for agent orchestration.

### Key Components

- **MCP Server**: Handles MCP protocol requests from AI systems
- **Intent Mapper**: Translates natural language intents to Beckn operations
- **Goose Orchestrator**: Manages workflows and tools
- **Beckn Client**: Interacts with Beckn networks following the protocol

## Getting Started

### Prerequisites

- Node.js (v18+)
- TypeScript
- Docker (optional, for containerized deployment)

### Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/mcp-beckn.git
cd mcp-beckn
```

2. Install dependencies
```bash
npm install
```

3. Configure environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server
```bash
npm run dev
```

## Architecture

The system follows a modular architecture with clear separation of concerns:

1. AI assistants send requests via MCP
2. Intent mapping transforms natural language to structured intents
3. Goose orchestration manages the transaction workflow
4. Beckn client handles protocol-specific operations

For more details, see the [Technical Proposal](./docs/technical-proposal.md).

## Development Roadmap

- **Phase 1**: Basic MCP server with Beckn search capabilities
- **Phase 2**: Full transaction lifecycle support (search, select, init, confirm)
- **Phase 3**: Multi-domain support and advanced NLU

## Contributing

This project is in early development and welcomes contributions. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Beckn Protocol community
- Anthropic for the Model Context Protocol
- Block for the Goose orchestration framework
