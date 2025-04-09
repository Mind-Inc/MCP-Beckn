/**
 * Orchestrator Factory
 * 
 * Creates and configures orchestration engines based on configuration.
 */

import { Orchestrator } from './index';
import { GooseOrchestratorAdapter } from './adapters/goose-adapter';
import { MindNetOrchestratorAdapter } from './adapters/mindnet-adapter';
import { LangGraphOrchestratorAdapter } from './adapters/langgraph-adapter';
import { orchestratorRegistry } from './registry';

export enum OrchestratorType {
  GOOSE = 'goose',
  MINDNET = 'mindnet',
  LANGGRAPH = 'langgraph',
  // Add more as needed
}

// Register built-in orchestrators
orchestratorRegistry.register(OrchestratorType.MINDNET, () => new MindNetOrchestratorAdapter());
orchestratorRegistry.register(OrchestratorType.LANGGRAPH, () => new LangGraphOrchestratorAdapter());

export class OrchestratorFactory {
  /**
   * Creates an orchestrator of the specified type
   * @param type The type of orchestrator to create
   * @returns An orchestrator instance
   */
  static createOrchestrator(type: string = process.env.ORCHESTRATOR_TYPE || OrchestratorType.GOOSE): Orchestrator {
    return orchestratorRegistry.get(type);
  }
  
  /**
   * Lists all available orchestrator types
   * @returns Array of orchestrator type names
   */
  static listAvailableTypes(): string[] {
    return orchestratorRegistry.list();
  }
  
  /**
   * Registers a custom orchestrator
   * @param name The name of the orchestrator
   * @param factory Function that creates an orchestrator instance
   */
  static registerOrchestrator(name: string, factory: () => Orchestrator): void {
    orchestratorRegistry.register(name, factory);
  }
}
