# Enterprise RAG System - Interactive Demo

An interactive visualization of a production-grade Retrieval-Augmented Generation (RAG) system with animated data flow, real-time metrics, and cost tracking.

## Features

- **Interactive Architecture Visualization**: Watch data flow through an 8-node RAG pipeline
- **Dual Simulation Modes**: Compare cache hit vs. cache miss performance
- **Animated Data Flow**: Particle animations showing data movement between components
- **Real-time Metrics**: Track latency, cost, token usage, and cache hit rates
- **Cost Analysis**: Detailed breakdown of per-component costs
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Zero Build Tools**: Pure HTML + CSS + React via CDN

## System Architecture

The demo visualizes these components:

1. **User Query** - Natural language input
2. **Semantic Cache** - Redis-based query caching with vector similarity
3. **Embedding Model** - Converts queries to 1536-dimensional vectors
4. **Hybrid Search** - Vector + BM25 search across 50,000 document chunks
5. **Re-ranking** - Cross-encoder model for relevance scoring
6. **Context Assembly** - Intelligent chunk aggregation
7. **LLM Generation** - GPT-4/GPT-4o response generation
8. **Response** - Final answer with source citations

## Quick Start

### Option 1: Open Directly in Browser

Simply open `index.html` in any modern web browser. No installation or build process required.

```bash
# Navigate to the directory
cd interactive-rag-demo

# Open in browser (macOS)
open index.html

# Open in browser (Linux)
xdg-open index.html

# Open in browser (Windows)
start index.html
```

### Option 2: Serve with Local Server

For the best experience, serve via a local HTTP server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (npx)
npx serve

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## Usage

### Running Simulations

1. **Using Preset Queries**: Click any of the preset query buttons to instantly run a simulation
2. **Custom Queries**: Type your own question and click "Run Query"
3. **Cache Hit Demo**: Click the "Cached" preset to see the optimized cache hit flow
4. **Mode Toggle**: Switch between "Cache Miss" and "Cache Hit" modes

### Understanding the Visualization

#### Node States

- **Inactive** (gray, low opacity): Node not involved in current query
- **Active** (pulsing green): Node currently receiving data
- **Processing** (spinner): Node actively processing
- **Complete** (checkmark): Node finished processing

#### Data Flow

- **Green animated particles**: Data flowing between active nodes
- **Connection lines**: Light up when data flows through them
- **Node messages**: Appear below nodes showing current status

### Simulation Modes

#### Cache Miss Flow (2.34s, $0.0034)

Full pipeline execution when query is not cached:
```
Query → Cache (miss) → Embedding → Search → Re-rank → Context → LLM → Response
```

#### Cache Hit Flow (0.12s, $0.0001)

Optimized path when similar query found in cache:
```
Query → Cache (hit) → Response
```

**Performance Improvement**: 95% faster, 97% cheaper

### Controls

- **Animation Speed**: Adjust simulation speed (0.5x, 1x, 2x)
- **Simulation Mode**: Choose between cache hit or miss
- **Preset Queries**: Quick examples for common scenarios

### Metrics Panel

Real-time tracking of:
- **Latency**: End-to-end query processing time
- **Cost**: Total API/service costs in USD
- **Cache Hit Rate**: Percentage of queries served from cache
- **Tokens Used**: Number of tokens processed by LLM
- **Documents Searched**: Chunks scanned during retrieval
- **Chunks Retrieved**: Initial results from search
- **Chunks Used**: Final context sent to LLM

### Cost Breakdown

Click "Show Cost Breakdown" to see per-component costs:

**Cache Miss Costs**:
- Cache Lookup: $0.0000
- Embedding Generation: $0.0001
- Vector Search: $0.0002
- Re-ranking: $0.0003
- LLM Input Tokens: $0.0018
- LLM Output Tokens: $0.0010
- **Total: $0.0034**

**Cache Hit Costs**:
- Cache Lookup: $0.0001
- **Total: $0.0001** (97% savings!)

### Node Details (Tooltips)

Hover over any architecture node to see:
- Component title and Azure service used
- Technical description
- Key specifications (model, latency, capacity)

## File Structure

```
interactive-rag-demo/
├── index.html          # Main HTML with CDN imports
├── styles.css          # All animations and responsive styles
├── app.jsx             # React components and simulation logic
└── README.md           # This file
```

## Technical Details

### Technologies Used

- **React 18** (via CDN)
- **Tailwind CSS** (via CDN)
- **Babel Standalone** (for JSX transpilation)
- **Pure CSS animations** (no animation libraries)

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance

