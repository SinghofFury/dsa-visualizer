/**
 * Graph Algorithms Implementation
 * Contains implementations of various graph algorithms with visualization steps
 */

/**
 * Helper function to create a properly formatted animation step
 * @param {Array} vertices - Highlighted vertices
 * @param {Array} edges - Highlighted edges
 * @param {String} explanation - Text explanation of the step
 * @param {String} action - Type of action for this step (e.g., 'visit', 'discover', 'process')
 * @returns {Object} Formatted animation step
 */
const createAnimationStep = (vertices, edges, explanation, action) => {
  return {
    vertices: vertices || [],
    edges: edges || [],
    explanation: explanation || '',
    action: action || ''
  };
};

/**
 * Breadth First Search (BFS) algorithm
 * @param {Object} adjacencyList - The graph represented as an adjacency list
 * @param {Number} startVertex - The vertex to start BFS from
 * @returns {Array} Array of animation steps
 */
export const breadthFirstSearch = (adjacencyList, startVertex = 0) => {
  const animationSteps = [];
  const visited = {};
  const queue = [startVertex];
  const vertices = Object.keys(adjacencyList).map(Number);
  
  // Add initial step
  animationSteps.push(
    createAnimationStep(
      [startVertex], 
      [], 
      `Starting BFS from vertex ${startVertex}`, 
      'start'
    )
  );
  
  // Mark the start vertex as visited
  visited[startVertex] = true;
  
  while (queue.length > 0) {
    const currentVertex = queue.shift();
    
    // Process current vertex
    animationSteps.push(
      createAnimationStep(
        [currentVertex], 
        [], 
        `Processing vertex ${currentVertex}`, 
        'process'
      )
    );
    
    // Process all adjacent vertices
    for (const neighbor of adjacencyList[currentVertex]) {
      const edge = [currentVertex, neighbor];
      
      if (!visited[neighbor]) {
        // Discover new vertex
        animationSteps.push(
          createAnimationStep(
            [currentVertex, neighbor], 
            [edge], 
            `Discovering vertex ${neighbor} from ${currentVertex}`, 
            'discover'
          )
        );
        
        // Mark as visited and add to queue
        visited[neighbor] = true;
        queue.push(neighbor);
        
        // Visit vertex
        animationSteps.push(
          createAnimationStep(
            [neighbor], 
            [edge], 
            `Adding vertex ${neighbor} to queue`, 
            'visit'
          )
        );
      } else {
        // Already visited
        animationSteps.push(
          createAnimationStep(
            [currentVertex, neighbor], 
            [edge], 
            `Vertex ${neighbor} already visited, skipping`, 
            'skip'
          )
        );
      }
    }
  }
  
  // Add completion step
  animationSteps.push(
    createAnimationStep(
      Object.keys(visited).map(Number), 
      [], 
      `BFS complete. Visited ${Object.keys(visited).length} vertices.`, 
      'complete'
    )
  );
  
  return animationSteps;
};

/**
 * Depth First Search (DFS) algorithm
 * @param {Object} adjacencyList - The graph represented as an adjacency list
 * @param {Number} startVertex - The vertex to start DFS from
 * @returns {Array} Array of animation steps
 */
