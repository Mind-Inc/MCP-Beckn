# Orchestration Layer

The MCP-Beckn integration includes a flexible orchestration layer that allows different workflow engines to be plugged in and used without changing the rest of the system.

## Architecture

The orchestration layer follows these design principles:

1. **Pluggable Orchestrators**: Any compliant orchestration engine can be used
2. **Consistent Interface**: All orchestrators implement the same interface
3. **Configuration-Driven**: The active orchestrator is selected via environment variables
4. **Graceful Fallbacks**: If a requested orchestrator fails, the system falls back to the default

## Supported Orchestrators

Currently, the system supports:

- **Goose** (default): Block's workflow orchestration framework
- **MindNet** (placeholder): Memory-persistent, Knowledge Graph-driven orchestration
- **LangGraph** (placeholder): LangChain's graph-based workflow engine

## How to Use

### 1. Configure the Orchestrator

Set the `ORCHESTRATOR_TYPE` environment variable to one of:
- `goose` (default)
- `mindnet` (when implemented)
- `langgraph` (when implemented)

```bash
# In .env file or environment
ORCHESTRATOR_TYPE=goose
```

### 2. Implement a New Orchestrator

To add support for a new orchestration engine:

1. Create a new adapter in `src/orchestrator/adapters/your-engine-adapter.ts`
2. Implement the `Orchestrator` interface
3. Add your engine to the `OrchestratorType` enum in the factory
4. Update the factory to create instances of your adapter

Example:

```typescript
// 1. Create adapter
export class YourEngineAdapter implements Orchestrator {
  async execute(intent: Intent): Promise<any> {
    // Your implementation here
  }
}

// 2. Update enum in factory.ts
export enum OrchestratorType {
  GOOSE = 'goose',
  MINDNET = 'mindnet',
  LANGGRAPH = 'langgraph',
  YOUR_ENGINE = 'your-engine'
}

// 3. Update factory method
static createOrchestrator(type: string): Orchestrator {
  switch (type.toLowerCase()) {
    // Existing cases...
    case OrchestratorType.YOUR_ENGINE:
      return new YourEngineAdapter();
    // ...
  }
}
```

## Extending the System

The orchestration abstraction can be extended in several ways:

1. **Enhanced Configuration**: Add options specific to each orchestrator
2. **Runtime Switching**: Allow switching orchestrators mid-operation based on intent
3. **Hybrid Orchestration**: Combine multiple orchestrators for complex workflows
4. **Stats & Metrics**: Collect performance data across different orchestrators

Refer to individual orchestrator documentation for engine-specific features and capabilities.
