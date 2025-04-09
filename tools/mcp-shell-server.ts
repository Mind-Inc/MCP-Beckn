import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

// Mock responses based on domain
const mockResponses = {
  mobility: {
    search: {
      status: 'success',
      data: {
        options: [
          {
            provider: "Namma Yatri",
            services: [
              {
                id: "ny-auto-1",
                name: "Auto Rickshaw",
                price: 150,
                currency: "INR",
                estimatedTime: "15 min"
              }
            ]
          },
          {
            provider: "Uber",
            services: [
              {
                id: "uber-go-1",
                name: "Uber Go",
                price: 250,
                currency: "INR",
                estimatedTime: "12 min"
              }
            ]
          }
        ]
      },
      conversation_context: {
        transaction_id: '',
        domain: 'mobility',
        state: 'search_completed'
      }
    },
    select: {
      status: 'success',
      data: {
        order: {
          id: 'order-123',
          provider: 'Uber',
          services: [
            {
              id: 'uber-go-1',
              name: 'Uber Go',
              price: 250,
              currency: 'INR',
              estimatedTime: '12 min',
              details: {
                driver: {
                  name: 'John Doe',
                  rating: '4.8',
                  phone: '+919876543210'
                },
                vehicle: {
                  model: 'Swift Dzire',
                  color: 'White',
                  registration: 'KA-01-AB-1234'
                }
              }
            }
          ]
        }
      },
      conversation_context: {
        transaction_id: '',
        domain: 'mobility',
        state: 'selection_completed'
      }
    },
    init: {
      status: 'success',
      data: {
        order: {
          id: 'order-123',
          provider: 'Uber',
          state: 'INITIALIZED',
          services: [
            {
              id: 'uber-go-1',
              name: 'Uber Go',
              price: 250,
              currency: 'INR'
            }
          ],
          payment: {
            uri: 'https://payment-gateway.example.com/pay?id=123',
            method: 'UPI',
            status: 'PENDING'
          }
        }
      },
      conversation_context: {
        transaction_id: '',
        domain: 'mobility',
        state: 'initialization_completed'
      }
    },
    confirm: {
      status: 'success',
      data: {
        order: {
          id: 'order-123',
          provider: 'Uber',
          state: 'CONFIRMED',
          services: [
            {
              id: 'uber-go-1',
              name: 'Uber Go',
              price: 250,
              currency: 'INR'
            }
          ],
          fulfillment: {
            tracking: true,
            agent: {
              name: 'John Doe',
              phone: '+919876543210',
              rating: '4.8'
            },
            vehicle: {
              model: 'Swift Dzire',
              color: 'White',
              registration: 'KA-01-AB-1234'
            },
            start: {
              time: {
                estimated: new Date(Date.now() + 5 * 60000).toISOString()
              }
            }
          },
          payment: {
            status: 'PAID',
            method: 'UPI'
          }
        }
      },
      conversation_context: {
        transaction_id: '',
        domain: 'mobility',
        state: 'confirmation_completed'
      }
    }
  },
  retail: {
    search: {
      status: 'success',
      data: {
        options: [
          {
            provider: "Amazon",
            services: [
              {
                id: "product-1",
                name: "iPhone 15",
                price: 79999,
                currency: "INR",
                estimatedTime: "2 days delivery"
              }
            ]
          },
          {
            provider: "Flipkart",
            services: [
              {
                id: "product-2",
                name: "iPhone 15",
                price: 81999,
                currency: "INR",
                estimatedTime: "3 days delivery"
              }
            ]
          }
        ]
      },
      conversation_context: {
        transaction_id: '',
        domain: 'retail',
        state: 'search_completed'
      }
    },
    select: {/* Similar structure to mobility select */},
    init: {/* Similar structure to mobility init */},
    confirm: {/* Similar structure to mobility confirm */}
  },
  food: {
    search: {
      status: 'success',
      data: {
        options: [
          {
            provider: "McDonald's",
            services: [
              {
                id: "food-1",
                name: "Big Mac Meal",
                price: 399,
                currency: "INR",
                estimatedTime: "30 min delivery"
              }
            ]
          },
          {
            provider: "Domino's Pizza",
            services: [
              {
                id: "food-2",
                name: "Pepperoni Pizza",
                price: 499,
                currency: "INR",
                estimatedTime: "45 min delivery"
              }
            ]
          }
        ]
      },
      conversation_context: {
        transaction_id: '',
        domain: 'food',
        state: 'search_completed'
      }
    },
    select: {/* Similar structure to mobility select */},
    init: {/* Similar structure to mobility init */},
    confirm: {/* Similar structure to mobility confirm */}
  }
};

