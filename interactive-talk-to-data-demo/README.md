# Talk-to-Data Platform - Interactive Demo

An interactive visualization of an enterprise multi-agent AI orchestration system that transforms natural language into SQL with autonomous self-healing and validation.

## Features

- **Multi-Agent Orchestration**: Watch 9 specialized AI agents collaborate in real-time
- **Natural Language to SQL**: See queries transform from plain English to executable SQL
- **Self-Healing Queries**: Observe automatic error detection and correction
- **Autonomous Validation**: Real-time SQL validation with instant feedback
- **Interactive Flow**: Animated agent collaboration with particle effects
- **Dual Simulation Modes**: Success path vs. self-healing path
- **Real-time Metrics**: Track query time, accuracy, agents involved, and SQL generation

## System Architecture

The demo visualizes these 9 AI agents:

1. **User Query** - Natural language input
2. **Planner Agent** - Analyzes intent and decomposes complex questions
3. **Schema Agent** - Maps NL concepts to database schema
4. **SQL Generator** - Converts intent into executable SQL
5. **Validator** - Validates SQL syntax and semantics
6. **Self-Healing** - Detects and fixes SQL errors automatically
7. **Executor** - Runs validated queries against database
8. **Visualizer** - Auto-generates appropriate charts
9. **Response** - Delivers results with visualizations

## Quick Start

### Option 1: Open Directly in Browser

```bash
open index.html
```

### Option 2: Serve with Local Server

```bash
# Using Python 3
python3 -m http.server 8000

# Then navigate to http://localhost:8000
```

## Usage

### Running Simulations

1. **Example Queries**: Click preset query buttons for instant demos
2. **Custom Input**: Type your own natural language question
3. **Execute**: Click "Execute Query" to watch agent orchestration

### Simulation Modes

#### Success Path (Fast)
Direct path when SQL is correct on first generation:
```
Query → Planner → Schema → SQL Gen → Validator (✓) → Executor → Visualizer → Response
```
**Time**: ~3.5s | **Accuracy**: 97-98%

#### Self-Healing Path (Autonomous Recovery)
When SQL needs correction, self-healing agent intervenes:
```
Query → Planner → Schema → SQL Gen → Validator (✗) → Self-Healing →
SQL Gen (fixed) → Validator (✓) → Executor → Visualizer → Response
```
**Time**: ~6.0s | **Accuracy**: 95%+ after healing

### Sample Queries

**1. Revenue Analysis (Success Path)**
```
"What is the total revenue by product category this quarter?"
```
- Generates clean SQL immediately
- Fast execution
- Bar chart visualization

**2. Employee Performance (Self-Healing)**
```
"Show me top 5 employees by sales performance"
```
- Initial SQL has column error
- Self-healing detects and fixes
- Demonstrates autonomous recovery
- Table visualization

**3. Trends Analysis (Success Path)**
```
"What are the monthly sales trends for the past year?"
```
- Complex date aggregation
- Clean execution
- Line chart visualization

### Understanding the Visualization

#### Agent States

- **Inactive** (gray, low opacity): Agent not involved
- **Active** (pulsing blue): Agent receiving/processing data
- **Processing** (spinner): Agent actively working
- **Complete** (checkmark): Agent finished successfully
- **Error** (exclamation): Agent detected issue (triggers self-healing)

#### Data Flow

- **Blue animated particles**: Data flowing between agents
- **Orange dashed lines**: Self-healing collaboration (when error occurs)
- **Connection lines**: Light up when data flows through
- **Agent messages**: Status updates below each agent

### Metrics Panel

Real-time tracking:
- **Query Time**: End-to-end processing duration
- **Accuracy**: Query correctness percentage
- **Agents Involved**: Number of agents activated
- **SQL Generated**: Number of SQL queries created (1 = success, 2 = self-healed)

### SQL Display

- **Live SQL**: See generated queries in real-time
- **Error Detection**: Red alerts when validation fails
- **Self-Healing**: Watch SQL automatically corrected
- **Syntax Highlighting**: SQL displayed with proper formatting

## Technical Details

### Technologies

- **React 18** (via CDN)
- **Tailwind CSS** (via CDN)
- **Babel Standalone** (JSX transpilation)
- **Pure CSS animations**

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Key Concepts Demonstrated