export const depthFirstSearch = (adjacencyList, startVertex = 0) => {
  const animationSteps = [];
  const visited = {};
  
  // Add initial step
  animationSteps.push(
    createAnimationStep(
      [startVertex], 
      [], 
      `Starting DFS from vertex ${startVertex}`, 
      'start'
    )
  );
  
  // DFS recursive helper function
  const dfsHelper = (vertex, parent = null) => {
    // Mark vertex as visited
    visited[vertex] = true;
    
    // Process vertex
    animationSteps.push(
      createAnimationStep(
        [vertex], 
        parent !== null ? [[parent, vertex]] : [], 
        `Visiting vertex ${vertex}${parent !== null ? ` from ${parent}` : ''}`, 
        'visit'
      )
    );
    
    // Process all adjacent vertices
    for (const neighbor of adjacencyList[vertex]) {
      const edge = [vertex, neighbor];
      
      if (!visited[neighbor]) {
        // Discover new vertex
        animationSteps.push(
          createAnimationStep(
            [vertex, neighbor], 
            [edge], 
            `Exploring edge (${vertex}, ${neighbor})`, 
            'explore'
          )
        );
        
        // Recursive call
        dfsHelper(neighbor, vertex);
        
        // Backtrack step
        animationSteps.push(
          createAnimationStep(
            [vertex], 
            [edge], 
            `Backtracking to vertex ${vertex}`, 
            'backtrack'
          )
        );
      } else {
        // Already visited
        animationSteps.push(
          createAnimationStep(
            [vertex, neighbor], 
            [edge], 
            `Vertex ${neighbor} already visited, skipping`, 
            'skip'
          )
        );
      }
    }
  };
  
  // Start DFS
  dfsHelper(startVertex);
  
  // Add completion step
  animationSteps.push(
    createAnimationStep(
      Object.keys(visited).map(Number), 
      [], 
      `DFS complete. Visited ${Object.keys(visited).length} vertices.`, 
      'complete'
    )
  );
  
  return animationSteps;
};

/**
 * Dijkstra's Algorithm for shortest paths
 * @param {Object} adjacencyList - The graph represented as an adjacency list
 * @param {Number} startVertex - The vertex to start from
 * @param {Array} edges - Array of edges with weights
 * @returns {Array} Array of animation steps
 */
export const dijkstraAlgorithm = (adjacencyList, startVertex = 0, edges = []) => {
  const animationSteps = [];
  const vertices = Object.keys(adjacencyList).map(Number);
  
  // Create a weighted adjacency list
  const weightedAdjList = {};
  vertices.forEach(v => {
    weightedAdjList[v] = [];
  });
  
  // Add weighted edges to the adjacency list
  edges.forEach(edge => {
    const [from, to, weight] = edge;
    weightedAdjList[from].push({ vertex: to, weight });
    weightedAdjList[to].push({ vertex: from, weight }); // For undirected graph
  });
  
  // Initialize distances with infinity, except for startVertex
  const distances = {};
  const previous = {};
  const unvisited = new Set(vertices);
  
  vertices.forEach(vertex => {
    distances[vertex] = vertex === startVertex ? 0 : Infinity;
    previous[vertex] = null;
  });
  
  // Add initial step
  animationSteps.push(
    createAnimationStep(
      [startVertex], 
      [], 
      `Starting Dijkstra's algorithm from vertex ${startVertex} with distance 0`, 
      'start'
    )
  );
  
  // Main algorithm loop
  while (unvisited.size > 0) {
    // Find vertex with minimum distance
    let currentVertex = null;
    let minDistance = Infinity;
    
    unvisited.forEach(vertex => {
      if (distances[vertex] < minDistance) {
        minDistance = distances[vertex];
        currentVertex = vertex;
      }
    });
    
    // If no reachable vertex found, break
    if (currentVertex === null || distances[currentVertex] === Infinity) {
      break;
    }
    
    // Process current vertex
    animationSteps.push(
      createAnimationStep(
        [currentVertex], 
        [], 
        `Processing vertex ${currentVertex} with current distance ${distances[currentVertex]}`, 
        'process'
      )
    );
    
    // Remove from unvisited
    unvisited.delete(currentVertex);
    
    // Update distances to neighbors
    weightedAdjList[currentVertex].forEach(neighbor => {
      const { vertex: neighborVertex, weight } = neighbor;
      
      if (unvisited.has(neighborVertex)) {
        const edge = [currentVertex, neighborVertex];
        const newDistance = distances[currentVertex] + weight;
        
        // Examine edge
        animationSteps.push(
          createAnimationStep(
            [currentVertex, neighborVertex], 
            [edge], 
            `Examining edge (${currentVertex}, ${neighborVertex}) with weight ${weight}`, 
            'examine'
          )
        );
        
        // Update distance if better
        if (newDistance < distances[neighborVertex]) {
          animationSteps.push(
            createAnimationStep(
              [neighborVertex], 
              [edge], 
              `Updating distance to ${neighborVertex}: ${distances[neighborVertex]} → ${newDistance}`, 
              'update'
            )
          );
          
          distances[neighborVertex] = newDistance;
          previous[neighborVertex] = currentVertex;
        } else {
          animationSteps.push(
            createAnimationStep(
              [neighborVertex], 
              [edge], 
              `No update needed: new distance ${newDistance} ≥ current distance ${distances[neighborVertex]}`, 
              'skip'
            )
          );
        }
      }
    });
  }
  
  // Calculate shortest paths
  const shortestPaths = {};
  vertices.forEach(vertex => {
    if (vertex !== startVertex && distances[vertex] !== Infinity) {
      const path = [];
      let current = vertex;
      
      while (current !== null) {
        path.unshift(current);
        current = previous[current];
      }
      
      shortestPaths[vertex] = {
        distance: distances[vertex],
        path
      };
    }
  });
  
  // Highlight all shortest paths
  const pathEdges = [];
  Object.values(shortestPaths).forEach(({ path }) => {
    for (let i = 0; i < path.length - 1; i++) {
      pathEdges.push([path[i], path[i+1]]);
    }
  });
  
  // Add completion step
  animationSteps.push(
    createAnimationStep(
      vertices.filter(v => distances[v] !== Infinity), 
      pathEdges, 
      `Dijkstra's algorithm complete. Found shortest paths from vertex ${startVertex}.`, 
      'complete'
    )
  );
  
  return animationSteps;
};

