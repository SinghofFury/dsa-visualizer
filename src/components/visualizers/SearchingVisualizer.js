import React, { useState, useEffect, useRef } from 'react';
import '../../styles/SearchingVisualizer.css';
import { linearSearch, binarySearch, jumpSearch, interpolationSearch, exponentialSearch } from '../../algorithms/searching';

const SearchingVisualizer = ({ algorithm, onAlgorithmRunningChange }) => {
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(10);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [targetValue, setTargetValue] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [searchResult, setSearchResult] = useState({ found: false, index: -1 });
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [animationHistory, setAnimationHistory] = useState([]);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [showTraceTable, setShowTraceTable] = useState(false);
  const [searchRange, setSearchRange] = useState({ low: 0, high: 0, mid: -1 });
  const animationTimeoutRef = useRef(null);
  const isPausedRef = useRef(false); // Add ref to track pause state for animations
  const arrayDisplayRef = useRef(null);

  // UI state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [compactMode, setCompactMode] = useState(false);

  // Algorithm information
  const algorithmInfo = {
    'Linear Search': {
      description: 'Linear Search sequentially checks each element of the list until it finds a match or reaches the end of the list. It is simple but inefficient for large lists.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      pseudocode: [
        'for i = 0 to n-1',
        '  if array[i] == target',
        '    return i',
        'return -1',
      ],
      explanations: {
        start: 'Starting linear search for target value {target} in array of length {length}',
        checking: 'Checking element at index {i} with value {val}',
        found: 'Target value {target} found at index {i}',
        continue: 'Element at index {i} is not the target, continuing to next element',
        notFound: 'Target value {target} not found in the array',
        complete: 'Search complete!'
      }
    },
    'Binary Search': {
      description: 'Binary Search finds the position of a target value within a sorted array by repeatedly dividing the search interval in half. If the value of the search key is less than the item in the middle of the interval, narrow the interval to the lower half. Otherwise, narrow it to the upper half.',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      note: 'Requires a sorted array',
      pseudocode: [
        'low = 0',
        'high = n - 1',
        'while low <= high',
        '  mid = (low + high) / 2',
        '  if array[mid] == target',
        '    return mid',
        '  else if array[mid] < target',
        '    low = mid + 1',
        '  else',
        '    high = mid - 1',
        'return -1',
      ],
      explanations: {
        start: 'Starting binary search with range [{low}...{high}]',
        midpoint: 'Calculating midpoint at index {mid} with value {val}',
        checking: 'Comparing target {target} with midpoint value {val} at index {mid}',
        found: 'Target value {target} found at index {mid}',
        narrowLeft: 'Target {target} is less than midpoint value {val}, narrowing search to left half [{low}...{high}]',
        narrowRight: 'Target {target} is greater than midpoint value {val}, narrowing search to right half [{low}...{high}]',
        notFound: 'Target value {target} not found in the array',
        complete: 'Search complete!'
      }
    },
    'Jump Search': {
      description: "Jump Search works by jumping ahead by fixed steps and then performing a linear search within the smaller range. It's more efficient than linear search but less efficient than binary search.",
      timeComplexity: 'O(√n)',
      spaceComplexity: 'O(1)',
      note: 'Requires a sorted array',
      pseudocode: [
        'blockSize = √n',
        'prev = 0',
        'while array[min(blockSize, n) - 1] < target',
        '  prev = blockSize',
        '  blockSize += √n',
        '  if prev >= n',
        '    return -1',
        'while array[prev] < target',
        '  prev++',
        '  if prev == min(blockSize, n)',
        '    return -1',
        'if array[prev] == target',
        '  return prev',
        'return -1',
      ],
      explanations: {
        start: 'Starting jump search for target value {target} in array of length {length}',
        jump: 'Jumping ahead to index {index} with value {val}',
        linearSearch: 'Starting linear search from index {start} to {end}',
        checking: 'Checking element at index {i} with value {val}',
        found: 'Target value {target} found at index {i}',
        notFound: 'Target value {target} not found in the array',
        complete: 'Search complete!'
      }
    },
    'Interpolation Search': {
      description: "Interpolation Search is an improved variant of binary search. It calculates the probable position of the target value based on the values at the bounds of the search range, which can be more efficient for uniformly distributed data.",
      timeComplexity: 'O(log log n) average case, O(n) worst case',
      spaceComplexity: 'O(1)',
      note: 'Requires a sorted array with uniformly distributed values',
      pseudocode: [
        'low = 0',
        'high = n - 1',
        'while low <= high and target >= array[low] and target <= array[high]',
        '  pos = low + ((target - array[low]) * (high - low)) / (array[high] - array[low])',
        '  if array[pos] == target',
        '    return pos',
        '  else if array[pos] < target',
        '    low = pos + 1',
        '  else',
        '    high = pos - 1',
        'return -1',
      ],
      explanations: {
        start: 'Starting interpolation search with range [{low}...{high}]',
        position: 'Calculated probable position at index {pos} with value {val}',
        checking: 'Comparing target {target} with value {val} at index {pos}',
        found: 'Target value {target} found at index {pos}',
        narrowLeft: 'Target {target} is less than value {val}, narrowing search to left half [{low}...{high}]',
        narrowRight: 'Target {target} is greater than value {val}, narrowing search to right half [{low}...{high}]',
        notFound: 'Target value {target} not found in the array',
        complete: 'Search complete!'
      }
    },
    'Exponential Search': {
      description: 'Exponential Search works by first finding a range where the target value may exist and then using binary search within that range. It explores the array by doubling the index until an element greater than the target is found.',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      note: 'Requires a sorted array',
      pseudocode: [
        'if array[0] == target',
        '  return 0',
        'i = 1',
        'while i < n and array[i] <= target',
        '  i = i * 2',
        'return binarySearch(array, target, i/2, min(i, n-1))',
      ],
      explanations: {
        start: 'Starting exponential search for target value {target}',
        exponentialCheck: 'Checking element at index {index} with value {val}',
        double: 'Doubling index from {prev} to {next}',
        setRange: 'Found range [{low}...{high}] for binary search',
        checking: 'Binary search: Comparing target {target} with value {val} at index {mid}',
        found: 'Target value {target} found at index {index}',
        notFound: 'Target value {target} not found in the array',
        complete: 'Search complete!'
      }
    }
  };

  // Generate array appropriate for the selected algorithm
  const generateArray = () => {
    let newArray = [];
    const maxValue = 100;
    const minValue = 1;
    
    // Generate array based on algorithm requirements
    if (algorithm === 'Interpolation Search') {
      // Create a more uniformly distributed array for interpolation search
      newArray = Array.from({ length: arraySize }, (_, i) => 
        Math.floor(minValue + (i * (maxValue / arraySize)) + Math.random() * (maxValue / arraySize)));
    } else {
      // Create a random array for other algorithms
      newArray = Array.from({ length: arraySize }, () => 
        Math.floor(Math.random() * maxValue) + minValue);
      
      // Sort if required by the algorithm
      if (algorithm === 'Binary Search' || algorithm === 'Jump Search') {
        newArray.sort((a, b) => a - b);
      }
    }
    
    // Set the array
    setArray(newArray);
    
    // Choose a target value - with a 70% chance of being in the array
    if (Math.random() < 0.7 && newArray.length > 0) {
      // Pick a value from the array
      const targetIdx = Math.floor(Math.random() * newArray.length);
      setTargetValue(newArray[targetIdx]);
    } else {
      // Pick a random value not in the array
      let randomTarget;
      do {
        randomTarget = Math.floor(Math.random() * maxValue) + minValue;
      } while (newArray.includes(randomTarget) && newArray.length < maxValue);
      
      setTargetValue(randomTarget);
    }
    
    // Reset search state
    setSearchResult({ found: false, index: -1 });
    setCurrentStep(0);
    setTotalSteps(0);
    setAnimationHistory([]);
    setCurrentExplanation('');
    setIsPaused(false);
    isPausedRef.current = false;
    setSearchRange({ low: 0, high: 0, mid: -1 });
  };

  // Initialize array on component mount and when array size or algorithm changes
  useEffect(() => {
    generateArray();
  }, [arraySize, algorithm]);

  // Clear any ongoing animations when component unmounts
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Generate explanation for the current step
  const generateExplanation = (animation, algorithm) => {
    try {
      if (!animation || animation.length < 3) return "No explanation available";
      
      const [indices, message, actionType, actionParams] = animation;
      
      // If a custom message is provided, use it directly
      if (message && message !== '') {
        return message;
      }
      
      const info = algorithmInfo[algorithm];
      if (!info || !info.explanations) return "No explanation available";
      
      let explanationKey;
      let parameters = {};
      
      switch (actionType) {
        case 'start':
          explanationKey = 'start';
          parameters = { target: targetValue, length: array.length };
          break;
        case 'checking':
          explanationKey = 'checking';
          parameters = { i: actionParams.i, val: array[actionParams.i], target: targetValue };
          break;
        case 'found':
          explanationKey = 'found';
          parameters = { i: actionParams.index, mid: actionParams.mid, val: array[actionParams.index], target: targetValue };
          break;
        case 'compare':
          if (algorithm === 'Binary Search' || algorithm === 'Interpolation Search') {
            explanationKey = 'checking';
            const midIndex = algorithm === 'Binary Search' ? actionParams.mid : actionParams.pos;
            parameters = { mid: midIndex, val: array[midIndex], target: targetValue, low: actionParams.low, high: actionParams.high };
          } else if (algorithm === 'Exponential Search') {
            if (actionParams.index === 0) {
              explanationKey = 'checking';
              parameters = { index: 0, val: array[0], target: targetValue };
            } else if (actionParams.low !== undefined) {
              explanationKey = 'checking';
              parameters = { mid: actionParams.mid, val: array[actionParams.mid], target: targetValue, low: actionParams.low, high: actionParams.high };
            } else {
              explanationKey = 'exponentialCheck';
              parameters = { index: actionParams.index, val: array[actionParams.index], target: targetValue };
            }
          } else {
            explanationKey = 'checking';
            parameters = { i: indices[0], val: array[indices[0]], target: targetValue };
          }
          break;
        case 'narrowLeft':
          explanationKey = 'narrowLeft';
          parameters = { 
            low: actionParams.low, 
            high: actionParams.high, 
            mid: actionParams.mid, 
            val: array[actionParams.mid], 
            target: targetValue 
          };
          break;
        case 'narrowRight':
          explanationKey = 'narrowRight';
          parameters = { 
            low: actionParams.low, 
            high: actionParams.high, 
            mid: actionParams.mid, 
            val: array[actionParams.mid], 
            target: targetValue 
          };
          break;
        case 'not-found':
          explanationKey = 'notFound';
          parameters = { target: targetValue };
          break;
        case 'jump':
          explanationKey = 'jump';
          parameters = { index: actionParams.index, val: array[actionParams.index], target: targetValue };
          break;
        case 'linear':
          explanationKey = 'linearSearch';
          parameters = { start: actionParams.prev, end: actionParams.end, target: targetValue };
          break;
        case 'exponential-check':
          explanationKey = 'exponentialCheck';
          parameters = { index: actionParams.index, val: array[actionParams.index], target: targetValue };
          break;
        case 'double':
          explanationKey = 'double';
          parameters = { prev: actionParams.prev, next: actionParams.next };
          break;
        case 'set-range':
          explanationKey = 'setRange';
          parameters = { low: actionParams.low, high: actionParams.high };
          break;
        default:
          return message || "No explanation available";
      }
      
      // Get the explanation template from algorithm info
      const explanationTemplate = info.explanations[explanationKey];
      
      // Replace placeholders with actual values
      return replacePlaceholders(explanationTemplate, parameters);
    } catch (error) {
      console.error("Error generating explanation:", error);
      return "Error generating explanation";
    }
  };

  // Helper function to replace placeholders in explanation strings
  const replacePlaceholders = (text, values) => {
    if (!text || !values) return text;
    
    let result = text;
    Object.keys(values).forEach(key => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), values[key]);
    });
    
    return result;
  };

  // Helper function to update search range based on algorithm and action
  const updateSearchRange = (algorithm, actionType, actionParams) => {
    // Handle different search algorithms
    switch (algorithm) {
      case 'Binary Search':
        if (actionType === 'compare' || actionType === 'narrowLeft' || actionType === 'narrowRight') {
          return {
            low: actionParams.low,
            high: actionParams.high,
            mid: actionParams.mid
          };
        }
        break;
      case 'Interpolation Search':
        if (actionType === 'compare' || actionType === 'narrowLeft' || actionType === 'narrowRight') {
          return {
            low: actionParams.low,
            high: actionParams.high,
            mid: actionParams.pos
          };
        }
        break;
      case 'Jump Search':
        if (actionType === 'jump' || actionType === 'linear') {
          const { prev, index, end } = actionParams;
          return {
            low: prev !== undefined ? prev : 0,
            high: end !== undefined ? end : index,
            mid: -1
          };
        }
        break;
      case 'Exponential Search':
        if (actionType === 'exponential-check') {
          return {
            low: 0,
            high: actionParams.bound,
            mid: actionParams.index
          };
        } else if (actionType === 'set-range') {
          return {
            low: actionParams.low,
            high: actionParams.high,
            mid: -1
          };
        } else if (actionType === 'compare' || actionType === 'narrowLeft' || actionType === 'narrowRight') {
          return {
            low: actionParams.low,
            high: actionParams.high,
            mid: actionParams.mid
          };
        }
        break;
      default:
        break;
    }
    
    return {};
  };

  // Update parent component when searching state changes
  useEffect(() => {
    if (onAlgorithmRunningChange) {
      onAlgorithmRunningChange(isSearching);
    }
  }, [isSearching, onAlgorithmRunningChange]);

  // Run the selected searching algorithm
  const runSearchingAlgorithm = () => {
    if (isSearching || targetValue === null) return;
    
    // Reset search state
    setIsSearching(true);
    setIsPaused(false);
    isPausedRef.current = false;
    setSearchResult({ found: false, index: -1 });
    setCurrentStep(0);
    setSearchRange({ low: 0, high: 0, mid: -1 });
    
    // Make a copy of the array for the algorithm
    const arrayCopy = [...array];
    
    // Ensure array is sorted for algorithms that require it
    const needsSorting = ['Binary Search', 'Jump Search', 'Interpolation Search', 'Exponential Search'].includes(algorithm);
    if (needsSorting && !isSorted(arrayCopy)) {
      arrayCopy.sort((a, b) => a - b);
      setArray(arrayCopy);
    }
    
    // Generate animations based on selected algorithm
    let animations = [];
    
    try {
      // Get the appropriate search function
      const searchFunctions = {
        'Linear Search': linearSearch,
        'Binary Search': binarySearch,
        'Jump Search': jumpSearch,
        'Interpolation Search': interpolationSearch,
        'Exponential Search': exponentialSearch
      };
      
      const searchFunction = searchFunctions[algorithm];
      
      if (!searchFunction) {
        throw new Error('Algorithm not implemented');
      }
      
      // Run the search algorithm
      animations = searchFunction(arrayCopy, targetValue);
      
      // Validate animations
      if (!animations || animations.length === 0) {
        throw new Error('No animation steps generated');
      }
      
      // Store animations and initialize visualization
      setAnimationHistory(animations);
      setTotalSteps(animations.length);
      setCurrentExplanation('Starting search for target value ' + targetValue);
      
      // Start the animation process
      animateSearch(animations, 0);
    } catch (error) {
      console.error("Error running search algorithm:", error);
      setIsSearching(false);
      setCurrentExplanation('Error: ' + error.message);
    }
  };

  // Helper function to check if array is sorted
  const isSorted = (arr) => {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < arr[i - 1]) return false;
    }
    return true;
  };

  // Animate the search algorithm
  const animateSearch = (animations, step) => {
    // If we've reached the end of animations or if cancelled
    if (step >= animations.length) {
      setIsSearching(false);
      setCurrentStep(animations.length);
      
      // Find if any of the animations contain a 'found' action type
      const foundAnimation = animations.find(anim => anim[2] === 'found');
      
      // Update search result if we found a result
      if (foundAnimation) {
        const params = foundAnimation[3];
        setSearchResult({ found: true, index: params.index });
        setCurrentExplanation(algorithmInfo[algorithm]?.explanations?.complete || 'Search complete! Target found.');
      } else {
        setSearchResult({ found: false, index: -1 });
        setCurrentExplanation(algorithmInfo[algorithm]?.explanations?.notFound?.replace('{target}', targetValue) || 'Target not found');
      }
      
      return;
    }
    
    // If animation is paused, don't proceed
    if (isPausedRef.current) {
      return;
    }
    
    // Get current animation step
    const animation = animations[step];
    
    // Update current step counter
    setCurrentStep(step + 1);
    
    // Process the animation based on its type
    const [indices, message, actionType, actionParams] = animation;
    
    // Update the search range based on the algorithm and action type
    const rangeUpdate = updateSearchRange(algorithm, actionType, actionParams);
    if (Object.keys(rangeUpdate).length > 0) {
      setSearchRange(rangeUpdate);
    }
    
    // Generate explanation
    try {
      const explanation = generateExplanation(animation, algorithm);
      setCurrentExplanation(explanation);
    } catch (error) {
      console.error("Error generating explanation:", error);
      setCurrentExplanation("Error explaining this step");
    }
    
    // Check if we found the target
    if (actionType === 'found') {
      setSearchResult({ found: true, index: actionParams.index });
    }
    
    // Calculate delay based on algorithm and action
    let delay = 1000 - (animationSpeed * 9);
    
    // For fast algorithms, some actions need shorter delays
    if (algorithm === 'Binary Search' || algorithm === 'Interpolation Search' || algorithm === 'Exponential Search') {
      if (actionType === 'narrowLeft' || actionType === 'narrowRight' || actionType === 'double' || actionType === 'set-range') {
        delay = delay * 0.7; // Faster for range changes
      }
    }
    
    // Schedule next animation step
    animationTimeoutRef.current = setTimeout(() => {
      animateSearch(animations, step + 1);
    }, delay);
  };

  // Toggle pause/resume of the animation
  const togglePause = () => {
    if (isPaused) {
      // Resume animation by directly calling the animation function
      setIsPaused(false);
      isPausedRef.current = false;
      
      // Use a small timeout to ensure state is updated before resuming
      setTimeout(() => {
        if (currentStep < animationHistory.length) {
          animateSearch(animationHistory, currentStep);
        }
      }, 50);
    } else {
      // Pause animation
      setIsPaused(true);
      isPausedRef.current = true;
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    }
  };

  // Step forward in the animation
  const stepForward = () => {
    if (currentStep < totalSteps && isPaused) {
      // Get the current animation
      const animation = animationHistory[currentStep];
      if (!animation) return;
      
      const [indices, found, foundIndex, actionType, actionParams] = animation;
      
      // Update visualization state
      if (found) {
        setSearchResult({ found: true, index: foundIndex });
      }
      
      // Update search range using helper function
      setSearchRange(updateSearchRange(algorithm, actionType, actionParams));
      
      // Update current step counter
      setCurrentStep(currentStep + 1);
      
      // Generate explanation
      try {
        const explanation = generateExplanation(animation, algorithm);
        setCurrentExplanation(explanation);
        
        // Show final message if last step
        if (currentStep + 1 === totalSteps) {
          if (found || (animationHistory[totalSteps - 1] && animationHistory[totalSteps - 1][1])) {
            setCurrentExplanation(algorithmInfo[algorithm]?.explanations?.complete || 'Search complete! Target found.');
          } else {
            setCurrentExplanation(algorithmInfo[algorithm]?.explanations?.notFound?.replace('{target}', targetValue) || 'Target not found');
          }
        }
      } catch (error) {
        console.error("Error generating explanation:", error);
        setCurrentExplanation('Error generating explanation');
      }
    }
  };

  // Step backward in the animation
  const stepBackward = () => {
    if (currentStep > 1 && isPaused) {
      // Get the previous animation
      const prevStep = currentStep - 2;
      const prevAnimation = animationHistory[prevStep];
      if (!prevAnimation) return;
      
      // Reset to initial state and replay animations up to the previous step
      setSearchResult({ found: false, index: -1 });
      setSearchRange({ low: 0, high: 0, mid: -1 });
      
      // Track the latest state as we replay
      let currentSearchResult = { found: false, index: -1 };
      let currentSearchRange = { low: 0, high: 0, mid: -1 };
      
      // Apply all animations up to the previous step
      for (let i = 0; i <= prevStep; i++) {
        const [indices, found, foundIndex, actionType, actionParams] = animationHistory[i];
        
        // Update search result
        if (found) {
          currentSearchResult = { found: true, index: foundIndex };
        }
        
        // Update search range using helper function
        currentSearchRange = updateSearchRange(algorithm, actionType, actionParams);
      }
      
      // Apply the calculated state
      setSearchResult(currentSearchResult);
      setSearchRange(currentSearchRange);
      
      // Update step counter
      setCurrentStep(currentStep - 1);
      
      // Generate explanation for the previous step
      try {
        const explanation = generateExplanation(prevAnimation, algorithm);
        setCurrentExplanation(explanation);
      } catch (error) {
        console.error("Error generating explanation:", error);
        setCurrentExplanation('Error generating explanation');
      }
    }
  };

  // Stop the animation
  const stopAnimation = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setIsSearching(false);
    setIsPaused(false);
    isPausedRef.current = false;
  };

  // Reset the array
  const resetArray = () => {
    stopAnimation();
    generateArray();
    setIsPaused(false);
    isPausedRef.current = false;
  };

  // Toggle trace table visibility
  const toggleTraceTable = () => {
    setShowTraceTable(!showTraceTable);
  };

  // Render array elements with appropriate styling
  const renderArrayElements = () => {
    const currentAnimation = animationHistory[currentStep - 1];
    const highlightIndices = currentAnimation ? currentAnimation[0] : [];
    const foundIndex = searchResult.found ? searchResult.index : -1;
    
    return array.map((value, idx) => {
      let className = 'array-element';
      
      // Special styling for the found element
      if (idx === foundIndex) {
        className += ' found';
      } 
      // Highlight elements being compared in the current step
      else if (highlightIndices && highlightIndices.includes(idx)) {
        className += ' comparing';
      }
      
      // For Binary Search, Interpolation Search, Jump Search, and Exponential Search, visualize the search range
      if ((algorithm === 'Binary Search' || algorithm === 'Interpolation Search' || 
           algorithm === 'Jump Search' || algorithm === 'Exponential Search') && 
          currentStep > 0 && searchRange.low !== undefined && searchRange.high !== undefined) {
        
        // Highlight the current search range
        if (idx >= searchRange.low && idx <= searchRange.high) {
          className += ' in-range';
        } else {
          className += ' out-of-range';
        }
        
        // Special styling for the midpoint/position
        if (idx === searchRange.mid) {
          className += ' midpoint';
        }
        
        // For Jump Search, highlight the block boundaries
        if (algorithm === 'Jump Search' && currentAnimation) {
          const actionType = currentAnimation[2];
          const actionParams = currentAnimation[3];
          
          if (actionType === 'jump' && actionParams) {
            if (actionParams.index === idx) {
              className += ' jump-point';
            }
            if (actionParams.prev === idx) {
              className += ' prev-point';
            }
          }
        }
        
        // For Exponential Search, highlight the doubling points
        if (algorithm === 'Exponential Search' && currentAnimation) {
          const actionType = currentAnimation[2];
          const actionParams = currentAnimation[3];
          
          if (actionType === 'double' && actionParams) {
            if (actionParams.prev === idx) {
              className += ' prev-point';
            }
            if (actionParams.next === idx) {
              className += ' jump-point';
            }
          }
        }
      }
      
      return (
        <div 
          className={className} 
          key={idx}
          data-index={idx}
          data-value={value}
        >
          <div className="array-element-value">{value}</div>
        </div>
      );
    });
  };

  // Render array indices with proper alignment
  const renderArrayIndices = () => {
    return array.map((_, idx) => (
      <div className="array-index" key={idx}>{idx}</div>
    ));
  };

  // Add scroll handler
  useEffect(() => {
    const handleScroll = () => {
      // Force a re-render to update search range position
      setSearchRange(prev => ({ ...prev }));
    };

    const arrayDisplay = arrayDisplayRef.current;
    if (arrayDisplay) {
      arrayDisplay.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (arrayDisplay) {
        arrayDisplay.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Add resize listener to detect screen size changes
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

  /**
   * Update the array display container size based on the current layout
   */
  const updateCanvasSize = () => {
    const container = document.querySelector('.array-container');
    if (!container) return;
    
    // Adjust container height based on the current layout
    if (isLargeScreen && !compactMode) {
      // Side-by-side layout
      container.style.height = '100%';
    } else if (compactMode) {
      // Compact mode
      container.style.height = '80vh';
    } else {
      // Stacked layout (default)
      container.style.height = '60vh';
    }
  };

  // ========== UI HANDLERS ==========
  const toggleCompactMode = () => {
    setCompactMode(!compactMode);
    // Need to update canvas after layout change
    setTimeout(updateCanvasSize, 50);
  };

  // Main render
  return (
    <div className={`searching-visualizer ${compactMode ? 'compact-mode' : ''}`}>
      <div className="searching-container">
        {/* Array visualization */}
        <div className="array-container">
          <h3>Array Visualization</h3>
          
          <div className="array-display" ref={arrayDisplayRef}>
            <div className="array-elements-container">
              {renderArrayElements()}
              
              {/* Search range indicator for binary search and other range-based algorithms */}
              {['Binary Search', 'Interpolation Search', 'Jump Search', 'Exponential Search'].includes(algorithm) && 
               currentStep > 0 && searchRange.low !== undefined && searchRange.high !== undefined && (
                <>
                  <div 
                    className="search-range" 
                    style={{
                      left: `${searchRange.low * 72 + 35}px`,
                      width: `${(searchRange.high - searchRange.low + 1) * 72 - 14}px`
                    }}
                  />
                  {searchRange.mid !== -1 && (
                    <div 
                      className="midpoint-indicator" 
                      style={{
                        left: `${searchRange.mid * 72 + 34}px`
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="array-indices">
            {renderArrayIndices()}
          </div>
          
          {/* Search Result */}
          <div className="search-result">
            {searchResult.found ? (
              <p className="result-found">
                <i className="fas fa-check-circle"></i> Target value {targetValue} found at index {searchResult.index}
              </p>
            ) : currentStep === animationHistory.length && animationHistory.length > 0 ? (
              <p className="result-not-found">
                <i className="fas fa-times-circle"></i> Target value {targetValue} not found in the array
              </p>
            ) : null}
          </div>
        </div>
        
        {/* Fixed animation controls */}
        {isSearching && (
          <div className="fixed-controls">
            <button
              onClick={togglePause}
              className="btn btn-primary"
              title={isPaused ? "Resume" : "Pause"}
            >
              <i className={`fas fa-${isPaused ? 'play' : 'pause'}`}></i>
            </button>
            
            <button
              onClick={stepBackward}
              disabled={!isPaused || currentStep <= 1}
              className="btn"
              title="Previous Step"
            >
              <i className="fas fa-step-backward"></i>
            </button>
            
            <button
              onClick={stepForward}
              disabled={!isPaused || currentStep >= totalSteps}
              className="btn"
              title="Next Step"
            >
              <i className="fas fa-step-forward"></i>
            </button>
            
            <button
              onClick={stopAnimation}
              className="btn"
              title="Reset"
            >
              <i className="fas fa-undo"></i>
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
        {/* Algorithm information */}
        <div className="algorithm-info">
          <h2>{algorithm}</h2>
          <p className="algorithm-description">{algorithmInfo[algorithm]?.description}</p>
          <div className="complexity">
            <p><strong>Time Complexity:</strong> {algorithmInfo[algorithm]?.timeComplexity}</p>
            <p><strong>Space Complexity:</strong> {algorithmInfo[algorithm]?.spaceComplexity}</p>
            {algorithmInfo[algorithm]?.note && (
              <p><strong>Note:</strong> {algorithmInfo[algorithm]?.note}</p>
            )}
          </div>
          
          <div className="pseudocode-container">
            <h3>Pseudocode</h3>
            <pre className="pseudocode">
              {algorithmInfo[algorithm]?.pseudocode?.map((line, index) => (
                <div key={index} className="pseudocode-line">{line}</div>
              ))}
            </pre>
          </div>
        </div>
        
        {/* Controls */}
        <div className="searching-controls-container">
          <h3 className="control-section-title">Searching Controls</h3>
          <div className="searching-controls">
            <div className="array-controls">
              <label>Array Size:</label>
              <input
                type="range"
                min="10"
                max="100"
                value={arraySize}
                onChange={(e) => setArraySize(parseInt(e.target.value))}
                disabled={isSearching}
              />
              <span>{arraySize}</span>
              
              <button
                className="search-btn"
                onClick={resetArray}
                disabled={isSearching}
              >
                Generate New Array
              </button>
            </div>
            
            <div className="search-controls">
              <label>Target:</label>
              <input
                type="number"
                value={targetValue || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0 && value <= 100) {
                    setTargetValue(value);
                  }
                }}
                disabled={isSearching}
              />
            </div>
            
            <div className="run-controls">
              <button
                className="search-btn search-btn-primary run-algorithm-btn"
                onClick={runSearchingAlgorithm}
                disabled={isSearching}
              >
                <i className="fas fa-search"></i> Search
              </button>
              
              <div className="speed-control">
                <label>Speed:</label>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  disabled={isSearching && !isPaused}
                  className="speed-select"
                >
                  <option value="10">Slow</option>
                  <option value="50">Medium</option>
                  <option value="90">Fast</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Visualization info/status */}
        {isSearching && (
          <div className="step-details">
            <div className="step-tags">
              <div className="step-number">
                Step {currentStep}/{totalSteps}
              </div>
              {searchResult.found !== null && (
                <div className="step-action">
                  {searchResult.found 
                    ? `Target ${targetValue} found at index ${searchResult.index}` 
                    : `Target ${targetValue} not found`}
                </div>
              )}
            </div>
            <div className="step-explanation">{currentExplanation}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchingVisualizer; 