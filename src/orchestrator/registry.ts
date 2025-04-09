/**
 * Orchestrator Registry
 * 
 * Enables runtime registration and discovery of orchestrators.
 */

import { Orchestrator } from './index';
import { GooseOrchestratorAdapter } from './adapters/goose-adapter';

export class OrchestratorRegistry {
  private static instance: OrchestratorRegistry;
  private orchestrators: Map<string, () => Orchestrator> = new Map();
  
  private constructor() {
    // Register default orchestrator
    this.register('goose', () => new GooseOrchestratorAdapter());
  }
  
  public static getInstance(): OrchestratorRegistry {
    if (!OrchestratorRegistry.instance) {
      OrchestratorRegistry.instance = new OrchestratorRegistry();
    }
    return OrchestratorRegistry.instance;
  }
  
  /**
   * Register a new orchestrator factory
   * @param name Unique name for the orchestrator
   * @param factory Function that creates an orchestrator instance
   */
  public register(name: string, factory: () => Orchestrator): void {
    this.orchestrators.set(name.toLowerCase(), factory);
    console.log(`Registered orchestrator: ${name}`);
  }
  
  /**
   * Get an orchestrator by name
   * @param name The name of the orchestrator to retrieve
   * @param fallbackToDefault Whether to fall back to the default if the requested one isn't found
   * @returns An orchestrator instance
   */
  public get(name: string = 'goose', fallbackToDefault: boolean = true): Orchestrator {
    const factory = this.orchestrators.get(name.toLowerCase());
    
    if (factory) {
      try {
        return factory();
      } catch (error) {
        console.error(`Error creating orchestrator '${name}':`, error);
        if (fallbackToDefault && name.toLowerCase() !== 'goose') {
          console.warn(`Falling back to default orchestrator`);
          return this.get('goose', false);
        }
        throw error;
      }
    }
    
    if (fallbackToDefault && name.toLowerCase() !== 'goose') {
      console.warn(`Orchestrator '${name}' not found, falling back to default`);
      return this.get('goose', false);
    }
    
    throw new Error(`Orchestrator '${name}' not registered`);
  }
  
  /**
   * List all registered orchestrators
   * @returns Array of orchestrator names
   */
  public list(): string[] {
    return Array.from(this.orchestrators.keys());
  }
}

// Export singleton instance
export const orchestratorRegistry = OrchestratorRegistry.getInstance();
