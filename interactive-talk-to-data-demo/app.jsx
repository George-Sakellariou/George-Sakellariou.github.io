const { useState, useEffect, useRef } = React;

// Agent definitions
const AGENTS = [
  { id: 'user-query', label: 'User Query', icon: '💬', color: '#6B7280', x: 50, y: 30 },
  { id: 'planner', label: 'Planner Agent', icon: '🧠', color: '#8B5CF6', x: 250, y: 30 },
  { id: 'schema', label: 'Schema Agent', icon: '🗄️', color: '#0078D4', x: 450, y: 30 },
  { id: 'sql-gen', label: 'SQL Generator', icon: '⚙️', color: '#10B981', x: 650, y: 30 },
  { id: 'validator', label: 'Validator', icon: '✓', color: '#F59E0B', x: 800, y: 120 },
  { id: 'self-heal', label: 'Self-Healing', icon: '🔧', color: '#EF4444', x: 650, y: 200 },
  { id: 'executor', label: 'Executor', icon: '▶️', color: '#6366F1', x: 450, y: 200 },
  { id: 'visualizer', label: 'Visualizer', icon: '📊', color: '#EC4899', x: 250, y: 200 },
  { id: 'response', label: 'Response', icon: '✅', color: '#10B981', x: 50, y: 200 }
];

// Connections between agents
const CONNECTIONS = [
  { from: 'user-query', to: 'planner', id: 'conn-1' },
  { from: 'planner', to: 'schema', id: 'conn-2' },
  { from: 'schema', to: 'sql-gen', id: 'conn-3' },
  { from: 'sql-gen', to: 'validator', id: 'conn-4' },
  { from: 'validator', to: 'executor', id: 'conn-5', successOnly: true },
  { from: 'validator', to: 'self-heal', id: 'conn-6', healingOnly: true },
  { from: 'self-heal', to: 'sql-gen', id: 'conn-7', healingOnly: true },
  { from: 'executor', to: 'visualizer', id: 'conn-8' },
  { from: 'visualizer', to: 'response', id: 'conn-9' }
];

// Sample queries with SQL
const SAMPLE_QUERIES = {
  "revenue": {
    nlQuery: "What is the total revenue by product category this quarter?",
    sqlInitial: "SELECT category, SUM(revenue) FROM sales WHERE quarter = 'Q4' GROUP BY category",
    sqlError: null,
    result: "Revenue analysis complete: Electronics: $1.2M, Clothing: $850K, Home: $620K",
    chartType: "bar",
    accuracy: 0.97,
    mode: "success"
  },
  "employees": {
    nlQuery: "Show me top 5 employees by sales performance",
    sqlInitial: "SELECT name, SUM(sales) FROM employee WHERE department = 'Sales' GROUP BY name LIMIT 5",
    sqlError: "Column 'employee.sales' doesn't exist",
    sqlHealed: "SELECT e.name, SUM(s.amount) as total_sales FROM employees e JOIN sales s ON e.id = s.employee_id WHERE e.department = 'Sales' GROUP BY e.name ORDER BY total_sales DESC LIMIT 5",
    result: "Top performers: Sarah Chen ($420K), Mike Johnson ($385K), Lisa Park ($362K), Tom Wilson ($341K), Amy Davis ($315K)",
    chartType: "table",
    accuracy: 0.95,
    mode: "healing"
  },
  "trends": {
    nlQuery: "What are the monthly sales trends for the past year?",
    sqlInitial: "SELECT DATE_FORMAT(sale_date, '%Y-%m') as month, SUM(amount) as total FROM sales WHERE sale_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR) GROUP BY month ORDER BY month",
    sqlError: null,
    result: "Sales trend: Steady growth from $520K (Jan) to $890K (Dec) with 71% YoY increase",
    chartType: "line",
    accuracy: 0.98,
    mode: "success"
  }
};

// Preset queries
const PRESET_QUERIES = [
  { text: "What is the total revenue by product category this quarter?", key: "revenue" },
  { text: "Show me top 5 employees by sales performance", key: "employees" },
  { text: "What are the monthly sales trends for the past year?", key: "trends" }
];

