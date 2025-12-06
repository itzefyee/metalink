import { RecommendationScore, DrawingAnalysis } from '@/types/cad.types';
import { getConvexClient } from './convex-client';

export class ProductMatcher {
  /**
   * Find products that match extracted specifications
   */
  async findMatchingProducts(
    analysis: DrawingAnalysis,
    client?: any
  ): Promise<RecommendationScore[]> {
    const convex = client ?? getConvexClient();
    const normalized = await this.normalizeSpecs(analysis.extractedSpecs, convex);
    const candidates = await this.fetchCandidateProducts(normalized, convex);
    
    const scored = candidates
      .map(product => this.scoreProduct(product, normalized))
      .filter((score): score is RecommendationScore => Boolean(score))
      .sort((a, b) => b.score - a.score);

    return scored;
  }

  private async normalizeSpecs(specs: any, convex: any): Promise<any> {
    // Tokenize component type
    const componentTokens = this.tokenize(specs.componentType);
    
    // Extract numeric values from dimensions
    const dimensionValues = this.extractNumbers(specs.dimensions ?? '');
    const loadValues = this.extractNumbers(specs.loadRequirements ?? '');

    // Resolve material family
    const materialFamily = this.resolveMaterialFamily(specs.material?.toLowerCase());

    return {
      raw: specs,
      componentTokens,
      materialFamily,
      dimensionValues,
      loadValues,
    };
  }

  private async fetchCandidateProducts(specs: any, convex: any): Promise<any[]> {
    try {
      // Import api dynamically to avoid build issues
      const { api } = await import('../../convex/_generated/api');
      
      // Query Convex for matching products
      const products = await convex.query(api.products.search, {
        category: specs.categoryHint,
        materialFamily: specs.materialFamily,
        componentType: specs.componentTypeId,
      });

      // Map Convex documents to product format
      return (products || []).map((p: any) => ({
        id: p._id,
        name: p.name,
        category: p.category,
        material: p.material,
        materialFamily: p.materialFamily,
        componentTypeId: p.componentTypeId,
        specifications: p.specifications,
        inStock: p.inStock,
      }));
    } catch (error) {
      console.error('Error fetching candidate products:', error);
      return [];
    }
  }

  private scoreProduct(product: any, specs: any): RecommendationScore | null {
    let score = 0;
    const matchedSpecs: string[] = [];

    // Component type matching
    if (this.keywordMatch(product, specs.componentTokens)) {
      score += 0.35;
      matchedSpecs.push('componentType');
    }

    // Material matching
    if (specs.materialFamily && product.materialFamily === specs.materialFamily) {
      score += 0.2;
      matchedSpecs.push('material');
    }

    // Dimension matching
    const dimensionScore = this.calculateDimensionMatch(product, specs);
    if (dimensionScore > 0) {
      score += dimensionScore * 0.2;
      matchedSpecs.push('dimensions');
    }

    // Availability boost
    if (product.inStock) {
      score += 0.05;
      matchedSpecs.push('availability');
    }

    if (score <= 0.05) {
      return null;
    }

    return {
      productId: product.id,
      score: Math.min(score, 0.99),
      reasoning: this.buildReasoning(product, specs, matchedSpecs),
      matchedSpecs: Array.from(new Set(matchedSpecs)),
    };
  }

  private calculateDimensionMatch(product: any, specs: any): number {
    // Implementation for dimension matching
    // Compare product dimensions with extracted specs
    // For now, return a placeholder score
    return 0.5;
  }

  private keywordMatch(product: any, tokens: string[]): boolean {
    const haystack = `${product.name} ${product.description ?? ''}`.toLowerCase();
    return tokens.some(token => haystack.includes(token));
  }

  private extractNumbers(text: string): number[] {
    const matches = text.match(/\d+\.?\d*/g);
    return matches ? matches.map(Number) : [];
  }

  private tokenize(input?: string): string[] {
    if (!input) return [];
    return input
      .toLowerCase()
      .split(/[\s,;/\-]+/)
      .filter(Boolean);
  }

  private resolveMaterialFamily(material?: string): string | undefined {
    if (!material) return undefined;
    if (material.includes('steel')) return 'steel';
    if (material.includes('aluminum')) return 'aluminum';
    if (material.includes('stainless')) return 'stainless';
    return undefined;
  }

  private buildReasoning(product: any, specs: any, matchedSpecs: string[]): string {
    const reasons: string[] = [];
    
    if (matchedSpecs.includes('componentType')) {
      reasons.push('matches component type');
    }
    if (matchedSpecs.includes('material')) {
      reasons.push('matches material requirements');
    }
    if (matchedSpecs.includes('dimensions')) {
      reasons.push('dimensions compatible');
    }
    if (matchedSpecs.includes('availability')) {
      reasons.push('in stock');
    }

    return reasons.length > 0 
      ? `Recommended because: ${reasons.join(', ')}`
      : 'Potential match based on specifications';
  }

  /**
   * Get alternative suggestions when no matches found
   */
  async getAlternativeSuggestions(analysis: DrawingAnalysis): Promise<{
    message: string;
    suggestedCategories: string[];
  } | null> {
    // Extract suggested categories from analysis if available
    const categories = analysis.alternativeSuggestions?.suggestedCategories || [];
    
    if (categories.length === 0) {
      return {
        message: 'No exact matches found. Consider custom fabrication or similar components.',
        suggestedCategories: ['custom', 'fabrication'],
      };
    }

    return {
      message: `No exact matches found. Consider these categories: ${categories.join(', ')}`,
      suggestedCategories: categories,
    };
  }
}

export const productMatcher = new ProductMatcher();

