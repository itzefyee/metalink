import dotenv from "dotenv";
import { MCPServer } from "@leanmcp/core";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Load environment variables
dotenv.config();

/**
 * STDIO version for Cursor MCP integration
 * This uses standard input/output instead of HTTP
 */
const server = new MCPServer({ 
  name: "my-mcp-server", 
  version: "1.0.0",
  logging: true
});

// Services are automatically discovered and registered from ./mcp
const mcpServer = server.getServer();

// Create STDIO transport and connect
const transport = new StdioServerTransport();

(async () => {
  try {
    await mcpServer.connect(transport);
    // Log to stderr (stdout is used for MCP protocol)
    console.error("MCP Server connected via STDIO");
  } catch (error) {
    console.error("Failed to connect:", error);
    process.exit(1);
  }
})();

// Handle process termination
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});


