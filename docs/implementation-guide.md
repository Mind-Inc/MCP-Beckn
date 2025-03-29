# Beckn-MCP Integration: Implementation Guide

## Overview

This implementation guide provides practical details on how the Beckn-MCP integration works, its current status, and how to extend it for production use. The integration creates a bridge between AI systems (via Model Context Protocol) and real-world services (via Beckn Protocol).

## System Architecture

![Architecture Diagram](./assets/beckn-mcp-architecture.png)

The system follows a layered architecture:

1. **MCP Server** - Receives requests from AI assistants using the Model Context Protocol
2. **Intent Mapper** - Translates natural language intents into structured Beckn operations
3. **Goose Orchestrator** - Manages workflows and tool execution
4. **Beckn Client** - Interacts with Beckn networks following the protocol specification

## Current Implementation Status

The current implementation provides a functional prototype with the following components:

### MCP Server
- Express-based server that handles MCP protocol requests
- Basic error handling and health check endpoints
- Request validation and context preservation

### Intent Mapper
- Domain detection for mobility, retail, and food domains
- Operation detection (search, select, init, confirm)
- Parameter extraction using simplified NLP techniques
- Structured intent generation

### Goose Orchestrator
- Mock implementation of Block's Goose framework
- Tool registration for Beckn operations
- Workflow execution based on intent types
- Support for search, select, init, and confirm operations

### Beckn Client
- Gateway URL management for different domains
- Request generation for Beckn protocol operations
- Simulated responses for testing purposes
- Domain-specific request and response handling

## Key Integration Points

### 1. MCP Protocol Integration

The integration with Model Context Protocol follows this pattern:

```
AI Assistant                      MCP Server
     |                                |
     | MCP Request with user query    |
     |------------------------------->|
     |                                | Intent Mapping
     |                                | Workflow Orchestration
     |                                | Beckn Protocol interaction
     | MCP Response with results      |
     |<-------------------------------|
     |                                |
```

Example MCP request:
```json
{
  "query": "Book me a ride from MG Road to the airport",
  "context": {
    "user_id": "user123",
    "conversation_id": "conv456",
    "previous_context": {}
  }
}
```

