# MCP Request/Response Validation

The validation system ensures that all MCP requests and responses conform to the expected schema, improving reliability and error handling.

## Overview

The validation module provides:

- Schema-based validation for MCP requests
- Schema-based validation for MCP responses
- Express middleware for automatic validation
- Helper functions for programmatic validation

## MCP Request Schema

All requests must include a `query` field and may include a `context` object:

```json
{
  "query": "Book me a cab from MG Road to the airport",
  "context": {
    "user_id": "user123",
    "conversation_id": "conv456",
    "transaction_id": "txn_789" 
  }
}
```

The validation enforces:
- `query` must be a non-empty string
- `context` is optional but must be an object if present
- `context` may include `user_id`, `conversation_id`, `transaction_id`, and `previous_context`

## MCP Response Schema

All responses must include a `status` field:

```json
{
  "status": "success",
  "data": {
    // Response data
  },
  "conversation_context": {
    "transaction_id": "txn_1234567890",
    "domain": "mobility",
    "state": "search_completed"
  }
}
```

The validation enforces:
- `status` must be one of: "success", "error", "pending"
- `data` is required for success responses
- `conversation_context` should contain transaction info
- `message` is optional but should be included for errors

## Usage

### As Express Middleware

```typescript
import express from 'express';
import { validateMcpRequest } from '../mcp-server/validation';

const app = express();
app.use(express.json());

// Apply validation middleware to MCP requests
app.post('/mcp/v1', validateMcpRequest, (req, res) => {
  // Your handler code - will only run if validation passes
});
```

### Programmatic Validation

```typescript
import { validateMcpResponse } from '../mcp-server/validation';

// Check if a response is valid
const response = {
  status: 'success',
  data: { /* ... */ },
  conversation_context: {
    transaction_id: 'txn_123',
    domain: 'mobility',
    state: 'search_completed'
  }
};

const validation = validateMcpResponse(response);
if (!validation.valid) {
  console.error('Invalid response:', validation.errors);
}
```

## Extending the Validation

To add new properties to the schema:

1. Update the schema definitions in `src/mcp-server/validation/index.ts`
2. Add new property definitions with appropriate types and constraints
3. Add them to the appropriate `properties` object in the schema

Example of extending the request schema:

```typescript
const mcpRequestSchema = {
  type: 'object',
  required: ['query'],
  properties: {
    query: { type: 'string', minLength: 1 },
    context: { 
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        conversation_id: { type: 'string' },
        transaction_id: { type: 'string' },
        previous_context: { type: 'object' },
        // Add new properties here
        client_version: { type: 'string' },
        device_info: { 
          type: 'object',
          properties: {
            type: { type: 'string' },
            os: { type: 'string' }
          }
        }
      }
    }
  }
};
```

## Common Validation Errors

| Error | Description | Solution |
|-------|-------------|----------|
| Required property 'query' missing | The query field is missing | Add a query field to your request |
| Invalid type, expected string | Query is not a string | Ensure query is a text string |
| Invalid context format | Context is not an object | Format context as a JSON object |
| Invalid enum value | Status has invalid value | Use only 'success', 'error', or 'pending' |
