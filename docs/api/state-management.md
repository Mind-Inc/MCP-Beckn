# Transaction State Management

The State Management system provides persistent tracking of transactions across the entire MCP-Beckn integration flow.

## Overview

The State Manager provides:

- Transaction creation and lifecycle tracking
- State transitions and history recording
- Domain-specific state management
- Automatic cleanup of old transactions

## Transaction States

Transactions progress through the following states:

| State | Description |
|-------|-------------|
| `CREATED` | Transaction has been created but no operation completed |
| `SEARCH_COMPLETED` | Search operation has completed successfully |
| `SELECTION_COMPLETED` | Selection operation has completed successfully |
| `INITIALIZATION_COMPLETED` | Initialization operation has completed successfully |
| `CONFIRMATION_COMPLETED` | Confirmation operation has completed successfully |
| `CANCELLED` | Transaction has been cancelled |
| `FAILED` | Transaction has failed due to an error |

## Transaction Object Structure

Each transaction includes:

```typescript
interface Transaction {
  id: string;                 // Unique transaction ID
  domain: string;             // Domain (mobility, retail, food)
  state: TransactionState;    // Current state of transaction
  context: Record<string, any>; // User context from MCP
  results?: any;              // Results of the last operation
  history: {                  // History of state changes
    timestamp: number;
    operation: string;
    state: TransactionState;
    data?: any;
  }[];
  createdAt: number;          // Creation timestamp
  updatedAt: number;          // Last update timestamp
}
```

## Basic Usage

### Creating a Transaction

```typescript
import { stateManager } from '../mcp-server/state-manager';

// Create a new transaction
const transaction = stateManager.createTransaction('mobility', {
  user_id: 'user123',
  conversation_id: 'conv456'
});

console.log(`Created transaction: ${transaction.id}`);
```

### Updating a Transaction

```typescript
// Update transaction state after search
const updatedTransaction = stateManager.updateTransaction(transaction.id, {
  state: TransactionState.SEARCH_COMPLETED,
  results: {
    // Search results data
  }
});

console.log(`Transaction updated to state: ${updatedTransaction.state}`);
```

### Retrieving a Transaction

```typescript
// Get transaction by ID
const retrievedTransaction = stateManager.getTransaction(transaction.id);

if (retrievedTransaction) {
  console.log(`Transaction state: ${retrievedTransaction.state}`);
  console.log(`Transaction history:`, retrievedTransaction.history);
}
```

## Transaction Lifecycle Example

```typescript
// 1. Create transaction on initial search
const transaction = stateManager.createTransaction('mobility', initialContext);

// 2. Update after search completes
stateManager.updateTransaction(transaction.id, {
  state: TransactionState.SEARCH_COMPLETED,
  results: searchResults
});

// 3. Update after selection completes
stateManager.updateTransaction(transaction.id, {
  state: TransactionState.SELECTION_COMPLETED,
  results: selectionResults
});

// 4. Update after initialization completes
stateManager.updateTransaction(transaction.id, {
  state: TransactionState.INITIALIZATION_COMPLETED,
  results: initResults
});

// 5. Update after confirmation completes
stateManager.updateTransaction(transaction.id, {
  state: TransactionState.CONFIRMATION_COMPLETED,
  results: confirmResults
});

// Alternative: Handle cancellation
stateManager.updateTransaction(transaction.id, {
  state: TransactionState.CANCELLED,
  results: { reason: 'User cancelled' }
});

// Alternative: Handle failure
stateManager.updateTransaction(transaction.id, {
  state: TransactionState.FAILED,
  results: { error: 'Payment declined' }
});
```

## Querying Transactions

```typescript
// Get all transactions
const allTransactions = stateManager.listTransactions();

// Get transactions for a specific domain
const mobilityTransactions = stateManager.getTransactionsByDomain('mobility');

// Get transactions in a specific state
const completedTransactions = stateManager.getTransactionsByState(
  TransactionState.CONFIRMATION_COMPLETED
);
```

## Automatic Cleanup

The State Manager automatically cleans up transactions older than 24 hours to prevent memory leaks. This happens every hour.

You can manually delete a transaction if needed:

```typescript
stateManager.deleteTransaction(transactionId);
```

## Integration with MCP Server

In your MCP server handlers:

```typescript
app.post('/mcp/v1', async (req, res) => {
  try {
    const { query, context = {} } = req.body;
    
    // Extract existing transaction ID if present
    const transactionId = context.transaction_id;
    let transaction;
    
    if (transactionId) {
      // Continue existing transaction
      transaction = stateManager.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({
          status: 'error',
          message: 'Transaction not found'
        });
      }
    } else {
      // Map intent to determine domain
      const intent = await intentMapper.mapQueryToIntent(query, context);
      
      // Create new transaction
      transaction = stateManager.createTransaction(intent.domain, context);
    }
    
    // Process the request...
    
    // Update transaction with results
    stateManager.updateTransaction(transaction.id, {
      state: TransactionState.SEARCH_COMPLETED,
      results: result
    });
    
    // Return response with transaction context
    return res.status(200).json({
      status: 'success',
      data: result,
      conversation_context: {
        transaction_id: transaction.id,
        domain: transaction.domain,
        state: transaction.state
      }
    });
  } catch (error) {
    // Error handling...
  }
});
```

## Extending the State Manager

The State Manager is designed as a singleton but can be extended if needed:

1. Create a subclass that extends the functionality
2. Override methods as needed
3. Create your own singleton instance

For example, to add persistence to disk:

```typescript
class PersistentStateManager extends StateManager {
  constructor() {
    super();
    this.loadFromDisk();
  }
  
  private loadFromDisk() {
    // Load transactions from file/database
  }
  
  private saveToDisk() {
    // Save transactions to file/database
  }
  
  // Override methods to add persistence
  createTransaction(domain: string, context: Record<string, any> = {}): Transaction {
    const transaction = super.createTransaction(domain, context);
    this.saveToDisk();
    return transaction;
  }
  
  updateTransaction(id: string, updates: Partial<Transaction>): Transaction {
    const transaction = super.updateTransaction(id, updates);
    this.saveToDisk();
    return transaction;
  }
  
  deleteTransaction(id: string): boolean {
    const result = super.deleteTransaction(id);
    this.saveToDisk();
    return result;
  }
}
```
