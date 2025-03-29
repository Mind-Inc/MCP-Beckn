/**
 * Intent Mapper
 * 
 * Maps natural language queries to structured Beckn intents.
 * In a production system, this would likely use NLU or an LLM for more sophisticated mapping.
 */

export interface Intent {
  domain: string;
  operation: string;
  parameters: Record<string, any>;
  context: Record<string, any>;
}

export class IntentMapper {
  private domains = {
    mobility: ['cab', 'taxi', 'ride', 'transportation', 'drive', 'car', 'auto', 'rickshaw'],
    retail: ['shop', 'buy', 'purchase', 'order', 'shopping', 'product', 'item'],
    food: ['eat', 'food', 'restaurant', 'delivery', 'hungry', 'meal', 'lunch', 'dinner', 'breakfast']
  };

  private operations = {
    search: ['find', 'search', 'look for', 'get', 'show'],
    select: ['choose', 'select', 'pick'],
    init: ['initiate', 'start', 'begin'],
    confirm: ['confirm', 'book', 'order', 'buy']
  };

  /**
   * Maps a natural language query to a structured intent
   */
  async mapQueryToIntent(query: string, context: Record<string, any>): Promise<Intent | null> {
    // Simplified domain and operation detection
    const domain = this.detectDomain(query.toLowerCase());
    const operation = this.detectOperation(query.toLowerCase()) || 'search'; // Default to search
    
    if (!domain) {
      return null;
    }
    
    // Extract parameters based on domain
    const params = await this.extractParameters(query, domain);
    
    return {
      domain,
      operation,
      parameters: params,
      context
    };
  }

  /**
   * Detects which domain a query belongs to based on keywords
   */
  private detectDomain(query: string): string | null {
    for (const [domain, keywords] of Object.entries(this.domains)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return domain;
      }
    }
    return null;
  }

  /**
   * Detects which operation a query is requesting
   */
  private detectOperation(query: string): string | null {
    for (const [operation, keywords] of Object.entries(this.operations)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return operation;
      }
    }
    return null;
  }

  /**
   * Extracts relevant parameters from the query based on domain
   */
  private async extractParameters(query: string, domain: string): Promise<Record<string, any>> {
    // This is a simplified implementation. In production, this should use NLU or LLM.
    switch (domain) {
      case 'mobility':
        return this.extractMobilityParameters(query);
      case 'retail':
        return this.extractRetailParameters(query);
      case 'food':
        return this.extractFoodParameters(query);
      default:
        return {};
    }
  }

  /**
   * Extracts parameters specific to mobility domain
   */
  private extractMobilityParameters(query: string): Record<string, any> {
    // Extract origin and destination (simplified)
    const toMatch = query.match(/to\s+([a-z\s]+)/i);
    const fromMatch = query.match(/from\s+([a-z\s]+)/i);
    
    // Extract time information
    const timeMatch = query.match(/(in|at)\s+(\d+)\s+(minutes?|hours?|am|pm)/i);
    
    return {
      destination: toMatch ? toMatch[1].trim() : undefined,
      origin: fromMatch ? fromMatch[1].trim() : 'current location',
      time: timeMatch ? timeMatch[0] : undefined
    };
  }

  /**
   * Extracts parameters specific to retail domain
   */
  private extractRetailParameters(query: string): Record<string, any> {
    // Extract product information (simplified)
    const productMatch = query.match(/(buy|purchase|order|find|get)\s+([a-z0-9\s]+)/i);
    
    return {
      product: productMatch ? productMatch[2].trim() : undefined,
      delivery: query.includes('delivery') || query.includes('deliver')
    };
  }

  /**
   * Extracts parameters specific to food domain
   */
  private extractFoodParameters(query: string): Record<string, any> {
    // Extract restaurant information (simplified)
    const restaurantMatch = query.match(/from\s+([a-z\s]+)/i);
    
    // Extract food items
    const foodMatch = query.match(/(order|get|want|like)\s+([a-z\s,]+)/i);
    
    return {
      restaurant: restaurantMatch ? restaurantMatch[1].trim() : undefined,
      food: foodMatch ? foodMatch[2].trim() : undefined,
      delivery: !query.includes('dine in') && !query.includes('dine-in')
    };
  }
}
