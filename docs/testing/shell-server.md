# MCP Shell Server

The MCP Shell Server is a standalone server that simulates MCP responses. It's designed to help Beckn developers test their integration without needing a full MCP server deployment.

## Features

- Standalone MCP API endpoint
- Simulated responses for mobility, retail, and food domains
- Support for all transaction operations (search, select, init, confirm)
- Transaction state management
- Mock data generation with realistic parameters

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Running the Shell Server

```bash
# Option 1: Using npm script
npm run shell

# Option 2: Directly
ts-node tools/mcp-shell-server.ts

# Option 3: With custom port
SHELL_PORT=3002 npm run shell
```

By default, the server runs on port 3001.

## API Endpoints

### MCP Endpoint

```
POST /mcp/v1
```

Example request:

```json
{
  "query": "Book me a cab from MG Road to the airport",
  "context": {
    "user_id": "user123"
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

### Transaction Endpoints

List all transactions:
```
GET /transactions
```

Get a specific transaction:
```
GET /transactions/:id
```

## Natural Language Intent Detection

The shell server includes simple intent detection to map natural language queries to domains and operations:

- **Domains**: mobility, retail, food
- **Operations**: search, select, init, confirm

For example:
- "Book a cab to the airport" → mobility/search
- "I want to select the Uber option" → mobility/select
- "Confirm my order" → retail/confirm (or whatever domain was active)

## Testing Multiple Steps

To test a complete transaction flow:

1. Start with a search query
2. Copy the `transaction_id` from the response
3. Include it in your next request's context
4. Progress through select, init, and confirm operations

Example flow:

```bash
# Step 1: Search
curl -X POST http://localhost:3001/mcp/v1 \
  -H "Content-Type: application/json" \
  -d '{"query": "Book me a cab from MG Road to the airport"}'

# Step 2: Select (using transaction_id from the previous response)
curl -X POST http://localhost:3001/mcp/v1 \
  -H "Content-Type: application/json" \
  -d '{"query": "I want the Uber option", "context": {"transaction_id": "txn_1234567890"}}'

# Step 3: Init
curl -X POST http://localhost:3001/mcp/v1 \
  -H "Content-Type: application/json" \
  -d '{"query": "Start the booking process", "context": {"transaction_id": "txn_1234567890"}}'

# Step 4: Confirm
curl -X POST http://localhost:3001/mcp/v1 \
  -H "Content-Type: application/json" \
  -d '{"query": "Confirm the booking", "context": {"transaction_id": "txn_1234567890"}}'
```

## Customizing Responses

To customize the responses from the shell server, you can modify the `mockResponses` object in `tools/mcp-shell-server.ts`.
