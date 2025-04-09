import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Configuration
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'; // debug, info, warn, error
const LOG_TO_FILE = process.env.LOG_TO_FILE === 'true';

// Ensure log directory exists
if (LOG_TO_FILE && !fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Logger function
function log(level: string, message: string, meta: any = {}) {
  if (LOG_LEVELS[level] < LOG_LEVELS[LOG_LEVEL]) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  // Console output
  console[level](JSON.stringify(logEntry));
  
  // File output
  if (LOG_TO_FILE) {
    const logFile = path.join(LOG_DIR, `mcp-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
}

// Request tracing middleware
export function requestTracer(req: Request, res: Response, next: NextFunction) {
  // Generate request ID if not present
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  req.headers['x-request-id'] = requestId;
  
  // Store start time
  const startTime = Date.now();
  
  // Log incoming request
  log('info', `MCP Request: ${req.method} ${req.path}`, {
    requestId,
    body: req.body,
    ip: req.ip,
    headers: req.headers
  });
  
  // Capture and log response
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    
    // Log response
    log('info', `MCP Response completed in ${responseTime}ms`, {
      requestId,
      statusCode: res.statusCode,
      responseTime,
      body: typeof body === 'string' ? body.slice(0, 1000) : '[Binary]'
    });
    
    return originalSend.call(this, body);
  };
  
  next();
}

// Export logger functions
export const logger = {
  debug: (message: string, meta?: any) => log('debug', message, meta),
  info: (message: string, meta?: any) => log('info', message, meta),
  warn: (message: string, meta?: any) => log('warn', message, meta),
  error: (message: string, meta?: any) => log('error', message, meta)
};
