import React, { useState, useEffect, useRef } from 'react';
import '../../styles/GraphVisualizer.css';
import { 
  breadthFirstSearch, 
  depthFirstSearch, 
  dijkstraAlgorithm, 
  kruskalAlgorithm, 
  primAlgorithm 
} from '../../algorithms/graph';

// Animation speed values in milliseconds
const SPEED_VALUES = {
  'very-slow': 2500,
  'slow': 1200,
  'medium': 500,
  'fast': 150
};

/**
 * GraphVisualizer Component
 * Visualizes graph algorithms with interactive animation controls
 */
const GraphVisualizer = ({ algorithm, onAlgorithmRunningChange }) => {
  // ========== STATE MANAGEMENT ==========
  // Graph structure
  const [vertices, setVertices] = useState([]);
  const [edges, setEdges] = useState([]);
  const [vertexCount, setVertexCount] = useState(6);
  const [selectedVertices, setSelectedVertices] = useState([]);
  const [edgeWeightInput, setEdgeWeightInput] = useState('1');
  const [showWeights, setShowWeights] = useState(true);
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationHistory, setAnimationHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedVertices, setHighlightedVertices] = useState([]);
  const [highlightedEdges, setHighlightedEdges] = useState([]);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [speedTier, setSpeedTier] = useState('slow'); // 'very-slow', 'slow', 'medium', 'fast'
  const [startVertex, setStartVertex] = useState(0);
  
  // UI state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [compactMode, setCompactMode] = useState(false);
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(true);
  
  // Educational content
  const [stepDetails, setStepDetails] = useState({
    step: 0,
    total: 0,
    action: '',
    vertices: [],
    edges: []
  });

  // ========== REFS ==========
  const canvasRef = useRef(null);
  const isPausedRef = useRef(false);
  const animationFrameIdRef = useRef(null);
  const lastAnimationTimeRef = useRef(0);
  const speedRef = useRef(SPEED_VALUES.slow);
  
  // ========== CONSTANTS ==========
  // Algorithm info for educational content
  const algorithmInfo = {
    'Breadth First Search': {
      description: 'Breadth First Search (BFS) explores a graph level by level, visiting all neighbors of a vertex before moving to the next level.',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      key: 'bfs'
    },
    'Depth First Search': {
      description: 'Depth First Search (DFS) explores as far as possible along each branch before backtracking.',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      key: 'dfs'
    },
    'Dijkstra\'s Algorithm': {
      description: 'Dijkstra\'s Algorithm finds the shortest path from a start vertex to all other vertices in a weighted graph.',
      timeComplexity: 'O(V² + E) or O((V+E)log V) with a priority queue',
      spaceComplexity: 'O(V)',
      key: 'dijkstra'
    },
    'Kruskal\'s Algorithm': {
      description: 'Kruskal\'s Algorithm finds a minimum spanning tree for a connected weighted graph.',
      timeComplexity: 'O(E log E) or O(E log V)',
      spaceComplexity: 'O(V + E)',
      key: 'kruskal'
    },
    'Prim\'s Algorithm': {
      description: 'Prim\'s Algorithm finds a minimum spanning tree for a connected weighted graph starting from a specific vertex.',
      timeComplexity: 'O(V² + E) or O((V+E)log V) with a priority queue',
      spaceComplexity: 'O(V)',
      key: 'prim'
    }
  };

  // ========== INITIALIZATION ==========
  // Initialize graph when component mounts or vertex count changes
  useEffect(() => {
    initializeGraph();
    
    // Also reset highlighted vertices and edges
    setHighlightedVertices([]);
    setHighlightedEdges([]);
    
    // Force a canvas redraw after initialization
    const timer = setTimeout(() => {
      updateCanvasSize();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [vertexCount]);
  
  // Add resize listener to detect screen size changes and adjust canvas
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLargeScreen(window.innerWidth >= 1024);
      updateCanvasSize();
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Call initially to set up
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update isPausedRef when isPaused changes
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  
  // Update speedRef when speedTier changes
  useEffect(() => {
    speedRef.current = SPEED_VALUES[speedTier];
  }, [speedTier]);
  
  // Properly clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);
  
  // Update parent component when animation state changes
  useEffect(() => {
    if (onAlgorithmRunningChange) {
      onAlgorithmRunningChange(isAnimating);
    }
  }, [isAnimating, onAlgorithmRunningChange]);
  
  // ========== GRAPH CONSTRUCTION ==========
  /**
   * Create adjacency list representation of the graph for algorithm use
   */
  const createAdjacencyList = (vertices, edges) => {
    const adjacencyList = {};
    
    // Initialize empty adjacency list for each vertex
    for (let i = 0; i < vertices.length; i++) {
      adjacencyList[i] = [];
    }
    
    // Add edges to the adjacency list (safely)
    if (Array.isArray(edges)) {
      edges.forEach(edge => {
        if (Array.isArray(edge) && edge.length >= 2) {
          const [source, target] = edge;
          
          // Check for valid vertices
          if (adjacencyList[source] && adjacencyList[target]) {
            // Add target to source's adjacency list
            if (!adjacencyList[source].includes(target)) {
              adjacencyList[source].push(target);
            }
            
            // Add source to target's adjacency list (for undirected graph)
            if (!adjacencyList[target].includes(source)) {
              adjacencyList[target].push(source);
            }
          }
        }
      });
    }
    
    return adjacencyList;
  };
  
  /**
   * Initialize the graph with random vertices and edges
   */
  const initializeGraph = () => {
    try {
      // Use fixed dimensions for more reliable graph initialization
      const radius = 200; // Fixed radius for circular layout
      const centerX = 400; // Fixed center X
      const centerY = 300; // Fixed center Y
      
      // Create vertices in a circular arrangement with fixed positions
      const newVertices = [];
      for (let i = 0; i < vertexCount; i++) {
        const angle = (i / vertexCount) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        newVertices.push({ x, y });
      }
      
      // Generate edges - start with a cycle to ensure connectivity
      const newEdges = [];
      const edgeSet = new Set();
      
      // Create a cycle to ensure connectedness
      for (let i = 0; i < vertexCount; i++) {
        const nextVertex = (i + 1) % vertexCount;
        const weight = Math.floor(Math.random() * 9) + 1;
        newEdges.push([i, nextVertex, weight]);
        edgeSet.add(`${i}-${nextVertex}`);
        edgeSet.add(`${nextVertex}-${i}`); // Add reverse edge for undirected graph
      }
      
      // Add some random additional edges
      const additionalEdges = Math.min(5, Math.floor(vertexCount / 2));
      let attempts = 0;
      
      while (newEdges.length < vertexCount + additionalEdges && attempts < 100) {
        attempts++;
        const source = Math.floor(Math.random() * vertexCount);
        const target = Math.floor(Math.random() * vertexCount);
        const edgeKey = `${source}-${target}`;
        
        // Skip self-loops and existing edges
        if (source !== target && !edgeSet.has(edgeKey)) {
          const weight = Math.floor(Math.random() * 9) + 1;
          newEdges.push([source, target, weight]);
          edgeSet.add(edgeKey);
          edgeSet.add(`${target}-${source}`); // Add reverse edge for undirected graph
        }
      }
      
      // Update state
      setVertices(newVertices);
      setEdges(newEdges);
      setSelectedVertices([]);
      setHighlightedVertices([]);
      setHighlightedEdges([]);
      
      // Reset visualization state
      if (isAnimating) {
        setIsAnimating(false);
        setIsPaused(false);
        isPausedRef.current = false;
        setCurrentStep(0);
        setAnimationHistory([]);
        
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
      }
      
      // Force canvas update
      setTimeout(() => {
        updateCanvasSize();
      }, 100);
    } catch (error) {
      console.error("Error initializing graph:", error);
    }
  };
  
  // ========== CANVAS RENDERING ==========
  /**
   * Update canvas size to match container
   */
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    const { width, height } = container.getBoundingClientRect();
    
    // Set canvas dimensions to match container
    canvas.width = width;
    canvas.height = height;
    
    // Redraw graph with updated canvas size
    drawGraph(vertices, edges, highlightedVertices, highlightedEdges);
  };
  
  /**
   * Draw the graph on the canvas
   */
  const drawGraph = (vertices, edges, highlightedVertices, highlightedEdges) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Add check for valid context
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Don't draw if there are no vertices or if dimensions are invalid
    if (!vertices.length || canvas.width <= 0 || canvas.height <= 0) return;
    
    try {
      // Calculate graph bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      vertices.forEach(vertex => {
        if (typeof vertex.x !== 'number' || typeof vertex.y !== 'number') return;
        minX = Math.min(minX, vertex.x);
        minY = Math.min(minY, vertex.y);
        maxX = Math.max(maxX, vertex.x);
        maxY = Math.max(maxY, vertex.y);
      });
      
      // Handle invalid bounds
      if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
        console.error("Invalid vertex coordinates");
        return;
      }
      
      // Calculate padding and scale to fit the graph in the canvas
      const padding = 50;
      const graphWidth = Math.max(1, maxX - minX) + 2 * padding;
      const graphHeight = Math.max(1, maxY - minY) + 2 * padding;
      
      // Calculate scale factor to fit graph in canvas while maintaining aspect ratio
      const scaleX = canvas.width / graphWidth;
      const scaleY = canvas.height / graphHeight;
      const scale = Math.min(scaleX, scaleY);
      
      // Calculate translation to center the graph
      const translateX = (canvas.width - (maxX + minX) * scale) / 2;
      const translateY = (canvas.height - (maxY + minY) * scale) / 2;
      
      // Helper function to convert graph coordinates to canvas coordinates
      const mapToCanvas = (x, y) => {
        return {
          x: x * scale + translateX,
          y: y * scale + translateY
        };
      };
      
      // Safely draw edges
      edges.forEach(edge => {
        if (!Array.isArray(edge) || edge.length < 2) return;
        
        const [sourceIdx, targetIdx, weight] = edge;
        const source = vertices[sourceIdx];
        const target = vertices[targetIdx];
        
        if (!source || !target) return;
        
        const isHighlighted = Array.isArray(highlightedEdges) && 
          highlightedEdges.some(e => 
            Array.isArray(e) && 
            ((e[0] === sourceIdx && e[1] === targetIdx) || 
             (e[0] === targetIdx && e[1] === sourceIdx))
          );
        
        const start = mapToCanvas(source.x, source.y);
        const end = mapToCanvas(target.x, target.y);
        
        // Draw edge line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        
        if (isHighlighted) {
          ctx.strokeStyle = '#3b82f6'; // Blue for highlighted edges
          ctx.lineWidth = 3;
        } else {
          ctx.strokeStyle = '#64748b'; // Slate for normal edges
          ctx.lineWidth = 1.5;
        }
        
        ctx.stroke();
        
        // Draw edge weight if enabled
        if (showWeights && weight !== undefined) {
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          
          // Add background for better readability
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
          ctx.beginPath();
          ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(weight.toString(), midX, midY);
        }
      });
      
      // Safely draw vertices
      vertices.forEach((vertex, index) => {
        if (typeof vertex.x !== 'number' || typeof vertex.y !== 'number') return;
        
        const isHighlighted = Array.isArray(highlightedVertices) && 
          highlightedVertices.includes(index);
        const isSelected = Array.isArray(selectedVertices) && 
          selectedVertices.includes(index);
        const isStart = index === startVertex;
        
        const pos = mapToCanvas(vertex.x, vertex.y);
        
        // Choose vertex fill color based on state
        if (isHighlighted) {
          ctx.fillStyle = '#3b82f6'; // Blue for highlighted
        } else if (isSelected) {
          ctx.fillStyle = '#ef4444'; // Red for selected
        } else if (isStart) {
          ctx.fillStyle = '#10b981'; // Green for start
        } else {
          ctx.fillStyle = '#f8fafc'; // Light gray for normal
        }
        
        // Draw the vertex circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw border
        if (isHighlighted) {
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 3;
        } else if (isSelected) {
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 3;
        } else if (isStart) {
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 3;
        } else {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
        }
        
        ctx.stroke();
        
        // Draw vertex label (index)
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Choose text color for contrast
        if (isHighlighted || isSelected || isStart) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = '#0f172a';
        }
        
        ctx.fillText(index.toString(), pos.x, pos.y);
      });
    } catch (error) {
      console.error("Error drawing graph:", error);
    }
  };
  
  // ========== USER INTERACTIONS ==========
  /**
   * Handle canvas click for vertex selection
   */
  const handleCanvasClick = (e) => {
    if (isAnimating) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate graph bounds for proper coordinate mapping
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    vertices.forEach(vertex => {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
    });
    
    // Calculate scaling and translation
    const padding = 50;
    const graphWidth = maxX - minX + 2 * padding;
    const graphHeight = maxY - minY + 2 * padding;
    const scaleX = canvas.width / graphWidth;
    const scaleY = canvas.height / graphHeight;
    const scale = Math.min(scaleX, scaleY);
    const translateX = (canvas.width - (maxX + minX) * scale) / 2;
    const translateY = (canvas.height - (maxY + minY) * scale) / 2;
    
    // Helper function to convert canvas coordinates to graph coordinates
    const mapToGraph = (canvasX, canvasY) => {
      return {
        x: (canvasX - translateX) / scale,
        y: (canvasY - translateY) / scale
      };
    };
    
    // Convert click to graph coordinates
    const clickPos = mapToGraph(x, y);
    
    // Check if a vertex was clicked (within vertex radius)
    const vertexRadius = 20 * (1 / scale); // Adjust for scaling
    let clickedVertexIndex = -1;
    
    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      const dx = vertex.x - clickPos.x;
      const dy = vertex.y - clickPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= vertexRadius) {
        clickedVertexIndex = i;
        break;
      }
    }
    
    // If a vertex was clicked
    if (clickedVertexIndex !== -1) {
      // Check for Ctrl/Cmd key to set start vertex for algorithms that need it
      if (e.ctrlKey || e.metaKey) {
        setStartVertex(clickedVertexIndex);
        drawGraph(vertices, edges, [], []); // Redraw to show new start vertex
        return;
      }
      
      // Toggle vertex selection
      const newSelectedVertices = [...selectedVertices];
      const index = newSelectedVertices.indexOf(clickedVertexIndex);
      
      if (index !== -1) {
        // Deselect if already selected
        newSelectedVertices.splice(index, 1);
      } else {
        // Select new vertex, keep at most 2 vertices selected
        if (newSelectedVertices.length >= 2) {
          newSelectedVertices.shift(); // Remove oldest selection
        }
        newSelectedVertices.push(clickedVertexIndex);
      }
      
      setSelectedVertices(newSelectedVertices);
      drawGraph(vertices, edges, [], []); // Redraw to show selection change
    }
  };
  
  /**
   * Add edge between selected vertices
   */
  const addEdge = () => {
    if (selectedVertices.length !== 2 || isAnimating) return;
    
    const [source, target] = selectedVertices;
    const weight = parseInt(edgeWeightInput) || 1;
    
    // Check if edge already exists
    const edgeExists = edges.some(edge => 
      (edge[0] === source && edge[1] === target) || 
      (edge[0] === target && edge[1] === source)
    );
    
    if (!edgeExists) {
      const newEdges = [...edges, [source, target, weight]];
      setEdges(newEdges);
      setSelectedVertices([]);
      drawGraph(vertices, newEdges, [], []);
    }
  };
  
  /**
   * Remove edge between selected vertices
   */
  const removeEdge = () => {
    if (selectedVertices.length !== 2 || isAnimating) return;
    
    const [source, target] = selectedVertices;
    
    // Find and remove the edge
    const newEdges = edges.filter(edge => 
      !((edge[0] === source && edge[1] === target) || 
        (edge[0] === target && edge[1] === source))
    );
    
    setEdges(newEdges);
    setSelectedVertices([]);
    drawGraph(vertices, newEdges, [], []);
  };
  
  /**
   * Handle speed change
   */
  const handleSpeedChange = (e) => {
    const newSpeed = e.target.value;
    setSpeedTier(newSpeed);
    speedRef.current = SPEED_VALUES[newSpeed];
  };
  
  // ========== ANIMATION CONTROL ==========
  /**
   * Run the selected algorithm
   */
  const runAlgorithm = () => {
    try {
      // Stop any ongoing animation
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      
      // Reset state
      setHighlightedVertices([]);
      setHighlightedEdges([]);
      setCurrentStep(0);
      setCurrentExplanation('');
      setStepDetails({
        step: 0,
        total: 0,
        action: '',
        vertices: [],
        edges: []
      });
      
      console.log("Running algorithm:", algorithm);
      
      if (!algorithm) {
        console.error("No algorithm selected");
        return;
      }
      
      if (!vertices.length) {
        console.error("No vertices to run algorithm on");
        return;
      }
      
      // Create adjacency list for the algorithm
      const adjacencyList = createAdjacencyList(vertices, edges);
      console.log("Adjacency list:", adjacencyList);
      
      // Get the algorithm function
      let animationSteps = [];
      
      switch (algorithm) {
        case 'Breadth First Search':
          animationSteps = breadthFirstSearch(adjacencyList, startVertex);
          break;
        case 'Depth First Search':
          animationSteps = depthFirstSearch(adjacencyList, startVertex);
          break;
        case 'Dijkstra\'s Algorithm':
          animationSteps = dijkstraAlgorithm(adjacencyList, startVertex, edges);
          break;
        case 'Kruskal\'s Algorithm':
          animationSteps = kruskalAlgorithm(adjacencyList, edges);
          break;
        case 'Prim\'s Algorithm':
          animationSteps = primAlgorithm(adjacencyList, edges);
          break;
        default:
          console.error("Unknown algorithm:", algorithm);
          return;
      }
      
      console.log("Animation steps:", animationSteps);
      
      if (!animationSteps || !animationSteps.length) {
        console.error("No animation steps returned from algorithm");
        return;
      }
      
      // Format steps to ensure consistent format
      const formattedSteps = formatAnimationSteps(animationSteps);
      console.log("Formatted steps:", formattedSteps);
      
      // Start visualization
      setIsAnimating(true);
      setIsPaused(false);
      isPausedRef.current = false;
      
      // Start animation
      startAnimation(formattedSteps);
    } catch (error) {
      console.error("Error running algorithm:", error);
      // Reset state on error
      setIsAnimating(false);
      setIsPaused(false);
      isPausedRef.current = false;
      setHighlightedVertices([]);
      setHighlightedEdges([]);
    }
  };
  
  /**
   * Start animation of algorithm steps
   */
  const startAnimation = (animations) => {
    // Validate animations
    if (!animations || !Array.isArray(animations) || !animations.length) {
      console.error("Invalid animation steps");
      return;
    }
    
    // Store the complete animation history
    setAnimationHistory(animations);
    
    // Initialize animation state
    setCurrentStep(0);
    setIsPaused(false);
    isPausedRef.current = false;
    
    // Apply first frame
    try {
      const firstFrame = animations[0];
      
      // Validate first frame
      if (!firstFrame || typeof firstFrame !== 'object') {
        console.error("Invalid first animation frame");
        return;
      }
      
      setHighlightedVertices(firstFrame.vertices || []);
      setHighlightedEdges(firstFrame.edges || []);
      setCurrentExplanation(firstFrame.explanation || '');
      
      setStepDetails({
        step: 1, // 1-indexed display
        total: animations.length,
        action: firstFrame.action || '',
        vertices: firstFrame.vertices || [],
        edges: firstFrame.edges || []
      });
      
      // Redraw with first frame
      drawGraph(vertices, edges, firstFrame.vertices || [], firstFrame.edges || []);
      
      // Start animation loop
      let currentFrameIndex = 0;
      lastAnimationTimeRef.current = 0;
      
      const animate = (timestamp) => {
        // Safety check
        if (currentFrameIndex >= animations.length) {
          setIsPaused(true);
          isPausedRef.current = true;
          return;
        }
        
        // Initialize timestamp on first frame
        if (!lastAnimationTimeRef.current) {
          lastAnimationTimeRef.current = timestamp;
          animationFrameIdRef.current = requestAnimationFrame(animate);
          return;
        }
        
        const elapsed = timestamp - lastAnimationTimeRef.current;
        
        // If paused, just keep requesting frames but don't advance
        if (isPausedRef.current) {
          animationFrameIdRef.current = requestAnimationFrame(animate);
          return;
        }
        
        // Time to advance to next frame?
        const currentSpeed = speedRef.current || SPEED_VALUES.slow;
        if (elapsed >= currentSpeed) {
          // Move to next frame
          currentFrameIndex++;
          
          // Check if animation is complete
          if (currentFrameIndex >= animations.length) {
            setCurrentStep(animations.length - 1);
            setIsPaused(true);
            isPausedRef.current = true;
            return;
          }
          
          // Set current step index
          setCurrentStep(currentFrameIndex);
          
          // Get current frame
          const frame = animations[currentFrameIndex];
          
          // Update visualization state with safety checks
          if (frame) {
            setHighlightedVertices(frame.vertices || []);
            setHighlightedEdges(frame.edges || []);
            setCurrentExplanation(frame.explanation || '');
            
            setStepDetails({
              step: currentFrameIndex + 1, // 1-indexed display
              total: animations.length,
              action: frame.action || '',
              vertices: frame.vertices || [],
              edges: frame.edges || []
            });
            
            // Draw current state
            drawGraph(vertices, edges, frame.vertices || [], frame.edges || []);
          }
          
          // Reset timer
          lastAnimationTimeRef.current = timestamp;
        }
        
        // Request next frame with safety check for max animation time
        // This prevents potential freezing if something goes wrong
        if (timestamp - lastAnimationTimeRef.current < 10000) { // 10 seconds max between frames
          animationFrameIdRef.current = requestAnimationFrame(animate);
        } else {
          console.error("Animation timed out");
          setIsPaused(true);
          isPausedRef.current = true;
        }
      };
      
      // Start animation loop
      animationFrameIdRef.current = requestAnimationFrame(animate);
    } catch (error) {
      console.error("Error starting animation:", error);
      setIsAnimating(false);
    }
  };
  
  /**
   * Toggle pause/resume animation
   */
  const togglePause = () => {
    setIsPaused(!isPaused);
    isPausedRef.current = !isPaused;
  };
  
  /**
   * Stop the animation
   */
  const stopAnimation = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    
    setIsAnimating(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setCurrentStep(0);
    setHighlightedVertices([]);
    setHighlightedEdges([]);
    setCurrentExplanation('');
    
    setStepDetails({
      step: 0,
      total: 0,
      action: '',
      vertices: [],
      edges: []
    });
    
    // Redraw graph without highlights
    drawGraph(vertices, edges, [], []);
  };
  
  /**
   * Step forward in the animation
   */
  const stepForward = () => {
    if (!animationHistory.length || currentStep >= animationHistory.length - 1) return;
    
    // Stop any ongoing animation
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    
    // Calculate the next step
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    
    // Get current animation frame
    const frame = animationHistory[nextStep];
    if (!frame) return;
    
    // Update visualization state
    setHighlightedVertices(frame.vertices || []);
    setHighlightedEdges(frame.edges || []);
    setCurrentExplanation(frame.explanation || '');
    
    // Update step details
    setStepDetails({
      step: nextStep + 1, // +1 for 1-indexed display
      total: animationHistory.length,
      action: frame.action || '',
      vertices: frame.vertices || [],
      edges: frame.edges || []
    });
    
    // Ensure graph is properly drawn
    drawGraph(vertices, edges, frame.vertices, frame.edges);
  };
  
  /**
   * Step backward in the animation
   */
  const stepBackward = () => {
    if (!animationHistory.length || currentStep <= 0) return;
    
    // Stop any ongoing animation
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    
    // Calculate previous step
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    
    // Get animation frame for the previous step
    const frame = animationHistory[prevStep];
    if (!frame) return;
    
    // Update visualization state
    setHighlightedVertices(frame.vertices || []);
    setHighlightedEdges(frame.edges || []);
    setCurrentExplanation(frame.explanation || '');
    
    // Update step details
    setStepDetails({
      step: prevStep + 1, // +1 for 1-indexed display
      total: animationHistory.length,
      action: frame.action || '',
      vertices: frame.vertices || [],
      edges: frame.edges || []
    });
    
    // Ensure graph is properly drawn
    drawGraph(vertices, edges, frame.vertices, frame.edges);
  };
  
  // ========== EDUCATIONAL CONTENT ==========
  /**
   * Get tooltip for the current action type
   */
  const getStepTooltip = (actionType) => {
    switch (actionType) {
      case 'start':
        return "The algorithm begins at the starting vertex";
      case 'process-vertex':
        return "Processing the current vertex";
      case 'visit-vertex':
        return "Visiting a vertex for the first time";
      case 'discover-vertex':
        return "Discovering a new unvisited vertex";
      case 'check-edge':
        return "Examining an edge between vertices";
      case 'select-vertex':
        return "Selecting the next vertex to process";
      case 'update-distance':
      case 'update-key':
        return "Updating the distance/key value for a vertex";
      case 'already-visited':
        return "This vertex has already been visited";
      case 'backtrack':
        return "Backtracking after exploring all paths from current vertex";
      case 'add-to-mst':
        return "Adding this vertex to the minimum spanning tree";
      case 'no-improvement':
        return "No improvement to current best path";
      case 'complete':
        return "The algorithm has completed";
      default:
        return "";
    }
  };
  
  /**
   * Render animation controls
   */
  const renderAnimationControls = () => {
    return (
      <div className="animation-controls">
        <button 
          onClick={stopAnimation}
          title="Stop"
          className="btn-secondary"
        >
          <i className="fas fa-stop"></i>
        </button>
        
        <button 
          onClick={stepBackward}
          disabled={currentStep === 0}
          title="Previous Step"
          className="btn-secondary"
        >
          <i className="fas fa-step-backward"></i>
        </button>
        
        <button 
          onClick={togglePause}
          className="btn-primary"
          title={isPaused ? "Play" : "Pause"}
        >
          <i className={`fas fa-${isPaused ? 'play' : 'pause'}`}></i>
        </button>
        
        <button 
          onClick={stepForward}
          disabled={currentStep >= animationHistory.length - 1}
          title="Next Step"
          className="btn-secondary"
        >
          <i className="fas fa-step-forward"></i>
        </button>
        
        <div className="speed-control">
          <select 
            value={speedTier}
            onChange={handleSpeedChange}
            className="speed-select"
            title="Animation Speed"
          >
            <option value="very-slow">Very Slow</option>
            <option value="slow">Slow</option>
            <option value="medium">Medium</option>
            <option value="fast">Fast</option>
          </select>
        </div>
      </div>
    );
  };
  
  /**
   * Render algorithm information
   */
  const renderAlgorithmInfo = () => {
    const info = algorithmInfo[algorithm];
    
    if (!info) {
      return <div className="algorithm-info">Select an algorithm to view information</div>;
    }
    
    return (
      <div className="algorithm-info">
        <h3>{algorithm}</h3>
        <p>{info.description}</p>
        <div className="algorithm-complexity">
          <div>
            <span className="complexity-label">Time Complexity:</span>
            <span className="complexity-value">{info.timeComplexity}</span>
          </div>
          <div>
            <span className="complexity-label">Space Complexity:</span>
            <span className="complexity-value">{info.spaceComplexity}</span>
          </div>
        </div>
      </div>
    );
  };
  
  /**
   * Render step details
   */
  const renderStepDetails = () => {
    if (!isAnimating) return null;
    
    return (
      <div className="step-details">
        <div className="step-tags">
          <div className="step-number">
            Step {stepDetails.step}/{stepDetails.total}
          </div>
          {stepDetails.action && (
            <div className="step-action">{stepDetails.action}</div>
          )}
        </div>
        <div 
          className="step-explanation"
          dangerouslySetInnerHTML={{ __html: currentExplanation }}
        />
        <div className="step-tooltip">
          {stepDetails.action && getStepTooltip(stepDetails.action)}
        </div>
      </div>
    );
  };
  
  // ========== UI HANDLERS ==========
  const toggleCompactMode = () => {
    setCompactMode(!compactMode);
    // Need to update canvas size after toggling mode
    setTimeout(updateCanvasSize, 50);
  };
  
  const toggleAlgorithmInfo = () => {
    setShowAlgorithmInfo(!showAlgorithmInfo);
  };
  
  /**
   * Render algorithm information overlay
   */
  const renderAlgorithmOverlay = () => {
    if (!isAnimating || !showAlgorithmInfo || !algorithm) return null;
    
    const info = algorithmInfo[algorithm];
    if (!info) return null;
    
    return (
      <div className="algorithm-info-panel">
        <div>
          <strong>Time:</strong> {info.timeComplexity}
        </div>
        <div>
          <strong>Space:</strong> {info.spaceComplexity}
        </div>
        <div className="step-status">
          Step {stepDetails.step}/{stepDetails.total}
        </div>
      </div>
    );
  };
  
  // ========== RENDER COMPONENT ==========
  return (
    <div className={`graph-visualizer ${compactMode ? 'compact-mode' : ''}`}>
      <div className="graph-container">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="graph-canvas"
        />
        
        {!isAnimating && (
          <div className="graph-instructions">
            <p>
              <i className="fas fa-mouse-pointer"></i> Click a vertex to select it.
              Select two vertices to add/remove an edge.
            </p>
            <p>
              <i className="fas fa-keyboard"></i> Hold Ctrl/Cmd + click to set start vertex.
            </p>
            {isMobile && (
              <p className="mobile-tip">
                <i className="fas fa-mobile-alt"></i> Scroll down to access controls
              </p>
            )}
          </div>
        )}
        
        {/* Algorithm info overlay */}
        {renderAlgorithmOverlay()}
        
        {/* Fixed animation controls that stay visible during visualization */}
        {isAnimating && (
          <div className="fixed-controls">
            <button onClick={togglePause} className="btn-primary" title={isPaused ? "Play" : "Pause"}>
              <i className={`fas fa-${isPaused ? 'play' : 'pause'}`}></i>
            </button>
            
            <button onClick={stepBackward} disabled={currentStep === 0} className="btn-secondary" title="Previous Step">
              <i className="fas fa-step-backward"></i>
            </button>
            
            <button onClick={stepForward} disabled={currentStep >= animationHistory.length - 1} className="btn-secondary" title="Next Step">
              <i className="fas fa-step-forward"></i>
            </button>
            
            <button onClick={stopAnimation} className="btn-secondary" title="Stop">
              <i className="fas fa-stop"></i>
            </button>
          </div>
        )}
        
        {/* Layout toggle button */}
        {isLargeScreen && (
          <button className="toggle-layout" onClick={toggleCompactMode} title={compactMode ? "Split View" : "Compact View"}>
            <i className={`fas fa-${compactMode ? 'columns' : 'compress'}`}></i>
          </button>
        )}
      </div>
      
      <div className="control-panel">
        {/* Algorithm information panel */}
        {renderAlgorithmInfo()}
        
        {/* Animation controls for visualization (full version in control panel) */}
        {isAnimating && renderAnimationControls()}
        
        {/* Step details during visualization */}
        {renderStepDetails()}
        
        {/* Graph manipulation controls */}
        <div className="graph-controls-container">
          <h3 className="control-section-title">Graph Controls</h3>
          <div className="graph-controls">
            <div className="vertex-controls">
              <label>Vertices:</label>
              <input 
                type="number" 
                min="3" 
                max="15"
                value={vertexCount}
                onChange={(e) => setVertexCount(parseInt(e.target.value) || 6)}
                disabled={isAnimating}
              />
              <button 
                className="btn btn-secondary" 
                onClick={initializeGraph}
                disabled={isAnimating}
              >
                Regenerate
              </button>
            </div>
            
            <div className="edge-controls">
              <label>Edge Weight:</label>
              <input 
                type="number" 
                min="1" 
                max="99"
                value={edgeWeightInput}
                onChange={(e) => setEdgeWeightInput(e.target.value)}
                disabled={isAnimating || selectedVertices.length !== 2}
              />
              <div className="edge-buttons">
                <button 
                  className="btn btn-secondary" 
                  onClick={addEdge}
                  disabled={isAnimating || selectedVertices.length !== 2}
                >
                  Add Edge
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={removeEdge}
                  disabled={isAnimating || selectedVertices.length !== 2}
                >
                  Remove
                </button>
              </div>
              <div className="show-weights">
                <input 
                  type="checkbox"
                  checked={showWeights}
                  onChange={() => setShowWeights(!showWeights)}
                  id="show-weights"
                />
                <label htmlFor="show-weights">Show Weights</label>
              </div>
            </div>
          </div>
          
          <div className="run-controls">
            <button 
              className="btn btn-primary run-algorithm-btn" 
              onClick={runAlgorithm}
              disabled={isAnimating && !isPaused}
            >
              {isAnimating ? 'Restart Algorithm' : 'Run Algorithm'}
            </button>
            
            {algorithm === 'Dijkstra\'s Algorithm' && (
              <div className="start-vertex-selector">
                <label>Start Vertex: </label>
                <select
                  value={startVertex}
                  onChange={(e) => setStartVertex(parseInt(e.target.value))}
                  disabled={isAnimating}
                >
                  {vertices.map((_, index) => (
                    <option key={index} value={index}>Vertex {index}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Format animation steps to a consistent structure
 * This ensures compatibility between different algorithm outputs
 */
const formatAnimationSteps = (steps) => {
  return steps.map(step => {
    // Check if the step is already in the correct format
    if (step.vertices !== undefined && step.edges !== undefined) {
      return step;
    }
    
    // Otherwise, assume it's in the legacy array format [vertices, edges, explanation, action]
    const [vertices, edges, explanation, action] = step;
    
    return {
      vertices: vertices || [],
      edges: edges || [],
      explanation: explanation || '',
      action: action || ''
    };
  });
};

export default GraphVisualizer; 