/**
 * Kruskal's Algorithm for minimum spanning tree
 * @param {Object} adjacencyList - The graph represented as an adjacency list
 * @param {Array} edges - Array of edges with weights
 * @returns {Array} Array of animation steps
 */
export const kruskalAlgorithm = (adjacencyList, edges = []) => {
  const animationSteps = [];
  const vertices = Object.keys(adjacencyList).map(Number);
  
  // Sort edges by weight
  const sortedEdges = [...edges].sort((a, b) => a[2] - b[2]);
  
  // Initialize disjoint set for union-find
  const parent = {};
  const rank = {};
  
  vertices.forEach(vertex => {
    parent[vertex] = vertex;
    rank[vertex] = 0;
  });
  
  // Find root of a vertex
  const find = (vertex) => {
    if (parent[vertex] !== vertex) {
      parent[vertex] = find(parent[vertex]);
    }
    return parent[vertex];
  };
  
  // Union two sets
  const union = (vertex1, vertex2) => {
    const root1 = find(vertex1);
    const root2 = find(vertex2);
    
    if (root1 !== root2) {
      if (rank[root1] > rank[root2]) {
        parent[root2] = root1;
      } else {
        parent[root1] = root2;
        if (rank[root1] === rank[root2]) {
          rank[root2]++;
        }
      }
      return true;
    }
    return false;
  };
  
  // Add initial step
  animationSteps.push(
    createAnimationStep(
      vertices, 
      [], 
      `Starting Kruskal's algorithm. Sorted ${sortedEdges.length} edges by weight.`, 
      'start'
    )
  );
  
  // Result MST
  const mstEdges = [];
  let totalWeight = 0;
  
  // Process edges
  for (const edge of sortedEdges) {
    const [from, to, weight] = edge;
    
    // Examine edge
    animationSteps.push(
      createAnimationStep(
        [from, to], 
        [[from, to]], 
        `Examining edge (${from}, ${to}) with weight ${weight}`, 
        'examine'
      )
    );
    
    // Check if adding this edge creates a cycle
    if (find(from) !== find(to)) {
      // Add to MST
      animationSteps.push(
        createAnimationStep(
          [from, to], 
          [[from, to]], 
          `Adding edge (${from}, ${to}) with weight ${weight} to MST`, 
          'add'
        )
      );
      
      union(from, to);
      mstEdges.push(edge);
      totalWeight += weight;
    } else {
      // Skip edge (would create cycle)
      animationSteps.push(
        createAnimationStep(
          [from, to], 
          [[from, to]], 
          `Skipping edge (${from}, ${to}) - would create a cycle`, 
          'skip'
        )
      );
    }
  }
  
  // Highlight final MST
  const mstVertices = new Set();
  mstEdges.forEach(([from, to]) => {
    mstVertices.add(from);
    mstVertices.add(to);
  });
  
  // Add completion step
  animationSteps.push(
    createAnimationStep(
      Array.from(mstVertices), 
      mstEdges.map(([from, to]) => [from, to]), 
      `Kruskal's algorithm complete. MST weight: ${totalWeight}`, 
      'complete'
    )
  );
  
  return animationSteps;
};

