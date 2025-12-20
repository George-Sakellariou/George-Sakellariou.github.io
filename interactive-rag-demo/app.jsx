const { useState, useEffect, useRef } = React;

// Node definitions
const NODES = [
  { id: 'user-query', label: 'User Query', icon: '💬', color: '#6B7280', x: 50, y: 50 },
  { id: 'cache', label: 'Semantic Cache', icon: '⚡', color: '#10B981', x: 250, y: 50 },
  { id: 'embedding', label: 'Embedding Model', icon: '🧮', color: '#8B5CF6', x: 450, y: 50 },
  { id: 'search', label: 'Hybrid Search', icon: '🔍', color: '#0078D4', x: 650, y: 50 },
  { id: 'rerank', label: 'Re-ranking', icon: '🎯', color: '#F59E0B', x: 850, y: 200 },
  { id: 'context', label: 'Context Assembly', icon: '📄', color: '#6366F1', x: 650, y: 350 },
  { id: 'llm', label: 'GPT-4/GPT-4o', icon: '🤖', color: '#EF4444', x: 450, y: 350 },
  { id: 'response', label: 'Response', icon: '✅', color: '#10B981', x: 250, y: 350 }
];

// Connections between nodes
const CONNECTIONS = [
  { from: 'user-query', to: 'cache', id: 'conn-1' },
  { from: 'cache', to: 'embedding', id: 'conn-2', missOnly: true },
  { from: 'embedding', to: 'search', id: 'conn-3' },
  { from: 'search', to: 'rerank', id: 'conn-4' },
  { from: 'rerank', to: 'context', id: 'conn-5' },
  { from: 'context', to: 'llm', id: 'conn-6' },
  { from: 'llm', to: 'response', id: 'conn-7' },
  { from: 'cache', to: 'response', id: 'conn-8', hitOnly: true }
];

// Sample responses
const SAMPLE_RESPONSES = {
  "remote work policy": {
    answer: "According to the Employee Handbook (Section 4.2), remote work is available up to 2 days per week for eligible positions. Employees must coordinate with their manager and ensure core hours (10 AM - 3 PM) availability. Equipment requests can be submitted through the IT portal.",
    sources: [
      { name: "employee-handbook.pdf", page: 42, relevance: 0.94 },
      { name: "hr-policy-2024.docx", page: 12, relevance: 0.87 }
    ],
    confidence: 0.92
  },
  "submit expenses": {
    answer: "Expense reports should be submitted through the Finance Portal within 30 days of the expense. Attach all receipts for amounts over $25. Manager approval is required for expenses over $500. Reimbursement typically takes 5-7 business days.",
    sources: [
      { name: "expense-policy.pdf", page: 8, relevance: 0.96 },
      { name: "finance-procedures.docx", page: 23, relevance: 0.82 }
    ],
    confidence: 0.95
  },
  "default": {
    answer: "Our code review process requires at least two approvals from team members before merging. All PRs must pass CI checks, have test coverage above 80%, and include updated documentation. Use conventional commit messages.",
    sources: [
      { name: "engineering-handbook.md", page: 15, relevance: 0.91 },
      { name: "pr-guidelines.md", page: 3, relevance: 0.89 }
    ],
    confidence: 0.90
  }
};

