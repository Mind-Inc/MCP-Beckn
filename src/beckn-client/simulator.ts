import { v4 as uuidv4 } from 'uuid';

// Domain-specific search response generators
const domainResponders = {
  mobility: {
    search: (parameters: any) => {
      const origin = parameters.origin || 'unknown location';
      const destination = parameters.destination || 'unknown destination';
      
      return {
        transactionId: `mobility-${uuidv4()}`,
        options: [
          {
            provider: "Namma Yatri",
            services: [
              {
                id: "ny-auto-1",
                name: "Auto Rickshaw",
                price: 150,
                currency: "INR",
                estimatedTime: "15 min",
                details: {
                  origin: origin,
                  destination: destination,
                  distance: "8.5 km",
                  vehicle_type: "auto"
                }
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
                estimatedTime: "12 min",
                details: {
                  origin: origin,
                  destination: destination,
                  distance: "8.5 km",
                  vehicle_type: "hatchback"
                }
              },
              {
                id: "uber-premier-1",
                name: "Uber Premier",
                price: 450,
                currency: "INR",
                estimatedTime: "10 min",
                details: {
                  origin: origin,
                  destination: destination,
                  distance: "8.5 km",
                  vehicle_type: "sedan"
                }
              }
            ]
          }
        ]
      };
    },
    
    select: (parameters: any) => {
      return {
        transactionId: parameters.transactionId,
        order: {
          id: `order-${uuidv4()}`,
          provider: parameters.provider || "Uber",
          items: [
            {
              id: parameters.itemId || "uber-go-1",
              price: {
                value: 250,
                currency: "INR"
              },
              fulfillment: {
                vehicle: {
                  registration: "KA-01-AB-1234"
                },
                agent: {
                  name: "Driver Name",
                  phone: "+919876543210",
                  rating: "4.8"
                }
              }
            }
          ],
          quote: {
            price: {
              value: 250,
              currency: "INR"
            },
            breakup: [
              {
                title: "Base Fare",
                price: {
                  value: 200,
                  currency: "INR"
                }
              },
              {
                title: "Taxes",
                price: {
                  value: 50,
                  currency: "INR"
                }
              }
            ]
          }
        }
      };
    },
    
    init: (parameters: any) => {
      return {
        transactionId: parameters.transactionId,
        order: {
          id: parameters.orderId || `order-${uuidv4()}`,
          state: "INITIALIZED",
          provider: parameters.provider || "Uber",
          items: parameters.items || [],
          billing: parameters.billing || {
            name: "John Doe",
            email: "john@example.com",
            phone: "+919876543210"
          },
          fulfillment: parameters.fulfillment || {},
          payment: {
            uri: "https://payment-gateway.example.com/pay?id=123",
            tl_method: "http/get",
            params: {
              amount: "250.00",
              currency: "INR",
              transaction_id: parameters.transactionId
            }
          }
        }
      };
    },
    
    confirm: (parameters: any) => {
      return {
        transactionId: parameters.transactionId,
        order: {
          id: parameters.orderId,
          state: "CONFIRMED",
          provider: parameters.provider || "Uber",
          items: parameters.items || [],
          fulfillment: {
            ...(parameters.fulfillment || {}),
            state: {
              descriptor: {
                name: "Order Confirmed"
              }
            },
            tracking: true,
            agent: {
              name: "Driver Name",
              phone: "+919876543210",
              rating: "4.8"
            },
            vehicle: {
              registration: "KA-01-AB-1234",
              model: "Swift Dzire",
              color: "White"
            },
            start: {
              time: {
                timestamp: new Date(Date.now() + 5 * 60000).toISOString()
              }
            }
          },
          billing: parameters.billing || {},
          payment: {
            ...(parameters.payment || {}),
            status: "PAID"
          }
        }
      };
    }
  },
  
  retail: {
    search: (parameters: any) => {
      const product = parameters.product || parameters.query || 'unknown product';
      
      return {
        transactionId: `retail-${uuidv4()}`,
        options: [
          {
            provider: "Amazon",
            services: [
              {
                id: "amz-prod-1",
                name: product,
                price: 45999,
                currency: "INR",
                estimatedTime: "2 days delivery",
                details: {
                  brand: "Apple",
                  model: "Latest Model",
                  warranty: "1 Year"
                }
              }
            ]
          },
          {
            provider: "Flipkart",
            services: [
              {
                id: "flp-prod-1",
                name: product,
                price: 46999,
                currency: "INR",
                estimatedTime: "3 days delivery",
                details: {
                  brand: "Apple",
                  model: "Latest Model",
                  warranty: "1 Year"
                }
              }
            ]
          }
        ]
      };
    },
    
    select: (parameters: any) => {
      return {
        transactionId: parameters.transactionId,
        order: {
          id: `order-${uuidv4()}`,
          provider: parameters.provider || "Amazon",
          items: [
            {
              id: parameters.itemId || "amz-prod-1",
              price: {
                value: 45999,
                currency: "INR"
              },
              fulfillment: {
                type: "Delivery",
                estimated_time: "2 days"
              }
            }
          ],
          quote: {
            price: {
              value: 45999,
              currency: "INR"
            },
            breakup: [
              {
                title: "Product Price",
                price: {
                  value: 44999,
                  currency: "INR"
                }
              },
              {
                title: "Delivery Fee",
                price: {
                  value: 1000,
                  currency: "INR"
                }
              }
            ]
          }
        }
      };
    },
    
    init: (parameters: any) => {
      return {
        transactionId: parameters.transactionId,
        order: {
          id: parameters.orderId || `order-${uuidv4()}`,
          state: "INITIALIZED",
          provider: parameters.provider || "Amazon",
          items: parameters.items || [],
          billing: parameters.billing || {
            name: "John Doe",
            email: "john@example.com",
            phone: "+919876543210",
            address: "123 Main St, Bangalore"
          },
          fulfillment: parameters.fulfillment || {
            type: "Delivery",
            address: "123 Main St, Bangalore",
            contact: "+919876543210"
          },
          payment: {
            uri: "https://payment-gateway.example.com/pay?id=123",
            tl_method: "http/get",
            params: {
              amount: "45999.00",
              currency: "INR",
              transaction_id: parameters.transactionId
            }
          }
        }
      };
    },
    
    confirm: (parameters: any) => {
      return {
        transactionId: parameters.transactionId,
        order: {
          id: parameters.orderId,
          state: "CONFIRMED",
          provider: parameters.provider || "Amazon",
          items: parameters.items || [],
          fulfillment: {
            ...(parameters.fulfillment || {}),
            state: {
              descriptor: {
                name: "Order Confirmed"
              }
            },
            tracking: {
              url: "https://tracking.example.com/order/123",
              status: "Order Placed"
            }
          },
          billing: parameters.billing || {},
          payment: {
            ...(parameters.payment || {}),
            status: "PAID"
          }
        }
      };
    }
  },
  
  food: {
    search: (parameters: any) => {
      const restaurant = parameters.restaurant || 'nearby restaurants';
      const food = parameters.food || 'popular dishes';
      
      return {
        transactionId: `food-${uuidv4()}`,
        options: [
          {
            provider: "McDonald's",
            services: [
              {
                id: "mcd-1",
                name: "Big Mac Meal",
                price: 399,
                currency: "INR",
                estimatedTime: "30 min",
                details: {
                  description: "Big Mac burger with fries and soft drink",
                  quantity: 1,
                  veg: false
                }
              }
            ]
          },
          {
            provider: "Domino's Pizza",
            services: [
              {
                id: "dom-1",
                name: "Pepperoni Pizza",
                price: 599,
                currency: "INR",
                estimatedTime: "45 min",
                details: {
                  description: "Medium pepperoni pizza",
                  quantity: 1,
                  veg: false
                }
              }
            ]
          }
        ]
      };
    },
    
    select: (parameters: any) => {
      return {
        transactionId: parameters.transactionId,
        order: {
          id: `order-${uuidv4()}`,
          provider: parameters.provider || "Domino's Pizza",
          items: [
            {
              id: parameters.itemId || "dom-1",
              price: {
                value: 599,
                currency: "INR"
              },
              quantity: 1
            }
          ],
          quote: {
            price: {
              value: 649,
              currency: "INR"
            },
            breakup: [
              {
                title: "Item Price",
                price: {
                  value: 599,
                  currency: "INR"
                }
              },
              {
                title: "Delivery Fee",
                price: {
                  value: 50,
                  currency: "INR"
                }
              }
            ]
          }
        }
      };
    },
    
    init: (parameters: any) => {
      return {
        transactionId: parameters.transactionId,
        order: {
          id: parameters.orderId || `order-${uuidv4()}`,
          state: "INITIALIZED",
          provider: parameters.provider || "Domino's Pizza",
          items: parameters.items || [],
          billing: parameters.billing || {
            name: "John Doe",
            email: "john@example.com",
            phone: "+919876543210"
          },
          fulfillment: parameters.fulfillment || {
            type: "Delivery",
            address: "123 Main St, Bangalore",
            instructions: "Leave at door"
          },
          payment: {
            uri: "https://payment-gateway.example.com/pay?id=123",
            tl_method: "http/get",
            params: {
              amount: "649.00",
              currency: "INR",
              transaction_id: parameters.transactionId
            }
          }
        }
      };
    },
    
    confirm: (parameters: any) => {
      return {
        transactionId: parameters.transactionId,
        order: {
          id: parameters.orderId,
          state: "CONFIRMED",
          provider: parameters.provider || "Domino's Pizza",
          items: parameters.items || [],
          fulfillment: {
            ...(parameters.fulfillment || {}),
            state: {
              descriptor: {
                name: "Order Confirmed"
              }
            },
            tracking: true,
            agent: {
              name: "Delivery Partner",
              phone: "+919876543210",
              rating: "4.8"
            },
            estimated_time: "45 minutes",
            start: {
              time: {
                timestamp: new Date(Date.now() + 15 * 60000).toISOString()
              }
            }
          },
          billing: parameters.billing || {},
          payment: {
            ...(parameters.payment || {}),
            status: "PAID"
          }
        }
      };
    }
  }
};