// Simple intent detection
function detectIntent(query) {
  const domains = {
    mobility: ['cab', 'taxi', 'ride', 'transportation'],
    retail: ['shop', 'buy', 'purchase', 'order'],
    food: ['eat', 'food', 'restaurant', 'delivery']
  };
  
  const operations = {
    search: ['find', 'search', 'look', 'get', 'show'],
    select: ['choose', 'select', 'pick'],
    init: ['initiate', 'start', 'begin'],
    confirm: ['confirm', 'book', 'order', 'buy']
  };
  
  // Detect domain
  let detectedDomain = 'mobility'; // Default
  for (const [domain, keywords] of Object.entries(domains)) {
    if (keywords.some(keyword => query.toLowerCase().includes(keyword))) {
      detectedDomain = domain;
      break;
    }
  }
  
  // Detect operation
  let detectedOperation = 'search'; // Default
  for (const [operation, keywords] of Object.entries(operations)) {
    if (keywords.some(keyword => query.toLowerCase().includes(keyword))) {
      detectedOperation = operation;
      break;
    }
  }
  
  return { domain: detectedDomain, operation: detectedOperation };
}

// Set up express app
const app = express();
app.use(express.json());
app.use(cors());

// Transaction state storage
const transactions = new Map();

// MCP endpoint
app.post('/mcp/v1', (req, res) => {
  const { query, context = {} } = req.body;
  const requestId = uuidv4();
  
  console.log(`[${requestId}] MCP Request:`, { query, context });
  
  try {
    // Detect intent from query
    const { domain, operation } = detectIntent(query);
    
    // Get appropriate mock response
    let response = JSON.parse(JSON.stringify(mockResponses[domain][operation]));
    
    // Use existing transaction ID if in context, or generate a new one
    const transactionId = (context.transaction_id) ? 
      context.transaction_id : 
      `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Update transaction ID in response
    response.conversation_context.transaction_id = transactionId;
    
    // Store transaction state
    transactions.set(transactionId, {
      domain,
      operation,
      state: `${operation}_completed`,
      timestamp: Date.now(),
      context: context
    });
    
    console.log(`[${requestId}] MCP Response:`, response);
    res.json(response);
  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process MCP request',
      error: error.message
    });
  }
});

// Transaction status endpoint
app.get('/transactions/:id', (req, res) => {
  const transactionId = req.params.id;
  if (transactions.has(transactionId)) {
    res.json({
      status: 'success',
      data: transactions.get(transactionId)
    });
  } else {
    res.status(404).json({
      status: 'error',
      message: 'Transaction not found'
    });
  }
});

// List all transactions
app.get('/transactions', (req, res) => {
  const transactionList = Array.from(transactions.entries()).map(([id, data]) => ({
    transaction_id: id,
    domain: data.domain,
    operation: data.operation,
    state: data.state,
    timestamp: data.timestamp
  }));
  
  res.json({
    status: 'success',
    data: transactionList
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Start server
const PORT = process.env.SHELL_PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP Shell Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/mcp/v1`);
  console.log(`Transactions endpoint: http://localhost:${PORT}/transactions`);
});
