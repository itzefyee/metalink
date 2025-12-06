/**
 * CAD Status API Route
 * GET /api/cad/status/[id]
 * 
 * Returns the status of a CAD generation operation
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      );
    }

    // Check if Convex is available
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      return NextResponse.json(
        { error: 'Convex not configured' },
        { status: 500 }
      );
    }

    // Initialize Convex client
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // Query generation status
    const generation = await convex.query(api.queries.getGeneration, {
      id: id as Id<"cadGenerations">,
    });

    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      );
    }

    // Map to standard response format
    return NextResponse.json({
      id: generation._id,
      status: generation.status as 'queued' | 'processing' | 'completed' | 'failed',
      created_at: new Date(generation.createdAt).toISOString(),
      completed_at: generation.status === 'completed' ? new Date(generation.createdAt).toISOString() : undefined,
      error: generation.status === 'failed' ? 'Generation failed' : undefined,
    });

  } catch (error: any) {
    console.error('[CAD API] Status error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch status',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