// Main simulator class
export class BecknSimulator {
  private transactions: Map<string, any> = new Map();
  
  constructor() {
    console.log('Beckn Simulator initialized');
  }
  
  // Process a Beckn operation
  async process(domain: string, operation: string, parameters: any): Promise<any> {
    console.log(`[BecknSimulator] Processing ${domain}/${operation}`, parameters);
    
    // Validate domain and operation
    if (!domainResponders[domain]) {
      throw new Error(`Unsupported domain: ${domain}`);
    }
    
    if (!domainResponders[domain][operation]) {
      throw new Error(`Unsupported operation for domain ${domain}: ${operation}`);
    }
    
    // Add simulated network latency
    await this.simulateLatency();
    
    // Generate response
    const response = domainResponders[domain][operation](parameters);
    
    // Store transaction if needed
    if (response.transactionId) {
      this.transactions.set(response.transactionId, {
        domain,
        operation,
        parameters,
        response,
        timestamp: Date.now()
      });
    }
    
    return response;
  }
  
  // Get transaction details
  getTransaction(transactionId: string): any {
    return this.transactions.get(transactionId);
  }
  
  // List all transactions
  listTransactions(): any[] {
    return Array.from(this.transactions.entries()).map(([id, data]) => ({
      transaction_id: id,
      domain: data.domain,
      operation: data.operation,
      timestamp: data.timestamp
    }));
  }
  
  // Simulate network latency
  private simulateLatency(): Promise<void> {
    const latency = Math.floor(Math.random() * 300) + 200; // 200-500ms
    return new Promise(resolve => setTimeout(resolve, latency));
  }
}

// Export singleton instance
export const becknSimulator = new BecknSimulator();
