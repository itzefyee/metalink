/**
 * Shared CAD Generation Validation
 * 
 * Centralized validation logic for CAD generation requests
 * Used by both API routes and Convex actions
 */

import { CADGenerationRequest } from '@/types/cad.types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates a CAD generation request
 * @param request - The CAD generation request to validate
 * @throws Error with descriptive message if validation fails
 */
export function validateCADRequest(request: CADGenerationRequest): void {
  const errors: ValidationError[] = [];

  // Validate description
  if (!request.description || request.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (request.description.length > 1000) {
    errors.push({ field: 'description', message: 'Description too long (max 1000 characters)' });
  }

  // Validate format
  if (request.format && !['step', 'stl', 'obj', 'gltf', 'glb'].includes(request.format)) {
    errors.push({
      field: 'format',
      message: 'Invalid format. Must be one of: step, stl, obj, gltf, glb',
    });
  }

  // Validate units
  if (request.units && !['mm', 'cm', 'm', 'in', 'ft'].includes(request.units)) {
    errors.push({
      field: 'units',
      message: 'Invalid units. Must be one of: mm, cm, m, in, ft',
    });
  }

  // Validate category
  if (
    request.category &&
    !['bracket', 'plate', 'beam', 'fastener', 'custom'].includes(request.category)
  ) {
    errors.push({
      field: 'category',
      message: 'Invalid category. Must be one of: bracket, plate, beam, fastener, custom',
    });
  }

  // Throw error if any validation failed
  if (errors.length > 0) {
    const errorMessages = errors.map((e) => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }
}

/**
 * Validates just the description field (for simpler use cases)
 * @param description - The description to validate
 * @throws Error if validation fails
 */
export function validateDescription(description: string): void {
  if (!description || description.trim().length === 0) {
    throw new Error('Description is required');
  }

  if (description.length > 1000) {
    throw new Error('Description too long (max 1000 characters)');
  }
}


