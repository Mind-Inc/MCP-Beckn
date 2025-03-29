# Beckn-MCP Integration: Technical Architecture Proposal

## Introduction

This document outlines a technical architecture for integrating Beckn Protocol with AI systems via the Model Context Protocol (MCP) and Block's Goose orchestration framework. The goal is to enable AI agents to interact seamlessly with real-world services through Beckn's open interoperable networks.

## Architecture Overview

![Architecture Diagram](./assets/beckn-mcp-architecture.png)

### Core Components

1. **MCP Server**
   - Receives requests from LLMs using the Model Context Protocol
   - Parses user intent and validates request structure
   - Routes requests to appropriate processing components

2. **Intent Mapping Engine**
   - Transforms natural language intents into structured Beckn operations
   - Extracts key parameters (locations, quantities, preferences)
   - Maintains conversation context across interactions

3. **Goose Orchestration Layer**
   - Manages the workflow between components
   - Handles tool routing and execution
   - Maintains state throughout the transaction lifecycle

4. **Beckn Protocol Client**
   - Implements the full Beckn transaction lifecycle
   - Discovers and communicates with BAPs/BPPs
   - Transforms Beckn responses for AI consumption

### Data Flow

1. User expresses intent to an AI assistant ("Book me a cab to the airport")
2. AI sends an MCP request to the MCP Server
3. Intent Mapper identifies this as a mobility request and extracts parameters
4. Goose orchestrates the workflow:
   - Initiates Beckn search request to relevant mobility networks
   - Presents options back to the AI
   - Handles selection and confirmation
5. Transaction details flow back to the AI for presentation to the user
6. Status updates continue via webhook or polling

## Implementation Approach

### MCP Server Implementation

```typescript
// Example MCP Server route for handling AI requests
import express from 'express';
import { IntentMapper } from './intentMapper';
import { GooseOrchestrator } from './gooseOrchestrator';

const app = express();
app.use(express.json());

app.post('/mcp/v1', async (req, res) => {
  try {
    // Extract the user query from MCP request
    const { query, context } = req.body;
    
    // Map the query to a Beckn intent
    const intentMapper = new IntentMapper();
    const intent = await intentMapper.mapQueryToIntent(query, context);
    
    if (!intent) {
      return res.status(400).json({
        status: 'error',
        message: 'Could not map query to a Beckn intent'
      });
    }
    
    // Use Goose to orchestrate the workflow
    const orchestrator = new GooseOrchestrator();
    const result = await orchestrator.execute(intent);
    
    // Return result in MCP-compatible format
    return res.status(200).json({
      status: 'success',
      data: result,
      conversation_context: {
        transaction_id: result.transaction_id,
        domain: intent.domain,
        state: result.state
      }
    });
  } catch (error) {
    console.error('Error processing MCP request:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('MCP Server listening on port 3000');
});
```

### Intent Mapping Engine

```typescript
// Example Intent Mapper implementation
export class IntentMapper {
  private domains = {
    mobility: ['cab', 'taxi', 'ride', 'transportation', 'drive'],
    retail: ['shop', 'buy', 'purchase', 'order'],
    food: ['eat', 'food', 'restaurant', 'delivery']
  };

  async mapQueryToIntent(query: string, context: any): Promise<any> {
    // Simplified domain detection - production would use NLU/LLM
    const domain = this.detectDomain(query.toLowerCase());
    
    if (!domain) {
      return null;
    }
    
    // Extract parameters based on domain
    const params = await this.extractParameters(query, domain);
    
    return {
      domain,
      operation: 'search', // Default operation, would be refined in production
      parameters: params,
      context
    };
  }

  private detectDomain(query: string): string | null {
    for (const [domain, keywords] of Object.entries(this.domains)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return domain;
      }
    }
    return null;
  }

  private async extractParameters(query: string, domain: string): Promise<any> {
    // In production, this would be a sophisticated NLU component
    // Simplified example for mobility domain
    if (domain === 'mobility') {
      // Extract origin and destination (simplified)
      const toMatch = query.match(/to\s+([a-z\s]+)/i);
      const fromMatch = query.match(/from\s+([a-z\s]+)/i);
      
      return {
        destination: toMatch ? toMatch[1].trim() : undefined,
        origin: fromMatch ? fromMatch[1].trim() : 'current location'
      };
    }
    
    return {};
  }
}
```

### Goose Orchestration Integration

```typescript
// Example Goose Orchestrator implementation
import { Goose, Tool } from '@block/goose';
import { BecknClient } from './becknClient';

export class GooseOrchestrator {
  private goose: Goose;
  private becknClient: BecknClient;

  constructor() {
    this.goose = new Goose();
    this.becknClient = new BecknClient();
    this.registerTools();
  }

  private registerTools() {
    // Register Beckn-related tools
    this.goose.registerTool(
      new Tool({
        name: 'beckn_search',
        description: 'Search for services in the Beckn network',
        parameters: {
          type: 'object',
          properties: {
            domain: { type: 'string' },
            parameters: { type: 'object' }
          },
          required: ['domain', 'parameters']
        },
        execute: async (args) => {
          return await this.becknClient.search(args.domain, args.parameters);
        }
      })
    );

    // Additional tools for select, init, confirm, etc.
    // ...
  }

  async execute(intent: any): Promise<any> {
    // Create a workflow based on the intent
    const workflow = this.createWorkflow(intent);
    
    // Execute the workflow
    return await this.goose.execute(workflow, {
      intent,
      history: []
    });
  }

  private createWorkflow(intent: any) {
    // Create a dynamic workflow based on the intent
    // This is a simplified example
    return `
      async function workflow(context) {
        // Search phase
        const searchResults = await tools.beckn_search({
          domain: "${intent.domain}",
          parameters: ${JSON.stringify(intent.parameters)}
        });
        
        // Here we would handle selection, confirmation, etc.
        // based on the search results
        
        return {
          status: "completed",
          results: searchResults,
          transaction_id: searchResults.transactionId,
          state: "search_completed"
        };
      }
    `;
  }
}
```

