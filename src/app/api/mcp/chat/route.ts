/**
 * MCP Chat API Route
 * POST /api/mcp/chat
 * 
 * Uses MCP chat tool for AI assistant
 */

import { NextRequest, NextResponse } from 'next/server';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3001/mcp';

export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId = 'anonymous' } = body;

    // Validation
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    // Call Convex chat action directly (MCP server doesn't need to call Convex)
    // This avoids import path issues and simplifies the architecture
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      return NextResponse.json(
        { error: 'Convex not configured' },
        { status: 500 }
      );
    }

    const { ConvexHttpClient } = await import('convex/browser');
    const { api } = await import('../../../../../convex/_generated/api');
    
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    
    try {
      const result = await convex.action(api.actions.chat.sendMessage, {
        userId,
        message,
      });

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } catch (convexError: any) {
      console.error('[MCP Chat API] Convex error:', convexError);
      return NextResponse.json(
        {
          error: 'Chat failed',
          message: convexError.message || 'Failed to send message',
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('[MCP Chat API] Error:', error);

    // Check if MCP server is reachable
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch failed')) {
      return NextResponse.json(
        {
          error: 'MCP server unreachable',
          message: `Cannot connect to MCP server. Make sure it's running at ${MCP_SERVER_URL}`,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Chat failed',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

