# Beckn-MCP Integration: Developer Quickstart

This guide will help you quickly set up and start developing with the Beckn-MCP Integration. It covers installation, configuration, running the application, and common development workflows.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- npm (v7 or later)
- git
- A code editor (VS Code recommended)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mcp-beckn.git
cd mcp-beckn
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file and edit it with your settings:

```bash
cp .env.example .env
```

Edit the `.env` file to set your configuration:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Beckn Gateway URLs
BECKN_MOBILITY_GATEWAY=https://beckn-mobility-gateway.example.com
BECKN_RETAIL_GATEWAY=https://beckn-retail-gateway.example.com
BECKN_FOOD_GATEWAY=https://beckn-food-gateway.example.com

# Authentication (for production)
API_KEY=your_api_key_here

# Logging
LOG_LEVEL=info
```

### 4. Start the Development Server

```bash
npm run dev
```

This will start the server in development mode with hot reloading. By default, the server listens on port 3000.

## Core Components

The project is organized into the following core components:

### MCP Server

Located in `src/mcp-server`, this component handles incoming MCP protocol requests from AI assistants.

Key files:
- `src/mcp-server/index.ts`: Express server implementation

### Intent Mapper

Located in `src/intent-mapper`, this component translates natural language queries into structured intents.

Key files:
- `src/intent-mapper/index.ts`: Main intent mapping implementation

### Goose Orchestrator

Located in `src/goose-orchestrator`, this component manages the workflow for Beckn operations.

Key files:
- `src/goose-orchestrator/index.ts`: Workflow orchestration implementation

### Beckn Client

Located in `src/beckn-client`, this component handles communication with Beckn Protocol networks.

Key files:
- `src/beckn-client/index.ts`: Beckn Protocol client implementation

## API Endpoints

### MCP Endpoint

```
POST /mcp/v1
```

This endpoint accepts MCP-format requests from AI assistants. Example request:

```json
{
  "query": "Book me a ride from MG Road to the airport",
  "context": {
    "user_id": "user123",
    "conversation_id": "conv456"
  }
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "options": [
      {
        "provider": "Namma Yatri",
        "services": [
          {
            "id": "ny-auto-1",
            "name": "Auto Rickshaw",
            "price": 150,
            "currency": "INR",
            "estimatedTime": "15 min"
          }
        ]
      }
    ]
  },
  "conversation_context": {
    "transaction_id": "txn_1234567890",
    "domain": "mobility",
    "state": "search_completed"
  }
}
```

### Health Check Endpoint

```
GET /health
```

Returns a simple health status for monitoring:

```json
{
  "status": "ok"
}
```

## Development Workflows

### Adding a New Domain

To add support for a new Beckn domain (e.g., healthcare):

1. Update the IntentMapper domain detection:

```typescript
// src/intent-mapper/index.ts
private domains = {
  mobility: ['cab', 'taxi', 'ride', 'transportation'],
  retail: ['shop', 'buy', 'purchase', 'order'],
  food: ['eat', 'food', 'restaurant', 'delivery'],
  healthcare: ['doctor', 'appointment', 'medicine', 'prescription'] // New domain
};
```

2. Add parameter extraction for the new domain:

```typescript
// src/intent-mapper/index.ts
private extractHealthcareParameters(query: string): Record<string, any> {
  // Extract healthcare-specific parameters
  return {
    specialization: this.extractSpecialization(query),
    urgency: query.includes('urgent') || query.includes('emergency'),
    location: this.extractLocation(query)
  };
}

