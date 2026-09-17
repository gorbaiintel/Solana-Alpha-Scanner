import { NodeTypeDefinition } from '../types';

export const NODE_DEFINITIONS: NodeTypeDefinition[] = [
  // --- INPUT CATEGORY ---
  {
    type: 'input_text',
    label: 'Text Input',
    category: 'input',
    description: 'Provide a static text or prompt payload to the workflow.',
    iconName: 'FileText',
    defaultInputs: [],
    defaultOutputs: [
      { name: 'text', dataType: 'string', direction: 'output' },
    ],
    defaultConfig: {
      value: 'Welcome to Visual Node Builder! Connect this node to Gemini AI or a Text Formatter to process this string.',
    },
  },
  {
    type: 'input_json',
    label: 'JSON Payload',
    category: 'input',
    description: 'Provide a structured JSON object or array dataset.',
    iconName: 'Braces',
    defaultInputs: [],
    defaultOutputs: [
      { name: 'json', dataType: 'object', direction: 'output' },
      { name: 'raw', dataType: 'string', direction: 'output' },
    ],
    defaultConfig: {
      value: JSON.stringify(
        {
          appName: 'NodeFlow Engine',
          version: '2.5.0',
          status: 'Active',
          items: [
            { id: 101, name: 'Gemini Node Integration', priority: 'High', score: 98 },
            { id: 102, name: 'Custom JS Runner', priority: 'Medium', score: 85 },
            { id: 103, name: 'REST API Proxy', priority: 'High', score: 92 },
          ],
        },
        null,
        2
      ),
    },
  },
  {
    type: 'trigger_form',
    label: 'Interactive Form',
    category: 'input',
    description: 'Creates a custom form input field on the canvas to trigger flow execution.',
    iconName: 'FormInput',
    defaultInputs: [],
    defaultOutputs: [
      { name: 'submittedValue', dataType: 'string', direction: 'output' },
    ],
    defaultConfig: {
      placeholder: 'Enter input message or text here...',
      defaultValue: 'Analyze recent market trends for artificial intelligence in web applications.',
    },
  },

  // --- AI CATEGORY ---
  {
    type: 'ai_gemini_prompt',
    label: 'Gemini Prompt AI',
    category: 'ai',
    description: 'Generates responses using Google Gemini AI models on the server.',
    iconName: 'Sparkles',
    defaultInputs: [
      { name: 'prompt', dataType: 'string', direction: 'input' },
      { name: 'context', dataType: 'string', direction: 'input' },
    ],
    defaultOutputs: [
      { name: 'response', dataType: 'string', direction: 'output' },
    ],
    defaultConfig: {
      systemInstruction: 'You are an expert AI assistant that provides insightful, concise, and structured answers.',
      model: 'gemini-2.5-flash',
      promptTemplate: '{{prompt}}\n\nAdditional Context:\n{{context}}',
    },
  },
  {
    type: 'ai_gemini_summarize',
    label: 'AI Summarizer',
    category: 'ai',
    description: 'Summarizes lengthy text documents, articles, or logs into key takeaways.',
    iconName: 'FileSearch',
    defaultInputs: [
      { name: 'text', dataType: 'string', direction: 'input' },
    ],
    defaultOutputs: [
      { name: 'summary', dataType: 'string', direction: 'output' },
      { name: 'bulletPoints', dataType: 'array', direction: 'output' },
    ],
    defaultConfig: {
      maxLength: 'short', // short, medium, bullet-points
      style: 'executive',
    },
  },
  {
    type: 'ai_gemini_classifier',
    label: 'AI Sentiment & Topic',
    category: 'ai',
    description: 'Classifies sentiment (Positive, Negative, Neutral) and extracts key tags.',
    iconName: 'Tag',
    defaultInputs: [
      { name: 'text', dataType: 'string', direction: 'input' },
    ],
    defaultOutputs: [
      { name: 'sentiment', dataType: 'string', direction: 'output' },
      { name: 'topics', dataType: 'array', direction: 'output' },
      { name: 'confidence', dataType: 'number', direction: 'output' },
    ],
    defaultConfig: {
      confidenceThreshold: 0.8,
    },
  },
  {
    type: 'ai_gemini_schema',
    label: 'AI Data Extractor',
    category: 'ai',
    description: 'Converts unstructured raw text into structured JSON schema using Gemini.',
    iconName: 'Binary',
    defaultInputs: [
      { name: 'unstructuredText', dataType: 'string', direction: 'input' },
    ],
    defaultOutputs: [
      { name: 'extractedJson', dataType: 'object', direction: 'output' },
    ],
    defaultConfig: {
      expectedSchema: JSON.stringify(
        {
          title: 'string',
          summary: 'string',
          keyInsights: ['string'],
          actionRequired: 'boolean',
        },
        null,
        2
      ),
    },
  },

  // --- LOGIC CATEGORY ---
  {
    type: 'code_js',
    label: 'JavaScript Runner',
    category: 'logic',
    description: 'Executes custom JavaScript code block on the Node server.',
    iconName: 'Code2',
    defaultInputs: [
      { name: 'inputData', dataType: 'any', direction: 'input' },
    ],
    defaultOutputs: [
      { name: 'result', dataType: 'any', direction: 'output' },
    ],
    defaultConfig: {
      code: `// 'input' variable contains incoming data from input port
// Return any transformed data or object

if (typeof input === 'string') {
  return {
    length: input.length,
    uppercase: input.toUpperCase(),
    words: input.split(' ').length,
    timestamp: new Date().toISOString()
  };
}

if (Array.isArray(input)) {
  return input.map(item => ({
    ...item,
    processed: true
  }));
}

return { received: input, processedAt: new Date().toISOString() };`,
    },
  },
  {
    type: 'json_path',
    label: 'JSON Key Extractor',
    category: 'logic',
    description: 'Extracts specific key or path value from incoming JSON object.',
    iconName: 'Workflow',
    defaultInputs: [
      { name: 'jsonObj', dataType: 'object', direction: 'input' },
    ],
    defaultOutputs: [
      { name: 'extractedValue', dataType: 'any', direction: 'output' },
    ],
    defaultConfig: {
      path: 'items', // e.g. "items" or "user.name"
    },
  },
  {
    type: 'text_formatter',
    label: 'Text Formatter',
    category: 'logic',
    description: 'Formats string with template variables, uppercase/lowercase, or regex replace.',
    iconName: 'Type',
    defaultInputs: [
      { name: 'textA', dataType: 'string', direction: 'input' },
      { name: 'textB', dataType: 'string', direction: 'input' },
    ],
    defaultOutputs: [
      { name: 'formatted', dataType: 'string', direction: 'output' },
    ],
    defaultConfig: {
      operation: 'template', // 'template', 'uppercase', 'lowercase', 'join'
      template: '📌 REPORT:\nValue A: {{textA}}\nValue B: {{textB}}',
    },
  },
  {
    type: 'filter_condition',
    label: 'Condition (If/Else)',
    category: 'logic',
    description: 'Branches or filters values based on condition rule.',
    iconName: 'GitBranch',
    defaultInputs: [
      { name: 'value', dataType: 'any', direction: 'input' },
    ],
    defaultOutputs: [
      { name: 'trueOutput', dataType: 'any', direction: 'output' },
      { name: 'falseOutput', dataType: 'any', direction: 'output' },
    ],
    defaultConfig: {
      operator: 'contains', // 'equals', 'contains', 'greaterThan', 'notEmpty'
      compareValue: 'High',
    },
  },
  {
    type: 'math_calculator',
    label: 'Math & Stats',
    category: 'logic',
    description: 'Performs mathematical or statistical operations on numbers or arrays.',
    iconName: 'Calculator',
    defaultInputs: [
      { name: 'val1', dataType: 'number', direction: 'input' },
      { name: 'val2', dataType: 'number', direction: 'input' },
    ],
    defaultOutputs: [
      { name: 'result', dataType: 'number', direction: 'output' },
    ],
    defaultConfig: {
      operation: 'sum', // 'sum', 'multiply', 'average', 'percentage'
    },
  },

  // --- NETWORK CATEGORY ---
  {
    type: 'http_request',
    label: 'REST API Proxy',
    category: 'network',
    description: 'Sends GET/POST HTTP requests to external APIs via backend proxy.',
    iconName: 'Globe',
    defaultInputs: [
      { name: 'queryParams', dataType: 'object', direction: 'input' },
      { name: 'bodyData', dataType: 'any', direction: 'input' },
    ],
    defaultOutputs: [
      { name: 'data', dataType: 'any', direction: 'output' },
      { name: 'status', dataType: 'number', direction: 'output' },
    ],
    defaultConfig: {
      url: 'https://api.github.com/repos/facebook/react',
      method: 'GET',
      headers: JSON.stringify({ Accept: 'application/vnd.github.v3+json' }, null, 2),
    },
  },

  // --- OUTPUT CATEGORY ---
  {
    type: 'output_log',
    label: 'Console Inspector',
    category: 'output',
    description: 'Displays input value in live inspection log viewer.',
    iconName: 'Terminal',
    defaultInputs: [
      { name: 'data', dataType: 'any', direction: 'input' },
    ],
    defaultOutputs: [],
    defaultConfig: {},
  },
  {
    type: 'output_json',
    label: 'JSON Viewer',
    category: 'output',
    description: 'Renders collapsible interactive JSON tree for inspection.',
    iconName: 'Code',
    defaultInputs: [
      { name: 'data', dataType: 'any', direction: 'input' },
    ],
    defaultOutputs: [],
    defaultConfig: {},
  },
  {
    type: 'output_card',
    label: 'Visual Card Display',
    category: 'output',
    description: 'Renders styled UI result card with title, badges, and text content.',
    iconName: 'Layout',
    defaultInputs: [
      { name: 'title', dataType: 'string', direction: 'input' },
      { name: 'content', dataType: 'string', direction: 'input' },
      { name: 'badge', dataType: 'string', direction: 'input' },
    ],
    defaultOutputs: [],
    defaultConfig: {
      cardStyle: 'emerald', // emerald, indigo, amber, rose
    },
  },
  {
    type: 'output_table',
    label: 'Data Table',
    category: 'output',
    description: 'Displays array of objects in responsive interactive grid table.',
    iconName: 'Table',
    defaultInputs: [
      { name: 'items', dataType: 'array', direction: 'input' },
    ],
    defaultOutputs: [],
    defaultConfig: {
      pageSize: 5,
    },
  },
];
