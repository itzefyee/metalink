/**
 * CAD Download API Route
 * GET /api/cad/download/[id]
 * 
 * Downloads a generated CAD file
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
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'step';

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

    // Get generation
    const generation = await convex.query(api.queries.getGeneration, {
      id: id as Id<"cadGenerations">,
    });

    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      );
    }

    if (!generation.stepFileId) {
      return NextResponse.json(
        { error: 'File not available' },
        { status: 404 }
      );
    }

    // Get file URL from Convex storage
    const fileUrl = await convex.query(api.queries.getFileUrl, {
      storageId: generation.stepFileId,
    });

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'File URL not found' },
        { status: 404 }
      );
    }

    // Fetch the file
    const fileResponse = await fetch(fileUrl);
    
    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch file' },
        { status: 500 }
      );
    }

    const fileBlob = await fileResponse.blob();

    // Return file with appropriate headers
    return new NextResponse(fileBlob, {
      headers: {
        'Content-Type': `model/${format}`,
        'Content-Disposition': `attachment; filename="model_${id}.${format}"`,
      },
    });

  } catch (error: any) {
    console.error('[CAD API] Download error:', error);

    return NextResponse.json(
      {
        error: 'Failed to download file',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