// Node details for tooltips
const NODE_DETAILS = {
  'user-query': {
    title: "User Query",
    service: "FastAPI Endpoint",
    description: "Natural language question submitted by the user through the chat interface.",
    specs: ["Max length: 500 characters", "Languages: EN, ES, FR, DE"]
  },
  'cache': {
    title: "Semantic Cache",
    service: "Azure Cache for Redis",
    description: "Stores query embeddings and responses. Uses cosine similarity (threshold > 0.95) to match semantically similar questions.",
    specs: ["Cache TTL: 24 hours", "Max entries: 100,000", "Similarity threshold: 0.95"]
  },
  'embedding': {
    title: "Embedding Model",
    service: "Azure OpenAI",
    description: "Converts text queries into 1536-dimensional vector representations for semantic search.",
    specs: ["Model: text-embedding-3-large", "Dimensions: 1536", "Latency: ~100ms"]
  },
  'search': {
    title: "Hybrid Search",
    service: "Azure AI Search",
    description: "Combines vector similarity search with BM25 keyword matching for optimal retrieval.",
    specs: ["Index size: 50,000 chunks", "Vector + BM25 fusion", "Top-K: 20"]
  },
  'rerank': {
    title: "Re-ranking",
    service: "Cross-Encoder Model",
    description: "Re-scores retrieved chunks using a cross-encoder for more accurate relevance ranking.",
    specs: ["Model: ms-marco-MiniLM", "Input: 20 chunks", "Output: Top 5"]
  },
  'context': {
    title: "Context Assembly",
    service: "Custom Logic",
    description: "Assembles retrieved chunks into a coherent context with source attribution.",
    specs: ["Max tokens: 4,000", "Chunk ordering: by relevance", "Metadata included"]
  },
  'llm': {
    title: "LLM Generation",
    service: "Azure OpenAI GPT-4",
    description: "Generates natural language response based on retrieved context and user query.",
    specs: ["Model: GPT-4o", "Max output: 1,000 tokens", "Temperature: 0.3"]
  },
  'response': {
    title: "Response",
    service: "Streaming Output",
    description: "Final answer delivered to user with source citations and confidence score.",
    specs: ["Format: Markdown", "Citations: Inline", "Streaming: Yes"]
  }
};

// Preset queries
const PRESET_QUERIES = [
  { text: "What is our remote work policy?", key: "remote work policy" },
  { text: "How do I submit expenses?", key: "submit expenses" },
  { text: "What are the code review guidelines?", key: "default" }
];

