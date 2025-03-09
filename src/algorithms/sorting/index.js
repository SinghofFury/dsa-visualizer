// Helper function to create a snapshot of the array state
const createSnapshot = (array, comparison = [], swap = [], actionType = null, actionParams = null, originalValues = null) => {
  return [array.slice(), comparison, swap, actionType, actionParams, originalValues ? originalValues.slice() : null];
};

// Bubble Sort
export const bubbleSort = (array, originalValues) => {
  const animations = [];
  const arrayCopy = [...array];
  const origValuesCopy = originalValues ? [...originalValues] : [...array];
  const n = arrayCopy.length;
  
  for (let i = 0; i < n - 1; i++) {
    // Add outer loop animation
    animations.push(createSnapshot(
      arrayCopy, 
      [], 
      [], 
      'outerLoop', 
      {i: i},
      origValuesCopy
    ));
    
    for (let j = 0; j < n - i - 1; j++) {
      // Add comparison animation
      animations.push(createSnapshot(
        arrayCopy, 
        [j, j + 1], 
        [],
        'comparison',
        {i: j, j: j+1, val1: origValuesCopy[j], val2: origValuesCopy[j+1]},
        origValuesCopy
      ));
      
      if (arrayCopy[j] > arrayCopy[j + 1]) {
        // Swap elements
        [arrayCopy[j], arrayCopy[j + 1]] = [arrayCopy[j + 1], arrayCopy[j]];
        [origValuesCopy[j], origValuesCopy[j + 1]] = [origValuesCopy[j + 1], origValuesCopy[j]];
        
        // Add swap animation
        animations.push(createSnapshot(
          arrayCopy, 
          [j, j + 1], 
          [j, j + 1],
          'swap',
          {i: j, j: j+1, val1: origValuesCopy[j], val2: origValuesCopy[j+1]},
          origValuesCopy
        ));
      } else {
        // No swap needed
        animations.push(createSnapshot(
          arrayCopy, 
          [j, j + 1],
          [],
          'noSwap',
          {i: j, j: j+1, val1: origValuesCopy[j], val2: origValuesCopy[j+1]},
          origValuesCopy
        ));
      }
    }
  }
  
  // Add final sorted animation
  animations.push(createSnapshot(
    arrayCopy, 
    [], 
    [],
    'complete',
    {},
    origValuesCopy
  ));
  
  return animations;
};

// Selection Sort
export const selectionSort = (array, originalValues) => {
  const animations = [];
  const arrayCopy = [...array];
  const origValuesCopy = originalValues ? [...originalValues] : [...array];
  const n = arrayCopy.length;
  
  for (let i = 0; i < n - 1; i++) {
    // Add outer loop animation
    animations.push(createSnapshot(
      arrayCopy, 
      [], 
      [], 
      'outerLoop', 
      {i: i},
      origValuesCopy
    ));
    
    let minIndex = i;
    
    // Find the minimum element in the unsorted part
    for (let j = i + 1; j < n; j++) {
      // Add comparison animation
      animations.push(createSnapshot(
        arrayCopy, 
        [minIndex, j], 
        [],
        'comparison',
        {i: minIndex, j: j, val1: origValuesCopy[minIndex], val2: origValuesCopy[j]},
        origValuesCopy
      ));
      
      if (arrayCopy[j] < arrayCopy[minIndex]) {
        // Update minimum index
        const oldMinIndex = minIndex;
        minIndex = j;
        
        // Add new minimum animation
        animations.push(createSnapshot(
          arrayCopy, 
          [oldMinIndex, minIndex], 
          [],
          'newMin',
          {oldMinIndex: oldMinIndex, newMinIndex: minIndex, val: origValuesCopy[minIndex]},
          origValuesCopy
        ));
      }
    }
    
    // Swap the minimum element with the first element of the unsorted part
    if (minIndex !== i) {
      [arrayCopy[i], arrayCopy[minIndex]] = [arrayCopy[minIndex], arrayCopy[i]];
      [origValuesCopy[i], origValuesCopy[minIndex]] = [origValuesCopy[minIndex], origValuesCopy[i]];
      
      // Add swap animation
      animations.push(createSnapshot(
        arrayCopy, 
        [i, minIndex], 
        [i, minIndex],
        'swap',
        {i: i, minIndex: minIndex, val1: origValuesCopy[i], val2: origValuesCopy[minIndex]},
        origValuesCopy
      ));
    }
  }
  
  // Add final sorted animation
  animations.push(createSnapshot(
    arrayCopy, 
    [], 
    [],
    'complete',
    {},
    origValuesCopy
  ));
  
  return animations;
};

