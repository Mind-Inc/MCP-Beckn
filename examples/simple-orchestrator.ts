/**
 * Simple Custom Orchestrator Example
 * 
 * This example demonstrates how to create and register a custom orchestrator.
 */

import { Orchestrator } from '../src/orchestrator';
import { Intent } from '../src/intent-mapper';
import { BecknClient } from '../src/beckn-client';
import { OrchestratorFactory } from '../src/orchestrator/factory';

/**
 * A simple orchestrator that directly calls the Beckn client
 */
class SimpleOrchestrator implements Orchestrator {
  private becknClient: BecknClient;
  
  constructor() {
    this.becknClient = new BecknClient();
    console.log('Simple orchestrator initialized');
  }
  
  async execute(intent: Intent): Promise<any> {
    console.log(`[SimpleOrchestrator] Processing intent: ${intent.domain}/${intent.operation}`);
    
    // Direct 1-to-1 mapping to Beckn operations
    switch (intent.operation) {
      case 'search':
        const searchResult = await this.becknClient.search(intent.domain, intent.parameters);
        return {
          status: 'completed',
          results: searchResult,
          transaction_id: searchResult.transactionId,
          state: 'search_completed'
        };
        
      case 'select':
        const selectResult = await this.becknClient.select(intent.domain, intent.parameters);
        return {
          status: 'completed',
          results: selectResult,
          transaction_id: selectResult.transactionId,
          state: 'selection_completed'
        };
        
      case 'init':
        const initResult = await this.becknClient.init(intent.domain, intent.parameters);
        return {
          status: 'completed',
          results: initResult,
          transaction_id: initResult.transactionId,
          state: 'initialization_completed'
        };
        
      case 'confirm':
        const confirmResult = await this.becknClient.confirm(intent.domain, intent.parameters);
        return {
          status: 'completed',
          results: confirmResult,
          transaction_id: confirmResult.transactionId,
          state: 'confirmation_completed'
        };
        
      default:
        throw new Error(`Unsupported operation: ${intent.operation}`);
    }
  }
}

// How to use this orchestrator:

// Option 1: Register at runtime
// This can be done anywhere in your application before the orchestrator is needed
OrchestratorFactory.registerOrchestrator('simple', () => new SimpleOrchestrator());

// Option 2: Add it as a built-in adapter
// 1. Copy this file to src/orchestrator/adapters/simple-adapter.ts
// 2. Update the factory to import and register it
// 3. Add 'simple' to the OrchestratorType enum

// Option 3: Use programmatically without registration
// const simpleOrchestrator = new SimpleOrchestrator();
// const result = await simpleOrchestrator.execute(intent);

export { SimpleOrchestrator };