### 1. Multi-Agent Collaboration

Each agent has specialized knowledge:
- **Planner**: Intent recognition & task decomposition
- **Schema**: Business glossary & metadata mapping
- **SQL Generator**: Query construction with joins/aggregations
- **Validator**: Syntax & semantic checking
- **Self-Healing**: Error analysis & correction

### 2. Self-Healing Architecture

When errors occur:
```
1. Validator detects issue
2. Self-Healing agent analyzes error
3. Identifies root cause (missing table, wrong column, etc.)
4. Generates corrected SQL
5. Sends back to SQL Generator
6. Validator re-checks (success)
7. Execution proceeds
```

### 3. Autonomous Validation

Pre-execution checks:
- SQL syntax validation
- Schema compatibility
- Join relationship verification
- Performance prediction
- Data quality checks

## Customization

### Adding Custom Queries

Edit `SAMPLE_QUERIES` in `app.jsx`:

```javascript
const SAMPLE_QUERIES = {
  "your-query-key": {
    nlQuery: "Your natural language question",
    sqlInitial: "SELECT ...",
    sqlError: null, // or "Error message" for healing mode
    sqlHealed: "SELECT ... (fixed)", // if healing mode
    result: "Your result description",
    chartType: "bar|line|table",
    accuracy: 0.95,
    mode: "success|healing"
  }
};
```

### Adjusting Animation Speed

Modify timing in simulation functions:

```javascript
currentDelay += 800; // Change milliseconds
```

### Changing Colors

Update CSS variables in `styles.css`:

```css
:root {
  --accent-blue: #0078D4; /* Change to your brand */
}
```

### Agent Positions

Edit `AGENTS` array in `app.jsx`:

```javascript
{ id: 'planner', label: 'Planner Agent', icon: '🧠',
  color: '#8B5CF6', x: 250, y: 30 }
```

## Architecture Highlights

### Why Multi-Agent?

1. **Specialization**: Each agent expert in specific task
2. **Resilience**: If one fails, others can adapt
3. **Scalability**: Easy to add new agents for new capabilities
4. **Autonomy**: Agents make decisions independently
5. **Learning**: Each agent improves from experience

### Production Benefits

- **95% Accuracy**: On complex business questions
- **Self-Healing**: Automatic error recovery without human intervention
- **Enterprise Governance**: Complete audit trail and access control
- **Multi-Source**: Works with SQL, NoSQL, and unstructured data
- **Real-time**: Low-latency responses even on complex queries

## Real-World Applications

- Executive dashboards (natural language)
- Ad-hoc business intelligence
- Data exploration without SQL knowledge
- Cross-department data access
- Automated reporting
- Conversational analytics

## Performance Tips

1. Click **preset queries** for consistent demos
2. Watch **error messages** during self-healing
3. Compare **metrics** between success vs. healing paths
4. Observe **SQL changes** when healing occurs

## Troubleshooting

### Animations Not Working
- Use modern browser
- Check browser console
- Verify CDN resources loaded

### SQL Not Displaying
- Click a preset query first
- Wait for "SQL Generator" to complete
- Check if simulation is running

### Agents Stuck
- Refresh page to reset
- Click "Execute Query" again
- Check browser console for errors

## Credits

Built with:
- React (Meta)
- Tailwind CSS (Tailwind Labs)
- Unicode emoji icons

Architecture powered by:
- Azure OpenAI (GPT-4/GPT-4o)
- SQL Server 2025 (AI-enhanced)
- AutoGen (Microsoft multi-agent framework)
- Azure Purview (Data governance)

## License

Part of portfolio project. Free to use for learning and portfolio purposes.

## Next Steps

Potential enhancements:
- [ ] Add database schema viewer
- [ ] Show actual query results in table
- [ ] Add query history
- [ ] Implement chart rendering (not just preview)
- [ ] Add A/B testing between agent configurations
- [ ] Show token usage breakdown
- [ ] Add voice input for queries

---

**Live Demo**: Open `index.html` to see multi-agent orchestration in action!

**Author**: George Sakellariou
**Version**: 1.0.0
**Last Updated**: 2025-12-20
