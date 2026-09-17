import { FlowNode, FlowConnection, ExecutionLog } from '../types';

// Helper to resolve input data for a node port based on incoming connections
export function resolvePortInputs(
  node: FlowNode,
  connections: FlowConnection[],
  allNodes: FlowNode[]
): Record<string, any> {
  const inputData: Record<string, any> = {};

  for (const inputPort of node.inputs) {
    // Find connection targeting this input port
    const conn = connections.find(
      (c) => c.toNodeId === node.id && c.toPortId === inputPort.id
    );

    if (conn) {
      const sourceNode = allNodes.find((n) => n.id === conn.fromNodeId);
      if (sourceNode && sourceNode.state.outputData) {
        const sourcePort = sourceNode.outputs.find((p) => p.id === conn.fromPortId);
        if (sourcePort) {
          inputData[inputPort.name] = sourceNode.state.outputData[sourcePort.name];
        }
      }
    }
  }

  return inputData;
}

// Topological Sort for Nodes to determine execution order
export function getExecutionOrder(nodes: FlowNode[], connections: FlowConnection[]): FlowNode[] {
  const inDegree: Record<string, number> = {};
  const graph: Record<string, string[]> = {};

  nodes.forEach((node) => {
    inDegree[node.id] = 0;
    graph[node.id] = [];
  });

  connections.forEach((conn) => {
    if (graph[conn.fromNodeId]) {
      graph[conn.fromNodeId].push(conn.toNodeId);
    }
    if (inDegree[conn.toNodeId] !== undefined) {
      inDegree[conn.toNodeId] += 1;
    }
  });

  const queue: FlowNode[] = nodes.filter((n) => inDegree[n.id] === 0);
  const ordered: FlowNode[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    ordered.push(current);

    const neighbors = graph[current.id] || [];
    for (const neighborId of neighbors) {
      inDegree[neighborId] -= 1;
      if (inDegree[neighborId] === 0) {
        const neighborNode = nodes.find((n) => n.id === neighborId);
        if (neighborNode) queue.push(neighborNode);
      }
    }
  }

  // Add any unvisited nodes (in case of cycles or disconnected components)
  nodes.forEach((n) => {
    if (!ordered.find((o) => o.id === n.id)) {
      ordered.push(n);
    }
  });

  return ordered;
}

