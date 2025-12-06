import { ml } from '@kittycad/lib';
import { CADHistoryRepository } from '@/repositories/cad-history.repository';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * CAD Generation Request parameters
 */
export interface CADGenerationRequest {
  description: string;
  category?: 'bracket' | 'plate' | 'beam' | 'fastener' | 'custom';
  format?: 'step' | 'stl' | 'obj' | 'gltf' | 'glb';
  units?: 'mm' | 'cm' | 'm' | 'in' | 'ft';
}

/**
 * CAD Generation Result
 */
export interface CADGenerationResult {
  id: string;
  status: 'completed' | 'failed';
  model_data: string; // base64 encoded
  parameters: Record<string, any>;
}

/**
 * CADGenerationService handles business logic for CAD model generation
 * Orchestrates: validation, Zoo Dev API calls, polling, and storage
 */
export class CADGenerationService {
  private static readonly MAX_POLL_ATTEMPTS = 150; // 5 minutes
  private static readonly POLL_INTERVAL = 2000; // 2 seconds

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
    if (!process.env.ZOO_API_TOKEN) {
      throw new Error(
        'Zoo Dev API token not configured. Please set ZOO_API_TOKEN in your environment variables.'
      );
    }

    // Business logic: Validate input
    this.validateRequest(request);

    const { description, category = 'custom', format = 'step', units = 'mm' } = request;

    try {
      // Business logic: Call Zoo Dev API
      const result = await ml.create_text_to_cad({
        body: {
          prompt: description,
        },
        output_format: format,
      });

      // Check for API errors
      if ('error_code' in result) {
        throw new Error(`CAD generation failed: ${(result as any).message || 'Unknown error'}`);
      }

      // Business logic: Poll for completion if async
      let finalResult = result;
      if (result && 'status' in result && result.status !== 'completed') {
        finalResult = await this.pollOperation(result.id || '', format);
      }

      // Business logic: Extract model data
      const modelData = this.extractModelData(finalResult, format);

      if (!modelData) {
        throw new Error('No model data received from Zoo Dev API');
      }

      const generationId = finalResult.id || `cad_${Date.now()}`;

      // Business logic: Store if user authenticated
      if (userId) {
        await this.storeGeneration(
          userId,
          generationId,
          description,
          category,
          format,
          units,
          modelData
        );
      }

      return {
        id: generationId,
        status: 'completed',
        model_data: modelData,
        parameters: {
          format,
          units,
          category,
          generated_at: new Date().toISOString(),
          prompt: description,
        },
      };
    } catch (error: any) {
      // Business logic: Store failed generation
      if (userId) {
        await this.storeFailedGeneration(userId, description, category, format, units, error.message);
      }

      // Business logic: Handle specific errors
      if (error.message?.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      }

      if (error.message?.includes('authentication')) {
        throw new Error('Authentication failed. Please check your API token.');
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
  }

  /**
   * Business logic: Poll Zoo Dev operation until completion
   */
  private static async pollOperation(operationId: string, format: string): Promise<any> {
    for (let attempt = 1; attempt <= this.MAX_POLL_ATTEMPTS; attempt++) {
      try {
        const operation = await (ml as any).get_text_to_cad_part_for_user({
          id: operationId,
        });

        // Check if completed
        if (operation.status === 'completed') {
          const outputKey = `source.${format}`;

          if (operation.outputs && operation.outputs[outputKey]) {
            return {
              id: operation.id,
              status: 'completed',
              outputs: operation.outputs,
            };
          } else {
            console.warn(`Expected output key ${outputKey} not found, returning all outputs`);
            return {
              id: operation.id,
              status: 'completed',
              outputs: operation.outputs,
            };
          }
        }

        // Check if failed
        if (operation.status === 'failed') {
          const errorMessage = (operation as any).error || 'Generation failed';
          throw new Error(errorMessage);
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
   * Business logic: Extract model data from Zoo Dev response
   */
  private static extractModelData(result: any, format: string): string | null {
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
   * Business logic: Store successful generation
   */
  private static async storeGeneration(
    userId: string,
    generationId: string,
    description: string,
    category: string,
    format: string,
    units: string,
    modelData: string
  ): Promise<void> {
    try {
      const supabase = await getSupabaseServer();
      const repository = new CADHistoryRepository(supabase);

      // Upload model to storage
      const modelBuffer = Buffer.from(modelData, 'base64');
      const filePath = `${userId}/${generationId}.${format}`;

      const { error: uploadError } = await supabase.storage
        .from('cad-models')
        .upload(filePath, modelBuffer, {
          contentType: `model/${format}`,
          upsert: false,
        });

      if (uploadError) {
        console.error('Failed to upload CAD model:', uploadError);
        // Continue to save history even if upload fails
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('cad-models').getPublicUrl(filePath);

      // Save to database
      await repository.create({
        user_id: userId,
        prompt: description,
        category,
        format,
        units,
        file_path: uploadError ? null : filePath,
        model_data_url: uploadError ? null : publicUrl,
        file_size: uploadError ? null : modelBuffer.length,
        zoo_operation_id: generationId,
        status: 'completed',
        error: null,
      });

      console.log(`Saved CAD generation to database: ${generationId}`);
    } catch (error) {
      console.error('Failed to store generation:', error);
      // Don't throw - storage failure shouldn't fail the generation
    }
  }

  /**
   * Business logic: Store failed generation
   */
  private static async storeFailedGeneration(
    userId: string,
    description: string,
    category: string,
    format: string,
    units: string,
    errorMessage: string
  ): Promise<void> {
    try {
      const supabase = await getSupabaseServer();
      const repository = new CADHistoryRepository(supabase);

      await repository.create({
        user_id: userId,
        prompt: description,
        category,
        format,
        units,
        file_path: null,
        model_data_url: null,
        file_size: null,
        zoo_operation_id: null,
        status: 'failed',
        error: errorMessage,
      });
    } catch (error) {
      console.error('Failed to store failed generation:', error);
    }
  }
}
