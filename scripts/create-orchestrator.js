#!/usr/bin/env node

/**
 * Orchestrator Template Generator
 * 
 * This script generates boilerplate code for a new orchestrator adapter.
 * 
 * Usage:
 *   node scripts/create-orchestrator.js MyOrchestrator
 */

const fs = require('fs');
const path = require('path');

// Get orchestrator name from command line
const orchestratorName = process.argv[2];

if (!orchestratorName) {
  console.error('Please provide an orchestrator name');
  console.log('Usage: node scripts/create-orchestrator.js MyOrchestrator');
  process.exit(1);
}

// Convert orchestrator name to various formats
const camelCaseName = orchestratorName.charAt(0).toLowerCase() + orchestratorName.slice(1);
const kebabCaseName = orchestratorName
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/\s+/g, '-')
  .toLowerCase();
const uppercaseName = kebabCaseName.toUpperCase().replace(/-/g, '_');

// Create adapter file
const adapterPath = path.join(__dirname, '..', 'src', 'orchestrator', 'adapters', `${kebabCaseName}-adapter.ts`);
const adapterContent = `/**
 * ${orchestratorName} Orchestrator Adapter
 * 
 * Adapts the ${orchestratorName} orchestration engine to the Orchestrator interface.
 */

import { Orchestrator } from '../index';
import { Intent } from '../../intent-mapper';

export class ${orchestratorName}OrchestratorAdapter implements Orchestrator {
  constructor() {
    // Initialize your orchestrator here
    console.log('${orchestratorName} orchestrator initialized');
  }

  async execute(intent: Intent): Promise<any> {
    // Implement your orchestration logic here
    console.log('Executing intent with ${orchestratorName}:', intent);
    
    // TODO: Replace with actual implementation
    return {
      status: 'completed',
      results: {
        // Your results here
      },
      transaction_id: \`\${intent.domain}-\${Date.now()}\`,
      state: \`\${intent.operation}_completed\`
    };
  }
}
`;

// Update factory to include the new orchestrator
const factoryPath = path.join(__dirname, '..', 'src', 'orchestrator', 'factory.ts');
let factoryContent = fs.readFileSync(factoryPath, 'utf8');

// Add import statement
const importStatement = `import { ${orchestratorName}OrchestratorAdapter } from './adapters/${kebabCaseName}-adapter';`;
factoryContent = factoryContent.replace(
  /import {.*} from '\.\/adapters\/.*';/g, 
  match => `${match}\n${importStatement}`
);

// Add to enum
factoryContent = factoryContent.replace(
  /export enum OrchestratorType {[\s\S]*?}/,
  match => match.replace(
    /(\s+\/\/ Add more as needed)/,
    `\n  ${uppercaseName} = '${kebabCaseName}',\n$1`
  )
);

// Add to switch case
factoryContent = factoryContent.replace(
  /switch\s*\(type\.toLowerCase\(\)\)\s*{[\s\S]*?}/,
  match => match.replace(
    /(\s+default:)/,
    `\n      case OrchestratorType.${uppercaseName}:
        try {
          return new ${orchestratorName}OrchestratorAdapter();
        } catch (error) {
          console.error('Failed to initialize ${orchestratorName} orchestrator:', error);
          console.warn('Falling back to Goose orchestrator');
          return new GooseOrchestratorAdapter();
        }\n$1`
  )
);

// Write files
try {
  fs.writeFileSync(adapterPath, adapterContent);
  console.log(`Created adapter at: ${adapterPath}`);
  
  fs.writeFileSync(factoryPath, factoryContent);
  console.log(`Updated factory at: ${factoryPath}`);
  
  // Update .env.example
  const envPath = path.join(__dirname, '..', '.env.example');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('ORCHESTRATOR_TYPE=')) {
    envContent = envContent.replace(
      /(ORCHESTRATOR_TYPE=.*# Options:.*)/,
      `$1, ${kebabCaseName}`
    );
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated .env.example`);
  }
  
  console.log(`\n🎉 ${orchestratorName} orchestrator boilerplate created successfully!`);
  console.log('\nTo use your new orchestrator:');
  console.log(`1. Complete the implementation in src/orchestrator/adapters/${kebabCaseName}-adapter.ts`);
  console.log(`2. Set ORCHESTRATOR_TYPE=${kebabCaseName} in your .env file`);
  console.log('3. Run the application');
  
} catch (error) {
  console.error('Error creating orchestrator:', error);
  process.exit(1);
}
