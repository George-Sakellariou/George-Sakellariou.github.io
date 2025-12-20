const { useState, useEffect, useRef } = React;

const NODES = [
  { id: 'query', label: 'User Query', icon: '💬', x: 50, y: 40 },
  { id: 'router', label: 'Smart Router', icon: '🎯', x: 250, y: 40 },
  { id: 'cache', label: 'Cache Layer', icon: '⚡', x: 450, y: 40 },
  { id: 'gpt4', label: 'GPT-4', icon: '🧠', x: 650, y: 40 },
  { id: 'gpt35', label: 'GPT-3.5', icon: '⚙️', x: 650, y: 140 },
  { id: 'kpi', label: 'KPI Engine', icon: '📊', x: 450, y: 220 },
  { id: 'forecast', label: 'Forecasting', icon: '🔮', x: 250, y: 220 },
  { id: 'response', label: 'Insights', icon: '✅', x: 50, y: 220 }
];

const QUERIES = {
  complex: {
    text: "Analyze sales trends and predict next quarter revenue by region with confidence intervals",
    model: "gpt4",
    cost: 0.0045,
    cached: false,
    time: 3.2,
    result: "Q1 2025 forecast: $4.2M (+12% YoY, 95% confidence: $3.9M-$4.5M). Top regions: West Coast (+18%), EMEA (+15%). Risk factors: Supply chain, seasonality."
  },
  simple: {
    text: "What were total sales last month?",
    model: "gpt35",
    cost: 0.0003,
    cached: false,
    time: 0.8,
    result: "Total sales for November 2024: $2.1M across all regions and product categories."
  },
  cached: {
    text: "What were total sales last month?",
    model: "cached",
    cost: 0.0001,
    cached: true,
    time: 0.1,
    result: "Total sales for November 2024: $2.1M across all regions and product categories. (From cache)"
  }
};

