/**
 * MCP Client Library
 * 
 * Helper functions to call MCP server from your Next.js app
 */

const MCP_API_BASE = '/api/mcp';

/**
 * Chat with MCP assistant
 */
export async function chatViaMCP(message: string, userId: string = 'anonymous') {
  const response = await fetch(`${MCP_API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Chat failed: ${response.status}`);
  }

  return response.json();
}
