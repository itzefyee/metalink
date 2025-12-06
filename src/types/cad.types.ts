/**
 * CAD Generation Types
 * Complete type definitions for the CAD generation system
 */

/**
 * CAD Generation Request parameters
 */
export interface CADGenerationRequest {
  description: string;
  category?: 'bracket' | 'plate' | 'beam' | 'fastener' | 'custom';
  format?: 'step' | 'stl' | 'obj' | 'gltf' | 'glb';
  units?: 'mm' | 'cm' | 'm' | 'in' | 'ft';
  specifications?: {
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      thickness?: number;
    };
    material?: {
      grade?: string;
      edgeType?: string;
    };
  };
}

/**
 * CAD Generation Result
 */
export interface CADGenerationResult {
  id: string;
  status: 'completed' | 'failed' | 'processing';
  model_data?: string; // base64 encoded
  file_url?: string;
  parameters: {
    format: string;
    units: string;
    category: string;
    generated_at: string;
    prompt: string;
  };
  error?: string;
}

/**
 * CAD History Item
 */
export interface CADHistoryItem {
  id: string;
  user_id: string;
  prompt: string;
  category: string;
  format: string;
  units: string;
  file_path?: string;
  model_data_url?: string;
  status: 'completed' | 'failed' | 'processing';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Zoo Dev API Response
 */
export interface ZooDevResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  outputs?: Record<string, any>;
  error?: string;
  created_at: string;
  completed_at?: string;
}

/**
 * User Preferences for CAD Generation
 */
export interface CADPreferences {
  defaultFormat: 'step' | 'stl' | 'obj' | 'gltf' | 'glb';
  defaultUnits: 'mm' | 'cm' | 'm' | 'in' | 'ft';
  defaultCategory: 'bracket' | 'plate' | 'beam' | 'fastener' | 'custom';
  recentPrompts: string[];
}

/**
 * API Error Response
 */
export interface APIError {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Generation Progress
 */
export interface GenerationProgress {
  stage: 'validating' | 'calling_api' | 'polling' | 'storing' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  elapsed_time?: number;
}

