import Anthropic from '@anthropic-ai/sdk';

export const CLAUDE_ANALYSIS_PROMPT = `
You are a technical expert analyzing engineering drawings and technical specifications.

Analyze the uploaded technical drawing/document and extract:

1. **Dimensions & Measurements**: Any specified dimensions, sizes, or measurements
2. **Material Requirements**: Specified materials or material properties  
3. **Load/Stress Requirements**: Weight capacity, force ratings, or stress specifications
4. **Component Type**: What type of component this appears to be
5. **Tolerances**: Any precision or tolerance requirements mentioned

Respond ONLY with valid JSON in this exact format:
{
  "extractedSpecs": {
    "dimensions": "extracted dimensions or null",
    "material": "material type or null", 
    "loadRequirements": "load/capacity info or null",
    "componentType": "component category or null",
    "tolerance": "precision requirements or null"
  },
  "confidence": 0.85,
  "reasoning": "Brief explanation of what was identified",
  "suggestedCategories": ["category1", "category2"]
}
`;

interface ClaudeAnalysisResponse {
  extractedSpecs: {
    dimensions?: string | null;
    material?: string | null;
    loadRequirements?: string | null;
    componentType?: string | null;
    tolerance?: string | null;
  };
  confidence: number;
  reasoning: string;
  suggestedCategories: string[];
}

export class ClaudeClient {
  private client: Anthropic | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (this.apiKey) {
      this.client = new Anthropic({
        apiKey: this.apiKey,
      });
    }
  }

  async analyzeDrawing(
    fileBuffer: Buffer,
    mimeType: string,
    filename?: string,
    cadModelData?: any
  ): Promise<ClaudeAnalysisResponse> {
    if (!this.apiKey || !this.client) {
      throw new Error('Claude API key not configured');
    }

    try {
      // Convert file to base64
      const base64Data = fileBuffer.toString('base64');

      // Build enhanced prompt with CAD data
      let promptText = CLAUDE_ANALYSIS_PROMPT;
      if (cadModelData) {
        promptText += this.buildCADDataContext(cadModelData);
      }

      console.log('Analyzing drawing with Claude API...');

      // Call Claude API with vision support
      const message = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image" as const,
                source: {
                  type: "base64" as const,
                  media_type: mimeType,
                  data: base64Data,
                },
              },
              {
                type: "text" as const,
                text: promptText,
              },
            ],
          },
        ],
      } as any);

      // Extract text from response
      const textBlocks = message.content.filter(block => block.type === 'text');
      const text = textBlocks
        .map(block => {
          if (block.type === 'text') {
            return block.text;
          }
          return '';
        })
        .join('');

      // Parse JSON response
      try {
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysisResult = JSON.parse(cleanedText);
        
        if (!analysisResult.extractedSpecs || typeof analysisResult.confidence !== 'number') {
          throw new Error('Invalid response structure');
        }

        return analysisResult;
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        
        return {
          extractedSpecs: {
            dimensions: null,
            material: null,
            loadRequirements: null,
            componentType: "unknown",
            tolerance: null
          },
          confidence: 0.5,
          reasoning: "Failed to parse AI response",
          suggestedCategories: ["custom"]
        };
      }
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw new Error(`Failed to analyze drawing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isConfigured(): Promise<boolean> {
    return !!(this.apiKey && this.client);
  }

  private buildCADDataContext(cadModelData: any): string {
    let context = '\n\n## Additional 3D CAD Model Data:\n\n';

    if (cadModelData.boundingBox) {
      const bbox = cadModelData.boundingBox;
      context += `**Bounding Box**:\n`;
      context += `- Length: ${(bbox.length * 25.4).toFixed(1)}mm\n`;
      context += `- Width: ${(bbox.width * 25.4).toFixed(1)}mm\n`;
      context += `- Height: ${(bbox.height * 25.4).toFixed(1)}mm\n\n`;
    }

    if (cadModelData.holeAnalysis && cadModelData.holeAnalysis.count > 0) {
      const holes = cadModelData.holeAnalysis;
      context += `**Hole Analysis**: ${holes.count} holes detected\n`;
      holes.holes.forEach((hole: any, idx: number) => {
        context += `- Hole #${idx + 1}: Diameter ${hole.diameter.toFixed(4)}"\n`;
      });
      context += '\n';
    }

    if (cadModelData.thicknessAnalysis) {
      const thickness = cadModelData.thicknessAnalysis;
      context += `**Material Thickness**: ${thickness.estimatedThickness.toFixed(3)}"\n\n`;
    }

    context += '\n**Use this CAD data for more accurate analysis.**\n';

    return context;
  }
}

export const claudeClient = new ClaudeClient();


