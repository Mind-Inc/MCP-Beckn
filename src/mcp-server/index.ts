import express from 'express';
import { IntentMapper } from '../intent-mapper';
import { GooseOrchestrator } from '../goose-orchestrator';

export class MCPServer {
  private app = express();
  private port: number;
  private intentMapper: IntentMapper;
  private orchestrator: GooseOrchestrator;

  constructor(port: number = 3000) {
    this.port = port;
    this.intentMapper = new IntentMapper();
    this.orchestrator = new GooseOrchestrator();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes() {
    // MCP endpoint for AI assistants
    this.app.post('/mcp/v1', this.handleMCPRequest.bind(this));
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
  }

  private async handleMCPRequest(req: express.Request, res: express.Response) {
    try {
      // Extract request details from MCP protocol
      const { query, context } = req.body;
      
      if (!query) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing query in request'
        });
      }
      
      // Map the query to a Beckn intent
      const intent = await this.intentMapper.mapQueryToIntent(query, context || {});
      
      if (!intent) {
        return res.status(400).json({
          status: 'error',
          message: 'Could not map query to a Beckn intent'
        });
      }
      
      // Use Goose to orchestrate the workflow
      const result = await this.orchestrator.execute(intent);
      
      // Return result in MCP-compatible format
      return res.status(200).json({
        status: 'success',
        data: result,
        conversation_context: {
          transaction_id: result.transaction_id,
          domain: intent.domain,
          state: result.state
        }
      });
    } catch (error) {
      console.error('Error processing MCP request:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`MCP Server listening on port ${this.port}`);
    });
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new MCPServer();
  server.start();
}