// Insertion Sort
export const insertionSort = (array, originalValues) => {
  const animations = [];
  const arrayCopy = [...array];
  const origValuesCopy = originalValues ? [...originalValues] : [...array];
  const n = arrayCopy.length;
  
  for (let i = 1; i < n; i++) {
    // Add outer loop animation
    animations.push(createSnapshot(
      arrayCopy, 
      [], 
      [], 
      'outerLoop', 
      {i: i},
      origValuesCopy
    ));
    
    const key = arrayCopy[i];
    const keyOrig = origValuesCopy[i];
    
    // Add key selection animation
    animations.push(createSnapshot(
      arrayCopy, 
      [i], 
      [],
      'key',
      {i: i, val: keyOrig},
      origValuesCopy
    ));
    
    let j = i - 1;
    
    // Move elements greater than key to one position ahead
    while (j >= 0 && arrayCopy[j] > key) {
      // Add comparison animation
      animations.push(createSnapshot(
        arrayCopy, 
        [j, j + 1], 
        [],
        'comparison',
        {j: j, i: j+1, val1: origValuesCopy[j], val2: keyOrig},
        origValuesCopy
      ));
      
      // Shift element
      arrayCopy[j + 1] = arrayCopy[j];
      origValuesCopy[j + 1] = origValuesCopy[j];
      
      // Add shift animation
      animations.push(createSnapshot(
        arrayCopy, 
        [j, j + 1], 
        [j, j + 1],
        'shift',
        {from: j, to: j+1, val: origValuesCopy[j]},
        origValuesCopy
      ));
      
      j--;
    }
    
    // Place key in its correct position
    arrayCopy[j + 1] = key;
    origValuesCopy[j + 1] = keyOrig;
    
    // Add insert animation
    animations.push(createSnapshot(
      arrayCopy, 
      [j + 1], 
      [],
      'insert',
      {i: j+1, val: keyOrig},
      origValuesCopy
    ));
  }
  
  // Add final sorted animation
  animations.push(createSnapshot(
    arrayCopy, 
    [], 
    [],
    'complete',
    {},
    origValuesCopy
  ));
  
  return animations;
};

// Merge Sort
export const mergeSort = (array, originalValues) => {
  const animations = [];
  const arrayCopy = [...array];
  const origValuesCopy = originalValues ? [...originalValues] : [...array];
  
  // Helper function to merge two sorted subarrays
  const merge = (arr, orig, left, mid, right) => {
    const leftSize = mid - left + 1;
    const rightSize = right - mid;
    
    // Create temporary arrays
    const leftArray = [];
    const rightArray = [];
    const leftOrigArray = [];
    const rightOrigArray = [];
    
    // Copy data to temporary arrays
    for (let i = 0; i < leftSize; i++) {
      leftArray[i] = arr[left + i];
      leftOrigArray[i] = orig[left + i];
    }
    
    for (let j = 0; j < rightSize; j++) {
      rightArray[j] = arr[mid + 1 + j];
      rightOrigArray[j] = orig[mid + 1 + j];
    }
    
    // Add subarrays animation
    animations.push(createSnapshot(
      arr, 
      [], 
      [],
      'subarrays',
      {left: left, mid: mid, right: right, leftArray: [...leftOrigArray], rightArray: [...rightOrigArray]},
      orig
    ));
    
    // Merge the temporary arrays back into arr[left..right]
    let i = 0; // Initial index of first subarray
    let j = 0; // Initial index of second subarray
    let k = left; // Initial index of merged subarray
    
    while (i < leftSize && j < rightSize) {
      // Add comparison animation
      animations.push(createSnapshot(
        arr, 
        [left + i, mid + 1 + j], 
        [],
        'comparison',
        {i: left + i, j: mid + 1 + j, val1: leftOrigArray[i], val2: rightOrigArray[j]},
        orig
      ));
      
      if (leftArray[i] <= rightArray[j]) {
        // Place from left array
        arr[k] = leftArray[i];
        orig[k] = leftOrigArray[i];
        
        // Add place animation
        animations.push(createSnapshot(
          arr, 
          [k], 
          [k],
          'place',
          {from: 'left', index: i, to: k, val: leftOrigArray[i]},
          orig
        ));
        
        i++;
      } else {
        // Place from right array
        arr[k] = rightArray[j];
        orig[k] = rightOrigArray[j];
        
        // Add place animation
        animations.push(createSnapshot(
          arr, 
          [k], 
          [k],
          'place',
          {from: 'right', index: j, to: k, val: rightOrigArray[j]},
          orig
        ));
        
        j++;
      }
      k++;
    }
    
    // Copy the remaining elements of leftArray[], if any
    while (i < leftSize) {
      arr[k] = leftArray[i];
      orig[k] = leftOrigArray[i];
      
      // Add place animation
      animations.push(createSnapshot(
        arr, 
        [k], 
        [k],
        'place',
        {from: 'left', index: i, to: k, val: leftOrigArray[i]},
        orig
      ));
      
      i++;
      k++;
    }
    
    // Copy the remaining elements of rightArray[], if any
    while (j < rightSize) {
      arr[k] = rightArray[j];
      orig[k] = rightOrigArray[j];
      
      // Add place animation
      animations.push(createSnapshot(
        arr, 
        [k], 
        [k],
        'place',
        {from: 'right', index: j, to: k, val: rightOrigArray[j]},
        orig
      ));
      
      j++;
      k++;
    }
  };
  
  // Helper function to implement merge sort recursively
  const mergeSortHelper = (arr, orig, left, right) => {
    if (left < right) {
      // Add divide animation
      animations.push(createSnapshot(
        arr, 
        [], 
        [],
        'divide',
        {left: left, right: right},
        orig
      ));
      
      // Find the middle point
      const mid = Math.floor((left + right) / 2);
      
      // Sort first and second halves
      mergeSortHelper(arr, orig, left, mid);
      mergeSortHelper(arr, orig, mid + 1, right);
      
      // Merge the sorted halves
      merge(arr, orig, left, mid, right);
      
      // Add merge animation
      animations.push(createSnapshot(
        arr, 
        [], 
        [],
        'merge',
        {left: left, mid: mid, right: right},
        orig
      ));
    }
  };
  
  // Start the merge sort process
  mergeSortHelper(arrayCopy, origValuesCopy, 0, arrayCopy.length - 1);
  
  // Add final sorted animation
  animations.push(createSnapshot(
    arrayCopy, 
    [], 
    [],
    'complete',
    {},
    origValuesCopy
  ));
  
  return animations;
};

