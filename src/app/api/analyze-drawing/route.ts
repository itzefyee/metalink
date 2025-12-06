import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, DrawingAnalysis } from '@/types/cad.types';
import { CADAnalysisService } from '@/services/cad-analysis.service';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    // Parse request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const cadDataJson = formData.get('cadModelData') as string;
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json<APIResponse<null>>(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      );
    }

    // Parse CAD model data if provided
    let cadModelData = null;
    if (cadDataJson) {
      try {
        cadModelData = JSON.parse(cadDataJson);
      } catch (e) {
        console.warn('Failed to parse CAD model data:', e);
      }
    }

    // Generate persistent user ID if not provided
    const finalUserId = userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Service layer handles everything
    const analysis = await CADAnalysisService.analyzeDrawing(file, cadModelData, finalUserId);

    return NextResponse.json<APIResponse<DrawingAnalysis>>({
      success: true,
      data: analysis,
      message: 'Analysis completed successfully',
    });
  } catch (error) {
    console.error('CAD analysis API error:', error);
    return NextResponse.json<APIResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}


