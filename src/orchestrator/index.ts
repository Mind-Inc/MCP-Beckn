/**
 * Orchestrator Interface
 * 
 * Defines the contract for workflow orchestration components.
 * This allows different orchestration engines to be plugged in.
 */

import { Intent } from '../intent-mapper';

/**
 * Core interface for orchestration engines
 * 
 * Any orchestration engine that implements this interface can be used
 * to process intents and manage workflows in the MCP-Beckn integration.
 * 
 * @example
 * ```typescript
 * class MyOrchestrator implements Orchestrator {
 *   async execute(intent: Intent): Promise<any> {
 *     // Process the intent and return results
 *     return {
 *       status: 'completed',
 *       results: { ... },
 *       transaction_id: 'txn_123',
 *       state: 'operation_completed'
 *     };
 *   }
 * }
 * ```
 */
export interface Orchestrator {
  /**
   * Executes a workflow based on the provided intent
   * 
   * @param intent - The structured intent to process
   * @returns Result of the workflow execution, which should include:
   *   - status: 'completed' | 'pending' | 'failed'
   *   - results: Any relevant data from the operation
   *   - transaction_id: A unique ID for the transaction
   *   - state: The current state of the workflow
   */
  execute(intent: Intent): Promise<{
    status: string;
    results: any;
    transaction_id: string;
    state: string;
    [key: string]: any;  // Allow additional fields
  }>;
}

/**
 * Re-export orchestrator factory and registry for convenient access
 */
export { OrchestratorFactory } from './factory';
export { orchestratorRegistry } from './registry';