### Beckn Client Implementation

```typescript
// Example Beckn Client implementation
export class BecknClient {
  private gatewayUrls = {
    mobility: 'https://beckn-mobility-gateway.example.com',
    retail: 'https://beckn-retail-gateway.example.com',
    food: 'https://beckn-food-gateway.example.com'
  };

  async search(domain: string, parameters: any): Promise<any> {
    const gatewayUrl = this.gatewayUrls[domain];
    if (!gatewayUrl) {
      throw new Error(`Unsupported domain: ${domain}`);
    }
    
    // Create Beckn search request
    const searchRequest = this.createSearchRequest(domain, parameters);
    
    // Send request to Beckn gateway
    const response = await fetch(`${gatewayUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchRequest)
    });
    
    if (!response.ok) {
      throw new Error(`Beckn search failed: ${response.statusText}`);
    }
    
    // Process and return results
    const searchResults = await response.json();
    return this.processSearchResults(searchResults);
  }

  private createSearchRequest(domain: string, parameters: any): any {
    // Create a domain-specific Beckn search request
    // This is a simplified example for mobility
    if (domain === 'mobility') {
      return {
        context: {
          domain: "mobility",
          action: "search",
          transaction_id: this.generateTransactionId()
        },
        message: {
          intent: {
            fulfillment: {
              start: {
                location: {
                  gps: parameters.origin === 'current location' 
                    ? "use_device_location" 
                    : this.geocodeLocation(parameters.origin)
                }
              },
              end: {
                location: {
                  gps: this.geocodeLocation(parameters.destination)
                }
              }
            }
          }
        }
      };
    }
    
    throw new Error(`Unsupported domain for search: ${domain}`);
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  private geocodeLocation(locationText: string): string {
    // In production, this would call a geocoding service
    // Returning dummy coordinates for this example
    return "12.9716,77.5946"; // Example coordinates for Bangalore
  }

  private processSearchResults(results: any): any {
    // Process and transform Beckn search results for AI consumption
    // This would be more sophisticated in production
    return {
      transactionId: results.context.transaction_id,
      options: results.message.catalog.providers.map(provider => ({
        provider: provider.descriptor.name,
        services: provider.items.map(item => ({
          id: item.id,
          name: item.descriptor.name,
          price: item.price.value,
          currency: item.price.currency,
          estimatedTime: item.fulfillment.duration
        }))
      }))
    };
  }

  // Additional methods for select, init, confirm, etc.
  // ...
}
```

## Benefits & Use Cases

### Immediate Benefits

1. **Democratized AI Access to Services**
   - Any AI system can connect to real-world services without proprietary integrations
   - Reduces integration costs and time-to-market for AI applications

2. **Decentralized Commerce for AI**
   - Prevents creation of AI gatekeepers through open networks
   - Enables direct provider-consumer connections via AI intermediaries

3. **Enhanced User Experience**
   - Seamless transactions within conversational interfaces
   - End-to-end fulfillment without platform switching

### Example Use Cases

1. **Mobility**
   ```
   User: "I need a cab from MG Road to the airport in 30 minutes"
   AI: [Uses MCP+Beckn to search, display options, book ride]
   "I've booked you an Uber, arriving in 5 minutes. Fare estimate: ₹450."
   ```

2. **Retail**
   ```
   User: "Find me the best deal on iPhone 15 with delivery by tomorrow"
   AI: [Uses MCP+Beckn to search across retail networks]
   "I found the iPhone 15 at these stores with next-day delivery..."
   ```

3. **Food Delivery**
   ```
   User: "Order my usual from Pizza Hut"
   AI: [Uses MCP+Beckn + user context to place order]
   "Your order (1 large pepperoni pizza and garlic bread) has been placed with Pizza Hut. Estimated delivery: 35 minutes."
   ```

## Implementation Roadmap

### Phase 1: Proof of Concept (1-2 months)
- Basic MCP server implementation
- Simplified intent mapping for one domain (mobility)
- Integration with one Beckn network
- End-to-end demonstration with basic flows

### Phase 2: MVP (3-4 months)
- Expanded domain support (mobility, retail, food)
- Full Goose orchestration implementation
- Comprehensive error handling
- Basic monitoring and logging

### Phase 3: Production (6+ months)
- Advanced NLU for intent and parameter extraction
- Multi-provider support within domains
- Status tracking and notifications
- Security hardening and compliance

## Getting Involved

This project is in the conceptual stage and presents an opportunity for collaborative development within the Beckn community. If you're interested in contributing:

1. **Technical Contributions**
   - Backend development (MCP Server, Goose integration)
   - Beckn protocol expertise
   - NLU/intent mapping experience
   - Infrastructure and deployment

2. **Domain Expertise**
   - Domain-specific knowledge (mobility, retail, etc.)
   - Testing and validation
   - Documentation and specifications

3. **Use Case Development**
   - Identifying high-value use cases
   - Defining user journeys
   - Success metrics and validation

## Next Steps

1. Form a working group of interested contributors
2. Refine the architecture and technical specifications
3. Develop a detailed implementation plan
4. Create a proof-of-concept implementation
5. Demonstrate with real-world transactions

## Contact

If you're interested in collaborating on this initiative, please contact [your contact information] to join the discussion.

---

This proposal represents an opportunity for the Beckn community to take a leadership role in shaping how AI systems interact with open commerce networks, potentially establishing a reference implementation that could influence the broader ecosystem.
