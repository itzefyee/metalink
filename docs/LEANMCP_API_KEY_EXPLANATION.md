# LeanMCP API Key: Why You're Not Using It (And When You Should)

## 🔍 Current Setup

You're currently using **LeanMCP SDK** (`@leanmcp/core`) to build your **own self-hosted MCP server**. This is different from using **LeanMCP's hosted services**.

## 📊 Two Ways to Use LeanMCP

### 1. **Self-Hosted MCP Server** (What You're Doing Now) ✅

**How it works:**
- Install `@leanmcp/core` as a library
- Build your own MCP server locally
- Run it on your own infrastructure (localhost:3001)
- No API key needed

**Your current setup:**
```typescript
// my-mcp-server/main.ts
import { createHTTPServer, MCPServer } from "@leanmcp/core";

const server = new MCPServer({ 
  name: "my-mcp-server", 
  version: "1.0.0"
});

await createHTTPServer(serverFactory, {
  port: 3001,
  cors: true
});
```

**Pros:**
- ✅ **Free** - No API costs
- ✅ **Full control** - Customize everything
- ✅ **Privacy** - Data stays on your server
- ✅ **No dependencies** - Works offline
- ✅ **No API key needed**

**Cons:**
- ❌ **You manage infrastructure** - Need to keep server running
- ❌ **No hosted features** - No built-in monitoring/analytics
- ❌ **Manual deployment** - You handle scaling

### 2. **LeanMCP Hosted Services** (Requires API Key) 🔑

**How it works:**
- Use LeanMCP's cloud platform
- Deploy your MCP server to their infrastructure
- Access hosted features (monitoring, analytics, etc.)
- Requires API key for authentication

**When you'd use it:**
```typescript
// If using LeanMCP hosted services
import { LeanMCPClient } from "@leanmcp/client";

const client = new LeanMCPClient({
  apiKey: process.env.LEANMCP_API_KEY, // ← API key needed here
  serverId: "your-server-id"
});
```

**Pros:**
- ✅ **Managed infrastructure** - They handle hosting
- ✅ **Built-in features** - Monitoring, analytics, scaling
- ✅ **Easy deployment** - Push to their platform
- ✅ **Production-ready** - Enterprise features

**Cons:**
- ❌ **Costs** - May have usage fees
- ❌ **API key required** - Need to sign up
- ❌ **Less control** - Limited customization
- ❌ **Dependency** - Requires internet connection

## 🤔 Why You're Not Using an API Key

**You're building a self-hosted MCP server**, which means:

1. **You're the host** - Running on `localhost:3001`
2. **No external service** - Not calling LeanMCP's APIs
3. **SDK only** - Using `@leanmcp/core` as a library, not a service
4. **Local operation** - Everything runs on your machine

**Think of it like:**
- **Self-hosted**: You're using WordPress software to build your own blog
- **Hosted**: You're using WordPress.com's hosted service

You're doing the first one - using the software, not the service.

## 🔑 When You WOULD Need an API Key

You'd need a LeanMCP API key if you want to:

1. **Deploy to LeanMCP Cloud**
   - Push your server to their platform
   - Use their hosting infrastructure
   - Access their dashboard

2. **Use LeanMCP Services**
   - Server monitoring
   - Analytics dashboard
   - Usage tracking
   - Team collaboration features

3. **Access LeanMCP APIs**
   - Build/deploy via API
   - Manage servers programmatically
   - Access hosted resources

## 📝 Current Architecture

```
Your Website (Next.js)
    ↓
Your API Route (/api/mcp/chat)
    ↓
Your MCP Server (localhost:3001)
    ↓ (using @leanmcp/core SDK)
Your Convex Backend
    ↓
Claude API (ANTHROPIC_API_KEY)
```

**No LeanMCP API key needed** because:
- You're not calling LeanMCP's APIs
- You're not using their hosting
- You're just using their SDK library

## 🚀 Should You Use LeanMCP Hosted Services?

### Use Self-Hosted (Current) If:
- ✅ You want full control
- ✅ You want to keep costs low
- ✅ You're comfortable managing servers
- ✅ You want data privacy
- ✅ You're building for internal use

### Use LeanMCP Hosted If:
- ✅ You want managed infrastructure
- ✅ You need monitoring/analytics
- ✅ You want easy deployment
- ✅ You're building for production scale
- ✅ You want enterprise features

## 🔄 How to Switch to Hosted (If Needed)

If you decide to use LeanMCP's hosted services:

1. **Get API Key:**
   - Sign up at LeanMCP Dashboard
   - Create an API key
   - Add to `.env`: `LEANMCP_API_KEY=your-key`

2. **Deploy Your Server:**
   ```bash
   # Install LeanMCP CLI
   npm install -g @leanmcp/cli
   
   # Login with API key
   leanmcp login
   
   # Deploy your server
   leanmcp deploy
   ```

3. **Update Your Code:**
   ```typescript
   // Use LeanMCP client instead of local server
   import { LeanMCPClient } from "@leanmcp/client";
   
   const client = new LeanMCPClient({
     apiKey: process.env.LEANMCP_API_KEY,
     serverId: "your-deployed-server-id"
   });
   ```

## ✅ Summary

**You're not using a LeanMCP API key because:**
- You're using `@leanmcp/core` as a **library** (SDK)
- You're running your **own server** locally
- You're not using LeanMCP's **hosted services**
- No external API calls = No API key needed

**This is perfectly fine!** Self-hosting gives you:
- Full control
- No costs
- Privacy
- Independence

**You only need an API key if:**
- You want to use LeanMCP's cloud platform
- You want hosted infrastructure
- You want their managed services

Your current setup is **correct and working** without an API key! 🎉