function App() {
  const [state, setState] = useState({
    isRunning: false,
    nodes: Object.fromEntries(NODES.map(n => [n.id, 'inactive'])),
    activeConnections: [],
    metrics: { time: 0, cost: 0, savings: 0, model: '' },
    query: '',
    response: null,
    typingIndex: 0
  });

  const timeouts = useRef([]);

  const clear = () => { timeouts.current.forEach(t => clearTimeout(t)); timeouts.current = []; };
  const updateNode = (id, status, delay = 0) => {
    const t = setTimeout(() => setState(p => ({ ...p, nodes: { ...p.nodes, [id]: status } })), delay);
    timeouts.current.push(t);
    return delay;
  };
  const updateConn = (ids, delay = 0) => {
    const t = setTimeout(() => setState(p => ({ ...p, activeConnections: ids })), delay);
    timeouts.current.push(t);
    return delay;
  };
  const updateMetrics = (m, delay = 0) => {
    const t = setTimeout(() => setState(p => ({ ...p, metrics: { ...p.metrics, ...m } })), delay);
    timeouts.current.push(t);
    return delay;
  };

  const runSim = (queryData) => {
    clear();
    let d = 0;
    setState(p => ({ ...p, isRunning: true, response: null, typingIndex: 0, nodes: Object.fromEntries(NODES.map(n => [n.id, 'inactive'])), activeConnections: [], metrics: { time: 0, cost: 0, savings: 0, model: '' } }));

    d += updateNode('query', 'active', d); d += updateConn(['query-router'], d); d += 500;
    d += updateNode('router', 'processing', d); d += 600;
    d += updateNode('router', 'complete', d);
    d += updateMetrics({ model: queryData.model }, d);

    if (queryData.cached) {
      d += updateConn(['router-cache'], d);
      d += updateNode('cache', 'processing', d); d += 300;
      d += updateNode('cache', 'complete', d);
      d += updateConn(['cache-response'], d);
      d += updateMetrics({ time: queryData.time, cost: queryData.cost, savings: 97 }, d);
    } else if (queryData.model === 'gpt4') {
      d += updateConn(['router-gpt4'], d);
      d += updateNode('gpt4', 'processing', d); d += 1500;
      d += updateNode('gpt4', 'complete', d);
      d += updateConn(['gpt4-kpi'], d);
      d += updateNode('kpi', 'processing', d); d += 800;
      d += updateNode('kpi', 'complete', d);
      d += updateConn(['kpi-forecast'], d);
      d += updateNode('forecast', 'processing', d); d += 900;
      d += updateNode('forecast', 'complete', d);
      d += updateConn(['forecast-response'], d);
      d += updateMetrics({ time: queryData.time, cost: queryData.cost, savings: 0 }, d);
    } else {
      d += updateConn(['router-gpt35'], d);
      d += updateNode('gpt35', 'processing', d); d += 800;
      d += updateNode('gpt35', 'complete', d);
      d += updateConn(['gpt35-response'], d);
      d += updateMetrics({ time: queryData.time, cost: queryData.cost, savings: 93 }, d);
    }

    d += updateNode('response', 'complete', d);
    setTimeout(() => {
      setState(p => ({ ...p, response: queryData.result, isRunning: false }));
      typeEffect(queryData.result);
    }, d);
  };

  const typeEffect = (text) => {
    setState(p => ({ ...p, typingIndex: 0 }));
    const int = setInterval(() => {
      setState(p => {
        if (p.typingIndex >= text.length) { clearInterval(int); return p; }
        return { ...p, typingIndex: p.typingIndex + 1 };
      });
    }, 15);
  };

  useEffect(() => () => clear(), []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-gradient">Universal AI Insights Platform</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Intelligent Model Routing with 75% Cost Reduction
          </p>
        </header>

        <div className="card p-6 mb-6 fade-in">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Smart Model Routing</h2>
          <div className="relative w-full" style={{ minHeight: '300px' }}>
            <svg className="w-full h-full" viewBox="0 0 750 280" preserveAspectRatio="xMidYMid meet">
              {[
                { from: NODES[0], to: NODES[1], id: 'query-router' },
                { from: NODES[1], to: NODES[2], id: 'router-cache' },
                { from: NODES[1], to: NODES[3], id: 'router-gpt4' },
                { from: NODES[1], to: NODES[4], id: 'router-gpt35' },
                { from: NODES[2], to: NODES[7], id: 'cache-response' },
                { from: NODES[3], to: NODES[5], id: 'gpt4-kpi' },
                { from: NODES[4], to: NODES[7], id: 'gpt35-response' },
                { from: NODES[5], to: NODES[6], id: 'kpi-forecast' },
                { from: NODES[6], to: NODES[7], id: 'forecast-response' }
              ].map(c => {
                const active = state.activeConnections.includes(c.id);
                return (
                  <g key={c.id}>
                    <line x1={c.from.x + 50} y1={c.from.y + 50} x2={c.to.x + 50} y2={c.to.y + 50}
                      className={`connection-line ${active ? 'active' : ''}`} />
                    {active && <circle className="particle" cx={c.from.x + 50} cy={c.from.y + 50} r="4">
                      <animateMotion dur="2s" repeatCount="indefinite"
                        path={`M ${c.from.x + 50} ${c.from.y + 50} L ${c.to.x + 50} ${c.to.y + 50}`} />
                    </circle>}
                  </g>
                );
              })}
            </svg>
            <div className="absolute inset-0 pointer-events-none">
              {NODES.map(n => (
                <div key={n.id} className={`absolute flex flex-col items-center justify-center border-2 rounded-xl transition-all node-${state.nodes[n.id]}`}
                  style={{ left: `${(n.x / 750) * 100}%`, top: `${(n.y / 280) * 100}%`, backgroundColor: 'var(--bg-elevated)', borderColor: '#8B5CF6', minWidth: '100px', minHeight: '100px' }}>
                  <div className="text-3xl mb-2">{n.icon}</div>
                  <div className="text-xs text-center px-2 font-medium">{n.label}</div>
                  {state.nodes[n.id] === 'processing' && <div className="spinner"></div>}
                  {state.nodes[n.id] === 'complete' && <div className="absolute top-2 right-2 text-xl" style={{ color: 'var(--success)' }}>✓</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card p-6 fade-in">
            <h2 className="text-xl font-semibold mb-4">Query Selection</h2>
            <div className="space-y-2">
              <button className="btn btn-secondary w-full text-left text-sm p-3" onClick={() => runSim(QUERIES.complex)} disabled={state.isRunning}>
                <div className="font-medium mb-1">Complex Analysis → GPT-4 🧠</div>
                <div className="text-xs opacity-70">{QUERIES.complex.text}</div>
              </button>
              <button className="btn btn-secondary w-full text-left text-sm p-3" onClick={() => runSim(QUERIES.simple)} disabled={state.isRunning}>
                <div className="font-medium mb-1">Simple Query → GPT-3.5 ⚙️</div>
                <div className="text-xs opacity-70">{QUERIES.simple.text}</div>
              </button>
              <button className="btn btn-secondary w-full text-left text-sm p-3" onClick={() => runSim(QUERIES.cached)} disabled={state.isRunning}>
                <div className="font-medium mb-1">Cached Result → Instant ⚡</div>
                <div className="text-xs opacity-70">{QUERIES.cached.text}</div>
              </button>
            </div>
          </div>

          <div className="card p-6 fade-in">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="metric-card">
                <div className="metric-value">{state.metrics.time.toFixed(1)}s</div>
                <div className="metric-label">Response Time</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">${state.metrics.cost.toFixed(4)}</div>
                <div className="metric-label">Query Cost</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{state.metrics.savings}%</div>
                <div className="metric-label">Cost Savings</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">
                  {state.metrics.model === 'gpt4' && <span className="model-badge model-gpt4">GPT-4</span>}
                  {state.metrics.model === 'gpt35' && <span className="model-badge model-gpt35">GPT-3.5</span>}
                  {state.metrics.model === 'cached' && <span className="model-badge model-cached">Cached</span>}
                  {!state.metrics.model && <span className="text-sm">-</span>}
                </div>
                <div className="metric-label">Model Used</div>
              </div>
            </div>
          </div>
        </div>

        {state.response && (
          <div className="card p-6 fade-in">
            <h2 className="text-xl font-semibold mb-4">AI-Generated Insights</h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {state.response.substring(0, state.typingIndex)}
              {state.typingIndex < state.response.length && <span className="inline-block w-0.5 h-5 ml-1 animate-pulse" style={{ backgroundColor: 'var(--accent-purple)' }}></span>}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