private extractSpecialization(query: string): string | undefined {
  const specializations = [
    'cardiology', 'dermatology', 'neurology', 'pediatrics',
    'orthopedics', 'gynecology', 'ophthalmology', 'dentist'
  ];
  
  for (const specialization of specializations) {
    if (query.toLowerCase().includes(specialization)) {
      return specialization;
    }
  }
  
  return undefined;
}
```

3. Update the BecknClient to support the new domain:

```typescript
// src/beckn-client/index.ts
private gatewayUrls = {
  mobility: process.env.BECKN_MOBILITY_GATEWAY || 'https://beckn-mobility-gateway.example.com',
  retail: process.env.BECKN_RETAIL_GATEWAY || 'https://beckn-retail-gateway.example.com',
  food: process.env.BECKN_FOOD_GATEWAY || 'https://beckn-food-gateway.example.com',
  healthcare: process.env.BECKN_HEALTHCARE_GATEWAY || 'https://beckn-healthcare-gateway.example.com'
};
```

4. Implement domain-specific request creation:

```typescript
// src/beckn-client/index.ts
private createSearchRequest(domain: string, parameters: any): any {
  // ...existing domain cases...
  
  case 'healthcare':
    return {
      context: {
        domain: "healthcare",
        action: "search",
        transaction_id: this.generateTransactionId()
      },
      message: {
        intent: {
          fulfillment: {
            type: parameters.urgency ? "immediate" : "appointment"
          },
          provider: {
            descriptor: {
              name: parameters.specialization ? `${parameters.specialization} specialist` : "doctor"
            }
          },
          location: {
            gps: parameters.location ? this.geocodeLocation(parameters.location) : "use_device_location"
          }
        }
      }
    };
}
```

5. Implement simulated response for the new domain:

```typescript
// src/beckn-client/index.ts
private getSimulatedSearchResponse(domain: string, parameters: any): any {
  // ...existing domain cases...
  
  case 'healthcare':
    return {
      transactionId,
      options: [
        {
          provider: "Apollo Hospitals",
          services: [
            {
              id: "apollo-doc-1",
              name: `Dr. Smith (${parameters.specialization || 'General Physician'})`,
              price: 800,
              currency: "INR",
              estimatedTime: parameters.urgency ? "Available now" : "Next available: Tomorrow 10:00 AM"
            }
          ]
        },
        {
          provider: "Practo",
          services: [
            {
              id: "practo-doc-1",
              name: `Dr. Johnson (${parameters.specialization || 'General Physician'})`,
              price: 600,
              currency: "INR",
              estimatedTime: parameters.urgency ? "Available in 1 hour" : "Next available: Today 4:00 PM"
            }
          ]
        }
      ]
    };
}
```

### Adding a New Beckn Operation

To support a new Beckn operation (e.g., cancel):

1. Update the IntentMapper operation detection:

```typescript
// src/intent-mapper/index.ts
private operations = {
  search: ['find', 'search', 'look for', 'get', 'show'],
  select: ['choose', 'select', 'pick'],
  init: ['initiate', 'start', 'begin'],
  confirm: ['confirm', 'book', 'order', 'buy'],
  cancel: ['cancel', 'abort', 'stop', 'terminate'] // New operation
};
```

2. Add a new tool in the GooseOrchestrator:

```typescript
// src/goose-orchestrator/index.ts
this.goose.registerTool({
  name: 'beckn_cancel',
  description: 'Cancel an existing order or booking',
  parameters: {
    type: 'object',
    properties: {
      domain: { type: 'string' },
      parameters: { type: 'object' }
    },
    required: ['domain', 'parameters']
  },
  execute: async (args) => {
    return await this.becknClient.cancel(args.domain, args.parameters);
  }
});
```

3. Implement the cancel method in MockGoose:

```typescript
// src/goose-orchestrator/index.ts
private async executeCancel(domain: string, parameters: any): Promise<any> {
  // Call the beckn_cancel tool
  const tool = this.tools['beckn_cancel'];
  if (!tool) {
    throw new Error('beckn_cancel tool not registered');
  }
  
  const result = await tool.execute({ domain, parameters });
  
  return {
    status: 'completed',
    results: result,
    transaction_id: result.transactionId,
    state: 'cancellation_completed'
  };
}
```

4. Implement the cancel method in the BecknClient:

```typescript
// src/beckn-client/index.ts
async cancel(domain: string, parameters: any): Promise<any> {
  console.log(`Cancelling in ${domain} domain with parameters:`, parameters);
  
  const gatewayUrl = this.gatewayUrls[domain];
  if (!gatewayUrl) {
    throw new Error(`Unsupported domain: ${domain}`);
  }
  
  // Create Beckn cancel request
  const cancelRequest = this.createCancelRequest(domain, parameters);
  
  // Simulate network latency
  await this.delay(500);
  
  // Return simulated response
  return this.getSimulatedCancelResponse(domain, parameters);
}