/**
 * Prim's Algorithm for minimum spanning tree
 * @param {Object} adjacencyList - The graph represented as an adjacency list
 * @param {Array} edges - Array of edges with weights
 * @returns {Array} Array of animation steps
 */
export const primAlgorithm = (adjacencyList, edges = []) => {
  const animationSteps = [];
  const vertices = Object.keys(adjacencyList).map(Number);
  
  // Create weighted adjacency list
  const weightedAdjList = {};
  vertices.forEach(v => {
    weightedAdjList[v] = [];
  });
  
  // Add weighted edges
  edges.forEach(([from, to, weight]) => {
    weightedAdjList[from].push({ vertex: to, weight });
    weightedAdjList[to].push({ vertex: from, weight }); // For undirected graph
  });
  
  // Start from first vertex
  const startVertex = vertices[0];
  const visited = new Set([startVertex]);
  const mstEdges = [];
  let totalWeight = 0;
  
  // Add initial step
  animationSteps.push(
    createAnimationStep(
      [startVertex], 
      [], 
      `Starting Prim's algorithm from vertex ${startVertex}`, 
      'start'
    )
  );
  
  // Continue until all vertices are in MST
  while (visited.size < vertices.length) {
    let minEdge = null;
    let minWeight = Infinity;
    let minFrom = null;
    let minTo = null;
    
    // Find minimum weight edge from visited to unvisited
    visited.forEach(from => {
      weightedAdjList[from].forEach(({ vertex: to, weight }) => {
        if (!visited.has(to) && weight < minWeight) {
          minWeight = weight;
          minFrom = from;
          minTo = to;
        }
      });
    });
    
    // If no edge found, break (graph may be disconnected)
    if (minEdge === null && minWeight === Infinity) {
      animationSteps.push(
        createAnimationStep(
          Array.from(visited), 
          mstEdges, 
          `No more edges found. Graph may be disconnected.`, 
          'warning'
        )
      );
      break;
    }
    
    // Add edge to MST
    animationSteps.push(
      createAnimationStep(
        [minFrom, minTo], 
        [[minFrom, minTo]], 
        `Adding edge (${minFrom}, ${minTo}) with weight ${minWeight} to MST`, 
        'add'
      )
    );
    
    mstEdges.push([minFrom, minTo]);
    visited.add(minTo);
    totalWeight += minWeight;
    
    // Highlight current MST
    animationSteps.push(
      createAnimationStep(
        Array.from(visited), 
        mstEdges, 
        `Current MST weight: ${totalWeight}`, 
        'progress'
      )
    );
  }
  
  // Add completion step
  animationSteps.push(
    createAnimationStep(
      Array.from(visited), 
      mstEdges, 
      `Prim's algorithm complete. MST weight: ${totalWeight}`, 
      'complete'
    )
  );
  
  return animationSteps;
}; 