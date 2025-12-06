# CAD Generation System - Complete Extraction

This document contains the complete CAD generation system extracted from Metalink, ready to be reused in another project. The system provides text-to-CAD generation using the Zoo Dev API (KittyCAD) with full history tracking, file storage, and React integration.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Service Layer](#service-layer)
4. [API Routes](#api-routes)
5. [Client-Side API](#client-side-api)
6. [React Hooks](#react-hooks)
7. [State Management](#state-management)
8. [Repository Pattern](#repository-pattern)
9. [Database Schema](#database-schema)
10. [TypeScript Types](#typescript-types)
11. [Setup Instructions](#setup-instructions)
12. [Dependencies](#dependencies)
13. [Usage Examples](#usage-examples)
14. [Configuration](#configuration)

---

## Overview

The CAD generation system enables users to generate 3D CAD models from natural language descriptions. It integrates with the Zoo Dev API (KittyCAD) to convert text prompts into production-ready CAD files in various formats (STEP, STL, OBJ, GLTF, GLB).

### Key Features

- **Text-to-CAD Generation**: Convert natural language descriptions to 3D CAD models
- **Multiple Formats**: Support for STEP, STL, OBJ, GLTF, GLB formats
- **Async Operation Handling**: Server-side polling for long-running operations
- **History Tracking**: Complete history of all generations with metadata
- **File Storage**: Automatic storage of generated models in Supabase Storage
- **React Integration**: Ready-to-use hooks and components
- **Cache Management**: Automatic cache invalidation for history updates
- **User Preferences**: Persistent format and unit preferences

### Technology Stack

- **Backend**: Next.js API Routes
- **External API**: Zoo Dev (KittyCAD) via `@kittycad/lib`
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **TypeScript**: Full type safety

---

## Architecture

### System Flow

```
User Input (Text Description)
    ↓
React Component (CADGenerator)
    ↓
React Hook (useCADGeneration)
    ↓
Client API (CADAPI)
    ↓
Next.js API Route (/api/generate-cad)
    ↓
Service Layer (CADGenerationService)
    ↓
Zoo Dev API (KittyCAD)
    ↓
Polling for Completion
    ↓
Extract Model Data
    ↓
Store in Database & Storage
    ↓
Return to Client
```

### Layer Responsibilities

1. **Service Layer** (`CADGenerationService`): Business logic, API calls, polling, validation
2. **API Routes**: Request handling, authentication, error responses
3. **Client API** (`CADAPI`): HTTP client wrapper for React components
4. **React Hooks**: React Query integration, cache management
5. **Repository**: Database abstraction layer
6. **State Management**: User preferences and recent prompts

---

## Service Layer

### File: `src/services/cad-generation.service.ts`

The service layer contains all business logic for CAD generation, including validation, API integration, polling, and storage.

```typescript
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
```

### Key Service Methods

- **`generateCAD()`**: Main entry point for CAD generation
- **`validateRequest()`**: Input validation
- **`pollOperation()`**: Polls Zoo Dev API for async operation completion
- **`extractModelData()`**: Extracts model data from API response
- **`storeGeneration()`**: Saves successful generation to database and storage
- **`storeFailedGeneration()`**: Saves failed generation for debugging

---

## API Routes

### Generate CAD Route: `src/app/api/generate-cad/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CADGenerationService, type CADGenerationRequest } from '@/services/cad-generation.service';
import { getSupabaseServer } from '@/lib/supabase-server';

interface CADGenerationResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    model_data?: string;
    preview_image?: string;
    parameters?: Record<string, any>;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<CADGenerationResponse>> {
  try {
    // Controller responsibility: Parse request
    const body: CADGenerationRequest = await request.json();

    // Get user ID if authenticated
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Service layer handles validation, API calls, polling, and storage
    const result = await CADGenerationService.generateCAD(body, user?.id);

    // Controller responsibility: Return response
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('CAD generation API error:', error);

    // Handle specific error types
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 429 }
      );
    }

    if (error.message?.includes('authentication')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 401 }
      );
    }

    if (error.message?.includes('required') || error.message?.includes('too long')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error during CAD generation',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    service: 'CAD Generation API',
    timestamp: new Date().toISOString(),
    zoo_api_configured: !!process.env.ZOO_API_TOKEN,
  });
}
```

### CAD History Route: `src/app/api/cad-history/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { CADHistoryRepository } from '@/repositories/cad-history.repository';

// GET - Retrieve CAD generation history
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await getSupabaseServer();
    const repository = new CADHistoryRepository(supabase);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Please sign in to view history'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { items, total } = await repository.findByUserId(user.id, limit, offset);

    // Transform data
    const transformedData = items.map(item => ({
      id: item.id,
      prompt: item.prompt,
      category: item.category || '',
      format: item.format,
      units: item.units || 'mm',
      model_data_url: item.model_data_url ?? undefined,
      file_path: item.file_path ?? undefined,
      generated_at: item.generated_at || new Date().toISOString(),
      status: (item.status as 'completed' | 'failed' | 'processing') || 'completed',
      error: item.error ?? undefined,
      zoo_operation_id: item.zoo_operation_id ?? undefined
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        total,
        limit,
        offset,
        hasMore: (offset + limit) < total
      }
    });

  } catch (error: any) {
    console.error('Error retrieving CAD history:', error);
    return NextResponse.json({
      success: false,
      error: `Failed to retrieve history: ${error.message || 'Unknown error'}`
    }, { status: 500 });
  }
}

// DELETE - Clear history or delete specific item
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await getSupabaseServer();
    const repository = new CADHistoryRepository(supabase);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Please sign in'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Delete specific item
      const toDelete = await repository.findById(id);

      if (!toDelete || toDelete.user_id !== user.id) {
        return NextResponse.json({
          success: false,
          error: 'Item not found'
        }, { status: 404 });
      }

      // Delete file from storage if exists
      if (toDelete.file_path) {
        await supabase.storage
          .from('cad-models')
          .remove([toDelete.file_path]);
      }

      await repository.deleteById(id, user.id);
    } else {
      // Clear all history for this user
      const { data: items } = await supabase
        .from('cad_history')
        .select('file_path')
        .eq('user_id', user.id);

      // Delete all files from storage
      if (items && items.length > 0) {
        const filePaths = items
          .map(item => item.file_path)
          .filter(Boolean) as string[];

        if (filePaths.length > 0) {
          await supabase.storage
            .from('cad-models')
            .remove(filePaths);
        }
      }

      await repository.deleteAllForUser(user.id);
    }

    return NextResponse.json({
      success: true
    });

  } catch (error: any) {
    console.error('Error deleting CAD history:', error);
    return NextResponse.json({
      success: false,
      error: `Failed to delete history: ${error.message || 'Unknown error'}`
    }, { status: 500 });
  }
}
```

---

## Client-Side API

### File: `src/lib/api/cad-api.ts`

```typescript
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
 * CAD Generation Result from API
 */
export interface CADGenerationResult {
  id: string;
  status: 'completed' | 'failed' | 'processing';
  model_data?: string; // base64 encoded model file
  preview_image?: string;
  parameters?: Record<string, any>;
  error?: string;
}

/**
 * CAD History Item
 */
export interface CADHistoryItem {
  id: string;
  prompt: string;
  category: string;
  format: string;
  units: string;
  model_data_url?: string;
  file_path?: string;
  generated_at: string;
  status: 'completed' | 'failed' | 'processing';
  error?: string;
  zoo_operation_id?: string;
}

/**
 * CAD History Response with pagination
 */
export interface CADHistoryResponse {
  data: CADHistoryItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * CADAPI handles client-side API calls for CAD generation and history
 */
export class CADAPI {
  private static readonly GENERATE_URL = '/api/generate-cad';
  private static readonly HISTORY_URL = '/api/cad-history';

  /**
   * Generates a CAD model from a text description
   */
  static async generateCAD(
    request: CADGenerationRequest
  ): Promise<CADGenerationResult> {
    try {
      // Validate required fields
      if (!request.description || request.description.trim().length === 0) {
        throw new Error('Description is required for CAD generation');
      }

      // Make API request
      const response = await fetch(this.GENERATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to generate CAD: ${response.statusText}${
            errorData.error ? ` - ${errorData.error}` : ''
          }`
        );
      }

      const data = await response.json();

      // Check if the response indicates success
      if (!data.success) {
        throw new Error(data.error || 'CAD generation failed');
      }

      // Return the generation result
      return data.data;
    } catch (error) {
      // Re-throw with descriptive error message
      if (error instanceof Error) {
        throw new Error(`CADService.generateCAD failed: ${error.message}`);
      }
      throw new Error('CADService.generateCAD failed: Unknown error');
    }
  }

  /**
   * Fetches CAD generation history for the authenticated user
   */
  static async getHistory(
    limit: number = 10,
    offset: number = 0
  ): Promise<CADHistoryResponse> {
    try {
      // Build URL with query parameters
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const url = `${this.HISTORY_URL}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch CAD history: ${response.statusText}${
            errorData.error ? ` - ${errorData.error}` : ''
          }`
        );
      }

      const data = await response.json();

      // Check if the response indicates success
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch CAD history');
      }

      // Return the history data with pagination
      return {
        data: data.data || [],
        pagination: data.pagination || {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
      };
    } catch (error) {
      // Re-throw with descriptive error message
      if (error instanceof Error) {
        throw new Error(`CADService.getHistory failed: ${error.message}`);
      }
      throw new Error('CADService.getHistory failed: Unknown error');
    }
  }

  /**
   * Deletes a specific CAD history item
   */
  static async deleteHistoryItem(id: string): Promise<void> {
    try {
      const url = `${this.HISTORY_URL}?id=${encodeURIComponent(id)}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to delete CAD history item: ${response.statusText}${
            errorData.error ? ` - ${errorData.error}` : ''
          }`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete CAD history item');
      }
    } catch (error) {
      // Re-throw with descriptive error message
      if (error instanceof Error) {
        throw new Error(`CADService.deleteHistoryItem failed: ${error.message}`);
      }
      throw new Error('CADService.deleteHistoryItem failed: Unknown error');
    }
  }

  /**
   * Clears all CAD history for the authenticated user
   */
  static async clearHistory(): Promise<void> {
    try {
      const response = await fetch(this.HISTORY_URL, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to clear CAD history: ${response.statusText}${
            errorData.error ? ` - ${errorData.error}` : ''
          }`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to clear CAD history');
      }
    } catch (error) {
      // Re-throw with descriptive error message
      if (error instanceof Error) {
        throw new Error(`CADService.clearHistory failed: ${error.message}`);
      }
      throw new Error('CADService.clearHistory failed: Unknown error');
    }
  }
}
```

---

## React Hooks

### File: `src/hooks/useCADGeneration.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CADAPI, CADGenerationRequest, CADGenerationResult, CADHistoryResponse } from '@/lib/api/cad-api';
import { useCADStore } from '@/stores/cad.store';

/**
 * Options for useCADGeneration hook
 */
export interface UseCADGenerationOptions {
  onSuccess?: (result: CADGenerationResult) => void;
  onError?: (error: Error) => void;
}

/**
 * useCADGeneration Hook
 * 
 * React Query mutation hook for CAD generation with automatic cache invalidation.
 * 
 * Cache Invalidation Strategy:
 * - On successful CAD generation, automatically invalidates the ['cad-history'] query cache
 * - This ensures the CAD history list is refetched and displays the newly generated model
 */
export const useCADGeneration = (options: UseCADGenerationOptions = {}) => {
  const { onSuccess, onError } = options;
  const queryClient = useQueryClient();
  const addRecentPrompt = useCADStore((state) => state.addRecentPrompt);

  const mutation = useMutation<CADGenerationResult, Error, CADGenerationRequest>({
    mutationFn: (request: CADGenerationRequest) => CADAPI.generateCAD(request),
    
    onSuccess: (data, variables) => {
      // Add the prompt to recent prompts in Zustand store
      addRecentPrompt(variables.description);
      
      /**
       * Cache Invalidation: Invalidate CAD history queries
       * 
       * This invalidates all queries with the 'cad-history' key prefix, including:
       * - ['cad-history'] - base query
       * - ['cad-history', limit, offset] - paginated queries
       * 
       * React Query will mark these queries as stale and automatically refetch them
       * in the background if they are currently being used by any component.
       */
      queryClient.invalidateQueries({ queryKey: ['cad-history'] });
      
      // Call user-provided onSuccess callback
      onSuccess?.(data);
    },
    
    onError: (error) => {
      // Call user-provided onError callback
      onError?.(error);
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
    reset: mutation.reset,
  };
};

/**
 * useCADHistory Hook
 * 
 * React Query hook for fetching CAD generation history with manual refetch support.
 * 
 * Cache Behavior:
 * - Data is considered fresh for 2 minutes (staleTime: 120000ms)
 * - After 2 minutes, data becomes stale and will refetch on next access
 * - Automatically refetches when invalidated by useCADGeneration mutation
 */
export const useCADHistory = (limit: number = 10, offset: number = 0) => {
  const queryKey = ['cad-history', limit, offset];

  const query = useQuery<CADHistoryResponse, Error>({
    queryKey,
    queryFn: async () => {
      return await CADAPI.getHistory(limit, offset);
    },
    // Data is considered fresh for 2 minutes
    staleTime: 2 * 60 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    /**
     * Manual refetch function for cache invalidation
     * 
     * Call this function to manually refresh the CAD history data.
     * This bypasses the staleTime and forces a fresh fetch from the API.
     */
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};
```

---

## State Management

### File: `src/stores/cad.store.ts`

```typescript
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

/**
 * CAD Store Interface
 * Manages client-side state for CAD generator preferences and history
 */
interface CADStore {
  // State
  selectedFormat: 'step' | 'stl' | 'obj' | 'gltf';
  selectedUnits: 'mm' | 'cm' | 'm' | 'in' | 'ft';
  selectedCategory: string;
  recentPrompts: string[];

  // Actions
  setFormat: (format: CADStore['selectedFormat']) => void;
  setUnits: (units: CADStore['selectedUnits']) => void;
  setCategory: (category: string) => void;
  addRecentPrompt: (prompt: string) => void;
  clearRecentPrompts: () => void;
}

/**
 * CAD Zustand Store
 * 
 * Persists user preferences for CAD generation including:
 * - Selected output format (STEP, STL, OBJ, GLTF)
 * - Selected units (mm, cm, m, in, ft)
 * - Recent prompts (up to 10 items, deduplicated)
 */
export const useCADStore = create<CADStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        selectedFormat: 'step',
        selectedUnits: 'mm',
        selectedCategory: '',
        recentPrompts: [],

        // Actions
        setFormat: (format) => set({ selectedFormat: format }),

        setUnits: (units) => set({ selectedUnits: units }),

        setCategory: (category) => set({ selectedCategory: category }),

        /**
         * Add a prompt to recent prompts list
         * - Deduplicates: removes existing occurrence before adding to front
         * - Limits to 10 items maximum
         * - Most recent prompt appears first
         */
        addRecentPrompt: (prompt) =>
          set((state) => {
            // Remove the prompt if it already exists (deduplicate)
            const filtered = state.recentPrompts.filter((p) => p !== prompt);
            
            // Add to front and limit to 10 items
            const updated = [prompt, ...filtered].slice(0, 10);
            
            return { recentPrompts: updated };
          }),

        clearRecentPrompts: () => set({ recentPrompts: [] }),
      }),
      {
        name: 'cad-store',
        // Only persist selectedFormat, selectedUnits, and recentPrompts
        // selectedCategory is session-only
        partialize: (state) => ({
          selectedFormat: state.selectedFormat,
          selectedUnits: state.selectedUnits,
          recentPrompts: state.recentPrompts,
        }),
      }
    ),
    {
      name: 'CADStore',
    }
  )
);
```

---

## Repository Pattern

### File: `src/repositories/cad-history.repository.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { Tables } from '@/lib/database.types';

export type CADHistoryRow = Tables<'cad_history'>;

export interface CADHistoryCreateInput {
  user_id: string;
  prompt: string;
  category?: string | null;
  format: string;
  units?: string | null;
  model_data_url?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  status: 'completed' | 'failed' | 'processing';
  error?: string | null;
  zoo_operation_id?: string | null;
}

export class CADHistoryRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(input: CADHistoryCreateInput): Promise<CADHistoryRow> {
    const { data, error } = await this.supabase
      .from('cad_history')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as CADHistoryRow;
  }

  async findById(id: string): Promise<CADHistoryRow | null> {
    const { data, error } = await this.supabase
      .from('cad_history')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as CADHistoryRow;
  }

  async findByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ items: CADHistoryRow[]; total: number }> {
    const countQuery = this.supabase
      .from('cad_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

    const { data, error } = await this.supabase
      .from('cad_history')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return {
      items: (data || []) as CADHistoryRow[],
      total: count || 0,
    };
  }

  async deleteById(id: string, userId: string): Promise<CADHistoryRow | null> {
    const { data, error } = await this.supabase
      .from('cad_history')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as CADHistoryRow;
  }

  async deleteAllForUser(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('cad_history')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }
}
```

---

## Database Schema

### Migration File: `supabase/migrations/20250115000000_initial_schema.sql`

```sql
-- CAD Generation History
CREATE TABLE IF NOT EXISTS cad_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  category VARCHAR(100),
  format VARCHAR(20) NOT NULL,
  units VARCHAR(20) DEFAULT 'mm',
  model_data_url TEXT, -- URL to file in Supabase Storage
  file_path TEXT, -- Storage bucket path
  file_size BIGINT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'processing')),
  error TEXT,
  zoo_operation_id VARCHAR(255), -- Zoo Dev API operation/generation ID
  metadata JSONB DEFAULT '{}',
  
  -- Optional: Conversation support for iterative generation
  conversation_id VARCHAR(255),
  previous_model_id VARCHAR(255),
  is_iteration BOOLEAN DEFAULT false,
  iteration_number INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cad_history_user_id ON cad_history(user_id);
