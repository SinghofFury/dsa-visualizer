import React, { useState, useEffect, useRef } from 'react';
import '../../styles/AlgorithmRaceVisualizer.css';

// Try importing searching algorithms
let linearSearch, binarySearch, jumpSearch, interpolationSearch, exponentialSearch;
try {
  const searchingAlgorithms = require('../../algorithms/searching');
  linearSearch = searchingAlgorithms.linearSearch;
  binarySearch = searchingAlgorithms.binarySearch;
  jumpSearch = searchingAlgorithms.jumpSearch;
  interpolationSearch = searchingAlgorithms.interpolationSearch;
  exponentialSearch = searchingAlgorithms.exponentialSearch;
} catch (error) {
  console.error('Error importing searching algorithms:', error);
  // Create dummy algorithms
  const createDummySearchAlgorithm = (name) => (arr, target) => {
    console.warn(`Using dummy implementation for ${name}`);
    const animations = [];
    for (let i = 0; i < 10; i++) {
      animations.push([[], `Step ${i+1} of ${name}`, 'step', {}]);
    }
    return animations;
  };
  
  linearSearch = createDummySearchAlgorithm('Linear Search');
  binarySearch = createDummySearchAlgorithm('Binary Search');
  jumpSearch = createDummySearchAlgorithm('Jump Search');
  interpolationSearch = createDummySearchAlgorithm('Interpolation Search');
  exponentialSearch = createDummySearchAlgorithm('Exponential Search');
}

// Try importing sorting algorithms
let bubbleSort, selectionSort, insertionSort, mergeSort, quickSort;
try {
  const sortingAlgorithms = require('../../algorithms/sorting');
  bubbleSort = sortingAlgorithms.bubbleSort;
  selectionSort = sortingAlgorithms.selectionSort;
  insertionSort = sortingAlgorithms.insertionSort;
  mergeSort = sortingAlgorithms.mergeSort;
  quickSort = sortingAlgorithms.quickSort;
} catch (error) {
  console.error('Error importing sorting algorithms:', error);
  // Create dummy algorithms
  const createDummySortAlgorithm = (name) => (arr) => {
    console.warn(`Using dummy implementation for ${name}`);
    const animations = [];
    for (let i = 0; i < 10; i++) {
      animations.push([[...arr], [], [], 'step', {}]);
    }
    return animations;
  };
  
  bubbleSort = createDummySortAlgorithm('Bubble Sort');
  selectionSort = createDummySortAlgorithm('Selection Sort');
  insertionSort = createDummySortAlgorithm('Insertion Sort');
  mergeSort = createDummySortAlgorithm('Merge Sort');
  quickSort = createDummySortAlgorithm('Quick Sort');
}

// Try importing graph algorithms
let breadthFirstSearch, depthFirstSearch, dijkstraAlgorithm, kruskalAlgorithm, primAlgorithm;
try {
  const graphAlgorithms = require('../../algorithms/graph');
  breadthFirstSearch = graphAlgorithms.breadthFirstSearch;
  depthFirstSearch = graphAlgorithms.depthFirstSearch;
  dijkstraAlgorithm = graphAlgorithms.dijkstraAlgorithm;
  kruskalAlgorithm = graphAlgorithms.kruskalAlgorithm;
  primAlgorithm = graphAlgorithms.primAlgorithm;
} catch (error) {
  console.error('Error importing graph algorithms:', error);
  // Create dummy algorithms
  const createDummyGraphAlgorithm = (name) => () => {
    console.warn(`Using dummy implementation for ${name}`);
    const animations = [];
    for (let i = 0; i < 10; i++) {
      animations.push([[], `Step ${i+1} of ${name}`, 'step', {}]);
    }
    return animations;
  };
  
  breadthFirstSearch = createDummyGraphAlgorithm('Breadth First Search');
  depthFirstSearch = createDummyGraphAlgorithm('Depth First Search');
  dijkstraAlgorithm = createDummyGraphAlgorithm('Dijkstra\'s Algorithm');
  kruskalAlgorithm = createDummyGraphAlgorithm('Kruskal\'s Algorithm');
  primAlgorithm = createDummyGraphAlgorithm('Prim\'s Algorithm');
}

// High-precision timing function
const now = () => {
  return typeof window !== 'undefined' && window.performance ? 
    window.performance.now() : 
    Date.now();
};

// Centralized function to get sorted results - eliminates duplication
const getSortedRaceResults = (algorithms, timings) => {
  if (!algorithms || !algorithms.length || !timings) return [];
  
  // Sort results by execution time (lowest first = fastest)
  return [...algorithms].sort((a, b) => {
    const timeA = timings[a] || Number.MAX_SAFE_INTEGER;
    const timeB = timings[b] || Number.MAX_SAFE_INTEGER;
    return timeA - timeB;
  });
};

