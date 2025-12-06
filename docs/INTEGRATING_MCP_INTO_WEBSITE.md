# Integrating MCP Server into Your Next.js Website

## Overview

This guide shows how to connect your Next.js website to the MCP server, allowing your website to use MCP tools instead of (or alongside) Convex actions.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Website   │────────▶│  Next.js API │────────▶│  MCP Server │
│  (Frontend) │         │    Routes    │         │  (Port 3001)│
└─────────────┘         └──────────────┘         └─────────────┘
```

## Setup

### 1. Environment Variable

Add to `.env.local`:

```bash
MCP_SERVER_URL=http://localhost:3001/mcp
```

For production, set this to your deployed MCP server URL.

### 2. Ensure MCP Server is Running

```bash
cd my-mcp-server
npm run dev
```

The server must be running for the API routes to work.

## API Routes Created

### `/api/mcp/tools/call` - Generic Tool Call

Call any MCP tool:

```typescript
// Frontend usage
const response = await fetch('/api/mcp/tools/call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    toolName: 'calculate',
    arguments: { a: 10, b: 5, operation: 'add' }
  })
});
```

### `/api/mcp/cad/generate` - CAD Generation

Generate CAD using MCP:

```typescript
// Frontend usage
const response = await fetch('/api/mcp/cad/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'Steel bracket with 4 holes',
    category: 'bracket',
    format: 'step',
    units: 'mm'
  })
});
```

### `/api/mcp/chat` - AI Chat

Chat with MCP assistant:

```typescript
// Frontend usage
const response = await fetch('/api/mcp/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What is AISC 360?',
    userId: 'user123'
  })
});
```

### `/api/mcp/resources/read` - Read Standards

Read standards documents:

```typescript
// Frontend usage
const response = await fetch('/api/mcp/resources/read', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    uri: 'standards://aisc-360-edge-distance'
  })
});
```

## Using the MCP Client Library

A helper library is provided at `src/lib/mcp-client.ts`:

```typescript
import { generateCADViaMCP, chatViaMCP, readMCPResource } from '@/lib/mcp-client';

// Generate CAD
const result = await generateCADViaMCP({
  description: 'Steel bracket',
  category: 'bracket',
  format: 'step'
});

// Chat
const chatResponse = await chatViaMCP('What is AISC 360?', userId);

// Read standards
const standard = await readMCPResource('standards://aisc-360-edge-distance');
```

## Updating Your Components

### Update Chatbot Component

Replace Convex action with MCP:

```typescript
// Before (using Convex)
const sendMessage = useAction(api.actions.chat.sendMessage);

// After (using MCP)
const handleSend = async () => {
  const response = await fetch('/api/mcp/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: input,
      userId: userId
    })
  });
  const data = await response.json();
  // Update UI with data.message
};
```

### Update CAD Generator

Replace Convex with MCP:

```typescript
// Before
const result = await convex.action(api.actions.generateCAD.generateFromDescription, {...});

// After
const result = await fetch('/api/mcp/cad/generate', {
  method: 'POST',
  body: JSON.stringify({ description, ... })
});
```

## Error Handling

All API routes handle:
- MCP server unreachable (503)
- Invalid requests (400)
- Tool execution errors (400)
- Server errors (500)

Check response status and error messages:

```typescript
const response = await fetch('/api/mcp/cad/generate', {...});
if (!response.ok) {
  const error = await response.json();
  console.error('Error:', error.message);
  // Show error to user
}
```

## Testing

### 1. Test MCP Server is Running

```powershell
netstat -ano | findstr :3001
```

Should show `LISTENING`.

### 2. Test API Route

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/mcp/tools/call" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"toolName":"calculate","arguments":{"a":10,"b":5,"operation":"add"}}'
```

### 3. Test from Frontend

```typescript
// In your component
const testMCP = async () => {
  try {
    const response = await fetch('/api/mcp/tools/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolName: 'echo',
        arguments: { message: 'Hello from website!' }
      })
    });
    const data = await response.json();
    console.log('MCP Response:', data);
  } catch (error) {
    console.error('MCP Error:', error);
  }
};
```

## Migration Strategy

### Option 1: Gradual Migration

Keep both Convex and MCP, migrate one feature at a time:

1. Start with chat → Use MCP chat tool
2. Then CAD generation → Use MCP generateCAD tool
3. Then compliance → Use MCP validateCompliance tool

### Option 2: Feature Flag

Add environment variable to switch between Convex and MCP:

```typescript
const USE_MCP = process.env.NEXT_PUBLIC_USE_MCP === 'true';

if (USE_MCP) {
  // Use MCP API routes
  return await fetch('/api/mcp/cad/generate', {...});
} else {
  // Use Convex
  return await convex.action(api.actions.generateCAD.generateFromDescription, {...});
}
```

### Option 3: Hybrid Approach

- Use Convex for data persistence
- Use MCP for AI/standards features
- Best of both worlds

## Production Deployment

### 1. Deploy MCP Server

Deploy `my-mcp-server` to a hosting service:
- Railway
- Render
- Fly.io
- Or keep it as a separate service

### 2. Update Environment Variables

```bash
# Production
MCP_SERVER_URL=https://your-mcp-server.com/mcp
```

### 3. Update API Routes

The API routes will automatically use the `MCP_SERVER_URL` environment variable.

## Benefits

✅ **Unified Backend** - Website and AI assistants use same tools  
✅ **Standards Access** - Website can read standards documents  
✅ **AI Integration** - Website can use AI-powered features  
✅ **Consistency** - Same tools for website and AI assistants  

## Current Status

- ✅ API routes created
- ✅ MCP client library created
- ⚠️ Components still use Convex (need to update)
- ⚠️ MCP server needs to be running

## Next Steps

1. **Start MCP server**: `cd my-mcp-server && npm run dev`
2. **Test API routes**: Use the test commands above
3. **Update components**: Replace Convex calls with MCP API calls
4. **Deploy**: Deploy both Next.js app and MCP server

