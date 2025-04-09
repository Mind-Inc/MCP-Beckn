# Beckn Simulator

The Beckn Simulator provides a realistic simulation of the Beckn Protocol for testing and development without requiring actual Beckn network connections.

## Overview

The Beckn Simulator provides:

- Domain-specific response generation
- Support for all core Beckn operations (search, select, init, confirm)
- Simulated network latency
- Transaction tracking

## Basic Usage

```typescript
import { becknSimulator } from '../beckn-client/simulator';

// Process a search operation
const searchResult = await becknSimulator.process('mobility', 'search', {
  origin: 'MG Road',
  destination: 'Airport'
});

console.log('Transaction ID:', searchResult.transactionId);
console.log('Options:', searchResult.options);

// Continue with selection using the transaction ID
const selectResult = await becknSimulator.process('mobility', 'select', {
  transactionId: searchResult.transactionId,
  itemId: 'uber-go-1',
  provider: 'Uber'
});

// Continue with init
const initResult = await becknSimulator.process('mobility', 'init', {
  transactionId: selectResult.transactionId,
  orderId: selectResult.order.id,
  provider: 'Uber'
});

// Complete with confirm
const confirmResult = await becknSimulator.process('mobility', 'confirm', {
  transactionId: initResult.transactionId,
  orderId: initResult.order.id,
  provider: 'Uber'
});
```

## Supported Domains

The simulator supports the following domains:

### Mobility Domain

For ride booking services (taxis, autos, etc.):

```typescript
// Example parameters for mobility domain
const mobilitySearchParams = {
  origin: 'MG Road',
  destination: 'Airport'
};

const mobilitySelectParams = {
  transactionId: 'mobility-1234',
  itemId: 'uber-go-1',
  provider: 'Uber'
};
```

### Retail Domain

For shopping and e-commerce:

```typescript
// Example parameters for retail domain
const retailSearchParams = {
  product: 'iPhone 15',
  delivery: true
};

const retailSelectParams = {
  transactionId: 'retail-1234',
  itemId: 'amz-prod-1',
  provider: 'Amazon'
};
```

### Food Domain

For food delivery and restaurants:

```typescript
// Example parameters for food domain
const foodSearchParams = {
  restaurant: "Domino's Pizza",
  food: 'Pepperoni Pizza'
};

const foodSelectParams = {
  transactionId: 'food-1234',
  itemId: 'dom-1',
  provider: "Domino's Pizza"
};
```

## Transaction Management

The simulator maintains a record of transactions:

```typescript
// Get details of a transaction
const transactionDetails = becknSimulator.getTransaction('mobility-1234');

// List all transactions
const allTransactions = becknSimulator.listTransactions();
```

## Network Latency Simulation

The simulator includes realistic network latency (200-500ms) to mimic real-world conditions. This helps test timeout handling and loading states.

## Customizing the Simulator

You can extend the simulator by modifying the domain responders:

1. Open `src/beckn-client/simulator.ts`
2. Find the `domainResponders` object
3. Add or modify response generators for different domains and operations

Example of adding a new domain:

```typescript
const domainResponders = {
  // Existing domains...
  
  healthcare: {
    search: (parameters: any) => {
      return {
        transactionId: `healthcare-${uuidv4()}`,
        options: [
          {
            provider: "Apollo Hospitals",
            services: [
              {
                id: "apollo-doc-1",
                name: "Dr. Smith (Cardiologist)",
                price: 800,
                currency: "INR",
                estimatedTime: "Available tomorrow at 10 AM"
              }
            ]
          }
        ]
      };
    },
    
    // Add other operations...
    select: (parameters: any) => { /* ... */ },
    init: (parameters: any) => { /* ... */ },
    confirm: (parameters: any) => { /* ... */ }
  }
};
```

## Integration with BecknClient

The Beckn Simulator can be used as a drop-in replacement for actual network calls in the BecknClient:

```typescript
class BecknClient {
  private useSimulator = true; // Toggle simulator mode
  
  async search(domain: string, parameters: any): Promise<any> {
    if (this.useSimulator) {
      return await becknSimulator.process(domain, 'search', parameters);
    } else {
      // Actual network code
    }
  }
  
  // Similarly for other methods...
}
```

## Error Simulation

To test error handling, you can force errors by passing invalid domains or operations:

```typescript
try {
  // This will throw an error
  await becknSimulator.process('invalid-domain', 'search', {});
} catch (error) {
  console.error('Error:', error.message);
}
```

## Specialized Mocking

For specialized test cases, you can create a custom instance:

```typescript
import { BecknSimulator } from '../beckn-client/simulator';

// Create a custom simulator for specific test cases
const customSimulator = new BecknSimulator();

// Use as needed
const result = await customSimulator.process('mobility', 'search', parameters);
```
