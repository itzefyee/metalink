"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import Anthropic from "@anthropic-ai/sdk";

export const generateManufacturingInsights = action({
  args: {
    geometry: v.any(),
    complianceResults: v.any(),
    specifications: v.any(),
  },
  handler: async (ctx, args) => {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set. Please set it in your Convex dashboard under Settings > Environment Variables.");
    }
    
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    const prompt = `You are a steel manufacturing expert. Analyze this component:

**Geometry:**
${JSON.stringify(args.geometry, null, 2)}

**Compliance Results:**
- Score: ${args.complianceResults.overallScore}/100
- Violations: ${args.complianceResults.violations.length}
- Warnings: ${args.complianceResults.warnings.length}

**Specifications:**
- Material: ${args.specifications.material.grade}
- Edge Type: ${args.specifications.material.edgeType}

Provide:
1. **Fabrication Sequence:** Step-by-step manufacturing process
2. **Cost Optimization:** Ways to reduce material waste and labor time
3. **Design Improvements:** Suggestions to enhance manufacturability
4. **Risk Assessment:** Potential issues and mitigation strategies
5. **Complexity Score:** 0-100 rating with time estimate

Format as markdown with clear sections.`;

    const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const firstContent = response.content[0];
    if (firstContent.type === "text") {
      return firstContent.text;
    }
    throw new Error("Unexpected response type from Anthropic API");
  },
});