private createCancelRequest(domain: string, parameters: any): any {
  return {
    context: {
      domain,
      action: "cancel",
      transaction_id: parameters.transactionId
    },
    message: {
      order_id: parameters.orderId,
      cancellation_reason_id: parameters.reasonId || "user_request"
    }
  };
}

private getSimulatedCancelResponse(domain: string, parameters: any): any {
  return {
    transactionId: parameters.transactionId,
    order: {
      id: parameters.orderId,
      state: "CANCELLED",
      cancellation: {
        reason: "Cancelled by user",
        cancelled_at: new Date().toISOString()
      }
    }
  };
}
```

## Testing

### Running Tests

The project uses Jest for testing. Run tests with:

```bash
npm test
```

This will run all test files matching the pattern `*.test.ts`.

### Writing Tests

Tests are written using Jest and located in the `tests` directory. To add a new test:

1. Create a new file in the `tests` directory following the naming convention `component-name.test.ts`
2. Import the component you want to test
3. Write your tests using Jest's expect syntax

Example test file:

```typescript
// tests/beckn-client.test.ts
import { BecknClient } from '../src/beckn-client';

describe('BecknClient', () => {
  let becknClient: BecknClient;

  beforeEach(() => {
    becknClient = new BecknClient();
  });

  describe('search', () => {
    it('should return mobility options for a mobility search', async () => {
      const domain = 'mobility';
      const parameters = {
        origin: 'mg road',
        destination: 'airport'
      };

      const result = await becknClient.search(domain, parameters);

      expect(result).toBeDefined();
      expect(result.transactionId).toBeDefined();
      expect(result.options).toBeInstanceOf(Array);
      expect(result.options.length).toBeGreaterThan(0);
      expect(result.options[0].provider).toBeDefined();
      expect(result.options[0].services).toBeInstanceOf(Array);
    });
  });
});
```

### Test Coverage

The test configuration in `jest.config.js` includes coverage reporting. After running tests, a coverage report is generated in the `coverage` directory.

To view the coverage report, open `coverage/lcov-report/index.html` in a web browser.

## Continuous Integration

This project has CI set up using GitHub Actions. The workflow configuration is located in `.github/workflows/ci.yml`. The CI performs the following steps:

1. Checks out the code
2. Sets up Node.js
3. Installs dependencies
4. Builds the project
5. Runs tests

This ensures that all changes pushed to the main branch or submitted as pull requests are validated before merging.

## Adding Dependencies

To add a new dependency to the project:

```bash
npm install dependency-name --save
```

For development dependencies:

```bash
npm install dependency-name --save-dev
```

Remember to update the `package.json` file if you manually modify dependencies.

## Building for Production

To build the project for production:

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist` directory according to the configuration in `tsconfig.json`.

To start the production build:

```bash
npm start
```

## Logging

The application uses environment variables for configuring logging. Set the `LOG_LEVEL` environment variable to control log verbosity:

```
LOG_LEVEL=debug    # For detailed logs during development
LOG_LEVEL=info     # For normal operation logs
LOG_LEVEL=warn     # For warnings and errors only
LOG_LEVEL=error    # For errors only
```

## Next Steps

1. Implement a proper logging framework (e.g., Winston or Pino)
2. Add authentication middleware for securing the MCP endpoint
3. Implement error handling middleware
4. Set up Docker containerization for easy deployment
5. Implement proper configuration management
6. Add instrumentation for monitoring and metrics

For more detailed documentation and architectural information, see the [technical proposal](./technical-proposal.md) and [implementation guide](./implementation-guide.md).
