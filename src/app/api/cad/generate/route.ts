/**
 * CAD Generation API Route
 * POST /api/cad/generate
 * 
 * Handles CAD generation requests through Zoo Dev API
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, category = 'custom', format = 'step', units = 'mm', specifications, userId } = body;

    // Validation
    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (description.length > 1000) {
      return NextResponse.json(
        { error: 'Description too long (max 1000 characters)' },
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

    // Generate persistent user ID if not provided
    const finalUserId = userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Call Convex action
    const result = await convex.action(api.actions.generateCAD.generateFromDescription, {
      description,
      specifications: specifications || {
        dimensions: { length: 6, width: 4, height: 0.25, thickness: 0.25 },
        material: { grade: "A36", edgeType: "rolled" },
      },
      userId: finalUserId,
    });

    // Return result
    return NextResponse.json({
      id: result.generationId,
      status: 'completed',
      parameters: {
        format,
        units,
        category,
        generated_at: new Date().toISOString(),
        prompt: description,
      },
      stepFileId: result.stepFileId,
    });

  } catch (error: any) {
    console.error('[CAD API] Generation error:', error);

    // Handle specific errors
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again in a few minutes.',
        },
        { status: 429 }
      );
    }

    if (error.message?.includes('authentication') || error.message?.includes('API key')) {
      return NextResponse.json(
        {
          error: 'Authentication failed',
          message: 'API authentication failed. Please check configuration.',
        },
        { status: 401 }
      );
    }

    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        {
          error: 'Request timeout',
          message: 'The generation took too long. Try simplifying your description.',
        },
        { status: 504 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