CREATE INDEX IF NOT EXISTS idx_cad_history_generated_at ON cad_history(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cad_history_zoo_operation ON cad_history(zoo_operation_id);
CREATE INDEX IF NOT EXISTS idx_cad_history_conversation_id ON cad_history(conversation_id);
CREATE INDEX IF NOT EXISTS idx_cad_history_user_conversation ON cad_history(user_id, conversation_id);

-- Row Level Security
ALTER TABLE cad_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own CAD history" ON cad_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CAD history" ON cad_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CAD history" ON cad_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own CAD history" ON cad_history
  FOR DELETE USING (auth.uid() = user_id);
```

### Supabase Storage Bucket

Create a storage bucket named `cad-models` with the following configuration:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cad-models', 'cad-models', true);

-- Storage policies
CREATE POLICY "Users can upload own CAD models" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cad-models' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own CAD models" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cad-models' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own CAD models" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cad-models' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## TypeScript Types

### Core Types

```typescript
// CAD Generation Request
export interface CADGenerationRequest {
  description: string;
  category?: 'bracket' | 'plate' | 'beam' | 'fastener' | 'custom';
  format?: 'step' | 'stl' | 'obj' | 'gltf' | 'glb';
  units?: 'mm' | 'cm' | 'm' | 'in' | 'ft';
}

// CAD Generation Result
export interface CADGenerationResult {
  id: string;
  status: 'completed' | 'failed' | 'processing';
  model_data?: string; // base64 encoded model file
  preview_image?: string;
  parameters?: Record<string, any>;
  error?: string;
}

// CAD History Item
export interface CADHistoryItem {
  id: string;
  prompt: string;
  category: string;
  format: string;
  units: string;
  model_data_url?: string;
  file_path?: string;
  generated_at: string;
  status: 'completed' | 'failed' | 'processing';
  error?: string;
  zoo_operation_id?: string;
}

// CAD History Response
export interface CADHistoryResponse {
  data: CADHistoryItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @kittycad/lib @tanstack/react-query zustand
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Zoo Dev API (KittyCAD)
ZOO_API_TOKEN=your_zoo_dev_api_token_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup

1. Run the migration SQL to create the `cad_history` table
2. Create the `cad-models` storage bucket in Supabase
3. Set up Row Level Security policies

### 4. File Structure

Create the following directory structure:

```
src/
├── services/
│   └── cad-generation.service.ts
├── repositories/
│   └── cad-history.repository.ts
├── lib/
│   ├── api/
│   │   └── cad-api.ts
│   └── supabase-server.ts
├── hooks/
│   └── useCADGeneration.ts
├── stores/
│   └── cad.store.ts
└── app/
    └── api/
        ├── generate-cad/
        │   └── route.ts
        └── cad-history/
            └── route.ts
```

### 5. Supabase Server Helper

Create `src/lib/supabase-server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export async function getSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
```

### 6. Initialize KittyCAD

The `@kittycad/lib` package requires initialization. Ensure you have the API token set:

```typescript
// In your service or API route
import { ml } from '@kittycad/lib';

// The library uses the ZOO_API_TOKEN environment variable automatically
// No explicit initialization needed if token is set
```

---

## Dependencies

### Required npm Packages

```json
{
  "dependencies": {
    "@kittycad/lib": "^3.1.4",
    "@tanstack/react-query": "^5.90.10",
    "@supabase/supabase-js": "^2.81.1",
    "@supabase/ssr": "^0.7.0",
    "zustand": "^5.0.8"
  }
}
```

### External Services

1. **Zoo Dev API (KittyCAD)**: Text-to-CAD generation service
   - Sign up at https://zoo.dev
   - Get API token from dashboard
   - Set `ZOO_API_TOKEN` environment variable

2. **Supabase**: Database and storage
   - PostgreSQL database for history
   - Storage bucket for CAD files
   - Authentication for user management

---

## Usage Examples

### Basic Generation

```typescript
import { useCADGeneration } from '@/hooks/useCADGeneration';

function CADGeneratorComponent() {
  const { mutate: generateCAD, isPending, data, error } = useCADGeneration({
    onSuccess: (result) => {
      console.log('CAD generated:', result.id);
      // Handle success (e.g., show preview, enable download)
    },
    onError: (error) => {
      console.error('Generation failed:', error);
      // Handle error (e.g., show error message)
    },
  });

  const handleGenerate = () => {
    generateCAD({
      description: 'A steel bracket with 4 mounting holes',
      category: 'bracket',
      format: 'step',
      units: 'mm',
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isPending}>
        {isPending ? 'Generating...' : 'Generate CAD'}
      </button>
      {error && <div>Error: {error.message}</div>}
      {data && <div>Generated: {data.id}</div>}
    </div>
  );
}
```

### History Management

```typescript
import { useCADHistory } from '@/hooks/useCADGeneration';
import { CADAPI } from '@/lib/api/cad-api';

function CADHistoryComponent() {
  const { data, isLoading, refetch } = useCADHistory(10, 0);

  const handleDelete = async (id: string) => {
    try {
      await CADAPI.deleteHistoryItem(id);
      refetch(); // Refresh history after deletion
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (isLoading) return <div>Loading history...</div>;

  return (
    <div>
      <h2>CAD Generation History</h2>
      {data?.data.map((item) => (
        <div key={item.id}>
          <p>{item.prompt}</p>
          <p>Format: {item.format}</p>
          {item.model_data_url && (
            <a href={item.model_data_url} download>Download</a>
          )}
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Using Store for Preferences

```typescript
import { useCADStore } from '@/stores/cad.store';

function FormatSelector() {
  const { selectedFormat, setFormat, selectedUnits, setUnits } = useCADStore();

  return (
    <div>
      <select value={selectedFormat} onChange={(e) => setFormat(e.target.value as any)}>
        <option value="step">STEP</option>
        <option value="stl">STL</option>
        <option value="obj">OBJ</option>
        <option value="gltf">GLTF</option>
      </select>
      
      <select value={selectedUnits} onChange={(e) => setUnits(e.target.value as any)}>
        <option value="mm">Millimeters</option>
        <option value="cm">Centimeters</option>
        <option value="m">Meters</option>
        <option value="in">Inches</option>
        <option value="ft">Feet</option>
      </select>
    </div>
  );
}
```

---

## Configuration

### Polling Configuration

Adjust polling behavior in `CADGenerationService`:

```typescript
private static readonly MAX_POLL_ATTEMPTS = 150; // 5 minutes (150 * 2s)
private static readonly POLL_INTERVAL = 2000; // 2 seconds
```

### Cache Configuration

Adjust cache behavior in `useCADHistory`:

```typescript
staleTime: 2 * 60 * 1000, // 2 minutes
```

### Storage Configuration

Configure storage bucket name in service:

```typescript
// In storeGeneration method
const filePath = `${userId}/${generationId}.${format}`;
await supabase.storage
  .from('cad-models') // Change bucket name here
  .upload(filePath, modelBuffer, {...});
```

---

## Error Handling

### Common Errors

1. **API Token Missing**: Ensure `ZOO_API_TOKEN` is set
2. **Rate Limiting**: Implement exponential backoff or queue
3. **Storage Failures**: Service continues even if storage fails
4. **Network Errors**: Polling retries automatically

### Error Response Format

```typescript
{
  success: false,
  error: "Error message here"
}
```

---

## Performance Considerations

1. **Polling**: Server-side polling prevents client timeout issues
2. **Caching**: React Query caches history for 2 minutes
3. **Storage**: Files stored in Supabase Storage, not in database
4. **Pagination**: History supports pagination to limit data transfer

---

## Security Considerations

1. **Authentication**: All API routes require authentication
2. **Row Level Security**: Database policies enforce user isolation
3. **Storage Policies**: Users can only access their own files
4. **Input Validation**: Service validates all inputs
5. **Error Messages**: Don't expose sensitive information in errors

---

## Testing

### Unit Tests

Test the service layer:

```typescript
describe('CADGenerationService', () => {
  it('should validate request', () => {
    expect(() => {
      CADGenerationService.generateCAD({ description: '' });
    }).toThrow('Description is required');
  });
});
```

### Integration Tests

Test API routes:

```typescript
describe('POST /api/generate-cad', () => {
  it('should generate CAD model', async () => {
    const response = await fetch('/api/generate-cad', {
      method: 'POST',
      body: JSON.stringify({
        description: 'Test bracket',
      }),
    });
    expect(response.ok).toBe(true);
  });
});
```

---

## Troubleshooting

### Issue: "Zoo Dev API token not configured"

**Solution**: Set `ZOO_API_TOKEN` environment variable

### Issue: Polling times out

**Solution**: Increase `MAX_POLL_ATTEMPTS` or implement webhooks

### Issue: Storage upload fails

**Solution**: Check Supabase storage bucket permissions and policies

### Issue: History not updating

**Solution**: Ensure cache invalidation is working, check React Query DevTools

---

## Future Enhancements

1. **Webhook Support**: Replace polling with webhooks for better scalability
2. **Batch Generation**: Support multiple generations in one request
3. **Template System**: Pre-defined templates for common parts
4. **Version Control**: Track iterations and modifications
5. **Collaboration**: Share generations with team members
6. **Analytics**: Track generation patterns and success rates

---

## License

This code is extracted from Metalink and is provided as-is for reuse in other projects. Adapt as needed for your specific requirements.

---

## Support

For questions or issues:
- Check Zoo Dev API documentation: https://zoo.dev/docs
- Supabase documentation: https://supabase.com/docs
- React Query documentation: https://tanstack.com/query/latest