// Main App Component
function App() {
  const [state, setState] = useState({
    isRunning: false,
    mode: 'success',
    agents: Object.fromEntries(AGENTS.map(a => [a.id, 'inactive'])),
    agentMessages: {},
    activeConnections: [],
    metrics: {
      queryTime: 0,
      accuracy: 0,
      agentsInvolved: 0,
      sqlGenerated: 0
    },
    query: '',
    currentSQL: '',
    showError: false,
    errorMessage: '',
    response: null,
    chartType: null,
    showSQLModal: false,
    typingIndex: 0
  });

  const simulationTimeouts = useRef([]);

  // Clear all simulation timeouts
  const clearSimulation = () => {
    simulationTimeouts.current.forEach(timeout => clearTimeout(timeout));
    simulationTimeouts.current = [];
  };

  // Update agent state
  const updateAgent = (agentId, status, message = null, delay = 0) => {
    const timeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        agents: { ...prev.agents, [agentId]: status },
        agentMessages: message ? { ...prev.agentMessages, [agentId]: message } : prev.agentMessages
      }));
    }, delay);
    simulationTimeouts.current.push(timeout);
    return delay;
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
    }, delay);
    simulationTimeouts.current.push(timeout);
    return delay;
  };

  // Update metrics
  const updateMetrics = (updates, delay = 0) => {
    const timeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        metrics: { ...prev.metrics, ...updates }
      }));
    }, delay);
    simulationTimeouts.current.push(timeout);
    return delay;
  };

  // Update SQL display
  const updateSQL = (sql, delay = 0) => {
    const timeout = setTimeout(() => {
      setState(prev => ({ ...prev, currentSQL: sql }));
    }, delay);
    simulationTimeouts.current.push(timeout);
    return delay;
  };

  // Show error
  const showError = (message, delay = 0) => {
    const timeout = setTimeout(() => {
      setState(prev => ({ ...prev, showError: true, errorMessage: message }));
    }, delay);
    simulationTimeouts.current.push(timeout);
    return delay;
  };

  // Run success flow simulation
  const runSuccessSimulation = (queryData) => {
    clearSimulation();
    let currentDelay = 0;

    // Reset state
    setState(prev => ({
      ...prev,
      isRunning: true,
      response: null,
      typingIndex: 0,
      currentSQL: '',
      showError: false,
      agents: Object.fromEntries(AGENTS.map(a => [a.id, 'inactive'])),
      agentMessages: {},
      activeConnections: [],
      metrics: { queryTime: 0, accuracy: 0, agentsInvolved: 0, sqlGenerated: 0 }
    }));

    // Step 1: User query
    currentDelay += updateAgent('user-query', 'active', null, currentDelay);
    currentDelay += updateConnection('conn-1', true, currentDelay);
    currentDelay += 500;

    // Step 2: Planner analyzes
    currentDelay += updateAgent('planner', 'processing', 'Analyzing intent...', currentDelay);
    currentDelay += 800;
    currentDelay += updateAgent('planner', 'complete', 'Plan created', currentDelay);
    currentDelay += updateConnection('conn-2', true, currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 1 }, currentDelay);

    // Step 3: Schema Agent
    currentDelay += updateAgent('schema', 'processing', 'Loading schema...', currentDelay);
    currentDelay += 700;
    currentDelay += updateAgent('schema', 'complete', 'Schema mapped', currentDelay);
    currentDelay += updateConnection('conn-3', true, currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 2, queryTime: 1.5 }, currentDelay);

    // Step 4: SQL Generator
    currentDelay += updateAgent('sql-gen', 'processing', 'Generating SQL...', currentDelay);
    currentDelay += updateSQL(queryData.sqlInitial, currentDelay + 400);
    currentDelay += 1000;
    currentDelay += updateAgent('sql-gen', 'complete', 'SQL generated', currentDelay);
    currentDelay += updateConnection('conn-4', true, currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 3, sqlGenerated: 1, queryTime: 2.1 }, currentDelay);

    // Step 5: Validator (success)
    currentDelay += updateAgent('validator', 'processing', 'Validating SQL...', currentDelay);
    currentDelay += 600;
    currentDelay += updateAgent('validator', 'complete', 'Valid ✓', currentDelay);
    currentDelay += updateConnection('conn-5', true, currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 4, queryTime: 2.5 }, currentDelay);

    // Step 6: Executor
    currentDelay += updateAgent('executor', 'processing', 'Executing query...', currentDelay);
    currentDelay += updateConnection('conn-8', true, currentDelay);
    currentDelay += 900;
    currentDelay += updateAgent('executor', 'complete', 'Query complete', currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 5, queryTime: 3.1 }, currentDelay);

    // Step 7: Visualizer
    currentDelay += updateAgent('visualizer', 'processing', 'Creating visualization...', currentDelay);
    currentDelay += updateConnection('conn-9', true, currentDelay);
    currentDelay += 700;
    currentDelay += updateAgent('visualizer', 'complete', 'Chart ready', currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 6, queryTime: 3.5, accuracy: queryData.accuracy }, currentDelay);

    // Step 8: Response
    currentDelay += updateAgent('response', 'complete', null, currentDelay);

    // Show final response
    const timeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        response: queryData.result,
        chartType: queryData.chartType,
        isRunning: false
      }));
      startTypingEffect(queryData.result);
    }, currentDelay);
    simulationTimeouts.current.push(timeout);
  };

  // Run self-healing flow simulation
  const runHealingSimulation = (queryData) => {
    clearSimulation();
    let currentDelay = 0;

    // Reset state
    setState(prev => ({
      ...prev,
      isRunning: true,
      response: null,
      typingIndex: 0,
      currentSQL: '',
      showError: false,
      agents: Object.fromEntries(AGENTS.map(a => [a.id, 'inactive'])),
      agentMessages: {},
      activeConnections: [],
      metrics: { queryTime: 0, accuracy: 0, agentsInvolved: 0, sqlGenerated: 0 }
    }));

    // Step 1-4: Same as success flow
    currentDelay += updateAgent('user-query', 'active', null, currentDelay);
    currentDelay += updateConnection('conn-1', true, currentDelay);
    currentDelay += 500;

    currentDelay += updateAgent('planner', 'processing', 'Analyzing intent...', currentDelay);
    currentDelay += 800;
    currentDelay += updateAgent('planner', 'complete', 'Plan created', currentDelay);
    currentDelay += updateConnection('conn-2', true, currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 1 }, currentDelay);

    currentDelay += updateAgent('schema', 'processing', 'Loading schema...', currentDelay);
    currentDelay += 700;
    currentDelay += updateAgent('schema', 'complete', 'Schema mapped', currentDelay);
    currentDelay += updateConnection('conn-3', true, currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 2, queryTime: 1.5 }, currentDelay);

    currentDelay += updateAgent('sql-gen', 'processing', 'Generating SQL...', currentDelay);
    currentDelay += updateSQL(queryData.sqlInitial, currentDelay + 400);
    currentDelay += 1000;
    currentDelay += updateAgent('sql-gen', 'complete', 'SQL generated', currentDelay);
    currentDelay += updateConnection('conn-4', true, currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 3, sqlGenerated: 1, queryTime: 2.1 }, currentDelay);

    // Step 5: Validator (error detected)
    currentDelay += updateAgent('validator', 'processing', 'Validating SQL...', currentDelay);
    currentDelay += 600;
    currentDelay += updateAgent('validator', 'error', 'Error detected!', currentDelay);
    currentDelay += showError(queryData.sqlError, currentDelay);
    currentDelay += updateConnection('conn-6', true, currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 4, queryTime: 2.7 }, currentDelay);

    // Step 6: Self-Healing Agent
    currentDelay += updateAgent('self-heal', 'processing', 'Analyzing error...', currentDelay);
    currentDelay += 1200;
    currentDelay += updateAgent('self-heal', 'active', 'Fixing SQL...', currentDelay);
    currentDelay += updateConnection('conn-7', true, currentDelay);
    currentDelay += updateSQL(queryData.sqlHealed, currentDelay + 400);
    currentDelay += 1000;
    currentDelay += updateAgent('self-heal', 'complete', 'SQL fixed!', currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 5, sqlGenerated: 2, queryTime: 4.2 }, currentDelay);

    // Step 7: SQL Generator receives fixed SQL
    currentDelay += updateAgent('sql-gen', 'active', 'SQL updated', currentDelay);
    currentDelay += updateConnection('conn-4', true, currentDelay);
    currentDelay += 500;
    currentDelay += updateAgent('sql-gen', 'complete', 'Validated', currentDelay);

    // Step 8: Validator (success this time)
    currentDelay += updateAgent('validator', 'processing', 'Re-validating...', currentDelay);
    currentDelay += 600;
    currentDelay += updateAgent('validator', 'complete', 'Valid ✓', currentDelay);
    currentDelay += updateConnection('conn-5', true, currentDelay);
    const errorTimeout = setTimeout(() => setState(prev => ({ ...prev, showError: false })), currentDelay);
    simulationTimeouts.current.push(errorTimeout);
    currentDelay += updateMetrics({ agentsInvolved: 5, queryTime: 5.0 }, currentDelay);

    // Step 9: Executor
    currentDelay += updateAgent('executor', 'processing', 'Executing query...', currentDelay);
    currentDelay += updateConnection('conn-8', true, currentDelay);
    currentDelay += 900;
    currentDelay += updateAgent('executor', 'complete', 'Query complete', currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 6, queryTime: 5.6 }, currentDelay);

    // Step 10: Visualizer
    currentDelay += updateAgent('visualizer', 'processing', 'Creating visualization...', currentDelay);
    currentDelay += updateConnection('conn-9', true, currentDelay);
    currentDelay += 700;
    currentDelay += updateAgent('visualizer', 'complete', 'Chart ready', currentDelay);
    currentDelay += updateMetrics({ agentsInvolved: 7, queryTime: 6.0, accuracy: queryData.accuracy }, currentDelay);

    // Step 11: Response
    currentDelay += updateAgent('response', 'complete', null, currentDelay);

    // Show final response
    const timeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        response: queryData.result,
        chartType: queryData.chartType,
        isRunning: false
      }));
      startTypingEffect(queryData.result);
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

    const query = state.query || "What is the total revenue by product category this quarter?";
    const queryKey = Object.keys(SAMPLE_QUERIES).find(key =>
      SAMPLE_QUERIES[key].nlQuery.toLowerCase().includes(query.toLowerCase().split(' ')[2])
    ) || 'revenue';

    const queryData = SAMPLE_QUERIES[queryKey];

    if (queryData.mode === 'healing') {
      runHealingSimulation(queryData);
    } else {
      runSuccessSimulation(queryData);
    }
  };

  // Handle preset query click
  const handlePresetQuery = (preset) => {
    setState(prev => ({ ...prev, query: preset.text }));
    setTimeout(() => {
      const queryData = SAMPLE_QUERIES[preset.key];
      if (queryData.mode === 'healing') {
        runHealingSimulation(queryData);
      } else {
        runSuccessSimulation(queryData);
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
            <span className="text-gradient">Talk-to-Data Platform</span>
          </h1>
          <p className="text-lg text-secondary" style={{ color: 'var(--text-secondary)' }}>
            Multi-Agent AI Orchestration with Self-Healing
          </p>
        </header>

        {/* Architecture Visualization */}
        <div className="card p-6 mb-6 fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
            Agent Orchestration Flow
          </h2>
          <ArchitectureViz
            agents={AGENTS}
            connections={CONNECTIONS}
            agentStates={state.agents}
            agentMessages={state.agentMessages}
            activeConnections={state.activeConnections}
            showError={state.showError}
          />
        </div>

        {/* Control Panel and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ControlPanel
            query={state.query}
            onQueryChange={(query) => setState(prev => ({ ...prev, query }))}
            onSubmit={runSimulation}
            isRunning={state.isRunning}
            onPresetClick={handlePresetQuery}
          />

          <MetricsPanel
            metrics={state.metrics}
            onShowSQL={() => setState(prev => ({ ...prev, showSQLModal: true }))}
          />
        </div>

        {/* SQL Display */}
        {state.currentSQL && (
          <SQLDisplay
            sql={state.currentSQL}
            showError={state.showError}
            errorMessage={state.errorMessage}
          />
        )}

        {/* Response Output */}
        {state.response && (
          <ResponseOutput
            response={state.response}
            typingIndex={state.typingIndex}
            chartType={state.chartType}
          />
        )}

        {/* SQL Modal */}
        {state.showSQLModal && (
          <SQLModal
            sql={state.currentSQL}
            onClose={() => setState(prev => ({ ...prev, showSQLModal: false }))}
          />
        )}
      </div>
    </div>
  );
}

// Architecture Visualization Component
function ArchitectureViz({ agents, connections, agentStates, agentMessages, activeConnections, showError }) {
  const svgRef = useRef(null);

  return (
    <div className="relative w-full" style={{ minHeight: '280px' }}>
      <svg ref={svgRef} className="w-full h-full" viewBox="0 0 900 250" preserveAspectRatio="xMidYMid meet">
        {/* Connections */}
        {connections.map(conn => {
          const fromAgent = agents.find(a => a.id === conn.from);
          const toAgent = agents.find(a => a.id === conn.to);
          const isActive = activeConnections.includes(conn.id);
          const isHealing = conn.healingOnly && showError;

          return (
            <g key={conn.id}>
              <line
                x1={fromAgent.x + 50}
                y1={fromAgent.y + 50}
                x2={toAgent.x + 50}
                y2={toAgent.y + 50}
                className={`connection-line ${isActive ? 'active' : ''} ${isHealing ? 'collaboration-line' : ''}`}
              />
              {isActive && (
                <circle className="particle" cx={fromAgent.x + 50} cy={fromAgent.y + 50} r="4">
                  <animateMotion
                    dur="2s"
                    repeatCount="indefinite"
                    path={`M ${fromAgent.x + 50} ${fromAgent.y + 50} L ${toAgent.x + 50} ${toAgent.y + 50}`}
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Agents */}
      <div className="absolute inset-0 pointer-events-none">
        {agents.map(agent => (
          <div
            key={agent.id}
            className={`agent absolute flex flex-col items-center justify-center border-2 rounded-xl bg-opacity-90 transition-all duration-300 agent-${agentStates[agent.id]}`}
            style={{
              left: `${(agent.x / 900) * 100}%`,
              top: `${(agent.y / 250) * 100}%`,
              backgroundColor: 'var(--bg-elevated)',
              borderColor: agent.color,
              minWidth: '100px',
              minHeight: '100px'
            }}
          >
            <div className="agent-icon text-3xl mb-2">{agent.icon}</div>
            <div className="agent-label text-xs text-center px-2 font-medium" style={{ color: 'var(--text-primary)' }}>
              {agent.label}
            </div>
            {agentStates[agent.id] === 'processing' && <div className="spinner"></div>}
            {agentStates[agent.id] === 'complete' && (
              <div className="absolute top-2 right-2 text-success text-xl">✓</div>
            )}
            {agentStates[agent.id] === 'error' && (
              <div className="absolute top-2 right-2 text-error text-xl">!</div>
            )}
            {agentMessages[agent.id] && (
              <div className="agent-message">{agentMessages[agent.id]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Control Panel Component
function ControlPanel({ query, onQueryChange, onSubmit, isRunning, onPresetClick }) {
  return (
    <div className="card p-6 fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Control Panel
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Natural Language Query
        </label>
        <input
          type="text"
          className="input"
          placeholder="Ask a question about your data..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          disabled={isRunning}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Example Queries
        </label>
        <div className="flex flex-col gap-2">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              className="btn btn-secondary text-left text-sm"
              onClick={() => onPresetClick(preset)}
              disabled={isRunning}
            >
              {preset.text}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary w-full"
        onClick={onSubmit}
        disabled={isRunning}
      >
        {isRunning ? 'Processing...' : 'Execute Query'}
      </button>
    </div>
  );
}

// Metrics Panel Component
function MetricsPanel({ metrics, onShowSQL }) {
  return (
    <div className="card p-6 fade-in" style={{ animationDelay: '0.3s' }}>
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        System Metrics
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="metric-card">
          <div className="metric-value">{metrics.queryTime.toFixed(1)}s</div>
          <div className="metric-label">Query Time</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{(metrics.accuracy * 100).toFixed(0)}%</div>
          <div className="metric-label">Accuracy</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.agentsInvolved}</div>
          <div className="metric-label">Agents Involved</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.sqlGenerated}</div>
          <div className="metric-label">SQL Generated</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Multi-Agent Orchestration</span>
          <span style={{ color: 'var(--success)' }}>Active</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Self-Healing</span>
          <span style={{ color: 'var(--success)' }}>Enabled</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Autonomous Validation</span>
          <span style={{ color: 'var(--success)' }}>Active</span>
        </div>
      </div>
    </div>
  );
}

// SQL Display Component
function SQLDisplay({ sql, showError, errorMessage }) {
  return (
    <div className="card p-6 mb-6 fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Generated SQL
        </h2>
        {showError && (
          <span className="text-sm px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            Error Detected
          </span>
        )}
      </div>

      <div className="sql-code">
        {sql}
      </div>

      {showError && errorMessage && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}
    </div>
  );
}

// Response Output Component
function ResponseOutput({ response, typingIndex, chartType }) {
  const displayText = response.substring(0, typingIndex);
  const showCursor = typingIndex < response.length;

  return (
    <div className="card p-6 fade-in">
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Query Result
      </h2>

      <div className="mb-4">
        <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {displayText}
          {showCursor && <span className="inline-block w-0.5 h-5 bg-blue-500 ml-1 animate-pulse"></span>}
        </p>
      </div>

      <div className="chart-preview">
        <div className="text-center">
          <div className="text-4xl mb-2">{chartType === 'bar' ? '📊' : chartType === 'line' ? '📈' : '📋'}</div>
          <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {chartType === 'bar' ? 'Bar Chart' : chartType === 'line' ? 'Line Chart' : 'Data Table'} Visualization
          </div>
        </div>
      </div>
    </div>
  );
}

// SQL Modal Component
function SQLModal({ sql, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              SQL Query Details
            </h2>
            <button
              className="text-2xl leading-none"
              style={{ color: 'var(--text-secondary)' }}
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <div className="sql-code">
            {sql}
          </div>
        </div>
      </div>
    </div>
  );
}

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