// Get rank of an algorithm in the race
const getAlgorithmRank = (algorithm, timings, algorithms) => {
  if (!algorithm || !timings || !algorithms || !algorithms.length) return -1;
  
  const sortedResults = getSortedRaceResults(algorithms, timings);
  return sortedResults.indexOf(algorithm) + 1;
};

// Check if algorithm is the winner
const isWinningAlgorithm = (algorithm, timings, algorithms, completedList) => {
  if (!algorithm || !timings || !algorithms || !algorithms.length || !completedList.length) return false;
  if (!completedList.includes(algorithm)) return false;
  
  // Get the fastest time among completed algorithms
  const fastestTime = Math.min(...completedList.map(algo => timings[algo] || Number.MAX_SAFE_INTEGER));
  
  // Only return true if this algorithm has the fastest time AND is the first one with this time
  // This ensures only one algorithm is marked as winner even if there's a tie
  return timings[algorithm] === fastestTime && 
         completedList.indexOf(algorithm) === completedList.findIndex(algo => timings[algo] === fastestTime);
};

// Race state management
const RaceState = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed'
};

// Centralized race result management
class RaceManager {
  constructor() {
    this.startTime = 0;
    this.algorithms = [];
    this.progress = {};
    this.completionTimes = {};
    this.steps = {};
    this.winner = null;
    this.rankings = [];
    this.state = RaceState.IDLE;
  }

  start(algorithms) {
    this.startTime = performance.now();
    this.algorithms = algorithms;
    this.progress = {};
    this.completionTimes = {};
    this.steps = {};
    this.winner = null;
    this.rankings = [];
    this.state = RaceState.RUNNING;
    
    algorithms.forEach(algo => {
      this.progress[algo] = 0;
      this.steps[algo] = 0;
    });
  }

  updateProgress(algorithm, currentStep, totalSteps) {
    if (this.state !== RaceState.RUNNING) return;
    
    this.steps[algorithm] = totalSteps;
    this.progress[algorithm] = Math.min(100, (currentStep / totalSteps) * 100);
    
    if (currentStep >= totalSteps && !this.completionTimes[algorithm]) {
      this.markCompleted(algorithm);
    }
  }

  markCompleted(algorithm) {
    const completionTime = performance.now() - this.startTime;
    this.completionTimes[algorithm] = completionTime;
    this.progress[algorithm] = 100;
    
    // Update rankings
    this.rankings = Object.entries(this.completionTimes)
      .sort(([, timeA], [, timeB]) => timeA - timeB)
      .map(([algo]) => algo);
    
    // First completed algorithm is the winner
    if (!this.winner) {
      this.winner = algorithm;
    }

    // Check if race is complete
    if (Object.keys(this.completionTimes).length === this.algorithms.length) {
      this.state = RaceState.COMPLETED;
    }
  }

  getRank(algorithm) {
    return this.rankings.indexOf(algorithm) + 1;
  }

  isWinner(algorithm) {
    return algorithm === this.winner;
  }

  isCompleted(algorithm) {
    return this.completionTimes.hasOwnProperty(algorithm);
  }

  getCompletionTime(algorithm) {
    return this.completionTimes[algorithm];
  }

  reset() {
    this.startTime = 0;
    this.algorithms = [];
    this.progress = {};
    this.completionTimes = {};
    this.steps = {};
    this.winner = null;
    this.rankings = [];
    this.state = RaceState.IDLE;
  }
}

// Create a single instance of RaceManager
const raceManager = new RaceManager();

