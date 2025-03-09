import React, { useState, useEffect, useRef } from 'react';
import '../../styles/SortingVisualizer.css';
import { 
  bubbleSort, 
  selectionSort, 
  insertionSort, 
  mergeSort, 
  quickSort 
} from '../../algorithms/sorting';

const SortingVisualizer = ({ algorithm, onAlgorithmRunningChange }) => {
  const [array, setArray] = useState([]);
  const [originalValues, setOriginalValues] = useState([]);
  const [arraySize, setArraySize] = useState(10);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [isSorting, setIsSorting] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [animationHistory, setAnimationHistory] = useState([]);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [showTraceTable, setShowTraceTable] = useState(false);
  const [showCustomArrayModal, setShowCustomArrayModal] = useState(false);
  const [customArrayInput, setCustomArrayInput] = useState('');
  const [customArrayError, setCustomArrayError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const animationTimeoutRef = useRef(null);
  const successMessageTimeoutRef = useRef(null);
  const isPausedRef = useRef(false);
  const customInputRef = useRef(null);

  // UI state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [compactMode, setCompactMode] = useState(false);

  // Algorithm information
  const algorithmInfo = {
    'Bubble Sort': {
      description: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      pseudocode: [
        'for i = 0 to n-1',
        '  for j = 0 to n-i-1',
        '    if array[j] > array[j+1]',
        '      swap(array[j], array[j+1])',
      ],
      explanations: {
        comparison: 'Comparing elements at indices {i} and {j}',
        swap: 'Swapping elements at indices {i} and {j} since {val1} > {val2}',
        noSwap: 'No swap needed since elements are in order ({val1} <= {val2})',
        outerLoop: 'Starting pass {i} through the array',
        complete: 'Sorting complete! The array is now in ascending order.'
      }
    },
    'Selection Sort': {
      description: 'Selection Sort divides the input list into a sorted and unsorted region. It repeatedly finds the minimum element from the unsorted region and moves it to the end of the sorted region.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      pseudocode: [
        'for i = 0 to n-1',
        '  minIndex = i',
        '  for j = i+1 to n',
        '    if array[j] < array[minIndex]',
        '      minIndex = j',
        '  swap(array[i], array[minIndex])',
      ],
      explanations: {
        comparison: 'Comparing elements at indices {i} and {j} to find the minimum',
        newMin: 'Found new minimum value {val} at index {i}',
        swap: 'Moving minimum value {val} to position {i}',
        outerLoop: 'Looking for the minimum element to place at position {i}',
        complete: 'Sorting complete! Each element has been placed in its correct position.'
      }
    },
    'Insertion Sort': {
      description: 'Insertion Sort builds the final sorted array one item at a time. It takes one element from the input data and finds its correct position in the sorted array.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      pseudocode: [
        'for i = 1 to n',
        '  key = array[i]',
        '  j = i - 1',
        '  while j >= 0 and array[j] > key',
        '    array[j+1] = array[j]',
        '    j = j - 1',
        '  array[j+1] = key',
      ],
      explanations: {
        key: 'Current key is {val} at index {i}',
        comparison: 'Comparing key {val1} with element {val2} at index {j}',
        shift: 'Shifting element {val} from index {i} to {j}',
        insert: 'Inserting key {val} at position {i}',
        outerLoop: 'Processing element at index {i}',
        complete: 'Sorting complete! All elements have been inserted in their correct positions.'
      }
    },
    'Merge Sort': {
      description: 'Merge Sort is a divide and conquer algorithm that divides the input array into two halves, recursively sorts them, and then merges the sorted halves.',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      pseudocode: [
        'mergeSort(array, start, end):',
        '  if start < end',
        '    mid = (start + end) / 2',
        '    mergeSort(array, start, mid)',
        '    mergeSort(array, mid+1, end)',
        '    merge(array, start, mid, end)',
      ],
      explanations: {
        divide: 'Dividing array from index {start} to {end}',
        comparison: 'Comparing elements {val1} and {val2}',
        merge: 'Merging subarrays [{start}...{mid}] and [{mid+1}...{end}]',
        copy: 'Copying element {val} to position {i}',
        complete: 'Sorting complete! All subarrays have been merged into one sorted array.'
      }
    },
    'Quick Sort': {
      description: 'Quick Sort is a divide-and-conquer algorithm that works by selecting a "pivot" element and partitioning the array around it, so that elements less than the pivot are on the left, and elements greater are on the right.',
      timeComplexity: 'O(n log n) average, O(n²) worst case',
      spaceComplexity: 'O(log n)',
      pseudocode: [
        'quickSort(array, low, high):',
        '  if low < high',
        '    // Partition the array and get pivot position',
        '    pivotIndex = partition(array, low, high)',
        '    // Recursively sort the sub-arrays',
        '    quickSort(array, low, pivotIndex-1)',
        '    quickSort(array, pivotIndex+1, high)',
        '',
        'partition(array, low, high):',
        '  pivot = array[high]  // Choose last element as pivot',
        '  i = low - 1         // Index of smaller element',
        '  for j = low to high-1',
        '    if array[j] <= pivot',
        '      i++',
        '      swap(array[i], array[j])',
        '  // Put pivot in correct position',
        '  swap(array[i+1], array[high])',
        '  return i+1           // Return pivot position',
      ],
      explanations: {
        pivot: 'Selected element "{val}" at index {i} as the pivot',
        comparison: 'Comparing element {val} with pivot {pivotVal}',
        swap: 'Swapping elements {val1} and {val2} to move smaller elements to the left of the pivot',
        partition: 'Partitioning subarray from index {low} to {high}',
        pivotPlacement: 'Placing pivot "{val}" at its correct position {i}',
        complete: 'Sorting complete! All elements have been correctly positioned around their respective pivots.'
      }
    },
  };

  // Initialize array on component mount
  useEffect(() => {
    generateRandomArray();
    
    return () => {
      // Cleanup timeouts on unmount
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (successMessageTimeoutRef.current) {
        clearTimeout(successMessageTimeoutRef.current);
      }
    };
  }, []);
  
  // Update array when size changes (but only if custom array is not active)
  useEffect(() => {
    // Only regenerate if we're not using a custom array
    if (!customArrayInput) {
      generateRandomArray();
    }
  }, [arraySize]);
  
  // Focus the input field when the custom array modal is shown
  useEffect(() => {
    if (showCustomArrayModal && customInputRef.current) {
      setTimeout(() => {
        customInputRef.current.focus();
      }, 50);
    }
  }, [showCustomArrayModal]);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showCustomArrayModal) {
        closeCustomArrayModal();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCustomArrayModal]);
  
  // Close modal when clicking outside
  const handleModalOutsideClick = (e) => {
    if (e.target.className === 'custom-array-input') {
      closeCustomArrayModal();
    }
  };

  // Show custom array modal
  const openCustomArrayModal = () => {
    // Stop any ongoing animations
    if (isSorting) {
      stopAnimation();
    }
    
    setShowCustomArrayModal(true);
    setCustomArrayError('');
  };
  
  // Hide custom array modal
  const closeCustomArrayModal = () => {
    setShowCustomArrayModal(false);
  };
  
  // Handle custom array input change
  const handleCustomArrayChange = (e) => {
    setCustomArrayInput(e.target.value);
    setCustomArrayError('');
  };
  
  // Parse and validate a custom array input
  const parseCustomArray = (input) => {
    try {
      // Clean input: keep only numbers, commas, spaces, dots, and minus signs
      const cleanInput = input.replace(/[^\d,.\s-]/g, '');
      
      // Split by comma or space
      const values = cleanInput.split(/[\s,]+/).filter(val => val.trim() !== '');
      
      if (values.length === 0) {
        throw new Error('Please enter at least one number');
      }
      
      if (values.length > 100) {
        throw new Error('Array size cannot exceed 100 elements');
      }
      
      // Convert to numbers
      const numbers = values.map(val => {
        const num = Number(val);
        if (isNaN(num)) {
          throw new Error(`Invalid number: ${val}`);
        }
        return num;
      });
      
      return {
        success: true,
        numbers,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        numbers: [],
        error: error.message
      };
    }
  };
  
  // Apply a custom array
  const applyCustomArray = () => {
    // Parse and validate the input
    const result = parseCustomArray(customArrayInput);
    
    if (!result.success) {
      setCustomArrayError(result.error);
      return;
    }
    
    const numberArray = result.numbers;
    
    // Get min and max values for scaling
    const minValue = Math.min(...numberArray);
    const maxValue = Math.max(...numberArray);
    
    // Create scaled array for visualization
    let scaledArray;
    
    if (maxValue === minValue) {
      // If all values are the same, use a fixed height
      scaledArray = numberArray.map(() => 200);
    } else {
      // Scale between 50 and 400px
      scaledArray = numberArray.map(num => {
        const normalized = (num - minValue) / (maxValue - minValue);
        return Math.round(normalized * 350 + 50);
      });
    }
    
    // Reset animation state
    setIsSorting(false);
    setIsSorted(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setCurrentStep(0);
    setTotalSteps(0);
    setAnimationHistory([]);
    
    // Update arrays
    setArray(scaledArray);
    setOriginalValues([...numberArray]);
    setArraySize(numberArray.length);
    
    // Close modal and show success message
    setShowCustomArrayModal(false);
    showSuccessMessage(`Custom array applied successfully! Ready to run ${algorithm}.`);
  };
  
  // Show a temporary success message
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    
    if (successMessageTimeoutRef.current) {
      clearTimeout(successMessageTimeoutRef.current);
    }
    
    successMessageTimeoutRef.current = setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // Reset custom array
  const resetCustomArray = () => {
    setCustomArrayInput('');
    setCustomArrayError('');
    generateRandomArray();
    setShowCustomArrayModal(false);
  };

  // Generate a random array
  const generateRandomArray = () => {
    const newArray = [];
    const origValues = [];
    
    for (let i = 0; i < arraySize; i++) {
      // Generate values between 5 and 100 for original values
      const value = Math.floor(Math.random() * 96) + 5;
      origValues.push(value);
      
      // Scale for visualization (between 50 and 400px)
      newArray.push(Math.floor((value / 100) * 350) + 50);
    }
    
    setArray(newArray);
    setOriginalValues(origValues);
    setIsSorted(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setCurrentStep(0);
    setTotalSteps(0);
    setAnimationHistory([]);
    setCurrentExplanation('');
  };

  // Generate explanation for the current animation step
  const generateExplanation = (actionType, actionParams, algorithm) => {
    const explanations = algorithmInfo[algorithm]?.explanations || {};
    
    if (!actionType) return '';
    
    let explanation = explanations[actionType] || '';
    
    if (actionParams) {
      // Replace placeholders like {i}, {val}, etc. with actual values
      Object.keys(actionParams).forEach(key => {
        explanation = explanation.replace(new RegExp(`\\{${key}\\}`, 'g'), actionParams[key]);
      });
    }
    
    return explanation || `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`;
  };

  // Run the selected sorting algorithm
  const runSortingAlgorithm = () => {
    if (isSorting) return;
    
    setIsSorting(true);
    setIsPaused(false);
    isPausedRef.current = false;
    setIsSorted(false);
    setCurrentStep(0);
    
    // Get a fresh copy of the array
    const arrayCopy = [...array];
    const originalValuesCopy = [...originalValues];
    
    // Run the selected algorithm
    let animations = [];
    
    switch (algorithm) {
      case 'Bubble Sort':
        animations = bubbleSort(arrayCopy, originalValuesCopy);
        break;
      case 'Selection Sort':
        animations = selectionSort(arrayCopy, originalValuesCopy);
        break;
      case 'Insertion Sort':
        animations = insertionSort(arrayCopy, originalValuesCopy);
        break;
      case 'Merge Sort':
        animations = mergeSort(arrayCopy, originalValuesCopy);
        break;
      case 'Quick Sort':
        animations = quickSort(arrayCopy, originalValuesCopy);
        break;
      default:
        setIsSorting(false);
        return;
    }
    
    setAnimationHistory(animations);
    setTotalSteps(animations.length);
    
    // Start animation
    animateSort(animations, 0);
  };

  // Animate the sorting algorithm
  const animateSort = (animations, step) => {
    if (step >= animations.length) {
      setIsSorting(false);
      setIsSorted(true);
      setCurrentStep(animations.length);
      return;
    }
    
    if (isPausedRef.current) {
      return;
    }
    
    const animation = animations[step];
    const [newArray, comparison, swap, actionType, actionParams, newOrigValues] = animation;
    
    // Update the array state
    setArray([...newArray]);
    
    // Update original values if available
    if (newOrigValues) {
      setOriginalValues([...newOrigValues]);
    }
    
    // Update current step
    setCurrentStep(step + 1);
    
    // Generate explanation for this step
    let explanation = '';
    if (actionType) {
      explanation = generateExplanation(actionType, actionParams, algorithm);
    } else if (swap.length === 2) {
      explanation = `Swapping elements at indices ${swap[0]} and ${swap[1]}`;
    } else if (comparison.length === 2) {
      explanation = `Comparing elements at indices ${comparison[0]} and ${comparison[1]}`;
    }
    
    setCurrentExplanation(explanation);
    
    // If this is the last step or the action type is 'complete', mark as sorted
    if (step === animations.length - 1 || actionType === 'complete') {
      setIsSorting(false);
      setIsSorted(true);
      return;
    }
    
    // Schedule the next animation step with appropriate delay based on action type
    const speed = 101 - animationSpeed; // Invert the speed so higher value = faster
    let delay = speed * 10;
    
    // For Quick Sort, use custom delays for different actions
    if (algorithm === 'Quick Sort') {
      switch (actionType) {
        case 'partition':
          delay = speed * 15; // Longer delay for partition step
          break;
        case 'pivot':
          delay = speed * 20; // Even longer delay for pivot selection
          break;
        case 'pivotPlacement':
          delay = speed * 20; // Longer delay for final pivot placement
          break;
        case 'swap':
          delay = speed * 12; // Slightly longer for swaps
          break;
        default:
          delay = speed * 10;
      }
    }
    
    animationTimeoutRef.current = setTimeout(() => {
      animateSort(animations, step + 1);
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
          animateSort(animationHistory, currentStep);
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
      const animation = animationHistory[currentStep];
      const [arrayState, comparison, swap, actionType, actionParams, updatedOriginals] = animation;
      
      setArray([...arrayState]);
      
      // If we have updated original values, use them
      if (updatedOriginals) {
        setOriginalValues([...updatedOriginals]);
      }
      
      // Generate explanation for this step
      let explanation = '';
      if (actionType) {
        explanation = generateExplanation(actionType, actionParams, algorithm);
      } else if (swap.length === 2) {
        explanation = `Swapping elements at indices ${swap[0]} and ${swap[1]}`;
      } else if (comparison.length === 2) {
        explanation = `Comparing elements at indices ${comparison[0]} and ${comparison[1]}`;
      }
      
      setCurrentExplanation(explanation);
      setCurrentStep(currentStep + 1);
    }
  };

  // Step backward in the animation
  const stepBackward = () => {
    if (currentStep > 1 && isPaused) {
      const animation = animationHistory[currentStep - 2];
      const [arrayState, comparison, swap, actionType, actionParams, updatedOriginals] = animation;
      
      setArray([...arrayState]);
      
      // If we have updated original values, use them
      if (updatedOriginals) {
        setOriginalValues([...updatedOriginals]);
      }
      
      // Generate explanation for this step
      let explanation = '';
      if (actionType) {
        explanation = generateExplanation(actionType, actionParams, algorithm);
      } else if (swap.length === 2) {
        explanation = `Swapping elements at indices ${swap[0]} and ${swap[1]}`;
      } else if (comparison.length === 2) {
        explanation = `Comparing elements at indices ${comparison[0]} and ${comparison[1]}`;
      }
      
      setCurrentExplanation(explanation);
      setCurrentStep(currentStep - 1);
    }
  };

  // Stop the animation
  const stopAnimation = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setIsSorting(false);
    setIsPaused(false);
    isPausedRef.current = false;
  };

  // Reset the array to random values
  const resetArray = () => {
    stopAnimation();
    setCustomArrayInput('');
    generateRandomArray();
  };

  // Toggle trace table visibility
  const toggleTraceTable = () => {
    setShowTraceTable(!showTraceTable);
  };

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
   * Update the canvas/container size based on the current layout
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

  // Render control panel with improved layout
  const renderControls = () => {
    return (
      <div className="sorting-controls-container">
        <h3 className="control-section-title">Sorting Controls</h3>
        <div className="sorting-controls">
          <div className="array-controls">
            <label>Array Size:</label>
            <input
              type="range"
              min="10"
              max="100"
              value={arraySize}
              onChange={(e) => setArraySize(parseInt(e.target.value))}
              disabled={isSorting || showCustomArrayModal}
            />
            <span>{arraySize}</span>
            
            <button
              className="btn btn-secondary"
              onClick={resetArray}
              disabled={isSorting || showCustomArrayModal}
            >
              Generate New Array
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={openCustomArrayModal}
              disabled={isSorting}
            >
              Custom Array
            </button>
          </div>
          
          <div className="algorithm-controls">
            <label>Speed:</label>
            <input
              type="range"
              min="1"
              max="100"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              disabled={isSorting && !isPaused}
            />
            <span>{animationSpeed}</span>
          </div>
          
          <div className="run-controls">
            <button
              className="btn btn-primary run-algorithm-btn"
              onClick={runSortingAlgorithm}
              disabled={isSorting || isSorted}
            >
              Run {algorithm}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render algorithm info panel
  const renderAlgorithmInfo = () => {
    return (
      <div className="algorithm-info">
        <h2>{algorithm}</h2>
        <p className="algorithm-description">{algorithmInfo[algorithm]?.description}</p>
        <div className="complexity">
          <p><strong>Time Complexity:</strong> {algorithmInfo[algorithm]?.timeComplexity}</p>
          <p><strong>Space Complexity:</strong> {algorithmInfo[algorithm]?.spaceComplexity}</p>
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
    );
  };

  // Update parent component when sorting state changes
  useEffect(() => {
    if (onAlgorithmRunningChange) {
      onAlgorithmRunningChange(isSorting);
    }
  }, [isSorting, onAlgorithmRunningChange]);

  // Main render
  return (
    <div className={`sorting-visualizer ${compactMode ? 'compact-mode' : ''}`}>
      <div className="sorting-container">
        {/* Array visualization */}
        <div className="array-container1 array-container">
          
          {/* Success message */}
          {successMessage && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i> {successMessage}
            </div>
          )}
          
          {/* Array bars */}
          {array.map((value, idx) => {
            let className = 'array-bar';
            
            // Mark array as sorted if complete
            if (isSorted) {
              className += ' sorted';
              return (
                <div 
                  className={className} 
                  key={idx}
                  style={{ 
                    height: `${value}px`,
                    width: `${Math.max(8, Math.min(50, Math.floor(1000 / array.length)))}px`
                  }}
                  data-value={originalValues[idx]}
                  data-index={idx}
                ></div>
              );
            }
            
            // Get current animation for styling
            const currentAnimation = animationHistory[currentStep - 1];
            
            // Get the original value for this bar
            let originalVal = originalValues[idx];
            
            // If we're in the middle of an animation, use the updated original values
            if (currentAnimation && currentAnimation.length > 5) {
              const [, comparison, swap, actionType, actionParams, updatedOriginals] = currentAnimation;
              
              if (updatedOriginals && updatedOriginals.length > idx) {
                originalVal = updatedOriginals[idx];
              }
              
              // Mark elements being compared
              if (comparison.includes(idx)) {
                className += ' comparing';
              }
              
              // Mark elements being swapped
              if (swap.includes(idx)) {
                className += ' swapping';
              }
              
              // Add special styling for Quick Sort
              if (algorithm === 'Quick Sort') {
                // Highlight the current pivot
                if (actionType === 'pivot' && actionParams?.i === idx) {
                  className += ' pivot';
                }
                
                // Highlight elements in the current partition
                if (actionType === 'partition') {
                  if (idx >= actionParams?.low && idx <= actionParams?.high) {
                    className += ' partitioning';
                  }
                }
                
                // Highlight the final position of a pivot
                if (actionType === 'pivotPlacement' && actionParams?.i === idx) {
                  className += ' pivot-final';
                }
                
                // For comparison, make it clearer which element is being compared with the pivot
                if (actionType === 'comparison' && comparison.length === 2) {
                  // The element being compared (not the pivot)
                  if (idx === comparison[0]) {
                    className += ' comparing';
                  }
                  // The pivot element
                  if (idx === comparison[1]) {
                    className += ' pivot';
                  }
                }
              }
            }
            
            const displayValue = originalVal !== undefined ? originalVal : value;
            
            return (
              <div 
                className={className} 
                key={idx}
                style={{ 
                  height: `${value}px`,
                  width: `${Math.max(8, Math.min(50, Math.floor(1000 / array.length)))}px`
                }}
                data-value={displayValue}
                data-index={idx}
              ></div>
            );
          })}
        </div>
        
        {/* Fixed animation controls */}
        {isSorting && (
          <div className="fixed-controls">
            <button
              onClick={togglePause}
              className="btn-primary"
              title={isPaused ? "Resume" : "Pause"}
            >
              <i className={`fas fa-${isPaused ? 'play' : 'pause'}`}></i>
            </button>
            
            <button
              onClick={stepBackward}
              disabled={!isPaused || currentStep <= 0}
              className="btn-secondary"
              title="Previous Step"
            >
              <i className="fas fa-step-backward"></i>
            </button>
            
            <button
              onClick={stepForward}
              disabled={!isPaused || currentStep >= animationHistory.length}
              className="btn-secondary"
              title="Next Step"
            >
              <i className="fas fa-step-forward"></i>
            </button>
            
            <button
              onClick={stopAnimation}
              className="btn-secondary"
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
        {renderAlgorithmInfo()}
        
        {/* Controls */}
        {renderControls()}
        
        {/* Visualization info/status */}
        {isSorting && (
          <div className="step-details">
            <div className="step-tags">
              <div className="step-number">
                Step {currentStep}/{totalSteps}
              </div>
              <div className="step-action">{currentExplanation}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Custom Array Modal */}
      {showCustomArrayModal && (
        <div className="custom-array-modal" onClick={handleModalOutsideClick}>
          <div className="card" onClick={e => e.stopPropagation()}>
            <h3>Enter Custom Array</h3>
            <div className="input-container">
              <input
                type="text"
                value={customArrayInput}
                onChange={handleCustomArrayChange}
                placeholder="Enter comma or space separated numbers (e.g. 5, 3, 8, 1, 9)"
                className={customArrayError ? 'input-error' : ''}
                ref={customInputRef}
                autoFocus
              />
              
              {customArrayError && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i> {customArrayError}
                </div>
              )}
              
              <div className="help-text">
                <p><strong>Guidelines:</strong></p>
                <ul>
                  <li>Enter numbers separated by commas or spaces</li>
                  <li>Maximum 100 numbers allowed</li>
                  <li>Numbers will be visualized as bar heights</li>
                  <li>Custom array can be used with any sorting algorithm</li>
                </ul>
                <p>Current Algorithm: <strong>{algorithm}</strong></p>
              </div>
              
              <div className="modal-actions">
                <button onClick={applyCustomArray} className="btn-primary">Apply</button>
                <button onClick={resetCustomArray} className="btn-secondary">Reset</button>
                <button onClick={closeCustomArrayModal} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortingVisualizer; 