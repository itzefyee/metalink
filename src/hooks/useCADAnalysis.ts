import { useState, useCallback } from 'react';
import { DrawingAnalysis, FileUploadState, APIResponse } from '@/types/cad.types';

export interface CADAnalysisState {
  isAnalyzing: boolean;
  error: string | null;
  analysis: DrawingAnalysis | null;
}

export const useCADAnalysis = (options: any = {}) => {
  const { onSuccess, onError } = options;

  const [state, setState] = useState<CADAnalysisState>({
    isAnalyzing: false,
    error: null,
    analysis: null,
  });

  const analyzeDrawing = useCallback(
    async (file: File, cadModelData?: any, userId?: string) => {
      setState({
        isAnalyzing: true,
        error: null,
        analysis: null,
      });

      try {
        const formData = new FormData();
        formData.append('file', file);

        if (cadModelData) {
          formData.append('cadModelData', JSON.stringify(cadModelData));
        }

        if (userId) {
          formData.append('userId', userId);
        }

        const response = await fetch('/api/analyze-drawing', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to analyze drawing');
        }

        const data: APIResponse<DrawingAnalysis> = await response.json();

        if (data.success && data.data) {
          setState({
            isAnalyzing: false,
            error: null,
            analysis: data.data,
          });

          onSuccess?.(data.data);
          return data.data;
        } else {
          throw new Error(data.error || 'Analysis failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze';
        setState({
          isAnalyzing: false,
          error: errorMessage,
          analysis: null,
        });
        onError?.(errorMessage);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      isAnalyzing: false,
      error: null,
      analysis: null,
    });
  }, []);

  return {
    ...state,
    analyzeDrawing,
    reset,
  };
};