Example MCP response:
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
      },
      {
        "provider": "Uber",
        "services": [
          {
            "id": "uber-go-1",
            "name": "Uber Go",
            "price": 250,
            "currency": "INR",
            "estimatedTime": "12 min"
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

### 2. Intent Mapping

The Intent Mapper translates natural language queries into structured Beckn intents:

```typescript
// Example of translated intent
{
  domain: "mobility",
  operation: "search",
  parameters: {
    destination: "airport",
    origin: "mg road",
    time: "in 30 minutes"
  },
  context: {
    // Preserved context from MCP request
  }
}
```

### 3. Goose Orchestration

The Goose Orchestrator manages the workflow for Beckn operations:

```
Intent --> Workflow Selection --> Tool Execution --> Result Processing
```

Each Beckn operation (search, select, init, confirm) is registered as a tool that the orchestrator can execute.

### 4. Beckn Protocol Integration

The Beckn Client handles the creation of protocol-compliant requests:

```json
// Example Beckn search request
{
  "context": {
    "domain": "mobility",
    "action": "search",
    "transaction_id": "txn_1234567890"
  },
  "message": {
    "intent": {
      "fulfillment": {
        "start": {
          "location": {
            "gps": "12.9758,77.6096"
          }
        },
        "end": {
          "location": {
            "gps": "12.9499,77.6681"
          }
        }
      }
    }
  }
}
```

## Production Considerations

While the current implementation provides a functional prototype, several enhancements would be needed for a production-ready system:

### 1. Advanced Natural Language Understanding

Replace the simplified intent mapping with more sophisticated NLU:

```typescript
// Example of LLM-based intent mapping
async mapQueryToIntent(query: string, context: any): Promise<Intent | null> {
  // Use LLM to parse the query
  const response = await this.llmClient.complete({
    prompt: `
      Parse the following user query into a structured intent:
      Query: "${query}"
      
      Output the result as a JSON object with:
      - domain (mobility, retail, food)
      - operation (search, select, init, confirm)
      - parameters (object with domain-specific parameters)
    `,
    max_tokens: 200,
    temperature: 0.1
  });
  
  // Parse the LLM response into a structured intent
  const parsedIntent = JSON.parse(response.text);
  
  return {
    ...parsedIntent,
    context
  };
}
```

### 2. Real Goose Integration

Implement the actual Goose framework from Block:

```typescript
import { Goose, Tool, Workflow } from '@block/goose';

export class GooseOrchestrator {
  private goose: Goose;
  
  constructor() {
    this.goose = new Goose();
    this.registerTools();
  }
  
  // Register tools and implement workflows using the actual Goose API
}
```

### 3. Real Beckn Protocol Communication

Implement actual HTTP requests to Beckn gateways:

```typescript
async search(domain: string, parameters: any): Promise<any> {
  const gatewayUrl = this.gatewayUrls[domain];
  if (!gatewayUrl) {
    throw new Error(`Unsupported domain: ${domain}`);
  }
  
  // Create Beckn search request
  const searchRequest = this.createSearchRequest(domain, parameters);
  
  // Send actual HTTP request to Beckn gateway
  const response = await fetch(`${gatewayUrl}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken(domain)}`
    },
    body: JSON.stringify(searchRequest)
  });
  
  if (!response.ok) {
    throw new Error(`Beckn search failed: ${response.statusText}`);
  }
  
  const searchResults = await response.json();
  return this.processSearchResults(searchResults);
}
```

### 4. Multi-Step Conversation Management

Implement comprehensive conversation state management for multi-step transactions:

```typescript
// Example conversation state management
class ConversationManager {
  private conversations = new Map<string, ConversationState>();
  
  getConversation(id: string): ConversationState | undefined {
    return this.conversations.get(id);
  }
  
  updateConversation(id: string, updates: Partial<ConversationState>): void {
    const existing = this.conversations.get(id) || {};
    this.conversations.set(id, { ...existing, ...updates });
  }
  
  // Additional methods for conversation lifecycle management
}

interface ConversationState {
  domainContext: string;
  currentOperation: string;
  transactionId?: string;
  selectedItems?: any[];
  paymentDetails?: any;
  fulfillmentDetails?: any;
}
```

### 5. Error Handling and Reliability

Implement robust error handling and retries:

```typescript
async executeWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: Error;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;
      
      if (attempt < retries) {
        // Exponential backoff with jitter
        const delay = Math.min(100 * Math.pow(2, attempt) + Math.random() * 100, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
```

## Extending the Integration

### Supporting New Domains

To extend the integration for a new Beckn domain:

1. Update the IntentMapper to detect the new domain:
```typescript
private domains = {
  mobility: ['cab', 'taxi', 'ride', 'transportation'],
  retail: ['shop', 'buy', 'purchase', 'order'],
  food: ['eat', 'food', 'restaurant', 'delivery'],
  healthcare: ['doctor', 'appointment', 'medicine', 'prescription'] // New domain
};
```

2. Implement parameter extraction for the new domain:
```typescript
private extractHealthcareParameters(query: string): Record<string, any> {
  // Extract relevant parameters for healthcare domain
  const doctorMatch = query.match(/(doctor|specialist|appointment)\s+for\s+([a-z\s]+)/i);
  
  return {
    specialization: doctorMatch ? doctorMatch[2].trim() : undefined,
    urgency: query.includes('urgent') || query.includes('emergency'),
    location: this.extractLocation(query)
  };
}
```

3. Update the BecknClient to support the new domain:
```typescript
private gatewayUrls = {
  mobility: 'https://beckn-mobility-gateway.example.com',
  retail: 'https://beckn-retail-gateway.example.com',
  food: 'https://beckn-food-gateway.example.com',
  healthcare: 'https://beckn-healthcare-gateway.example.com' // New domain
};

// Implement domain-specific request creation and response processing
```

### Implementing New Beckn Operations

To support additional Beckn Protocol operations beyond the core SRPC (search, select, init, confirm):

1. Add new tools to the GooseOrchestrator:
```typescript
this.goose.registerTool({
  name: 'beckn_status',
  description: 'Check the status of an ongoing transaction',
  parameters: {
    type: 'object',
    properties: {
      domain: { type: 'string' },
      parameters: { type: 'object' }
    },
    required: ['domain', 'parameters']
  },
  execute: async (args) => {
    return await this.becknClient.status(args.domain, args.parameters);
  }
});
```

2. Implement the corresponding methods in the BecknClient:
```typescript
async status(domain: string, parameters: any): Promise<any> {
  const gatewayUrl = this.gatewayUrls[domain];
  if (!gatewayUrl) {
    throw new Error(`Unsupported domain: ${domain}`);
  }
  
  // Create and send status request
  const statusRequest = this.createStatusRequest(domain, parameters);
  
  // Process and return results
}

private createStatusRequest(domain: string, parameters: any): any {
  return {
    context: {
      domain,
      action: "status",
      transaction_id: parameters.transactionId
    },
    message: {
      order_id: parameters.orderId
    }
  };
}
```

### Enhancing the MCP Integration

To support more sophisticated interactions with AI assistants:

1. Implement structured responses with rich formatting:
```typescript
return res.status(200).json({
  status: 'success',
  data: {
    message: "I found several ride options for you.",
    structured_content: {
      type: "ride_options",
      options: result.options.map(option => ({
        provider: option.provider,
        services: option.services.map(service => ({
          id: service.id,
          name: service.name,
          price: `${service.currency} ${service.price}`,
          eta: service.estimatedTime,
          icon_url: this.getProviderIcon(option.provider)
        }))
      }))
    },
    suggested_replies: [
      "Book the cheapest option",
      "Book the fastest option",
      "Show more details"
    ]
  },
  conversation_context: {
    transaction_id: result.transaction_id,
    domain: intent.domain,
    state: result.state,
    options: result.options
  }
});
```

2. Support for asynchronous operations:
```typescript
// Initial response
res.status(202).json({
  status: 'processing',
  request_id: requestId,
  message: "I'm searching for available services. This may take a moment.",
  poll_url: `/mcp/v1/status/${requestId}`
});

// Process the request asynchronously
this.processAsyncRequest(requestId, intent)
  .catch(error => {
    console.error(`Async processing error for ${requestId}:`, error);
  });
```

## Deployment Considerations

For deploying this integration in production:

1. **Infrastructure**
   - Deploy behind an API gateway for rate limiting and security
   - Use containerization (Docker) for easy scaling
   - Implement health checks and monitoring

2. **Scaling**
   - Use a load balancer for horizontal scaling
   - Implement caching for frequent queries
   - Consider serverless deployment for cost efficiency

3. **Security**
   - Implement authentication for MCP endpoints
   - Use HTTPS for all communications
   - Validate and sanitize all inputs
   - Implement rate limiting to prevent abuse

4. **Monitoring**
   - Track request success rates and latencies
   - Monitor transaction completion rates
   - Implement logging for debugging and auditing
   - Set up alerts for critical failures

## Conclusion

This implementation guide provides a roadmap for developing a production-ready Beckn-MCP integration. By following these guidelines and extending the current prototype, you can create a robust bridge between AI assistants and real-world services through the Beckn Protocol.

The integration enables a new paradigm of AI-powered commerce while preserving the open, decentralized nature of the Beckn ecosystem. This approach prevents the creation of new gatekeepers while democratizing access to services through conversational AI interfaces.

## Next Steps

1. Enhance the Intent Mapper with LLM-based natural language understanding
2. Integrate with the actual Goose framework from Block
3. Implement real Beckn Protocol communication with network gateways
4. Develop conversation state management for multi-step transactions
5. Add comprehensive error handling and reliability features
6. Create a reference implementation for one domain (e.g., mobility)
7. Extend to additional domains and operations