// Quick Sort
export const quickSort = (array, originalValues) => {
  const animations = [];
  const arrayCopy = [...array];
  const origValuesCopy = originalValues ? [...originalValues] : [...array];
  
  // Helper function to perform partition
  const partition = (arr, orig, low, high) => {
    // Choose the rightmost element as pivot
    const pivot = arr[high];
    const pivotOrig = orig[high];
    
    // Add pivot selection animation
    animations.push(createSnapshot(
      arr, 
      [high], 
      [],
      'pivot',
      {index: high, val: pivotOrig},
      orig
    ));
    
    // Index of smaller element
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      // Add comparison animation
      animations.push(createSnapshot(
        arr, 
        [j, high], 
        [],
        'comparison',
        {j: j, pivot: high, val1: orig[j], val2: pivotOrig},
        orig
      ));
      
      // If current element is smaller than the pivot
      if (arr[j] < pivot) {
        i++;
        
        // Swap arr[i] and arr[j]
        [arr[i], arr[j]] = [arr[j], arr[i]];
        [orig[i], orig[j]] = [orig[j], orig[i]];
        
        // Add swap animation
        animations.push(createSnapshot(
          arr, 
          [i, j], 
          [i, j],
          'swap',
          {i: i, j: j, val1: orig[i], val2: orig[j]},
          orig
        ));
      }
    }
    
    // Swap arr[i+1] and arr[high] (put the pivot element in its correct position)
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    [orig[i + 1], orig[high]] = [orig[high], orig[i + 1]];
    
    // Add pivot placement animation
    animations.push(createSnapshot(
      arr, 
      [i + 1, high], 
      [i + 1, high],
      'place-pivot',
      {from: high, to: i + 1, val: pivotOrig},
      orig
    ));
    
    return i + 1; // Return the partitioning index
  };
  
  // Helper function to implement quick sort recursively
  const quickSortHelper = (arr, orig, low, high) => {
    if (low < high) {
      // Add divide animation
      animations.push(createSnapshot(
        arr, 
        [], 
        [],
        'divide',
        {low: low, high: high},
        orig
      ));
      
      // Find the partitioning index
      const pi = partition(arr, orig, low, high);
      
      // Add partitioned animation
      animations.push(createSnapshot(
        arr, 
        [], 
        [],
        'partitioned',
        {low: low, high: high, pi: pi},
        orig
      ));
      
      // Sort elements before and after partition
      quickSortHelper(arr, orig, low, pi - 1);
      quickSortHelper(arr, orig, pi + 1, high);
    }
  };
  
  // Start the quick sort process
  quickSortHelper(arrayCopy, origValuesCopy, 0, arrayCopy.length - 1);
  
  // Add final sorted animation
  animations.push(createSnapshot(
    arrayCopy, 
    [], 
    [],
    'complete',
    {},
    origValuesCopy
  ));
  
  return animations;
}; 