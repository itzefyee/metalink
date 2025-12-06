# Metalink Assistant - Chatbot Capabilities

## 🤖 What is Metalink Assistant?

Metalink Assistant is an AI-powered chatbot integrated into your website that helps users with CAD generation, steel manufacturing standards, and design guidance. It's powered by **Claude Sonnet 4.5** and has access to industry standards through the MCP (Model Context Protocol) server.

## 📚 Knowledge Base

The chatbot has access to these **steel manufacturing standards**:

### 1. **AISC 360** (American Institute of Steel Construction)
- **Edge Distance Requirements** (`standards://aisc-360-edge-distance`)
  - Minimum edge distances for rolled vs. sheared/gas-cut edges
  - Calculations based on hole diameter
  - Example: 1/2" hole with rolled edge = 1.25 × 0.5 = 0.625" minimum

- **Hole Spacing Requirements** (`standards://aisc-360-hole-spacing`)
  - Minimum spacing between holes
  - Requirements for different edge conditions

### 2. **AWS D1.1** (American Welding Society)
- **Preheat Requirements** (`standards://aws-d1.1-preheat`)
  - Welding preheat temperatures
  - Material thickness requirements
  - Environmental considerations

### 3. **ASTM Standards**
- **ASTM A36 Properties** (`standards://astm-a36-properties`)
  - Material properties (yield strength, tensile strength, etc.)
  - Chemical composition
  - Mechanical properties

## 💬 What Questions Can It Answer?

### 1. **CAD Generation Help**
The chatbot can guide users through generating CAD models:

**Example Questions:**
- "How do I generate a steel beam?"
- "What format should I use for my CAD file?"
- "Can you help me describe a plate for CAD generation?"
- "What units should I use - mm or inches?"

**What it does:**
- Explains the CAD generation process
- Helps users write better descriptions
- Suggests appropriate formats (STEP, IGES, STL)
- Recommends units based on project needs

### 2. **Compliance & Standards Questions**
The chatbot can explain compliance requirements:

**Example Questions:**
- "What's the minimum edge distance for a 3/4 inch hole?"
- "What are the AISC 360 requirements for hole spacing?"
- "Do I need preheating for welding A36 steel?"
- "What are the material properties of ASTM A36?"

**What it does:**
- References specific standards (AISC 360, AWS D1.1, ASTM)
- Provides calculations and formulas
- Explains code requirements
- Gives examples with real numbers

### 3. **Design Guidance**
The chatbot can suggest design improvements:

**Example Questions:**
- "Is my design compliant with AISC 360?"
- "What material grade should I use for this application?"
- "How can I optimize my steel structure?"
- "What edge type should I use - rolled or cut?"

**What it does:**
- Reviews design decisions
- Suggests material grades
- Recommends edge types
- Provides optimization tips

### 4. **Troubleshooting**
The chatbot can help solve problems:

**Example Questions:**
- "My CAD generation failed, what should I do?"
- "Why is my file not downloading?"
- "What does this error message mean?"
- "How do I fix a validation error?"

**What it does:**
- Diagnoses common issues
- Provides step-by-step solutions
- Explains error messages
- Suggests workarounds

### 5. **General Steel Manufacturing Questions**
The chatbot can answer general questions about steel:

**Example Questions:**
- "What's the difference between A36 and A992 steel?"
- "When should I use rolled edges vs. cut edges?"
- "What are the welding requirements for structural steel?"
- "How do I calculate minimum edge distances?"

**What it does:**
- Explains steel grades and properties
- Compares different materials
- Provides industry best practices
- Shares technical knowledge

## 🎯 Key Features

### ✅ **Conversational**
- Natural language understanding
- Context-aware responses
- Follow-up question handling
- Conversation history maintained

### ✅ **Technically Accurate**
- Based on real industry standards
- References specific code sections
- Provides calculations and formulas
- Cites sources (AISC, AWS, ASTM)

### ✅ **Helpful & Friendly**
- Conversational tone
- Clear explanations
- Step-by-step guidance
- Patient with follow-ups

### ✅ **Rate Limited**
- 50 messages per hour per user
- Prevents abuse
- Fair usage for all users

## 📝 Example Conversations

### Example 1: CAD Generation Help
```
User: "I need to generate a steel beam, 6 feet long, 4 inches wide"
Assistant: "I can help you generate that! For a 6-foot steel beam that's 4 inches wide, I'd recommend:
- Format: STEP (most compatible)
- Units: inches (since you're using feet/inches)
- Material: A36 (common structural steel)
- Category: beam

Would you like me to help you refine the description, or do you want to proceed with generating it?"
```

### Example 2: Standards Question
```
User: "What's the minimum edge distance for a 1/2 inch hole?"
Assistant: "According to AISC 360 Table J3.4, the minimum edge distance depends on the edge condition:

- Rolled edges: 1.25 × hole diameter = 1.25 × 0.5 = 0.625 inches
- Sheared/gas-cut edges: 1.75 × hole diameter = 1.75 × 0.5 = 0.875 inches

So for a 1/2 inch hole, you need at least 0.625" from a rolled edge or 0.875" from a sheared edge."
```

### Example 3: Design Guidance
```
User: "Should I use A36 or A992 for my structural beam?"
Assistant: "Great question! Here's the comparison:

**A36:**
- Yield strength: 36 ksi
- Lower cost
- Good for general construction
- Widely available

**A992:**
- Yield strength: 50 ksi (stronger)
- Higher cost
- Better for high-load applications
- More efficient (less material needed)

For most structural beams, A992 is preferred because it's stronger and allows for lighter designs. However, A36 is perfectly fine for lower-load applications and is more economical.

What's the application you're designing for?"
```

## 🚀 How to Use

1. **Click the chat button** (💬) in the bottom-right corner
2. **Type your question** in the input field
3. **Press Enter** or click "Send"
4. **Get instant help** from the AI assistant

## ⚙️ Technical Details

- **AI Model**: Claude Sonnet 4.5 (Anthropic)
- **Context**: Has access to MCP standards resources
- **History**: Maintains conversation context (last 20 messages)
- **Storage**: Messages saved in Convex database and Redis cache
- **Rate Limit**: 50 messages per hour per user

## 🔒 Limitations

- **Rate Limited**: 50 messages/hour to prevent abuse
- **Standards Scope**: Currently covers AISC 360, AWS D1.1, and ASTM A36
- **CAD Generation**: Can guide but doesn't generate CAD directly (uses the generation tool)
- **Language**: Primarily English

## 💡 Tips for Best Results

1. **Be Specific**: Include dimensions, materials, and requirements
2. **Ask Follow-ups**: The chatbot remembers context
3. **Reference Standards**: Ask about specific code sections
4. **Provide Context**: Share your application or use case

## 🎓 Learning Resource

The chatbot can also act as a learning tool:
- Learn about steel manufacturing standards
- Understand compliance requirements
- Get familiar with CAD generation
- Explore design best practices

---

**Ready to chat?** Click the 💬 button and start asking questions!

