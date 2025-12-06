// convex/templates.ts
export const TEMPLATES = {
  "l-bracket": {
    id: "l-bracket",
    name: "L-Bracket",
    description: "Standard 90° angle bracket",
    defaultParams: {
      height: 6,
      width: 4,
      thickness: 0.25,
      holeCount: 4,
      holeDiameter: 0.5,
      material: "A36",
      edgeType: "rolled",
    },
    zooPrompt: (params: {
      height: number;
      width: number;
      thickness: number;
      holeCount: number;
      holeDiameter: number;
      material: string;
    }) =>
      `Create an L-shaped steel bracket with:
- Vertical leg: ${params.height} inches tall
- Horizontal leg: ${params.width} inches wide  
- Thickness: ${params.thickness} inches throughout
- ${params.holeCount} holes, ${params.holeDiameter}" diameter
- Material: ASTM ${params.material} steel
- Generate in STEP format with precise dimensions`,
  },
  // Add more templates...
};