const AlgorithmRaceVisualizer = ({ category, onAlgorithmRunningChange }) => {
  // State for algorithm selection
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);
  const [availableAlgorithms, setAvailableAlgorithms] = useState([]);
  
  // State for race configuration
  const [arraySize, setArraySize] = useState(50);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [isRacing, setIsRacing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [raceResults, setRaceResults] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [customInputError, setCustomInputError] = useState('');
  const [showCustomInputModal, setShowCustomInputModal] = useState(false);
  
  // State for data visualization
  const [array, setArray] = useState([]);
  const [targetValue, setTargetValue] = useState(null);
  const [algorithmProgress, setAlgorithmProgress] = useState({});
  const [algorithmSteps, setAlgorithmSteps] = useState({});
  const [algorithmAnimations, setAlgorithmAnimations] = useState({});
  const [currentStepIndices, setCurrentStepIndices] = useState({});
  const [completedAlgorithms, setCompletedAlgorithms] = useState([]);
  const [algorithmStates, setAlgorithmStates] = useState({});
  const [algorithmTimings, setAlgorithmTimings] = useState({});
  const [raceStartTime, setRaceStartTime] = useState(null);
  
  // Refs for animation control
  const animationTimeoutRef = useRef(null);
  const isPausedRef = useRef(false);
  const customInputRef = useRef(null);
  const raceCanvasRef = useRef(null);
  const algorithmRefs = useRef({});

  // UI state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [compactMode, setCompactMode] = useState(false);
  const [showDataVisualization, setShowDataVisualization] = useState(true);

  // Set available algorithms based on category
  useEffect(() => {
    let algorithms = [];
    
    switch(category) {
      case 'Searching':
        algorithms = ['Linear Search', 'Binary Search', 'Jump Search', 'Exponential Search', 'Interpolation Search'];
        break;
      case 'Sorting':
        algorithms = ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort'];
        break;
      case 'Graph':
        algorithms = ['Breadth First Search', 'Depth First Search', 'Dijkstra\'s Algorithm', 'Kruskal\'s Algorithm', 'Prim\'s Algorithm'];
        break;
      default:
        algorithms = [];
    }
    
    setAvailableAlgorithms(algorithms);
    
    // Reset selected algorithms when category changes
    setSelectedAlgorithms([]);
    setRaceResults([]);
    setAlgorithmProgress({});
    setAlgorithmSteps({});
    setAlgorithmAnimations({});
    setCurrentStepIndices({});
    setCompletedAlgorithms([]);
    setAlgorithmStates({});
    setAlgorithmTimings({});
    
    // Generate new data when category changes
    generateData();
  }, [category]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Notify parent component when race starts/stops
  useEffect(() => {
    onAlgorithmRunningChange(isRacing);
  }, [isRacing, onAlgorithmRunningChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Draw algorithm visualization on canvas
  useEffect(() => {
    if (raceCanvasRef.current && showDataVisualization && category === 'Sorting') {
      const canvas = raceCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw algorithm states
      Object.keys(algorithmStates).forEach((algo, algoIndex) => {
        const state = algorithmStates[algo];
        if (!state || !Array.isArray(state) || state.length === 0) return;
        
        try {
          const barWidth = canvas.width / (state.length * Math.max(1, Object.keys(algorithmStates).length));
          const maxVal = Math.max(...state.filter(val => typeof val === 'number'));
          
          if (isNaN(maxVal) || maxVal <= 0) return;
          
          state.forEach((val, i) => {
            if (typeof val !== 'number') return;
            
            const x = (i + algoIndex * state.length) * barWidth;
            const height = (val / maxVal) * (canvas.height - 30);
            
            // Draw bar
            ctx.fillStyle = completedAlgorithms.includes(algo) 
              ? 'rgba(76, 175, 80, 0.7)' 
              : `hsl(${360 * algoIndex / Math.max(1, Object.keys(algorithmStates).length)}, 70%, 60%)`;
            
            ctx.fillRect(x, canvas.height - height, Math.max(1, barWidth - 1), height);
            
            // Draw algorithm label
            if (i === 0) {
              ctx.fillStyle = '#fff';
              ctx.font = '12px Arial';
              ctx.fillText(algo, x, 15);
            }
          });
        } catch (error) {
          console.error('Error drawing visualization:', error);
        }
      });
    }
  }, [algorithmStates, isRacing, showDataVisualization, category, completedAlgorithms]);

  // Generate data based on the selected category
  const generateData = () => {
    if (category === 'Searching') {
      // Generate sorted array for searching algorithms
      const newArray = Array.from({ length: arraySize }, (_, i) => 
        Math.floor(Math.random() * 100) + 1
      ).sort((a, b) => a - b);
      
      // Generate random target value from the array
      const randomIndex = Math.floor(Math.random() * arraySize);
      const newTarget = newArray[randomIndex];
      
      setArray(newArray);
      setTargetValue(newTarget);
    } else if (category === 'Sorting') {
      // Generate unsorted array for sorting algorithms
      const newArray = Array.from({ length: arraySize }, (_, i) => 
        Math.floor(Math.random() * 100) + 1
      );
      
      setArray(newArray);
    } else if (category === 'Graph') {
      // For graph algorithms, we'll use a simplified approach for the race
      // In a real implementation, you'd generate a graph structure
      setArray([]);
    }
  };

  // Toggle algorithm selection
  const toggleAlgorithmSelection = (algorithm) => {
    if (selectedAlgorithms.includes(algorithm)) {
      setSelectedAlgorithms(selectedAlgorithms.filter(algo => algo !== algorithm));
    } else {
      setSelectedAlgorithms([...selectedAlgorithms, algorithm]);
    }
  };

  // Start the race
  const startRace = () => {
    if (selectedAlgorithms.length < 2) {
      alert('Please select at least 2 algorithms to compare');
      return;
    }

    setIsRacing(true);
    isPausedRef.current = false;
    setIsPaused(false);
    
    // Initialize race manager
    raceManager.start(selectedAlgorithms);
    
    // Reset all race-related state
    setRaceResults([]);
    setAlgorithmProgress({});
    setCurrentStepIndices({});
    setCompletedAlgorithms([]);
    setAlgorithmTimings({});
    setAlgorithmStates({});
    
    // Initialize animations and states
    const animations = {};
    const states = {};
    
    selectedAlgorithms.forEach(algo => {
      try {
        if (category === 'Searching') {
          animations[algo] = getSearchingAnimations(algo, array, targetValue);
        } else if (category === 'Sorting') {
          animations[algo] = getSortingAnimations(algo, [...array]);
          states[algo] = [...array];
        } else if (category === 'Graph') {
          animations[algo] = getGraphAnimations(algo);
        }
        
        if (!animations[algo] || !Array.isArray(animations[algo])) {
          throw new Error(`Invalid animations returned for ${algo}`);
        }
        
        raceManager.steps[algo] = animations[algo].length;
        
        if (animations[algo].length === 0) {
          throw new Error(`No animation steps returned for ${algo}`);
        }
      } catch (error) {
        console.error(`Error initializing ${algo}:`, error);
        animations[algo] = [{type: 'error', message: error.message}];
        raceManager.steps[algo] = 1;
      }
    });
    
    setAlgorithmAnimations(animations);
    setAlgorithmStates(states);
    
    // Start animation
    animateRace(animations, {}, states);
  };

  // Get animations for searching algorithms
  const getSearchingAnimations = (algorithm, arr, target) => {
    try {
      switch(algorithm) {
        case 'Linear Search':
          return linearSearch(arr, target);
        case 'Binary Search':
          return binarySearch(arr, target);
        case 'Jump Search':
          return jumpSearch(arr, target);
        case 'Exponential Search':
          return exponentialSearch(arr, target);
        case 'Interpolation Search':
          return interpolationSearch(arr, target);
        default:
          console.warn(`Unknown searching algorithm: ${algorithm}`);
          return [];
      }
    } catch (error) {
      console.error(`Error getting animations for ${algorithm}:`, error);
      return [];
    }
  };

  // Get animations for sorting algorithms
  const getSortingAnimations = (algorithm, arr) => {
    try {
      switch(algorithm) {
        case 'Bubble Sort':
          return bubbleSort(arr);
        case 'Selection Sort':
          return selectionSort(arr);
        case 'Insertion Sort':
          return insertionSort(arr);
        case 'Merge Sort':
          return mergeSort(arr);
        case 'Quick Sort':
          return quickSort(arr);
        default:
          console.warn(`Unknown sorting algorithm: ${algorithm}`);
          return [];
      }
    } catch (error) {
      console.error(`Error getting animations for ${algorithm}:`, error);
      return [];
    }
  };

  // Get animations for graph algorithms
  const getGraphAnimations = (algorithm) => {
    try {
      // This is a simplified implementation
      // In a real implementation, you'd use the actual graph algorithms
      const dummyAnimations = [];
      const steps = algorithm === 'Breadth First Search' ? 15 : 
                 algorithm === 'Depth First Search' ? 18 : 
                 algorithm === 'Dijkstra\'s Algorithm' ? 25 : 
                 algorithm === 'Kruskal\'s Algorithm' ? 22 : 
                 algorithm === 'Prim\'s Algorithm' ? 20 : 15;
      
      for (let i = 0; i < steps; i++) {
        dummyAnimations.push([[], `Step ${i+1} of ${algorithm}`, 'step', {}]);
      }
      
      return dummyAnimations;
    } catch (error) {
      console.error(`Error getting animations for ${algorithm}:`, error);
      return [];
    }
  };

  // Animate the race
  const animateRace = (animations, stepIndices = {}, states = {}) => {
    if (!animations) {
      console.error('Invalid animations');
      setIsRacing(false);
      return;
    }

    if (isPausedRef.current) {
      return;
    }

    try {
      // Update progress for each algorithm
      const newStepIndices = { ...stepIndices };
      const newStates = { ...states };
      
      selectedAlgorithms.forEach(algo => {
        if (!animations[algo]) return;
        
        const totalSteps = animations[algo].length;
        const currentStepIndex = newStepIndices[algo] || 0;
        
        if (currentStepIndex < totalSteps) {
          // Update algorithm state and progress
          if (category === 'Sorting' && animations[algo][currentStepIndex]) {
            const currentAnim = animations[algo][currentStepIndex];
            if (currentAnim && Array.isArray(currentAnim) && currentAnim[0]) {
              newStates[algo] = [...currentAnim[0]];
            }
          }
          
          // Update progress in race manager
          raceManager.updateProgress(algo, currentStepIndex + 1, totalSteps);
          
          // Increment step index
          newStepIndices[algo] = currentStepIndex + 1;
        }
      });
      
      // Update state with new progress
      setAlgorithmProgress(raceManager.progress);
      setCurrentStepIndices(newStepIndices);
      setCompletedAlgorithms(raceManager.rankings);
      setAlgorithmTimings(raceManager.completionTimes);
      
      if (Object.keys(newStates).length > 0) {
        setAlgorithmStates(newStates);
      }
      
      // Check if race is complete
      if (raceManager.state === RaceState.COMPLETED) {
        setIsRacing(false);
        setRaceResults(raceManager.rankings);
        return;
      }
      
      // Schedule next animation frame
      const speed = 101 - animationSpeed;
      animationTimeoutRef.current = setTimeout(() => {
        animateRace(animations, newStepIndices, newStates);
      }, Math.max(10, speed));
    } catch (error) {
      console.error('Error in animation:', error);
      setIsRacing(false);
    }
  };

  // Get realistic speed factor for each algorithm based on complexity
  const getAlgorithmSpeedFactor = (algorithm) => {
    // Lower number = faster execution in the race
    switch(algorithm) {
      // Searching algorithms - from fastest to slowest
      case 'Binary Search':
        return 15; // O(log n) - very fast
      case 'Exponential Search':
        return 20; // O(log n) with some overhead
      case 'Interpolation Search':
        return 18; // O(log log n) avg
      case 'Jump Search':
        return 25; // O(√n)
      case 'Linear Search':
        return 40; // O(n) - slowest search

      // Sorting algorithms - from fastest to slowest
      case 'Merge Sort':
        return 30; // O(n log n) - consistently fast
      case 'Quick Sort':
        return 28; // O(n log n) - fast on average
      case 'Heap Sort':
        return 32; // O(n log n) - slightly slower due to heap operations
      case 'Insertion Sort':
        return 45; // O(n²) but efficient for small arrays
      case 'Selection Sort':
        return 50; // O(n²) consistent but slow
      case 'Bubble Sort':
        return 55; // O(n²) - slowest sort

      // Graph algorithms
      case 'Breadth First Search':
        return 35;
      case 'Depth First Search':
        return 30;
      case 'Dijkstra\'s Algorithm':
        return 45;
      case 'Prim\'s Algorithm':
        return 40;
      case 'Kruskal\'s Algorithm':
        return 38;
      
      default:
        return 30; // Default speed factor
    }
  };

  // Pause/resume the race
  const togglePause = () => {
    if (!isRacing) return;
    
    const currentTime = now();
    
    if (isPaused) {
      // Calculate time spent paused for each algorithm
      selectedAlgorithms.forEach(algo => {
        const algoRef = algorithmRefs.current[algo] || {};
        if (algoRef.pauseTime) {
          algoRef.totalPausedTime = (algoRef.totalPausedTime || 0) + (currentTime - algoRef.pauseTime);
          algoRef.pauseTime = 0;
          // Update last step time to maintain consistent timing
          algoRef.lastStepTime = currentTime;
        }
      });
      
      // Resume
      isPausedRef.current = false;
      setIsPaused(false);
      animateRace(algorithmAnimations, currentStepIndices, algorithmStates);
    } else {
      // Record pause time for all algorithms
      selectedAlgorithms.forEach(algo => {
        const algoRef = algorithmRefs.current[algo] || {};
        algoRef.pauseTime = currentTime;
      });
      
      // Pause
      isPausedRef.current = true;
      setIsPaused(true);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    }
  };

  // Stop the race
  const stopRace = () => {
    setIsRacing(false);
    isPausedRef.current = true;
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  };

  // Reset the race
  const resetRace = () => {
    stopRace();
    raceManager.reset();
    setRaceResults([]);
    setAlgorithmProgress({});
    setCurrentStepIndices({});
    setCompletedAlgorithms([]);
    setAlgorithmTimings({});
    setAlgorithmStates({});
    generateData();
  };

  // Toggle compact mode
  const toggleCompactMode = () => {
    setCompactMode(!compactMode);
  };

  // Toggle data visualization
  const toggleDataVisualization = () => {
    setShowDataVisualization(!showDataVisualization);
  };

  // Open custom input modal
  const openCustomInputModal = () => {
    setShowCustomInputModal(true);
    setCustomInputError('');
    setTimeout(() => {
      if (customInputRef.current) {
        customInputRef.current.focus();
      }
    }, 100);
  };

  // Close custom input modal
  const closeCustomInputModal = () => {
    setShowCustomInputModal(false);
  };

  // Handle custom input change
  const handleCustomInputChange = (e) => {
    setCustomInput(e.target.value);
    setCustomInputError('');
  };

  // Parse and apply custom input
  const applyCustomInput = () => {
    try {
      if (category === 'Searching') {
        // Parse array and target value
        const inputParts = customInput.split('|');
        if (inputParts.length !== 2) {
          throw new Error('Input format should be: array | target');
        }
        
        const arrayStr = inputParts[0].trim();
        const targetStr = inputParts[1].trim();
        
        // Parse array
        let newArray;
        try {
          newArray = JSON.parse(arrayStr);
          if (!Array.isArray(newArray)) {
            throw new Error('First part should be an array');
          }
          if (newArray.length === 0) {
            throw new Error('Array cannot be empty');
          }
          if (!newArray.every(item => typeof item === 'number')) {
            throw new Error('Array should contain only numbers');
          }
        } catch (e) {
          throw new Error(`Invalid array format: ${e.message}`);
        }
        
        // Parse target
        let newTarget;
        try {
          newTarget = JSON.parse(targetStr);
          if (typeof newTarget !== 'number') {
            throw new Error('Target should be a number');
          }
        } catch (e) {
          throw new Error(`Invalid target format: ${e.message}`);
        }
        
        // For binary search, array must be sorted
        const sortedArray = [...newArray].sort((a, b) => a - b);
        
        setArray(sortedArray);
        setTargetValue(newTarget);
        setArraySize(sortedArray.length);
      } else if (category === 'Sorting') {
        // Parse array
        let newArray;
        try {
          newArray = JSON.parse(customInput);
          if (!Array.isArray(newArray)) {
            throw new Error('Input should be an array');
          }
          if (newArray.length === 0) {
            throw new Error('Array cannot be empty');
          }
          if (!newArray.every(item => typeof item === 'number')) {
            throw new Error('Array should contain only numbers');
          }
        } catch (e) {
          throw new Error(`Invalid array format: ${e.message}`);
        }
        
        setArray(newArray);
        setArraySize(newArray.length);
      }
      
      closeCustomInputModal();
    } catch (error) {
      setCustomInputError(error.message);
    }
  };

  // Format milliseconds to readable time
  const formatTime = (ms) => {
    if (!ms && ms !== 0) return 'N/A';
    if (ms < 1) return '<1ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Render algorithm selection checkboxes
  const renderAlgorithmSelection = () => {
    return (
      <div className="algorithm-selection">
        <h3>Select Algorithms to Compare</h3>
        <div className="algorithm-checkboxes">
          {availableAlgorithms.map(algo => (
            <div key={algo} className="algorithm-checkbox">
              <input
                type="checkbox"
                id={`algo-${algo}`}
                checked={selectedAlgorithms.includes(algo)}
                onChange={() => toggleAlgorithmSelection(algo)}
                disabled={isRacing}
              />
              <label htmlFor={`algo-${algo}`}>{algo}</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render race controls
  const renderRaceControls = () => {
    return (
      <div className="race-controls">
        <div className="control-group">
          <label htmlFor="array-size">Array Size:</label>
          <input
            type="range"
            id="array-size"
            min="10"
            max="200"
            value={arraySize}
            onChange={(e) => setArraySize(parseInt(e.target.value))}
            disabled={isRacing}
          />
          <span>{arraySize}</span>
        </div>
        
        <div className="control-group">
          <label htmlFor="animation-speed">Speed:</label>
          <input
            type="range"
            id="animation-speed"
            min="1"
            max="100"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
          />
          <span>{animationSpeed}%</span>
        </div>
        
        <div className="button-group">
          <button 
            className="generate-btn"
            onClick={generateData}
            disabled={isRacing}
          >
            <i className="fas fa-random"></i> Generate New Data
          </button>
          
          <button 
            className="custom-input-btn"
            onClick={openCustomInputModal}
            disabled={isRacing}
          >
            <i className="fas fa-keyboard"></i> Custom Input
          </button>
          
          {category === 'Sorting' && (
            <button 
              className="visualize-btn"
              onClick={toggleDataVisualization}
              disabled={isRacing && !isPaused}
            >
              <i className={`fas fa-${showDataVisualization ? 'eye-slash' : 'eye'}`}></i>
              {showDataVisualization ? ' Hide Visualization' : ' Show Visualization'}
            </button>
          )}
          
          <button 
            className="race-btn"
            onClick={startRace}
            disabled={isRacing || selectedAlgorithms.length < 2}
          >
            <i className="fas fa-flag-checkered"></i> Start Race
          </button>
          
          {isRacing && (
            <>
              <button 
                className="pause-btn"
                onClick={togglePause}
              >
                <i className={`fas fa-${isPaused ? 'play' : 'pause'}`}></i>
                {isPaused ? ' Resume' : ' Pause'}
              </button>
              
              <button 
                className="stop-btn"
                onClick={stopRace}
              >
                <i className="fas fa-stop"></i> Stop
              </button>
            </>
          )}
          
          <button 
            className="reset-btn"
            onClick={resetRace}
            disabled={isRacing && !isPaused}
          >
            <i className="fas fa-redo"></i> Reset
          </button>
        </div>
      </div>
    );
  };

  // Render race visualization
  const renderRaceVisualization = () => {
    return (
      <div className="race-visualization">
        {selectedAlgorithms.map((algo) => {
          const isCompleted = raceManager.isCompleted(algo);
          const rank = raceManager.getRank(algo);
          const isWinner = raceManager.isWinner(algo);
          const progress = raceManager.progress[algo] || 0;
          
          return (
            <div 
              key={algo} 
              className={`algorithm-race-track ${isCompleted ? 'completed' : ''} ${isWinner ? 'winner' : ''}`}
            >
              <div className="algorithm-name">
                <span>
                  {isCompleted && (
                    <span className="rank-indicator">#{rank}</span>
                  )}
                  {algo}
                </span>
                {isCompleted && (
                  <span className="finish-time">
                    {formatTime(raceManager.getCompletionTime(algo))}
                    {isWinner && <i className="fas fa-trophy trophy-icon"></i>}
                  </span>
                )}
              </div>
              <div className="progress-container">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: isWinner ? 'var(--winner-color)' : 
                                  isCompleted ? 'var(--success-color)' : null
                  }}
                ></div>
                {isRacing && !isCompleted && progress > 0 && (
                  <div className="progress-indicator"></div>
                )}
              </div>
              <div className="algorithm-stats">
                {isCompleted ? (
                  <span className="completed">
                    <i className="fas fa-check-circle"></i>
                    {isWinner ? ' Winner!' : ' Completed'}
                  </span>
                ) : (
                  <span className="steps">
                    Step {currentStepIndices[algo] || 0} of {raceManager.steps[algo] || 0}
                    <span className="progress-percentage">
                      ({Math.round(progress)}%)
                    </span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render data visualization
  const renderDataVisualization = () => {
    if (!showDataVisualization || category !== 'Sorting') return null;
    
    return (
      <div className="data-visualization">
        <h3>Algorithm Progress Visualization</h3>
        <canvas 
          ref={raceCanvasRef}
          width={800}
          height={300}
          className="race-canvas"
        ></canvas>
      </div>
    );
  };

  // Render race results
  const renderRaceResults = () => {
    if (raceManager.state !== RaceState.COMPLETED) return null;
    
    return (
      <div className="race-results">
        <h3>Race Results</h3>
        <div className="results-table">
          <div className="results-header">
            <div className="rank">Rank</div>
            <div className="algorithm">Algorithm</div>
            <div className="time">Time</div>
            <div className="steps">Steps</div>
            <div className="time-complexity">Time Complexity</div>
          </div>
          {raceManager.rankings.map((algo) => {
            const rank = raceManager.getRank(algo);
            const isWinner = raceManager.isWinner(algo);
            
            return (
              <div key={algo} className={`result-row ${isWinner ? 'winner' : ''}`}>
                <div className="rank">
                  {isWinner ? <i className="fas fa-trophy"></i> : rank}
                </div>
                <div className="algorithm">{algo}</div>
                <div className="time">{formatTime(raceManager.getCompletionTime(algo))}</div>
                <div className="steps">{raceManager.steps[algo] || 0}</div>
                <div className="time-complexity">
                  {getTimeComplexity(algo)}
                </div>
              </div>
            );
          })}
        </div>
        
        {raceManager.rankings.length > 1 && (
          <div className="efficiency-analysis">
            <h4>Efficiency Analysis</h4>
            <p>
              <strong>{raceManager.winner}</strong> completed the race 
              {raceManager.rankings.length > 1 && (
                <> {calculatePercentageDifference(
                  raceManager.getCompletionTime(raceManager.winner),
                  raceManager.getCompletionTime(raceManager.rankings[1])
                )}% faster than <strong>{raceManager.rankings[1]}</strong></>
              )}
              {category === 'Sorting' && (
                <> with {raceManager.steps[raceManager.winner] || 0} operations for {arraySize} elements.</>
              )}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Get time complexity for an algorithm
  const getTimeComplexity = (algorithm) => {
    switch(algorithm) {
      case 'Linear Search':
        return 'O(n)';
      case 'Binary Search':
      case 'Exponential Search':
        return 'O(log n)';
      case 'Jump Search':
        return 'O(√n)';
      case 'Interpolation Search':
        return 'O(log log n) avg, O(n) worst';
      case 'Bubble Sort':
      case 'Selection Sort':
      case 'Insertion Sort':
        return 'O(n²)';
      case 'Merge Sort':
      case 'Quick Sort':
        return 'O(n log n)';
      case 'Breadth First Search':
      case 'Depth First Search':
        return 'O(V + E)';
      case 'Dijkstra\'s Algorithm':
      case 'Prim\'s Algorithm':
        return 'O((V+E)log V)';
      case 'Kruskal\'s Algorithm':
        return 'O(E log E)';
      default:
        return 'Unknown';
    }
  };

  // Calculate percentage difference between two times
  const calculatePercentageDifference = (time1, time2) => {
    if (!time1 || !time2 || time1 === 0) return 0;
    return ((time2 - time1) / time1 * 100).toFixed(1);
  };

  // Render custom input modal
  const renderCustomInputModal = () => {
    if (!showCustomInputModal) return null;
    
    return (
      <div className="modal-overlay" onClick={closeCustomInputModal}>
        <div className="custom-input-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Custom Input Challenge</h3>
            <button className="close-modal" onClick={closeCustomInputModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {category === 'Searching' && (
            <div className="input-instructions">
              <p>Format: <code>[array] | target</code></p>
              <p>Example: <code>[1, 3, 5, 7, 9] | 5</code></p>
              <p>Note: Array will be sorted automatically for binary search algorithms</p>
            </div>
          )}
          
          {category === 'Sorting' && (
            <div className="input-instructions">
              <p>Format: <code>[array]</code></p>
              <p>Example: <code>[9, 3, 7, 1, 5]</code></p>
            </div>
          )}
          
          <textarea
            ref={customInputRef}
            value={customInput}
            onChange={handleCustomInputChange}
            placeholder={category === 'Searching' ? '[1, 2, 3, 4, 5] | 3' : '[5, 2, 9, 1, 5, 6]'}
            rows={5}
            className="custom-input-textarea"
          ></textarea>
          
          {customInputError && (
            <div className="input-error">
              <i className="fas fa-exclamation-triangle"></i> {customInputError}
            </div>
          )}
          
          <div className="modal-buttons">
            <button className="cancel-btn" onClick={closeCustomInputModal}>
              <i className="fas fa-times"></i> Cancel
            </button>
            <button className="apply-btn" onClick={applyCustomInput}>
              <i className="fas fa-check"></i> Apply
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render current data preview
  const renderDataPreview = () => {
    if (isRacing || !array.length) return null;
    
    return (
      <div className="data-preview">
        <h3>Current Data Preview</h3>
        <div className="array-preview">
          {category === 'Searching' && (
            <div className="preview-info">
              <span>Array (sorted): </span>
              <span className="preview-array">
                [{array.length > 10 ? 
                  `${array.slice(0, 5).join(', ')}, ... , ${array.slice(-5).join(', ')}` : 
                  array.join(', ')}]
              </span>
              <span className="preview-target">Target: {targetValue}</span>
            </div>
          )}
          
          {category === 'Sorting' && (
            <div className="preview-info">
              <span>Array (unsorted): </span>
              <span className="preview-array">
                [{array.length > 10 ? 
                  `${array.slice(0, 5).join(', ')}, ... , ${array.slice(-5).join(', ')}` : 
                  array.join(', ')}]
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`algorithm-race-visualizer ${compactMode ? 'compact' : ''}`}>
      <div className="race-header">
        <h2>Algorithm Race Mode - {category}</h2>
        <div className="header-actions">
          <button 
            className="compact-toggle"
            onClick={toggleCompactMode}
            title={compactMode ? 'Expand view' : 'Compact view'}
          >
            <i className={`fas fa-${compactMode ? 'expand' : 'compress'}`}></i>
          </button>
        </div>
      </div>
      
      {renderAlgorithmSelection()}
      {renderRaceControls()}
      {renderDataPreview()}
      
      {(isRacing || raceManager.state !== RaceState.IDLE) && renderRaceVisualization()}
      {renderDataVisualization()}
      {renderRaceResults()}
      {renderCustomInputModal()}
    </div>
  );
};

export default AlgorithmRaceVisualizer; 