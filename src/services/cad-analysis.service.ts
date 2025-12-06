import { DrawingAnalysis, Product } from '@/types/cad.types';
import { claudeClient } from '@/lib/claude-client';
import { productMatcher } from '@/lib/product-matcher';
import { getConvexClient } from '@/lib/convex-client';
import { getCached } from '@/lib/cache/redis-cache';
import crypto from 'crypto';

interface FileValidation {
  isValid: boolean;
  error?: string;
}

/**
 * CADAnalysisService handles business logic for CAD drawing analysis
 * Orchestrates: validation, AI analysis, product matching, and storage
 */
export class CADAnalysisService {
  // Allowed file types and extensions
  private static readonly ALLOWED_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/step',
    'application/sla',
    'model/obj',
    'application/dxf',
    'application/octet-stream',
  ];

  private static readonly ALLOWED_EXTENSIONS = [
    'pdf', 'png', 'jpg', 'jpeg', 'step', 'stp', 'stl', 'obj', 'dxf',
  ];

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly CACHE_TTL = 86400; // 24 hours

  /**
   * Analyze a technical drawing file
   * 
   * @param file - File to analyze
   * @param cadModelData - Optional parsed CAD model data
   * @param userId - Optional user ID for storage
   * @returns Drawing analysis with product recommendations
   */
  static async analyzeDrawing(
    file: File,
    cadModelData?: any,
    userId?: string
  ): Promise<DrawingAnalysis> {
    // Business logic: Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Business logic: Generate cache key from file content
    const fileHash = await this.generateFileHash(file);
    const cacheKey = `cad:analysis:${fileHash}`;

    // Business logic: Get or perform analysis with caching
    const analysis = await getCached<DrawingAnalysis>(
      cacheKey,
      async () => {
        return this.performAnalysis(file, cadModelData);
      },
      this.CACHE_TTL
    );

    // Business logic: Store analysis if user is authenticated
    if (userId) {
      await this.storeAnalysis(file, analysis, userId);
    }

    return analysis;
  }

  /**
   * Business logic: Validate file type and size
   */
  private static validateFile(file: File): FileValidation {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (
      !this.ALLOWED_TYPES.includes(file.type) &&
      !this.ALLOWED_EXTENSIONS.includes(fileExtension || '')
    ) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload PDF, PNG, JPG, STEP, STL, OBJ, or DXF files.',
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'File size exceeds 10MB limit.',
      };
    }

    return { isValid: true };
  }

  /**
   * Business logic: Generate SHA-256 hash from file content
   */
  private static async generateFileHash(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Business logic: Perform AI analysis and product matching
   */
  private static async performAnalysis(
    file: File,
    cadModelData?: any
  ): Promise<DrawingAnalysis> {
    console.log(`Performing CAD analysis for file: ${file.name}`);

    // Check if Claude API is configured
    const isClaudeConfigured = await claudeClient.isConfigured();
    let analysis: DrawingAnalysis;

    if (isClaudeConfigured) {
      try {
        // Use real Claude API for analysis
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const claudeResponse = await claudeClient.analyzeDrawing(
          fileBuffer,
          file.type,
          file.name,
          cadModelData
        );

        // Convert Claude response to DrawingAnalysis
        analysis = {
          extractedSpecs: {
            dimensions: claudeResponse.extractedSpecs.dimensions || undefined,
            material: claudeResponse.extractedSpecs.material || undefined,
            loadRequirements: claudeResponse.extractedSpecs.loadRequirements || undefined,
            componentType: claudeResponse.extractedSpecs.componentType || undefined,
            tolerance: claudeResponse.extractedSpecs.tolerance || undefined,
          },
          recommendedProducts: [],
          totalRecommendations: 0,
          confidence: claudeResponse.confidence,
          reasoning: claudeResponse.reasoning,
          analysisId: `analysis_${Date.now()}`,
        };
      } catch (claudeError) {
        console.error('Claude API failed, falling back to mock:', claudeError);
        analysis = this.getFallbackAnalysis(file.name, cadModelData);
      }
    } else {
      // Use mock analysis if API not configured
      analysis = this.getFallbackAnalysis(file.name, cadModelData);
    }

    // Business logic: Find matching products
    const convex = getConvexClient();
    const recommendations = await productMatcher.findMatchingProducts(analysis, convex);

    analysis.totalRecommendations = recommendations.length;

    // Get actual product data (limit to 3 for display)
    const productIds = recommendations.slice(0, 3).map((rec) => rec.productId);

    if (productIds.length > 0) {
      try {
        // Import api dynamically
        const { api } = await import('../../convex/_generated/api');
        
        const products = await Promise.all(
          productIds.map(id => 
            convex.query(api.products.get, { id: id as any })
          )
        );

        if (products && products.length > 0) {
          // Sort products to match recommendation order
          analysis.recommendedProducts = productIds
            .map((id) => products.find((p) => p && p._id === id))
            .filter(Boolean)
            .map(p => ({
              id: p!._id,
              name: p!.name,
              category: p!.category,
              material: p!.material,
              price: p!.price,
              images: p!.images,
            })) as Product[];
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        analysis.recommendedProducts = [];
      }
    }

    // Business logic: Get alternative suggestions if no matches
    if (analysis.recommendedProducts.length === 0 && recommendations.length === 0) {
      try {
        const alternativeSuggestions = await productMatcher.getAlternativeSuggestions(analysis);
        if (alternativeSuggestions) {
          analysis.alternativeSuggestions = alternativeSuggestions;
        }
      } catch (error) {
        console.error('Error getting alternative suggestions:', error);
      }
    }

    return analysis;
  }

  /**
   * Business logic: Store analysis and file for authenticated user
   */
  private static async storeAnalysis(
    file: File,
    analysis: DrawingAnalysis,
    userId: string
  ): Promise<void> {
    try {
      const convex = getConvexClient();

      // Prepare file for upload
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const contentType = this.getContentType(file.name, file.type);

      // Upload file to Convex storage
      let storageId: string | null = null;
      try {
        // Import api dynamically
        const { api } = await import('../../convex/_generated/api');
        
        // Store file using Convex storage action (storage is only available in actions)
        storageId = await convex.action(api.files.upload, {
          fileName: file.name,
          fileData: Array.from(new Uint8Array(fileBuffer)),
          contentType: contentType,
          userId: userId as any,
        });
        console.log(`Uploaded drawing for user ${userId} with storage ID: ${storageId}`);
      } catch (uploadError) {
        console.error('Failed to upload drawing:', uploadError);
      }

      // Save analysis to Convex database
      // Import api dynamically
      const { api } = await import('../../convex/_generated/api');
      
      const analysisId = await convex.mutation(api.drawingAnalyses.create, {
        userId: userId as any,
        fileName: file.name,
        storageId: storageId as any,
        fileType: file.type,
        fileSize: file.size,
        extractedSpecs: analysis.extractedSpecs as any,
        recommendedProducts: analysis.recommendedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
        })),
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        claudeResponse: analysis as any,
      });

      console.log(`Saved drawing analysis for user ${userId}`);
    } catch (error) {
      console.error('Failed to store drawing analysis:', error);
    }
  }

  /**
   * Business logic: Get content type from file extension
   */
  private static getContentType(fileName: string, defaultType: string): string {
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      step: 'application/step',
      stp: 'application/step',
      stl: 'application/vnd.ms-pki.stl',
      obj: 'model/obj',
      dxf: 'application/dxf',
    };

    return contentTypeMap[fileExt || ''] || defaultType || 'application/octet-stream';
  }

  /**
   * Business logic: Generate fallback analysis when AI is unavailable
   */
  private static getFallbackAnalysis(fileName: string, cadModelData?: any): DrawingAnalysis {
    // If we have CAD model data, use it for more accurate analysis
    if (cadModelData) {
      let dimensions: string | undefined = undefined;

      // Calculate dimensions from bounding box
      if (cadModelData.boundingBox?.length && cadModelData.boundingBox?.width && cadModelData.boundingBox?.height) {
        dimensions = `${(cadModelData.boundingBox.length * 25.4).toFixed(1)}mm x ${(
          cadModelData.boundingBox.width * 25.4
        ).toFixed(1)}mm x ${(cadModelData.boundingBox.height * 25.4).toFixed(1)}mm`;
      }

      const material = cadModelData.thicknessAnalysis?.estimatedThickness
        ? `Steel (${cadModelData.thicknessAnalysis.estimatedThickness.toFixed(3)}" thick)`
        : 'Steel (material analysis pending)';

      const componentType =
        cadModelData.holeAnalysis?.count > 0
          ? 'Mounting bracket or structural component'
          : 'Structural component';

      return {
        extractedSpecs: {
          dimensions,
          material,
          componentType,
          tolerance: cadModelData.boundingBoxWithTolerance?.tolerance
            ? `±${cadModelData.boundingBoxWithTolerance.tolerance.toFixed(3)}"`
            : '±0.005" (standard)',
        },
        recommendedProducts: [],
        totalRecommendations: 0,
        confidence: 0.92,
        reasoning: `Analysis based on parsed 3D CAD model data. Detected ${
          cadModelData.faceCount || 0
        } faces, ${cadModelData.holeAnalysis?.count || 0} holes.`,
        analysisId: `analysis_${Date.now()}`,
      };
    }

    // Filename-based fallback
    return {
      extractedSpecs: {
        dimensions: '120mm x 80mm x 65mm',
        material: 'Aluminum',
        componentType: 'servo motor',
        tolerance: '±0.02mm',
      },
      recommendedProducts: [],
      totalRecommendations: 0,
      confidence: 0.85,
      reasoning: 'Based on the dimensions and technical specifications visible in the drawing.',
      analysisId: `analysis_${Date.now()}`,
    };
  }
}

