/**
 * CAD Generation React Hooks
 * 
 * React Query hooks for CAD generation operations
 * Provides caching, automatic refetching, and optimistic updates
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CADAPI } from '@/lib/cad-api';
import { CADGenerationRequest, CADGenerationResult, CADHistoryItem } from '@/types/cad.types';
import { useCADStore } from '@/stores/cad.store';

/**
 * Hook for CAD generation
 */
export function useCADGeneration() {
  const queryClient = useQueryClient();
  const { addToRecentPrompts } = useCADStore();

  return useMutation({
    mutationFn: async (request: CADGenerationRequest) => {
      // Get user ID from localStorage
      const userId =
        typeof window !== 'undefined'
          ? localStorage.getItem('metalink_user_id') || undefined
          : undefined;

      return await CADAPI.generate(request, userId);
    },
    onSuccess: (data, variables) => {
      // Add prompt to recent prompts
      addToRecentPrompts(variables.description);

      // Invalidate history to show new generation
      queryClient.invalidateQueries({ queryKey: ['cad-history'] });
    },
    onError: (error: any) => {
      console.error('CAD generation failed:', error);
    },
  });
}

/**
 * Hook for checking generation status
 */
export function useGenerationStatus(generationId?: string) {
  return useQuery({
    queryKey: ['cad-status', generationId],
    queryFn: () => CADAPI.getStatus(generationId!),
    enabled: !!generationId,
    refetchInterval: (data) => {
      // Stop polling if completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      // Poll every 2 seconds if still processing
      return 2000;
    },
  });
}

/**
 * Hook for generation history
 */
export function useCADHistory(limit: number = 20) {
  const userId =
    typeof window !== 'undefined'
      ? localStorage.getItem('metalink_user_id') || 'anonymous'
      : 'anonymous';

  return useQuery<CADHistoryItem[]>({
    queryKey: ['cad-history', userId, limit],
    queryFn: () => CADAPI.getHistory(userId, limit),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

/**
 * Hook for deleting a generation
 */
export function useDeleteGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (generationId: string) => CADAPI.deleteGeneration(generationId),
    onSuccess: () => {
      // Invalidate history to remove deleted item
      queryClient.invalidateQueries({ queryKey: ['cad-history'] });
    },
  });
}

/**
 * Hook for downloading a CAD file
 */
export function useDownloadCAD() {
  return useMutation({
    mutationFn: async ({ generationId, format = 'step' }: { generationId: string; format?: string }) => {
      const blob = await CADAPI.downloadFile(generationId, format);
      const filename = `model_${generationId}.${format}`;
      CADAPI.triggerDownload(blob, filename);
      return { generationId, format, filename };
    },
  });
}

/**
 * Hook for batch operations
 */
export function useCADBatch() {
  const queryClient = useQueryClient();

  const deleteMultiple = async (generationIds: string[]) => {
    await Promise.all(generationIds.map((id) => CADAPI.deleteGeneration(id)));
    queryClient.invalidateQueries({ queryKey: ['cad-history'] });
  };

  const downloadMultiple = async (generationIds: string[], format: string = 'step') => {
    for (const id of generationIds) {
      const blob = await CADAPI.downloadFile(id, format);
      CADAPI.triggerDownload(blob, `model_${id}.${format}`);
      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  return {
    deleteMultiple,
    downloadMultiple,
  };
}

