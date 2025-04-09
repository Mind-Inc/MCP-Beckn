# MCP-Beckn Testing Dashboard

The Testing Dashboard provides a user-friendly web interface for interacting with the MCP Shell Server and monitoring transactions.

## Features

- Interactive query testing
- Transaction history and details
- Configurable settings
- JSON formatting options

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Running MCP Shell Server (see [shell-server.md](./shell-server.md))

### Running the Dashboard

```bash
# Option 1: Using npm script
npm run dashboard

# Option 2: Directly
npx serve tools/test-dashboard
```

By default, the dashboard is served on http://localhost:5000.

## Using the Dashboard

### MCP Tester Tab

This tab allows you to send MCP requests:

1. Enter your MCP server endpoint (default: http://localhost:3001/mcp/v1)
2. Type a natural language query (e.g., "Book me a cab to the airport")
3. Add context in JSON format if needed (e.g., for transaction continuation)
4. Click "Send Request"
5. View the response in the display box below

The dashboard automatically captures the transaction ID from the response, making it easy to follow multi-step transactions.

### Transactions Tab

This tab displays all active transactions:

1. View a list of all transactions with their IDs, domains, and states
2. Click "Refresh" to update the list
3. Click "View" on any transaction to see its full details
4. Monitor transaction status changes and timestamps

### Settings Tab

Configure dashboard behavior:

1. Set the transactions endpoint
2. Configure auto-refresh rate (in seconds)
3. Toggle JSON pretty-printing
4. Save settings for future sessions

## Integration Testing Workflow

The dashboard is particularly useful for testing the full transaction lifecycle:

1. Start by sending a search query
2. When you get results, use the transaction_id from the response
3. Send a follow-up query to select one of the options
4. Continue through the init and confirm steps

The dashboard will automatically track the transaction as it progresses through different states.

## Troubleshooting

If you encounter issues with the dashboard:

1. Ensure the MCP Shell Server is running
2. Check that the endpoints in Settings match your server configuration
3. Verify browser console for any JavaScript errors
4. Try clearing your browser cache and reloading

## Advanced Usage

### Testing with Real MCP Server

You can point the dashboard to your actual MCP server by changing the endpoint:

1. Go to the Settings tab
2. Update the MCP Endpoint to your server address (e.g., http://localhost:3000/mcp/v1)
3. Save settings

This is useful for comparing responses between the shell server and your actual implementation.
