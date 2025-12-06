export interface ChatbotContext {
  [key: string]: any;
}

export interface ChatbotOption {
  id: string;
  label: string;
  next?: string | ((context: ChatbotContext) => string);
  action?: 'navigate' | 'link';
  url?: string;
  isBack?: boolean;
}

export interface ChatbotNode {
  id: string;
  type: 'message' | 'carousel' | 'form';
  message: string;
  options?: ChatbotOption[];
  media?: {
    type: 'image' | 'video';
    url: string;
    alt?: string;
    thumbnail?: string;
  };
  items?: Array<{
    title: string;
    description: string;
    image: string;
    action?: {
      label: string;
      url: string;
    };
  }>;
  formFields?: Array<{
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'email' | 'number';
    placeholder?: string;
    required?: boolean;
    rows?: number;
    options?: Array<{
      value: string;
      label: string;
    }>;
  }>;
  submitLabel?: string;
  successMessage?: {
    id: string;
  };
}

export interface FormNode extends ChatbotNode {
  type: 'form';
  formFields: Array<{
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'email' | 'number';
    placeholder?: string;
    required?: boolean;
    rows?: number;
    options?: Array<{
      value: string;
      label: string;
    }>;
  }>;
  submitLabel: string;
  successMessage: {
    id: string;
  };
}

export const chatbotFlow: Record<string, ChatbotNode> = {
  greeting: {
    id: 'greeting',
    type: 'message',
    message: 'Hello! I\'m **SteelBot**, your AI assistant for Metalink. How can I help you today?',
    options: [
      {
        id: 'cad-generator',
        label: 'CAD Generator',
        next: 'cad-generator-info',
      },
      {
        id: 'cad-analyzer',
        label: 'CAD Analyzer',
        next: 'cad-analyzer-info',
      },
      {
        id: 'product-recommender',
        label: 'Product Recommender',
        next: 'product-recommender-info',
      },
      {
        id: 'catalog',
        label: 'Browse Catalog',
        action: 'navigate',
        url: '/catalog',
      },
    ],
  },
  'cad-generator-info': {
    id: 'cad-generator-info',
    type: 'message',
    message: 'The **CAD Generator** allows you to create technical drawings from text descriptions using AI. Simply describe what you need, and I\'ll help generate the CAD file.',
    options: [
      {
        id: 'try-cad-generator',
        label: 'Try CAD Generator',
        action: 'navigate',
        url: '/cad-generator',
      },
      {
        id: 'back',
        label: 'Back',
        next: 'greeting',
        isBack: true,
      },
    ],
  },
  'cad-analyzer-info': {
    id: 'cad-analyzer-info',
    type: 'message',
    message: 'The **CAD Analyzer** helps you analyze drawings for manufacturability, validate specifications, and generate detailed reports.',
    options: [
      {
        id: 'try-cad-analyzer',
        label: 'Try CAD Analyzer',
        action: 'navigate',
        url: '/cad-analyzer',
      },
      {
        id: 'back',
        label: 'Back',
        next: 'greeting',
        isBack: true,
      },
    ],
  },
  'product-recommender-info': {
    id: 'product-recommender-info',
    type: 'message',
    message: 'The **Product Recommender** provides AI-powered product recommendations with compatibility scores and alternatives based on your requirements.',
    options: [
      {
        id: 'try-product-recommender',
        label: 'Try Product Recommender',
        action: 'navigate',
        url: '/product-recommender',
      },
      {
        id: 'back',
        label: 'Back',
        next: 'greeting',
        isBack: true,
      },
    ],
  },
};

export function getConversationNode(nodeId: string): ChatbotNode {
  return chatbotFlow[nodeId] || chatbotFlow.greeting;
}