// Main App Component
function App() {
  const [state, setState] = useState({
    isRunning: false,
    currentStep: 0,
    mode: 'cache-miss',
    speed: 1,
    nodes: Object.fromEntries(NODES.map(n => [n.id, 'inactive'])),
    nodeMessages: {},
    activeConnections: [],
    metrics: {
      latency: 0,
      cost: 0,
      tokensUsed: 0,
      cacheHitRate: 67,
      documentsSearched: 50000,
      chunksRetrieved: 20,
      chunksUsed: 5
    },
    query: '',
    response: null,
    showCostBreakdown: false,
    hoveredNode: null,
    typingIndex: 0
  });

  const simulationTimeouts = useRef([]);

  // Get response for query
  const getResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('remote') || lowerQuery.includes('work from home')) {
      return SAMPLE_RESPONSES["remote work policy"];
    } else if (lowerQuery.includes('expense')) {
      return SAMPLE_RESPONSES["submit expenses"];
    }
    return SAMPLE_RESPONSES["default"];
  };

  // Clear all simulation timeouts
  const clearSimulation = () => {
    simulationTimeouts.current.forEach(timeout => clearTimeout(timeout));
    simulationTimeouts.current = [];
  };

  // Update node state
  const updateNode = (nodeId, status, message = null, delay = 0) => {
    const timeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        nodes: { ...prev.nodes, [nodeId]: status },
        nodeMessages: message ? { ...prev.nodeMessages, [nodeId]: message } : prev.nodeMessages
      }));
    }, delay / state.speed);
    simulationTimeouts.current.push(timeout);
    return delay / state.speed;
  };

  // Update connection state
  const updateConnection = (connectionId, active, delay = 0) => {
    const timeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        activeConnections: active
          ? [...prev.activeConnections, connectionId]
          : prev.activeConnections.filter(id => id !== connectionId)
      }));
    }, delay / state.speed);
    simulationTimeouts.current.push(timeout);
    return delay / state.speed;
  };

  // Update metrics
  const updateMetrics = (updates, delay = 0) => {
    const timeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        metrics: { ...prev.metrics, ...updates }
      }));
    }, delay / state.speed);
    simulationTimeouts.current.push(timeout);
    return delay / state.speed;
  };

  // Run cache miss simulation
  const runCacheMissSimulation = (query) => {
    clearSimulation();
    let currentDelay = 0;

    // Reset state
    setState(prev => ({
      ...prev,
      isRunning: true,
      response: null,
      typingIndex: 0,
      nodes: Object.fromEntries(NODES.map(n => [n.id, 'inactive'])),
      nodeMessages: {},
      activeConnections: [],
      metrics: { ...prev.metrics, latency: 0, cost: 0, tokensUsed: 0 }
    }));

    // Step 1: User query active
    currentDelay += updateNode('user-query', 'active', null, currentDelay);
    currentDelay += updateConnection('conn-1', true, currentDelay);
    currentDelay += 500;

    // Step 2: Cache processing (miss)
    currentDelay += updateNode('cache', 'processing', 'Checking cache...', currentDelay);
    currentDelay += 800;
    currentDelay += updateNode('cache', 'active', 'Cache Miss', currentDelay);
    currentDelay += updateConnection('conn-2', true, currentDelay);
    currentDelay += 300;

    // Step 3: Embedding
    currentDelay += updateNode('embedding', 'processing', 'Converting to vector...', currentDelay);
    currentDelay += updateConnection('conn-3', true, currentDelay);
    currentDelay += 600;
    currentDelay += updateNode('embedding', 'complete', 'Vector created', currentDelay);
    currentDelay += updateMetrics({ latency: 0.7 }, currentDelay);

    // Step 4: Search
    currentDelay += updateNode('search', 'processing', 'Searching 50,000 chunks...', currentDelay);
    currentDelay += updateConnection('conn-4', true, currentDelay);
    currentDelay += 1000;
    currentDelay += updateNode('search', 'complete', 'Top 20 retrieved', currentDelay);
    currentDelay += updateMetrics({ latency: 1.3 }, currentDelay);

    // Step 5: Rerank
    currentDelay += updateNode('rerank', 'processing', 'Re-ranking top 20 → 5', currentDelay);
    currentDelay += updateConnection('conn-5', true, currentDelay);
    currentDelay += 700;
    currentDelay += updateNode('rerank', 'complete', 'Top 5 selected', currentDelay);
    currentDelay += updateMetrics({ latency: 1.7 }, currentDelay);

    // Step 6: Context assembly
    currentDelay += updateNode('context', 'processing', 'Assembling 3,200 tokens', currentDelay);
    currentDelay += updateConnection('conn-6', true, currentDelay);
    currentDelay += 400;
    currentDelay += updateNode('context', 'complete', 'Context ready', currentDelay);
    currentDelay += updateMetrics({ tokensUsed: 3200, latency: 1.9 }, currentDelay);

    // Step 7: LLM generation
    currentDelay += updateNode('llm', 'processing', 'Generating response...', currentDelay);
    currentDelay += updateConnection('conn-7', true, currentDelay);
    currentDelay += 1500;
    currentDelay += updateNode('llm', 'complete', 'Response generated', currentDelay);
    currentDelay += updateMetrics({ latency: 2.34, cost: 0.0034 }, currentDelay);

    // Step 8: Response complete
    currentDelay += updateNode('response', 'complete', null, currentDelay);

    // Show response with typing effect
    const responseData = getResponse(query);
    const timeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        response: responseData,
        isRunning: false
      }));
      startTypingEffect(responseData.answer);
    }, currentDelay);
    simulationTimeouts.current.push(timeout);

    // Cache the response
    currentDelay += updateNode('cache', 'complete', 'Response cached', currentDelay + 500);
  };

  // Run cache hit simulation
  const runCacheHitSimulation = (query) => {
    clearSimulation();
    let currentDelay = 0;

    // Reset state
    setState(prev => ({
      ...prev,
      isRunning: true,
      response: null,
      typingIndex: 0,
      nodes: Object.fromEntries(NODES.map(n => [n.id, 'inactive'])),
      nodeMessages: {},
      activeConnections: [],
      metrics: { ...prev.metrics, latency: 0, cost: 0, tokensUsed: 0 }
    }));

    // Step 1: User query active
    currentDelay += updateNode('user-query', 'active', null, currentDelay);
    currentDelay += updateConnection('conn-1', true, currentDelay);
    currentDelay += 500;

    // Step 2: Cache hit
    currentDelay += updateNode('cache', 'processing', 'Checking cache...', currentDelay);
    currentDelay += 300;
    currentDelay += updateNode('cache', 'complete', 'Cache Hit! ⚡', currentDelay);
    currentDelay += updateConnection('conn-8', true, currentDelay);
    currentDelay += updateMetrics({ latency: 0.12, cost: 0.0001 }, currentDelay);

    // Step 3: Response immediate
    currentDelay += updateNode('response', 'complete', null, currentDelay);

    // Mark skipped nodes
    ['embedding', 'search', 'rerank', 'context', 'llm'].forEach(nodeId => {
      updateNode(nodeId, 'inactive', 'Skipped', currentDelay);
    });

    // Show response with typing effect
    const responseData = getResponse(query);
    const timeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        response: responseData,
        isRunning: false
      }));
      startTypingEffect(responseData.answer);
    }, currentDelay);
    simulationTimeouts.current.push(timeout);
  };

  // Typing effect for response
  const startTypingEffect = (text) => {
    setState(prev => ({ ...prev, typingIndex: 0 }));
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.typingIndex >= text.length) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, typingIndex: prev.typingIndex + 1 };
      });
    }, 20);
  };

  // Run simulation
  const runSimulation = () => {
    if (state.isRunning) return;

    const query = state.query || "What is our remote work policy?";
    if (state.mode === 'cache-hit') {
      runCacheHitSimulation(query);
    } else {
      runCacheMissSimulation(query);
    }
  };

  // Handle preset query click
  const handlePresetQuery = (preset, isCacheHit = false) => {
    setState(prev => ({
      ...prev,
      query: preset.text,
      mode: isCacheHit ? 'cache-hit' : 'cache-miss'
    }));
    setTimeout(() => {
      if (isCacheHit) {
        runCacheHitSimulation(preset.text);
      } else {
        runCacheMissSimulation(preset.text);
      }
    }, 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearSimulation();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-gradient">Enterprise RAG System</span>
          </h1>
          <p className="text-lg text-secondary" style={{ color: 'var(--text-secondary)' }}>
            Live Interactive Simulation
          </p>
        </header>

        {/* Architecture Visualization */}
        <div className="card p-6 mb-6 fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
            Architecture Flow
          </h2>
          <ArchitectureViz
            nodes={NODES}
            connections={CONNECTIONS}
            nodeStates={state.nodes}
            nodeMessages={state.nodeMessages}
            activeConnections={state.activeConnections}
            mode={state.mode}
            onNodeHover={(nodeId) => setState(prev => ({ ...prev, hoveredNode: nodeId }))}
            onNodeLeave={() => setState(prev => ({ ...prev, hoveredNode: null }))}
          />
        </div>

        {/* Control Panel and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Control Panel */}
          <ControlPanel
            query={state.query}
            onQueryChange={(query) => setState(prev => ({ ...prev, query }))}
            onSubmit={runSimulation}
            mode={state.mode}
            onModeChange={(mode) => setState(prev => ({ ...prev, mode }))}
            speed={state.speed}
            onSpeedChange={(speed) => setState(prev => ({ ...prev, speed }))}
            isRunning={state.isRunning}
            onPresetClick={handlePresetQuery}
          />

          {/* Metrics Panel */}
          <MetricsPanel
            metrics={state.metrics}
            onShowCostBreakdown={() => setState(prev => ({ ...prev, showCostBreakdown: true }))}
            mode={state.mode}
          />
        </div>

        {/* Response Output */}
        {state.response && (
          <ResponseOutput
            response={state.response}
            typingIndex={state.typingIndex}
          />
        )}

        {/* Tooltip */}
        {state.hoveredNode && (
          <Tooltip node={state.hoveredNode} details={NODE_DETAILS[state.hoveredNode]} />
        )}

        {/* Cost Breakdown Modal */}
        {state.showCostBreakdown && (
          <CostBreakdownModal
            mode={state.mode}
            onClose={() => setState(prev => ({ ...prev, showCostBreakdown: false }))}
          />
        )}
      </div>
    </div>
  );
}

