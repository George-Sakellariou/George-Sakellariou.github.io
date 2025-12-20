const { useState, useEffect, useRef } = React;

const NODES = [
  { id: 'upload', label: 'Document Upload', icon: '📄', x: 50, y: 40 },
  { id: 'ocr', label: 'OCR Processing', icon: '👁️', x: 250, y: 40 },
  { id: 'extract', label: 'Data Extraction', icon: '🔍', x: 450, y: 40 },
  { id: 'validate', label: 'Validation', icon: '✓', x: 650, y: 40 },
  { id: 'hitl', label: 'Human Review', icon: '👤', x: 800, y: 140 },
  { id: 'export', label: 'Export/ERP', icon: '📤', x: 450, y: 220 },
  { id: 'complete', label: 'Complete', icon: '✅', x: 50, y: 220 }
];

const DOCS = {
  invoice: {
    type: 'Invoice',
    icon: '🧾',
    accuracy: 0.99,
    time: 2.8,
    needsReview: false,
    data: {
      'Invoice Number': 'INV-2024-00142',
      'Date': '2024-11-15',
      'Vendor': 'Acme Corp',
      'Amount': '$12,450.00',
      'Tax': '$1,245.00',
      'Total': '$13,695.00'
    }
  },
  receipt: {
    type: 'Receipt',
    icon: '🧾',
    accuracy: 0.97,
    time: 1.9,
    needsReview: false,
    data: {
      'Receipt Number': 'RCP-789456',
      'Date': '2024-11-20',
      'Merchant': 'Office Supplies Inc',
      'Amount': '$248.50',
      'Payment Method': 'Corporate Card'
    }
  },
  contract: {
    type: 'Contract',
    icon: '📜',
    accuracy: 0.94,
    time: 4.2,
    needsReview: true,
    data: {
      'Contract Number': 'CTR-2024-Q4-089',
      'Parties': 'Company A & Company B',
      'Effective Date': '2025-01-01',
      'Term': '24 months',
      'Value': '$250,000',
      'Status': 'Pending Review'
    }
  }
};

function App() {
  const [state, setState] = useState({
    isRunning: false,
    nodes: Object.fromEntries(NODES.map(n => [n.id, 'inactive'])),
    activeConnections: [],
    metrics: { time: 0, accuracy: 0, confidence: 0 },
    docType: null,
    extractedData: null
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

  const runProcess = (docData) => {
    clear();
    let d = 0;
    setState(p => ({ ...p, isRunning: true, extractedData: null, docType: docData.type, nodes: Object.fromEntries(NODES.map(n => [n.id, 'inactive'])), activeConnections: [], metrics: { time: 0, accuracy: 0, confidence: 0 } }));

    // Upload
    d += updateNode('upload', 'active', d); d += updateConn(['upload-ocr'], d); d += 500;
    d += updateNode('upload', 'complete', d);

    // OCR
    d += updateNode('ocr', 'processing', d); d += 1200;
    d += updateNode('ocr', 'complete', d); d += updateConn(['ocr-extract'], d);
    d += updateMetrics({ time: 1.2, accuracy: 95 }, d);

    // Extract
    d += updateNode('extract', 'processing', d); d += 1000;
    d += updateNode('extract', 'complete', d); d += updateConn(['extract-validate'], d);
    d += updateMetrics({ time: 2.0, accuracy: 97 }, d);

    // Validate
    d += updateNode('validate', 'processing', d); d += 800;
    d += updateNode('validate', 'complete', d);
    d += updateMetrics({ time: docData.time, accuracy: docData.accuracy * 100, confidence: docData.accuracy }, d);

    if (docData.needsReview) {
      // Human review path
      d += updateConn(['validate-hitl'], d);
      d += updateNode('hitl', 'processing', d); d += 1500;
      d += updateNode('hitl', 'complete', d);
      d += updateConn(['hitl-export'], d);
      d += updateMetrics({ time: docData.time + 2.0 }, d);
    } else {
      // Direct export
      d += updateConn(['validate-export'], d);
    }

    // Export
    d += updateNode('export', 'processing', d); d += 600;
    d += updateNode('export', 'complete', d); d += updateConn(['export-complete'], d);

    // Complete
    d += updateNode('complete', 'complete', d);

    setTimeout(() => {
      setState(p => ({ ...p, extractedData: docData.data, isRunning: false }));
    }, d);
  };

  useEffect(() => () => clear(), []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-gradient">Intelligent Document Processing</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            AI-Powered OCR with 99%+ Accuracy
          </p>
        </header>

        <div className="card p-6 mb-6 fade-in">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Processing Pipeline</h2>
          <div className="relative w-full" style={{ minHeight: '300px' }}>
            <svg className="w-full h-full" viewBox="0 0 900 280" preserveAspectRatio="xMidYMid meet">
              {[
                { from: NODES[0], to: NODES[1], id: 'upload-ocr' },
                { from: NODES[1], to: NODES[2], id: 'ocr-extract' },
                { from: NODES[2], to: NODES[3], id: 'extract-validate' },
                { from: NODES[3], to: NODES[4], id: 'validate-hitl' },
                { from: NODES[3], to: NODES[5], id: 'validate-export' },
                { from: NODES[4], to: NODES[5], id: 'hitl-export' },
                { from: NODES[5], to: NODES[6], id: 'export-complete' }
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
                  style={{ left: `${(n.x / 900) * 100}%`, top: `${(n.y / 280) * 100}%`, backgroundColor: 'var(--bg-elevated)', borderColor: '#14B8A6', minWidth: '100px', minHeight: '100px' }}>
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
            <h2 className="text-xl font-semibold mb-4">Document Selection</h2>
            <div className="doc-preview mb-4" className={state.docType ? 'doc-preview active' : 'doc-preview'}>
              {state.docType ? (
                <div className="text-center">
                  <div className="text-6xl mb-2">{DOCS[Object.keys(DOCS).find(k => DOCS[k].type === state.docType)].icon}</div>
                  <div className="text-lg font-medium">{state.docType}</div>
                </div>
              ) : (
                <div className="text-center">Select a document type to process</div>
              )}
            </div>
            <div className="space-y-2">
              {Object.entries(DOCS).map(([key, doc]) => (
                <button key={key} className="btn btn-primary w-full text-left" onClick={() => runProcess(doc)} disabled={state.isRunning}>
                  <span className="text-2xl mr-3">{doc.icon}</span>
                  Process {doc.type} {doc.needsReview && '(Requires Review)'}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6 fade-in">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="metric-card">
                <div className="metric-value">{state.metrics.time.toFixed(1)}s</div>
                <div className="metric-label">Processing Time</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{state.metrics.accuracy.toFixed(0)}%</div>
                <div className="metric-label">Accuracy</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{(state.metrics.confidence * 100).toFixed(0)}%</div>
                <div className="metric-label">Confidence</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">
                  {state.docType ? <span style={{ fontSize: '1rem' }}>{state.docType}</span> : '-'}
                </div>
                <div className="metric-label">Document Type</div>
              </div>
            </div>
          </div>
        </div>

        {state.extractedData && (
          <div className="card p-6 fade-in">
            <h2 className="text-xl font-semibold mb-4">Extracted Data</h2>
            <div className="extracted-data">
              {Object.entries(state.extractedData).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <span style={{ color: 'var(--accent-teal)' }}>{key}:</span> <span style={{ color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <button className="btn btn-primary">Export to SAP</button>
              <button className="btn btn-primary">Download JSON</button>
              <button className="btn btn-primary">Send to Workflow</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