// Single Node Execution Logic
export async function executeSingleNode(
  node: FlowNode,
  inputData: Record<string, any>,
  addLog: (log: Omit<ExecutionLog, 'id' | 'timestamp'>) => void
): Promise<Record<string, any>> {
  const startTime = Date.now();
  addLog({
    nodeId: node.id,
    nodeLabel: node.label,
    type: 'info',
    message: `Executing node [${node.label}] (${node.type})...`,
    data: { inputs: inputData },
  });

  let outputData: Record<string, any> = {};

  switch (node.type) {
    case 'input_text': {
      outputData = { text: node.config.value || '' };
      break;
    }

    case 'input_json': {
      let parsed = node.config.value;
      if (typeof node.config.value === 'string') {
        try {
          parsed = JSON.parse(node.config.value);
        } catch {
          parsed = node.config.value;
        }
      }
      outputData = {
        json: parsed,
        raw: typeof node.config.value === 'string' ? node.config.value : JSON.stringify(node.config.value, null, 2),
      };
      break;
    }

    case 'trigger_form': {
      outputData = {
        submittedValue: inputData.submittedValue || node.config.defaultValue || node.config.placeholder || '',
      };
      break;
    }

    case 'ai_gemini_prompt': {
      const userPrompt = inputData.prompt || node.config.promptTemplate || 'Provide an overview.';
      const context = inputData.context || '';

      let fullPrompt = node.config.promptTemplate || '{{prompt}}';
      fullPrompt = fullPrompt.replace('{{prompt}}', userPrompt).replace('{{context}}', context);
      if (!fullPrompt.includes(userPrompt)) {
        fullPrompt = `${userPrompt}\n${context}`.trim();
      }

      const res = await fetch('/api/gemini/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          systemInstruction: node.config.systemInstruction,
          model: node.config.model || 'gemini-2.5-flash',
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gemini prompt request failed');
      }

      outputData = { response: json.result };
      break;
    }

    case 'ai_gemini_summarize': {
      const textToSummarize = inputData.text || 'No text provided to summarize.';
      const prompt = `Please summarize the following text into key insights:\n\n${textToSummarize}`;

      const res = await fetch('/api/gemini/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction: 'You are an executive text summarizer.',
          model: 'gemini-2.5-flash',
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gemini summarizer failed');
      }

      const summaryText = json.result || '';
      const bulletPoints = summaryText
        .split('\n')
        .map((s: string) => s.replace(/^[-*•\d.]+\s*/, '').trim())
        .filter((s: string) => s.length > 0);

      outputData = { summary: summaryText, bulletPoints };
      break;
    }

    case 'ai_gemini_classifier': {
      const textToClassify = inputData.text || 'Sample content';
      const prompt = `Analyze the sentiment and key topics of the following text:
"${textToClassify}"

Return JSON strictly in this format:
{
  "sentiment": "Positive" | "Negative" | "Neutral",
  "topics": ["topic1", "topic2"],
  "confidence": 0.95
}`;

      const res = await fetch('/api/gemini/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          responseMimeType: 'application/json',
          model: 'gemini-2.5-flash',
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gemini classifier failed');
      }

      try {
        const parsed = JSON.parse(json.result);
        outputData = {
          sentiment: parsed.sentiment || 'Neutral',
          topics: parsed.topics || ['General'],
          confidence: parsed.confidence || 0.9,
        };
      } catch {
        outputData = { sentiment: 'Neutral', topics: ['General'], confidence: 0.8 };
      }
      break;
    }

    case 'ai_gemini_schema': {
      const rawText = inputData.unstructuredText || 'Sample data';
      const schemaSpec = node.config.expectedSchema || '{}';
      const prompt = `Extract structured data from this raw input text according to the following schema specification:

SCHEMA SPEC:
${schemaSpec}

RAW TEXT INPUT:
${rawText}

Return valid JSON adhering to the schema.`;

      const res = await fetch('/api/gemini/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          responseMimeType: 'application/json',
          model: 'gemini-2.5-flash',
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gemini data extraction failed');
      }

      try {
        const extracted = JSON.parse(json.result);
        outputData = { extractedJson: extracted };
      } catch {
        outputData = { extractedJson: { rawResult: json.result } };
      }
      break;
    }

    case 'code_js': {
      const code = node.config.code || 'return input;';
      const inputVal = inputData.inputData !== undefined ? inputData.inputData : {};

      const res = await fetch('/api/nodes/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input: inputVal }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'JavaScript runner failed');
      }

      outputData = { result: json.result };
      break;
    }

    case 'json_path': {
      const obj = inputData.jsonObj || {};
      const pathStr = node.config.path || '';

      let current: any = obj;
      if (pathStr) {
        const keys = pathStr.split('.');
        for (const key of keys) {
          if (current && typeof current === 'object' && key in current) {
            current = current[key];
          } else {
            current = undefined;
            break;
          }
        }
      }

      outputData = { extractedValue: current };
      break;
    }

    case 'text_formatter': {
      const valA = inputData.textA || '';
      const valB = inputData.textB || '';
      const op = node.config.operation || 'template';

      let formatted = '';
      if (op === 'template') {
        const tpl = node.config.template || '{{textA}} - {{textB}}';
        formatted = tpl.replace('{{textA}}', String(valA)).replace('{{textB}}', String(valB));
      } else if (op === 'uppercase') {
        formatted = String(valA).toUpperCase();
      } else if (op === 'lowercase') {
        formatted = String(valA).toLowerCase();
      } else {
        formatted = `${valA} ${valB}`.trim();
      }

      outputData = { formatted };
      break;
    }

    case 'filter_condition': {
      const val = inputData.value;
      const operator = node.config.operator || 'equals';
      const cmpVal = node.config.compareValue || '';

      let isTrue = false;
      if (operator === 'equals') {
        isTrue = String(val) === String(cmpVal);
      } else if (operator === 'contains') {
        isTrue = String(val).toLowerCase().includes(String(cmpVal).toLowerCase());
      } else if (operator === 'greaterThan') {
        isTrue = Number(val) > Number(cmpVal);
      } else if (operator === 'notEmpty') {
        isTrue = val !== null && val !== undefined && val !== '';
      }

      outputData = {
        trueOutput: isTrue ? val : null,
        falseOutput: !isTrue ? val : null,
      };
      break;
    }

    case 'math_calculator': {
      const v1 = Number(inputData.val1) || 0;
      const v2 = Number(inputData.val2) || 0;
      const op = node.config.operation || 'sum';

      let resNum = 0;
      if (op === 'sum') resNum = v1 + v2;
      else if (op === 'multiply') resNum = v1 * v2;
      else if (op === 'average') resNum = (v1 + v2) / 2;
      else if (op === 'percentage') resNum = v2 !== 0 ? (v1 / v2) * 100 : 0;

      outputData = { result: resNum };
      break;
    }

    case 'http_request': {
      const url = node.config.url;
      const method = node.config.method || 'GET';
      let headers = {};
      try {
        if (node.config.headers) headers = JSON.parse(node.config.headers);
      } catch {
        headers = {};
      }

      const res = await fetch('/api/http-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          method,
          headers,
          body: inputData.bodyData,
        }),
      });

      const json = await res.json();
      if (res.status >= 400) {
        throw new Error(json.error || `HTTP Request failed with status ${res.status}`);
      }

      outputData = {
        data: json.data,
        status: json.status,
      };
      break;
    }

    case 'output_log': {
      outputData = { logged: inputData.data };
      break;
    }

    case 'output_json': {
      outputData = { jsonView: inputData.data };
      break;
    }

    case 'output_card': {
      outputData = {
        title: inputData.title || node.config.cardTitle || 'Result Card',
        content: inputData.content || 'No content passed to display.',
        badge: inputData.badge || 'Output',
      };
      break;
    }

    case 'output_table': {
      let items = inputData.items;
      if (!Array.isArray(items)) {
        if (items && typeof items === 'object') items = [items];
        else items = [];
      }
      outputData = { items };
      break;
    }

    default:
      outputData = { ...inputData };
  }

  const duration = Date.now() - startTime;
  addLog({
    nodeId: node.id,
    nodeLabel: node.label,
    type: 'success',
    message: `Completed [${node.label}] in ${duration}ms`,
    data: { output: outputData },
  });

  return outputData;
}
