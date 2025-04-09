/**
 * Goose Orchestrator Adapter
 * 
 * Adapts the GooseOrchestrator to the Orchestrator interface.
 */

import { Orchestrator } from '../index';
import { Intent } from '../../intent-mapper';
import { GooseOrchestrator } from '../../goose-orchestrator';

export class GooseOrchestratorAdapter implements Orchestrator {
  private gooseOrchestrator: GooseOrchestrator;

  constructor() {
    this.gooseOrchestrator = new GooseOrchestrator();
  }

  async execute(intent: Intent): Promise<any> {
    return await this.gooseOrchestrator.execute(intent);
  }
}
