/**
 * CAD History API Route
 * GET /api/cad/history
 * 
 * Returns CAD generation history for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
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

    // Query history
    const history = await convex.query(api.queries.listGenerations, { limit });

    // Filter by user if needed (in production, you'd do this server-side)
    const userHistory = history.filter((item: any) => item.userId === userId || !item.userId);

    return NextResponse.json(userHistory);

  } catch (error: any) {
    console.error('[CAD API] History error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch history',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}