- 60fps smooth animations
- No build process required
- Minimal dependencies
- Optimized for low latency

## Customization

### Adding Custom Queries

Edit the `SAMPLE_RESPONSES` object in `app.jsx`:

```javascript
const SAMPLE_RESPONSES = {
  "your-query-key": {
    answer: "Your custom answer here...",
    sources: [
      { name: "document.pdf", page: 1, relevance: 0.95 }
    ],
    confidence: 0.92
  }
};
```

### Adjusting Animation Timing

Modify delays in the simulation functions:

```javascript
// In runCacheMissSimulation() or runCacheHitSimulation()
currentDelay += 500;  // Adjust this value (in milliseconds)
```

### Changing Colors

Update the CSS variables in `styles.css`:

```css
:root {
  --accent-green: #10B981;  /* Change to your brand color */
  --bg-primary: #0a0a0a;     /* Background color */
}
```

### Modifying Node Positions

Edit the `NODES` array in `app.jsx`:

```javascript
{ id: 'user-query', label: 'User Query', icon: '💬', color: '#6B7280', x: 50, y: 50 }
//                                                                      ^    ^
//                                                                      |    |
//                                                          Change X and Y coordinates
```

## Embedding in Portfolio

### As Standalone Page

Simply link to `index.html` from your portfolio:

```html
<a href="/interactive-rag-demo/index.html">View RAG Demo</a>
```

### As Embedded Component

Include in an existing React app:

```jsx
// Copy the App component from app.jsx
import { App } from './interactive-rag-demo/app.jsx';

// Use in your portfolio
<App />
```

### As iFrame

Embed in any webpage:

```html
<iframe
  src="/interactive-rag-demo/index.html"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>
```

## Architecture Highlights

### Why This Design?

1. **Semantic Cache**: Reduces cost by 97% for similar queries
2. **Hybrid Search**: Combines vector similarity with keyword matching
3. **Re-ranking**: Cross-encoder ensures highest quality results
4. **Context Assembly**: Optimizes token usage while maintaining quality
5. **Streaming Response**: Better user experience with immediate feedback

### Real-World Applications

- Enterprise knowledge bases
- Customer support automation
- Technical documentation search
- HR policy Q&A systems
- Code repository search
- Legal document analysis

### Production Considerations

This demo shows the architecture used in production RAG systems:

- **Caching Strategy**: 24-hour TTL with 0.95 similarity threshold
- **Search Optimization**: Two-stage retrieval (broad → precise)
- **Cost Management**: Cache hits save 97% per query
- **Scalability**: Azure AI Search handles 50K+ document chunks
- **Quality**: Re-ranking ensures best results reach the LLM

## Troubleshooting

### Animations Not Working

- Ensure you're using a modern browser
- Check browser console for JavaScript errors
- Verify all CDN resources loaded successfully

### Tooltip Not Showing

- Hover directly over the node (not near it)
- Check if JavaScript is enabled
- Try refreshing the page

### Simulation Stuck

- Click "Run Query" again to restart
- Check browser console for errors
- Refresh the page to reset state

### Mobile Display Issues

- Rotate device to landscape for better view
- Nodes may be smaller on mobile (expected)
- Some tooltips may be repositioned for mobile

## Performance Tips

1. Use **2x speed** for quicker demonstrations
2. Use **preset queries** for consistent results
3. Run **cache hit** mode to show optimization benefits
4. Click **cost breakdown** to emphasize savings

## Credits

Built with:
- React (Meta)
- Tailwind CSS (Tailwind Labs)
- Icons from Unicode emoji set

Architecture based on production RAG systems using:
- Azure OpenAI
- Azure AI Search
- Azure Cache for Redis

## License

This demo is part of a portfolio project. Feel free to use and modify for your own portfolio or learning purposes.

## Support

For questions or issues:
1. Check the browser console for errors
2. Verify all files are in the same directory
3. Ensure you're using a modern browser
4. Try opening in an incognito/private window

## Next Steps

Potential enhancements:
- [ ] Add multi-modal document support (images, PDFs)
- [ ] Implement A/B testing visualization
- [ ] Add real API integration option
- [ ] Show confidence score calculation
- [ ] Add query history and comparison
- [ ] Implement dark/light theme toggle
- [ ] Add export functionality for metrics

---

**Live Demo**: Open `index.html` in your browser to see it in action!

**Author**: Your Name
**Version**: 1.0.0
**Last Updated**: 2025-12-20
