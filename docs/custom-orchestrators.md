# Creating Custom Orchestrators

This guide explains how to develop and integrate your own orchestration engine with the MCP-Beckn bridge.

## What is an Orchestrator?

In the MCP-Beckn architecture, an orchestrator is responsible for:

1. Processing structured intents from the Intent Mapper
2. Executing the appropriate workflows for each intent
3. Coordinating with the Beckn Client to perform operations
4. Returning results in a consistent format

## Ways to Create Custom Orchestrators

There are several ways to create and use your own orchestrator:

### Method 1: Using the Generator Script (Recommended)

The fastest way to get started is to use our generator script:

```bash
node scripts/create-orchestrator.js MyOrchestrator
```

This will:
- Create a new adapter file in `src/orchestrator/adapters/my-orchestrator-adapter.ts`
- Update the factory to include your orchestrator
- Update the .env.example file with your orchestrator option

All you need to do is implement the `execute` method in your adapter class.

### Method 2: Runtime Registration (Most Flexible)

You can register your orchestrator at runtime without modifying the core files:

```typescript
import { OrchestratorFactory } from './src/orchestrator';
import { MyOrchestrator } from './my-orchestrator';

// Register your orchestrator
OrchestratorFactory.registerOrchestrator('my-orchestrator', () => new MyOrchestrator());

// Now you can use it by setting ORCHESTRATOR_TYPE=my-orchestrator
```

This approach is great for:
- Plugins and extensions
- Testing different orchestrators
- Dynamic orchestrator selection based on conditions

### Method 3: Manual Integration (Most Control)

You can manually integrate your orchestrator by:

1. Creating an adapter class that implements the `Orchestrator` interface
2. Adding your adapter to the factory
3. Updating the environment configuration

## Orchestrator Interface

All orchestrators must implement this interface:

```typescript
interface Orchestrator {
  execute(intent: Intent): Promise<{
    status: string;
    results: any;
    transaction_id: string;
    state: string;
    [key: string]: any;
  }>;
}
```

## Example: Simple Custom Orchestrator

Here's a minimal example of a custom orchestrator:

```typescript
import { Orchestrator } from '../src/orchestrator';
import { Intent } from '../src/intent-mapper';
import { BecknClient } from '../src/beckn-client';

class SimpleOrchestrator implements Orchestrator {
  private becknClient: BecknClient;
  
  constructor() {
    this.becknClient = new BecknClient();
  }
  
  async execute(intent: Intent): Promise<any> {
    // Direct mapping to Beckn operations
    switch (intent.operation) {
      case 'search':
        const result = await this.becknClient.search(intent.domain, intent.parameters);
        return {
          status: 'completed',
          results: result,
          transaction_id: result.transactionId,
          state: 'search_completed'
        };
        
      // Handle other operations...
        
      default:
        throw new Error(`Unsupported operation: ${intent.operation}`);
    }
  }
}
```

See the full example in `examples/simple-orchestrator.ts`.

## Advanced Topics

### Stateful Orchestrators

For orchestrators that maintain state across requests:

```typescript
class StatefulOrchestrator implements Orchestrator {
  private sessions: Map<string, any> = new Map();
  
  async execute(intent: Intent): Promise<any> {
    const sessionId = intent.context.conversation_id;
    let session = this.sessions.get(sessionId) || { state: 'new', history: [] };
    
    // Update session with new intent
    session.history.push(intent);
    
    // Process based on current state
    // ...
    
    // Save updated session
    this.sessions.set(sessionId, session);
    
    return {
      // ...result
    };
  }
}
```

### Multi-Step Transactions

For complex workflows that span multiple intents:

```typescript
class MultiStepOrchestrator implements Orchestrator {
  async execute(intent: Intent): Promise<any> {
    // Check if continuing a transaction
    if (intent.context.transaction_id) {
      return this.continueTransaction(intent);
    }
    
    // Start new transaction
    return this.startTransaction(intent);
  }
  
  private async startTransaction(intent: Intent): Promise<any> {
    // Initialize transaction
    // ...
  }
  
  private async continueTransaction(intent: Intent): Promise<any> {
    // Continue existing transaction
    // ...
  }
}
```

### Integration with Other Frameworks

You can wrap existing orchestration frameworks:

```typescript
import * as langchain from 'langchain';

class LangChainOrchestrator implements Orchestrator {
  private agent: any;
  
  constructor() {
    // Initialize LangChain agent
    this.agent = langchain.createAgent(/* ... */);
  }
  
  async execute(intent: Intent): Promise<any> {
    // Convert intent to LangChain format
    const result = await this.agent.execute(/* ... */);
    
    // Convert result back to expected format
    return {
      status: 'completed',
      results: result,
      transaction_id: /* ... */,
      state: /* ... */
    };
  }
}
```

## Best Practices

1. **Error Handling**: Always handle errors gracefully and provide meaningful error messages
2. **Logging**: Include detailed logging for debugging and monitoring
3. **Timeout Handling**: Implement timeouts for external operations
4. **Validation**: Validate intents before processing
5. **Testing**: Create tests specifically for your orchestrator

## Testing Orchestrators

Here's a simple pattern for testing orchestrators:

```typescript
// In your test file
import { MyOrchestrator } from './my-orchestrator';

describe('MyOrchestrator', () => {
  let orchestrator: MyOrchestrator;
  
  beforeEach(() => {
    orchestrator = new MyOrchestrator();
  });
  
  it('should handle search intents', async () => {
    const intent = {
      domain: 'mobility',
      operation: 'search',
      parameters: { /* ... */ },
      context: {}
    };
    
    const result = await orchestrator.execute(intent);
    
    expect(result.status).toBe('completed');
    expect(result.transaction_id).toBeDefined();
    expect(result.state).toBe('search_completed');
  });
  
  // Additional tests...
});
```

## Getting Help

If you need assistance creating custom orchestrators:
- Check the examples directory for reference implementations
- Explore the existing adapters in `src/orchestrator/adapters/`
- Open an issue if you encounter problems
