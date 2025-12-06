import dotenv from "dotenv";
import { createHTTPServer, MCPServer } from "@leanmcp/core";

// Load environment variables
dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

/**
 * Create and configure the MCP server
 * Services are automatically discovered from ./mcp directory
 */
const serverFactory = async () => {
  const server = new MCPServer({ 
    name: "my-mcp-server", 
    version: "1.0.0",
    logging: true
  });

  // Services are automatically discovered and registered from ./mcp
  return server.getServer();
};

// Use createHTTPServer which handles SSE (Server-Sent Events) for Streamable HTTP
// This is required for MCP Inspector to connect properly
await createHTTPServer(serverFactory, {
  port: PORT,
  cors: true,
  logging: true  // Log HTTP requests
});

console.log(`\nmy-mcp-server MCP Server`);
console.log(`HTTP endpoint: http://localhost:${PORT}/mcp`);
console.log(`Health check: http://localhost:${PORT}/health`);
console.log(`\n💡 Tip: Use MCP Inspector to connect: npx @modelcontextprotocol/inspector http://localhost:${PORT}/mcp`);
