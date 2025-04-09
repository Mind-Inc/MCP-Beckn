/**
 * Example demonstrating how to test a custom orchestrator
 * 
 * Usage:
 *   node examples/test-orchestrator.js
 */

// This is a simplified example that doesn't use TypeScript
// In a real project, you'd use ts-node or compile first

const { IntentFactory, testOrchestrator } = require('../dist/orchestrator/testing');
const { SimpleOrchestrator } = require('../dist/examples/simple-orchestrator');

async function main() {
  console.log('Testing custom orchestrator...');
  
  // Create an instance of your orchestrator
  const orchestrator = new SimpleOrchestrator();
  
  // Method 1: Using the test utility
  console.log('\n=== Testing with standard test utility ===');
  const results = await testOrchestrator(orchestrator);
  
  if (results.success) {
    console.log('✅ All tests passed!');
    console.log('Search transaction ID:', results.search.transaction_id);
    console.log('Final state:', results.confirm.state);
  } else {
    console.error('❌ Tests failed:', results.error);
  }
  
  // Method 2: Manual testing
  console.log('\n=== Manual testing with specific intents ===');
  
  // Test with a mobility search intent
  const mobilityIntent = IntentFactory.createSearchIntent('mobility', {
    parameters: {
      origin: 'Custom Origin',
      destination: 'Custom Destination'
    }
  });
  
  console.log('Testing mobility search...');
  try {
    const mobilityResult = await orchestrator.execute(mobilityIntent);
    console.log('✅ Mobility search succeeded!');
    console.log('Transaction ID:', mobilityResult.transaction_id);
    console.log('State:', mobilityResult.state);
  } catch (error) {
    console.error('❌ Mobility search failed:', error);
  }
  
  // Test with a retail search intent
  const retailIntent = IntentFactory.createSearchIntent('retail', {
    parameters: {
      product: 'Custom Product'
    }
  });
  
  console.log('\nTesting retail search...');
  try {
    const retailResult = await orchestrator.execute(retailIntent);
    console.log('✅ Retail search succeeded!');
    console.log('Transaction ID:', retailResult.transaction_id);
    console.log('State:', retailResult.state);
  } catch (error) {
    console.error('❌ Retail search failed:', error);
  }
  
  console.log('\nTesting complete!');
}

// Run the tests
main().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});
