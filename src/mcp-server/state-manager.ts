/**
 * MCP State Manager
 * 
 * Manages state for ongoing MCP-Beckn transactions.
 */

import { v4 as uuidv4 } from 'uuid';

// Transaction state types
export enum TransactionState {
  CREATED = 'created',
  SEARCH_COMPLETED = 'search_completed',
  SELECTION_COMPLETED = 'selection_completed',
  INITIALIZATION_COMPLETED = 'initialization_completed',
  CONFIRMATION_COMPLETED = 'confirmation_completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

// Domain types
export enum Domain {
  MOBILITY = 'mobility',
  RETAIL = 'retail',
  FOOD = 'food'
}

// Operation types
export enum Operation {
  SEARCH = 'search',
  SELECT = 'select',
  INIT = 'init',
  CONFIRM = 'confirm',
  CANCEL = 'cancel',
  STATUS = 'status'
}

// Transaction data interface
export interface Transaction {
  id: string;
  domain: string;
  state: TransactionState;
  context: Record<string, any>;
  results?: any;
  history: {
    timestamp: number;
    operation: string;
    state: TransactionState;
    data?: any;
  }[];
  createdAt: number;
  updatedAt: number;
}

// State manager class
export class StateManager {
  private static instance: StateManager;
  private transactions: Map<string, Transaction> = new Map();
  
  private constructor() {
    console.log('State Manager initialized');
    
    // Setup cleanup of old transactions
    setInterval(() => this.cleanupOldTransactions(), 3600000); // Every hour
  }
  
  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }
  
  // Create a new transaction
  public createTransaction(domain: string, context: Record<string, any> = {}): Transaction {
    const id = uuidv4();
    const transaction: Transaction = {
      id,
      domain,
      state: TransactionState.CREATED,
      context,
      history: [
        {
          timestamp: Date.now(),
          operation: 'create',
          state: TransactionState.CREATED
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.transactions.set(id, transaction);
    console.log(`Created transaction ${id} for domain ${domain}`);
    
    return transaction;
  }
  
  // Get transaction by ID
  public getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }
  
  // Update transaction state
  public updateTransaction(id: string, updates: Partial<Transaction>): Transaction {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      throw new Error(`Transaction ${id} not found`);
    }
    
    // Update fields
    const updatedTransaction = {
      ...transaction,
      ...updates,
      updatedAt: Date.now()
    };
    
    // Add to history if state changed
    if (updates.state && updates.state !== transaction.state) {
      updatedTransaction.history.push({
        timestamp: Date.now(),
        operation: 'update',
        state: updates.state,
        data: updates.results
      });
    }
    
    this.transactions.set(id, updatedTransaction);
    console.log(`Updated transaction ${id}`, { 
      previousState: transaction.state,
      newState: updatedTransaction.state
    });
    
    return updatedTransaction;
  }
  
  // List all transactions
  public listTransactions(): Transaction[] {
    return Array.from(this.transactions.values());
  }
  
  // Get transactions by domain
  public getTransactionsByDomain(domain: string): Transaction[] {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.domain === domain);
  }
  
  // Get transactions by state
  public getTransactionsByState(state: TransactionState): Transaction[] {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.state === state);
  }
  
  // Delete transaction
  public deleteTransaction(id: string): boolean {
    console.log(`Deleting transaction ${id}`);
    return this.transactions.delete(id);
  }
  
  // Clean up old transactions (older than 24 hours)
  private cleanupOldTransactions(): void {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    let cleanupCount = 0;
    for (const [id, transaction] of this.transactions.entries()) {
      if (transaction.updatedAt < oneDayAgo) {
        this.transactions.delete(id);
        cleanupCount++;
      }
    }
    
    if (cleanupCount > 0) {
      console.log(`Cleaned up ${cleanupCount} old transactions`);
    }
  }
}

// Export singleton instance
export const stateManager = StateManager.getInstance();
