import { WorkflowTemplate } from '../types';

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'ai-content-generator',
    name: 'AI Content Generation Flow',
    description: 'Triggers a prompt form, processes it with Gemini AI, formats the layout, and renders a visual card.',
    badge: 'Gemini AI',
    nodes: [
      {
        id: 'node-form-1',
        type: 'trigger_form',
        label: 'User Prompt Form',
        category: 'input',
        x: 80,
        y: 180,
        inputs: [],
        outputs: [
          { id: 'port-f1-out', name: 'submittedValue', dataType: 'string', direction: 'output' },
        ],
        config: {
          placeholder: 'Enter a topic to generate content for...',
          defaultValue: 'Explain how Node.js full-stack applications handle asynchronous workflow pipelines.',
        },
        state: { status: 'idle' },
      },
      {
        id: 'node-ai-1',
        type: 'ai_gemini_prompt',
        label: 'Gemini AI Writer',
        category: 'ai',
        x: 420,
        y: 180,
        inputs: [
          { id: 'port-ai1-in-prompt', name: 'prompt', dataType: 'string', direction: 'input' },
          { id: 'port-ai1-in-ctx', name: 'context', dataType: 'string', direction: 'input' },
        ],
        outputs: [
          { id: 'port-ai1-out-resp', name: 'response', dataType: 'string', direction: 'output' },
        ],
        config: {
          systemInstruction: 'You are an expert tech writer. Provide a engaging 2-paragraph overview with key points.',
          model: 'gemini-2.5-flash',
          promptTemplate: 'Write a comprehensive breakdown about:\n{{prompt}}',
        },
        state: { status: 'idle' },
      },
      {
        id: 'node-card-1',
        type: 'output_card',
        label: 'Formatted Article Card',
        category: 'output',
        x: 780,
        y: 180,
        inputs: [
          { id: 'port-c1-in-title', name: 'title', dataType: 'string', direction: 'input' },
          { id: 'port-c1-in-content', name: 'content', dataType: 'string', direction: 'input' },
          { id: 'port-c1-in-badge', name: 'badge', dataType: 'string', direction: 'input' },
        ],
        outputs: [],
        config: {
          cardStyle: 'emerald',
        },
        state: { status: 'idle' },
      },
    ],
    connections: [
      {
        id: 'conn-1',
        fromNodeId: 'node-form-1',
        fromPortId: 'port-f1-out',
        toNodeId: 'node-ai-1',
        toPortId: 'port-ai1-in-prompt',
      },
      {
        id: 'conn-2',
        fromNodeId: 'node-ai-1',
        fromPortId: 'port-ai1-out-resp',
        toNodeId: 'node-card-1',
        toPortId: 'port-c1-in-content',
      },
      {
        id: 'conn-3',
        fromNodeId: 'node-form-1',
        fromPortId: 'port-f1-out',
        toNodeId: 'node-card-1',
        toPortId: 'port-c1-in-title',
      },
    ],
  },
  {
    id: 'api-sentiment-analysis',
    name: 'GitHub REST API & AI Sentiment Flow',
    description: 'Fetches repository data from GitHub REST API via Node proxy, extracts description, and classifies sentiment.',
    badge: 'REST API + AI',
    nodes: [
      {
        id: 'node-http-1',
        type: 'http_request',
        label: 'GitHub API Fetch',
        category: 'network',
        x: 80,
        y: 180,
        inputs: [
          { id: 'port-http1-in-q', name: 'queryParams', dataType: 'object', direction: 'input' },
          { id: 'port-http1-in-b', name: 'bodyData', dataType: 'any', direction: 'input' },
        ],
        outputs: [
          { id: 'port-http1-out-data', name: 'data', dataType: 'any', direction: 'output' },
          { id: 'port-http1-out-status', name: 'status', dataType: 'number', direction: 'output' },
        ],
        config: {
          url: 'https://api.github.com/repos/facebook/react',
          method: 'GET',
          headers: JSON.stringify({ Accept: 'application/vnd.github.v3+json' }, null, 2),
        },
        state: { status: 'idle' },
      },
      {
        id: 'node-key-1',
        type: 'json_path',
        label: 'Extract Description',
        category: 'logic',
        x: 420,
        y: 180,
        inputs: [
          { id: 'port-key1-in-obj', name: 'jsonObj', dataType: 'object', direction: 'input' },
        ],
        outputs: [
          { id: 'port-key1-out-val', name: 'extractedValue', dataType: 'any', direction: 'output' },
        ],
        config: {
          path: 'description',
        },
        state: { status: 'idle' },
      },
      {
        id: 'node-classify-1',
        type: 'ai_gemini_classifier',
        label: 'Gemini Classifier',
        category: 'ai',
        x: 740,
        y: 180,
        inputs: [
          { id: 'port-cls1-in-txt', name: 'text', dataType: 'string', direction: 'input' },
        ],
        outputs: [
          { id: 'port-cls1-out-sent', name: 'sentiment', dataType: 'string', direction: 'output' },
          { id: 'port-cls1-out-top', name: 'topics', dataType: 'array', direction: 'output' },
          { id: 'port-cls1-out-conf', name: 'confidence', dataType: 'number', direction: 'output' },
        ],
        config: {
          confidenceThreshold: 0.85,
        },
        state: { status: 'idle' },
      },
      {
        id: 'node-json-out',
        type: 'output_json',
        label: 'JSON Inspection Output',
        category: 'output',
        x: 1080,
        y: 180,
        inputs: [
          { id: 'port-jsonout-in', name: 'data', dataType: 'any', direction: 'input' },
        ],
        outputs: [],
        config: {},
        state: { status: 'idle' },
      },
    ],
    connections: [
      {
        id: 'conn-h1',
        fromNodeId: 'node-http-1',
        fromPortId: 'port-http1-out-data',
        toNodeId: 'node-key-1',
        toPortId: 'port-key1-in-obj',
      },
      {
        id: 'conn-h2',
        fromNodeId: 'node-key-1',
        fromPortId: 'port-key1-out-val',
        toNodeId: 'node-classify-1',
        toPortId: 'port-cls1-in-txt',
      },
      {
        id: 'conn-h3',
        fromNodeId: 'node-classify-1',
        fromPortId: 'port-cls1-out-sent',
        toNodeId: 'node-json-out',
        toPortId: 'port-jsonout-in',
      },
    ],
  },
  {
    id: 'custom-js-pipeline',
    name: 'JavaScript Data Processing & Table Render',
    description: 'Loads a JSON dataset, executes custom Node server JS code, calculates metrics, and displays a responsive table.',
    badge: 'Node Code Engine',
    nodes: [
      {
        id: 'node-json-in',
        type: 'input_json',
        label: 'Sales Records Dataset',
        category: 'input',
        x: 80,
        y: 180,
        inputs: [],
        outputs: [
          { id: 'port-ji-out-json', name: 'json', dataType: 'object', direction: 'output' },
          { id: 'port-ji-out-raw', name: 'raw', dataType: 'string', direction: 'output' },
        ],
        config: {
          value: JSON.stringify(
            [
              { id: 'TX-101', item: 'AI Compute Cluster', region: 'North America', units: 14, price: 4200, status: 'Completed' },
              { id: 'TX-102', item: 'Cloud Storage Tier', region: 'Europe', units: 28, price: 1100, status: 'Completed' },
              { id: 'TX-103', item: 'Developer Seats', region: 'Asia Pacific', units: 85, price: 250, status: 'Pending' },
              { id: 'TX-104', item: 'Enterprise Gateway', region: 'North America', units: 6, price: 8900, status: 'Completed' },
              { id: 'TX-105', item: 'Security Audit Suite', region: 'Europe', units: 12, price: 3400, status: 'Pending' }
            ],
            null,
            2
          ),
        },
        state: { status: 'idle' },
      },
      {
        id: 'node-js-exec',
        type: 'code_js',
        label: 'Calculate Total Revenue',
        category: 'logic',
        x: 440,
        y: 180,
        inputs: [
          { id: 'port-js-in', name: 'inputData', dataType: 'any', direction: 'input' },
        ],
        outputs: [
          { id: 'port-js-out', name: 'result', dataType: 'any', direction: 'output' },
        ],
        config: {
          code: `// Process sales dataset
if (!Array.isArray(input)) return [];

return input.map(row => {
  const revenue = row.units * row.price;
  const tax = revenue * 0.08;
  return {
    ...row,
    revenue: '$' + revenue.toLocaleString(),
    totalWithTax: '$' + (revenue + tax).toLocaleString(),
    isHighValue: revenue > 15000
  };
});`,
        },
        state: { status: 'idle' },
      },
      {
        id: 'node-table-out',
        type: 'output_table',
        label: 'Calculated Revenue Table',
        category: 'output',
        x: 820,
        y: 180,
        inputs: [
          { id: 'port-tbl-in', name: 'items', dataType: 'array', direction: 'input' },
        ],
        outputs: [],
        config: {
          pageSize: 5,
        },
        state: { status: 'idle' },
      },
    ],
    connections: [
      {
        id: 'conn-p1',
        fromNodeId: 'node-json-in',
        fromPortId: 'port-ji-out-json',
        toNodeId: 'node-js-exec',
        toPortId: 'port-js-in',
      },
      {
        id: 'conn-p2',
        fromNodeId: 'node-js-exec',
        fromPortId: 'port-js-out',
        toNodeId: 'node-table-out',
        toPortId: 'port-tbl-in',
      },
    ],
  },
];
