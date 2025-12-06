/**
 * CAD API Client
 * 
 * Client-side HTTP wrapper for CAD generation API
 * Provides a clean interface for React components
 */

import { CADGenerationRequest, CADGenerationResult, CADHistoryItem } from '@/types/cad.types';

/**
 * CAD API Client
 * Wraps all CAD-related API calls
 */
export class CADAPI {
  private static readonly BASE_URL = '/api/cad';

  /**
   * Generate a new CAD model
   */
  static async generate(request: CADGenerationRequest, userId?: string): Promise<CADGenerationResult> {
    const response = await fetch(`${this.BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Generation failed');
    }

    return await response.json();
  }

  /**
   * Check status of a generation
   */
  static async getStatus(generationId: string): Promise<any> {
    const response = await fetch(`${this.BASE_URL}/status/${generationId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to get status');
    }

    return await response.json();
  }

  /**
   * Get generation history
   */
  static async getHistory(userId: string, limit: number = 20): Promise<CADHistoryItem[]> {
    const response = await fetch(`${this.BASE_URL}/history?userId=${userId}&limit=${limit}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to get history');
    }

    return await response.json();
  }

  /**
   * Delete a generation
   */
  static async deleteGeneration(generationId: string): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/generation/${generationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to delete');
    }
  }

  /**
   * Download a CAD file
   */
  static async downloadFile(generationId: string, format: string = 'step'): Promise<Blob> {
    const response = await fetch(`${this.BASE_URL}/download/${generationId}?format=${format}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to download');
    }

    return await response.blob();
  }

  /**
   * Helper: Trigger file download in browser
   */
  static triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}



