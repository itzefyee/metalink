/**
 * CAD Generation Service
 * 
 * Service layer for CAD generation using Zoo Dev API
 * Handles: validation, API integration, polling, storage, and business logic
 */

import { CADGenerationRequest, CADGenerationResult, ZooDevResponse } from '@/types/cad.types';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

/**
 * CADGenerationService handles business logic for CAD model generation
 * Orchestrates: validation, Zoo Dev API calls, polling, and storage
 */
export class CADGenerationService {
  private static readonly MAX_POLL_ATTEMPTS = 150; // 5 minutes
  private static readonly POLL_INTERVAL = 2000; // 2 seconds
  private static readonly API_TIMEOUT = 30000; // 30 seconds

  /**
   * Generate a CAD model from text description
   * 
   * @param request - Generation parameters
   * @param userId - Optional user ID for storage
   * @returns Generated CAD model data
   */
  static async generateCAD(
    request: CADGenerationRequest,
    userId?: string
  ): Promise<CADGenerationResult> {
    // Business logic: Validate API configuration
    if (!process.env.NEXT_PUBLIC_ZOO_DEV_API_KEY) {
      throw new Error(
        'Zoo Dev API key not configured. Please set NEXT_PUBLIC_ZOO_DEV_API_KEY in your environment variables.'
      );
    }

    // Business logic: Validate input
    this.validateRequest(request);

    const { description, category = 'custom', format = 'step', units = 'mm', specifications } = request;

    try {
      // Business logic: Call Zoo Dev API through our proxy
      const response = await fetch('/api/cad/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          category,
          format,
          units,
          specifications,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'CAD generation failed');
      }

      const result: CADGenerationResult = await response.json();

      return result;
    } catch (error: any) {
      // Business logic: Handle specific errors
      if (error.message?.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      }

      if (error.message?.includes('authentication')) {
        throw new Error('Authentication failed. Please check your API token.');
      }

      if (error.message?.includes('timeout')) {
        throw new Error('Request timed out. The model may be too complex. Try simplifying your description.');
      }

      throw new Error(`CAD generation service error: ${error.message}`);
    }
  }

  /**
   * Business logic: Validate generation request
   */
  private static validateRequest(request: CADGenerationRequest): void {
    if (!request.description || request.description.trim().length === 0) {
      throw new Error('Description is required');
    }

    if (request.description.length > 1000) {
      throw new Error('Description too long (max 1000 characters)');
    }

    if (request.format && !['step', 'stl', 'obj', 'gltf', 'glb'].includes(request.format)) {
      throw new Error('Invalid format. Must be one of: step, stl, obj, gltf, glb');
    }

    if (request.units && !['mm', 'cm', 'm', 'in', 'ft'].includes(request.units)) {
      throw new Error('Invalid units. Must be one of: mm, cm, m, in, ft');
    }
  }

  /**
   * Business logic: Poll Zoo Dev operation until completion
   */
  static async pollOperation(operationId: string, format: string): Promise<ZooDevResponse> {
    for (let attempt = 1; attempt <= this.MAX_POLL_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(`/api/cad/status/${operationId}`, {
          signal: AbortSignal.timeout(this.API_TIMEOUT),
        });

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.statusText}`);
        }

        const operation: ZooDevResponse = await response.json();

        // Check if completed
        if (operation.status === 'completed') {
          return operation;
        }

        // Check if failed
        if (operation.status === 'failed') {
          throw new Error(operation.error || 'Generation failed');
        }

        // Still in progress, wait and retry
        await new Promise((resolve) => setTimeout(resolve, this.POLL_INTERVAL));
      } catch (error: any) {
        // If it's a known error, throw immediately
        if (error.message && !error.message.includes('fetch') && !error.message.includes('network')) {
          throw error;
        }

        // For network errors, log and continue
        console.warn(`Poll attempt ${attempt} encountered error:`, error.message);

        if (attempt === this.MAX_POLL_ATTEMPTS) {
          throw new Error(`Polling failed after ${this.MAX_POLL_ATTEMPTS} attempts: ${error.message}`);
        }

        await new Promise((resolve) => setTimeout(resolve, this.POLL_INTERVAL));
      }
    }

    throw new Error(
      `Operation ${operationId} did not complete within ${
        (this.MAX_POLL_ATTEMPTS * this.POLL_INTERVAL) / 1000
      } seconds`
    );
  }

  /**
   * Business logic: Get generation history
   */
  static async getHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const response = await fetch(`/api/cad/history?userId=${userId}&limit=${limit}`);

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to get history:', error);
      throw new Error(`Failed to get generation history: ${error.message}`);
    }
  }

  /**
   * Business logic: Delete generation from history
   */
  static async deleteGeneration(generationId: string): Promise<void> {
    try {
      const response = await fetch(`/api/cad/generation/${generationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete generation');
      }
    } catch (error: any) {
      throw new Error(`Failed to delete generation: ${error.message}`);
    }
  }

  /**
   * Business logic: Download CAD file
   */
  static async downloadFile(generationId: string, format: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/cad/download/${generationId}?format=${format}`);

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      return await response.blob();
    } catch (error: any) {
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Business logic: Extract model data from Zoo Dev response
   */
  static extractModelData(result: any, format: string): string | null {
    const outputKey = `source.${format}`;

    if (result.outputs && typeof result.outputs === 'object') {
      // Try specific format key first
      if (result.outputs[outputKey]) {
        const output = result.outputs[outputKey];
        return typeof output === 'object' && output !== null && 'content' in output
          ? (output as any).content
          : typeof output === 'string'
          ? output
          : String(output);
      }

      // Fallback: try any available output
      const availableKeys = Object.keys(result.outputs);
      for (const key of availableKeys) {
        const output = result.outputs[key];
        if (output) {
          if (typeof output === 'string') {
            return output;
          } else if (typeof output === 'object' && output !== null && 'content' in output) {
            return (output as any).content;
          } else {
            return String(output);
          }
        }
      }
    }

    // Additional fallback for older API responses
    const resultAny = result as any;
    if (resultAny.model_data) {
      return resultAny.model_data;
    } else if (resultAny.data?.model_data) {
      return resultAny.data.model_data;
    }

    return null;
  }

  /**
   * Business logic: Format error message for user
   */
  static formatError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }
}

