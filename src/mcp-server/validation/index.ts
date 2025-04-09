import Ajv from 'ajv';
import { Request, Response, NextFunction } from 'express';

const ajv = new Ajv();

// MCP request schema
const mcpRequestSchema = {
  type: 'object',
  required: ['query'],
  properties: {
    query: { type: 'string', minLength: 1 },
    context: { 
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        conversation_id: { type: 'string' },
        transaction_id: { type: 'string' },
        previous_context: { type: 'object' }
      }
    }
  },
  additionalProperties: true
};

// MCP response schema
const mcpResponseSchema = {
  type: 'object',
  required: ['status'],
  properties: {
    status: { type: 'string', enum: ['success', 'error', 'pending'] },
    data: { type: 'object' },
    conversation_context: { 
      type: 'object',
      properties: {
        transaction_id: { type: 'string' },
        domain: { type: 'string' },
        state: { type: 'string' }
      }
    },
    message: { type: 'string' }
  }
};

// Validate MCP requests
export function validateMcpRequest(req: Request, res: Response, next: NextFunction) {
  const validate = ajv.compile(mcpRequestSchema);
  if (validate(req.body)) {
    next();
  } else {
    res.status(400).json({
      status: 'error',
      message: 'Invalid MCP request format',
      errors: validate.errors
    });
  }
}

// Validate MCP responses (for middleware or testing)
export function validateMcpResponse(response: any): { valid: boolean, errors: any[] | null } {
  const validate = ajv.compile(mcpResponseSchema);
  const valid = validate(response);
  return {
    valid,
    errors: valid ? null : validate.errors
  };
}
