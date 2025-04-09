/**
 * Orchestrator Testing Utilities
 * 
 * Provides helper functions and mock objects for testing orchestrators.
 */

import { Orchestrator } from './index';
import { Intent } from '../intent-mapper';
import { BecknClient } from '../beckn-client';

/**
 * Mock Beckn Client for testing orchestrators
 * Returns predictable responses without making actual network calls
 */
export class MockBecknClient extends BecknClient {
  constructor() {
    super();
  }

  // Override methods to provide mock responses
  async search(domain: string, parameters: any): Promise<any> {
    return {
      transactionId: `mock-txn-${Date.now()}`,
      options: [
        {
          provider: "Mock Provider",
          services: [
            {
              id: "mock-service-1",
              name: "Mock Service",
              price: 100,
              currency: "INR",
              estimatedTime: "10 min"
            }
          ]
        }
      ]
    };
  }

  async select(domain: string, parameters: any): Promise<any> {
    return {
      transactionId: parameters.transactionId || `mock-txn-${Date.now()}`,
      order: {
        id: `mock-order-${Date.now()}`,
        provider: "Mock Provider",
        items: [
          {
            id: parameters.itemId || "mock-item-1",
            price: {
              value: 100,
              currency: "INR"
            }
          }
        ]
      }
    };
  }

  async init(domain: string, parameters: any): Promise<any> {
    return {
      transactionId: parameters.transactionId || `mock-txn-${Date.now()}`,
      order: {
        id: parameters.orderId || `mock-order-${Date.now()}`,
        provider: parameters.provider || "Mock Provider",
        status: "INITIALIZED",
        payment: {
          uri: "https://mock-payment.example.com"
        }
      }
    };
  }

  async confirm(domain: string, parameters: any): Promise<any> {
    return {
      transactionId: parameters.transactionId || `mock-txn-${Date.now()}`,
      order: {
        id: parameters.orderId || `mock-order-${Date.now()}`,
        provider: parameters.provider || "Mock Provider",
        status: "CONFIRMED"
      }
    };
  }
}

/**
 * Creates mock intents for testing orchestrators
 */
export class IntentFactory {
  /**
   * Creates a mock search intent
   */
  static createSearchIntent(domain: string = 'mobility', overrides: Partial<Intent> = {}): Intent {
    const defaults: Intent = {
      domain,
      operation: 'search',
      parameters: domain === 'mobility' 
        ? { origin: 'test origin', destination: 'test destination' }
        : { query: 'test query' },
      context: {
        user_id: 'test-user',
        conversation_id: 'test-conversation'
      }
    };
    
    return { ...defaults, ...overrides };
  }
  
  /**
   * Creates a mock select intent
   */
  static createSelectIntent(domain: string = 'mobility', overrides: Partial<Intent> = {}): Intent {
    const defaults: Intent = {
      domain,
      operation: 'select',
      parameters: {
        transactionId: `mock-txn-${Date.now()}`,
        itemId: 'mock-item-1',
        provider: 'Mock Provider'
      },
      context: {
        user_id: 'test-user',
        conversation_id: 'test-conversation'
      }
    };
    
    return { ...defaults, ...overrides };
  }
  
  /**
   * Creates a mock init intent
   */
  static createInitIntent(domain: string = 'mobility', overrides: Partial<Intent> = {}): Intent {
    const defaults: Intent = {
      domain,
      operation: 'init',
      parameters: {
        transactionId: `mock-txn-${Date.now()}`,
        orderId: `mock-order-${Date.now()}`,
        provider: 'Mock Provider'
      },
      context: {
        user_id: 'test-user',
        conversation_id: 'test-conversation'
      }
    };
    
    return { ...defaults, ...overrides };
  }
  
  /**
   * Creates a mock confirm intent
   */
  static createConfirmIntent(domain: string = 'mobility', overrides: Partial<Intent> = {}): Intent {
    const defaults: Intent = {
      domain,
      operation: 'confirm',
      parameters: {
        transactionId: `mock-txn-${Date.now()}`,
        orderId: `mock-order-${Date.now()}`,
        provider: 'Mock Provider'
      },
      context: {
        user_id: 'test-user',
        conversation_id: 'test-conversation'
      }
    };
    
    return { ...defaults, ...overrides };
  }
}

/**
 * Tests an orchestrator with standard intents
 * @param orchestrator The orchestrator to test
 * @returns Test results object
 */
export async function testOrchestrator(orchestrator: Orchestrator): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  
  try {
    // Test search
    const searchIntent = IntentFactory.createSearchIntent();
    results.search = await orchestrator.execute(searchIntent);
    
    // Use transaction ID from search for remaining operations
    const txnId = results.search.transaction_id;
    
    // Test select
    const selectIntent = IntentFactory.createSelectIntent('mobility', {
      parameters: { transactionId: txnId }
    });
    results.select = await orchestrator.execute(selectIntent);
    
    // Test init
    const initIntent = IntentFactory.createInitIntent('mobility', {
      parameters: { transactionId: txnId }
    });
    results.init = await orchestrator.execute(initIntent);
    
    // Test confirm
    const confirmIntent = IntentFactory.createConfirmIntent('mobility', {
      parameters: { transactionId: txnId }
    });
    results.confirm = await orchestrator.execute(confirmIntent);
    
    results.success = true;
  } catch (error) {
    results.success = false;
    results.error = error;
  }
  
  return results;
}