// Architecture Visualization Component
function ArchitectureViz({ nodes, connections, nodeStates, nodeMessages, activeConnections, mode, onNodeHover, onNodeLeave }) {
  const svgRef = useRef(null);

  return (
    <div className="relative w-full" style={{ minHeight: '450px' }}>
      <svg ref={svgRef} className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
        {/* Connections */}
        {connections.map(conn => {
          if (conn.missOnly && mode === 'cache-hit') return null;
          if (conn.hitOnly && mode === 'cache-miss') return null;

          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);

          const isActive = activeConnections.includes(conn.id);

          return (
            <g key={conn.id}>
              <line
                x1={fromNode.x + 50}
                y1={fromNode.y + 50}
                x2={toNode.x + 50}
                y2={toNode.y + 50}
                className={`connection-line ${isActive ? 'active' : ''}`}
              />
              {isActive && (
                <>
                  <circle className="particle" cx={fromNode.x + 50} cy={fromNode.y + 50} r="4">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={`M ${fromNode.x + 50} ${fromNode.y + 50} L ${toNode.x + 50} ${toNode.y + 50}`}
                    />
                  </circle>
                  <circle className="particle" cx={fromNode.x + 50} cy={fromNode.y + 50} r="4">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      begin="0.5s"
                      path={`M ${fromNode.x + 50} ${fromNode.y + 50} L ${toNode.x + 50} ${toNode.y + 50}`}
                    />
                  </circle>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      <div className="absolute inset-0 pointer-events-none">
        {nodes.map(node => (
          <div
            key={node.id}
            className={`node absolute flex flex-col items-center justify-center border-2 rounded-xl bg-opacity-90 pointer-events-auto cursor-pointer transition-all duration-300 node-${nodeStates[node.id]}`}
            style={{
              left: `${(node.x / 1000) * 100}%`,
              top: `${(node.y / 400) * 100}%`,
              backgroundColor: 'var(--bg-elevated)',
              borderColor: node.color,
              transform: 'translate(0, 0)',
              minWidth: '100px',
              minHeight: '100px'
            }}
            onMouseEnter={() => onNodeHover(node.id)}
            onMouseLeave={onNodeLeave}
          >
            <div className="node-icon text-3xl mb-2">{node.icon}</div>
            <div className="node-label text-xs text-center px-2 font-medium" style={{ color: 'var(--text-primary)' }}>
              {node.label}
            </div>
            {nodeStates[node.id] === 'processing' && <div className="spinner"></div>}
            {nodeStates[node.id] === 'complete' && (
              <div className="absolute top-2 right-2 text-success text-xl">✓</div>
            )}
            {nodeMessages[node.id] && (
              <div className="node-message">{nodeMessages[node.id]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Control Panel Component
function ControlPanel({ query, onQueryChange, onSubmit, mode, onModeChange, speed, onSpeedChange, isRunning, onPresetClick }) {
  return (
    <div className="card p-6 fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Control Panel
      </h2>

      {/* Query Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Query
        </label>
        <input
          type="text"
          className="input"
          placeholder="Ask a question... (e.g., What is our remote work policy?)"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          disabled={isRunning}
        />
      </div>

      {/* Preset Queries */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Quick Examples
        </label>
        <div className="flex flex-col gap-2">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              className="btn btn-secondary text-left text-sm"
              onClick={() => onPresetClick(preset, false)}
              disabled={isRunning}
            >
              {preset.text}
            </button>
          ))}
          <button
            className="btn btn-secondary text-left text-sm flex items-center gap-2"
            onClick={() => onPresetClick(PRESET_QUERIES[0], true)}
            disabled={isRunning}
          >
            <span>⚡</span>
            <span>{PRESET_QUERIES[0].text} (Cached)</span>
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Simulation Mode
        </label>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="cache-miss"
              checked={mode === 'cache-miss'}
              onChange={(e) => onModeChange(e.target.value)}
              disabled={isRunning}
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cache Miss</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="cache-hit"
              checked={mode === 'cache-hit'}
              onChange={(e) => onModeChange(e.target.value)}
              disabled={isRunning}
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cache Hit</span>
          </label>
        </div>
      </div>

      {/* Speed Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Animation Speed
        </label>
        <select
          className="input"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          disabled={isRunning}
        >
          <option value="0.5">0.5x Speed</option>
          <option value="1">1x Speed</option>
          <option value="2">2x Speed</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        className="btn btn-primary w-full"
        onClick={onSubmit}
        disabled={isRunning}
      >
        {isRunning ? 'Running...' : 'Run Query'}
      </button>
    </div>
  );
}

// Metrics Panel Component
function MetricsPanel({ metrics, onShowCostBreakdown, mode }) {
  return (
    <div className="card p-6 fade-in" style={{ animationDelay: '0.3s' }}>
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Metrics
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="metric-card">
          <div className="metric-value">{metrics.latency.toFixed(2)}s</div>
          <div className="metric-label">Latency</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">${metrics.cost.toFixed(4)}</div>
          <div className="metric-label">Cost</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.cacheHitRate}%</div>
          <div className="metric-label">Cache Hit Rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.tokensUsed.toLocaleString()}</div>
          <div className="metric-label">Tokens Used</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Documents Searched</span>
          <span style={{ color: 'var(--text-primary)' }}>{metrics.documentsSearched.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Chunks Retrieved</span>
          <span style={{ color: 'var(--text-primary)' }}>{metrics.chunksRetrieved}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Chunks Used</span>
          <span style={{ color: 'var(--text-primary)' }}>{metrics.chunksUsed}</span>
        </div>
      </div>

      <button className="btn btn-secondary w-full mt-4" onClick={onShowCostBreakdown}>
        Show Cost Breakdown
      </button>
    </div>
  );
}

// Response Output Component
function ResponseOutput({ response, typingIndex }) {
  const displayText = response.answer.substring(0, typingIndex);
  const showCursor = typingIndex < response.answer.length;

  return (
    <div className="card p-6 fade-in">
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Response
      </h2>

      <div className="mb-4">
        <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {displayText}
          {showCursor && <span className="inline-block w-0.5 h-5 bg-green-500 ml-1 animate-pulse"></span>}
        </p>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
          Sources
        </div>
        <div className="flex flex-wrap gap-2">
          {response.sources.map((source, idx) => (
            <div key={idx} className="source-chip">
              <span>📄</span>
              <span>{source.name}</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                (p. {source.page})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Confidence
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent-green)' }}>
            {(response.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{ width: `${response.confidence * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Tooltip Component
function Tooltip({ node, details }) {
  return (
    <div
      className="tooltip fixed"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      }}
    >
      <div className="font-semibold text-lg mb-2" style={{ color: 'var(--accent-green)' }}>
        {details.title}
      </div>
      <div className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
        {details.service}
      </div>
      <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {details.description}
      </p>
      <div className="text-xs space-y-1" style={{ color: 'var(--text-tertiary)' }}>
        {details.specs.map((spec, idx) => (
          <div key={idx}>• {spec}</div>
        ))}
      </div>
    </div>
  );
}

// Cost Breakdown Modal Component
function CostBreakdownModal({ mode, onClose }) {
  const cacheMissCosts = {
    'Cache Lookup': 0.0000,
    'Embedding Generation': 0.0001,
    'Vector Search': 0.0002,
    'Re-ranking': 0.0003,
    'LLM Input Tokens': 0.0018,
    'LLM Output Tokens': 0.0010,
    'Total': 0.0034
  };

  const cacheHitCosts = {
    'Cache Lookup': 0.0001,
    'Total': 0.0001
  };

  const costs = mode === 'cache-miss' ? cacheMissCosts : cacheHitCosts;
  const savings = mode === 'cache-hit' ? 97 : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Cost Breakdown
            </h2>
            <button
              className="text-2xl leading-none"
              style={{ color: 'var(--text-secondary)' }}
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(costs).map(([item, cost]) => (
              <div key={item}>
                {item === 'Total' && <div className="divider my-4"></div>}
                <div className="flex justify-between items-center">
                  <span
                    className={item === 'Total' ? 'font-bold' : ''}
                    style={{ color: item === 'Total' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {item}
                  </span>
                  <span
                    className={item === 'Total' ? 'font-bold text-lg' : ''}
                    style={{ color: item === 'Total' ? 'var(--accent-green)' : 'var(--text-primary)' }}
                  >
                    ${cost.toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {mode === 'cache-miss' && (
            <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-start gap-2">
                <span className="text-xl">💡</span>
                <div>
                  <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Cache hit would cost: $0.0001
                  </div>
                  <div className="text-sm" style={{ color: 'var(--accent-green)' }}>
                    Savings: 97%
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === 'cache-hit' && (
            <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-start gap-2">
                <span className="text-xl">⚡</span>
                <div>
                  <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Cache Hit Efficiency
                  </div>
                  <div className="text-sm" style={{ color: 'var(--accent-green)' }}>
                    {savings}% cost reduction compared to full pipeline
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
