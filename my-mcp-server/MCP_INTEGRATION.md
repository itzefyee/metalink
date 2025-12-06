# MCP Integration for Metalink Project

This document describes the MCP (Model Context Protocol) services integrated into the Metalink CAD generation platform.

## Overview

The MCP server provides AI assistants (like Claude) with access to:
- **CAD Generation Tools**: Generate, parse, validate, and analyze CAD models
- **Standards Resources**: Access to AISC 360, AWS D1.1, and ASTM standards
- **Chat Interface**: AI-powered assistant with standards knowledge
- **Prompts**: Pre-built prompts for common CAD generation scenarios

## Services

### 1. CAD Service (`mcp/cad/index.ts`)

Provides tools for CAD generation and analysis:

#### Tools:

- **`generateCAD`**: Generate CAD models from natural language descriptions
  - Input: Description, category, format, units, material grade, edge type
  - Output: Generation ID and STEP file ID
  
- **`parseSTEP`**: Extract geometry data from STEP files
  - Input: Convex storage ID of STEP file
  - Output: Dimensions, holes, edge distances, center of mass
  
- **`validateCompliance`**: Validate CAD against AISC 360 and AWS D1.1
  - Input: Geometry data and specifications
  - Output: Compliance score, violations, warnings, passes
  
- **`analyzeCAD`**: Generate AI-powered manufacturing insights
  - Input: Geometry, compliance results, specifications
  - Output: Fabrication sequence, cost optimization, design improvements

### 2. Standards Service (`mcp/standards/index.ts`)

Provides resources and prompts for steel manufacturing standards:

#### Resources:

- **`aiscEdgeDistance`**: AISC 360 Table J3.4 - Edge Distance Requirements
- **`aiscHoleSpacing`**: AISC 360 Section J3.3 - Hole Spacing Requirements
- **`aiscWeldSizes`**: AISC 360 Table J2.4 - Weld Size Requirements
- **`awsPreheat`**: AWS D1.1 Table 3.2 - Preheat Requirements
- **`astmA36Properties`**: ASTM A36 Material Properties

#### Prompts:

- **`bracketPrompt`**: Generate prompt for standard steel bracket
- **`platePrompt`**: Generate prompt for steel plate with holes

### 3. Chat Service (`mcp/chat/index.ts`)

Provides AI-powered chat with standards knowledge:

#### Tools:

- **`chat`**: Chat with Metalink AI assistant
  - Input: User message and user ID
  - Output: AI response with standards context

### 4. Example Service (`mcp/example/index.ts`)

Basic example tools for testing:
- `calculate`: Arithmetic operations
- `echo`: Echo messages
- `serverInfo`: Server information resource
- `greeting`: Greeting prompt

## Usage Examples

### Generate CAD via MCP

```typescript
// AI can call this tool
{
  "name": "generateCAD",
  "arguments": {
    "description": "Steel bracket with 4 mounting holes, 6x4 inches",
    "category": "bracket",
    "format": "step",
    "units": "in",
    "materialGrade": "A36",
    "edgeType": "rolled"
  }
}
```

### Access Standards

```typescript
// AI can read this resource
{
  "uri": "standards://aisc-360-edge-distance"
}
```

### Chat with Assistant

```typescript
// AI can use this tool
{
  "name": "chat",
  "arguments": {
    "message": "What's the edge distance for a 1/2\" hole on a sheared edge?",
    "userId": "user123"
  }
}
```

## Integration with Convex

The MCP tools are designed to work with your Convex backend:

- **CAD Generation**: Calls `api.actions.generateCAD.generateFromDescription`
- **STEP Parsing**: Calls `api.actions.parseSTEP.extractGeometry`
- **Compliance**: Calls `api.actions.validateCompliance.validateWithCache`
- **AI Analysis**: Calls `api.actions.aiAnalysis.generateManufacturingInsights`
- **Chat**: Calls `api.actions.chat.sendMessage`

## Configuration

To enable full functionality, configure:

1. **Convex URL**: Set `NEXT_PUBLIC_CONVEX_URL` environment variable
2. **Convex Actions**: Ensure all actions are deployed
3. **API Keys**: Configure in Convex dashboard:
   - `ANTHROPIC_API_KEY`
   - `ZOO_DEV_API_KEY`
   - `UPSTASH_REDIS_REST_URL` (optional)
   - `UPSTASH_REDIS_REST_TOKEN` (optional)

## Testing

Use MCP Inspector to test all services:

```bash
npx @modelcontextprotocol/inspector http://localhost:3001/mcp
```

## Architecture

```
AI Assistant (Claude)
    ↓
MCP Server (my-mcp-server)
    ↓
MCP Tools/Resources
    ↓
Convex Actions/Queries
    ↓
External APIs (Zoo Dev, Anthropic)
```

## Benefits

1. **AI Integration**: Claude can use your CAD tools directly
2. **Standards Access**: AI has instant access to manufacturing standards
3. **Context-Aware**: AI understands your domain (steel manufacturing)
4. **Extensible**: Easy to add new tools and resources
5. **Standardized**: Uses MCP protocol for compatibility

## Next Steps

1. **Connect to Convex**: Update tools to call actual Convex actions
2. **Add More Standards**: Expand standards database
3. **Custom Prompts**: Add domain-specific prompts
4. **Error Handling**: Improve error messages and validation
5. **Testing**: Test with real AI assistants

