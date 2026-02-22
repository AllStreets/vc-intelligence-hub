import { useEffect, useRef, memo } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

cytoscape.use(fcose);

const FounderNetworkGraph = memo(function FounderNetworkGraph({ data }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    // Deduplicate nodes - keep only unique founder IDs
    const uniqueNodeIds = new Set();
    const deduplicatedNodes = data.nodes.filter(node => {
      if (uniqueNodeIds.has(node.data.id)) {
        return false;
      }
      uniqueNodeIds.add(node.data.id);
      return true;
    });

    // Filter edges to only include edges between unique nodes
    const deduplicatedEdges = data.edges.filter(edge => {
      return uniqueNodeIds.has(edge.data.source) && uniqueNodeIds.has(edge.data.target);
    });

    // Initialize Cytoscape instance
    const cy = cytoscape({
      container: containerRef.current,
      elements: [...deduplicatedNodes, ...deduplicatedEdges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#EF4444',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '10px',
            'color': '#fff',
            'width': '40px',
            'height': '40px',
            'border-width': '2px',
            'border-color': '#991B1B'
          }
        },
        {
          selector: 'edge',
          style: {
            'line-color': '#64748B',
            'target-arrow-color': '#64748B',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'width': 'data(strength)',
            'opacity': 0.5
          }
        }
      ],
      layout: {
        name: 'fcose',
        quality: 'default',
        directed: false,
        nodeSeparation: 75,
        edgeElasticity: 0.45,
        nungsSampling: true,
        gravity: 0.05
      }
    });

    // Add click event to show founder details
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      const data = node.data();
      console.log('Clicked founder:', data);
      // Dispatch event or callback to show founder details
    });

    cyRef.current = cy;

    // Cleanup on unmount
    return () => {
      cy.destroy();
    };
  }, [data]);

  if (!data || data.nodes.length === 0) {
    return (
      <div className="w-full h-96 bg-dark-700 rounded-lg flex items-center justify-center">
        <p className="text-slate-400">No founder network data available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-96 bg-dark-700 rounded-lg border border-dark-600"
    />
  );
});

export { FounderNetworkGraph };
