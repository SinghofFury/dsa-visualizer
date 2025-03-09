// Add Exponential Search implementation
export const exponentialSearch = (arr, target) => {
  const animations = [];
  const n = arr.length;
  
  animations.push([[], `Starting exponential search for target value ${target}`, 'start', {}]);
  
  // If array is empty
  if (n === 0) {
    animations.push([[], 'Array is empty. Target cannot be found.', 'not-found', {}]);
    return animations;
  }
  
  // If first element is the target
  animations.push([[0], `Checking if first element ${arr[0]} equals target ${target}`, 'compare', { index: 0 }]);
  if (arr[0] === target) {
    animations.push([[0], `Target ${target} found at index 0!`, 'found', { index: 0 }]);
    return animations;
  }
  
  // Find range for binary search by doubling index
  let i = 1;
  while (i < n && arr[i] <= target) {
    animations.push([[i], `Checking exponential bound at index ${i} (value ${arr[i]})`, 'exponential-check', { index: i, bound: i }]);
    
    // If target found during range finding
    if (arr[i] === target) {
      animations.push([[i], `Target ${target} found at index ${i}!`, 'found', { index: i }]);
      return animations;
    }
    
    // Double i for next check
    const prevI = i;
    i = i * 2;
    animations.push([[], `Doubling index from ${prevI} to ${Math.min(i, n-1)}`, 'double', { prev: prevI, next: Math.min(i, n-1) }]);
  }
  
  // Set binary search range for the exponential search
  const low = Math.floor(i / 2);
  const high = Math.min(i, n - 1);
  animations.push([[], `Found range [${low}...${high}] for binary search`, 'set-range', { low: low, high: high }]);
  
  // Perform binary search in the found range
  return binarySearchForExponential(arr, target, low, high, animations);
};

// Helper function for binary search within a specific range (used by Exponential Search)
const binarySearchForExponential = (arr, target, low, high, animations) => {
  let start = low;
  let end = high;
  
  // Only keep track of the array range being searched
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    animations.push([[mid], `Binary search in range [${start}...${end}]. Checking if ${arr[mid]} equals target ${target}`, 'compare', { low: start, high: end, mid: mid }]);
    
    // Found target
    if (arr[mid] === target) {
      animations.push([[mid], `Target ${target} found at index ${mid}!`, 'found', { index: mid }]);
      return animations;
    } 
    // Target is in the left half
    else if (arr[mid] > target) {
      animations.push([[], `${arr[mid]} > ${target}, search left half [${start}...${mid-1}]`, 'narrowLeft', { low: start, high: mid - 1, mid: mid }]);
      end = mid - 1;
    } 
    // Target is in the right half
    else {
      animations.push([[], `${arr[mid]} < ${target}, search right half [${mid+1}...${end}]`, 'narrowRight', { low: mid + 1, high: end, mid: mid }]);
      start = mid + 1;
    }
  }
  
  // Target not found
  animations.push([[], `Target ${target} not found in the array range [${low}...${high}]`, 'not-found', {}]);
  return animations;
};

// Linear Search algorithm
export const linearSearch = (arr, target) => {
  const animations = [];
  const n = arr.length;
  
  animations.push([[], `Starting linear search for target value ${target}`, 'start', {}]);
  
  for (let i = 0; i < n; i++) {
    // Highlight current element being checked
    animations.push([[i], `Checking element at index ${i} (value ${arr[i]})`, 'checking', { i }]);
    
    // If found
    if (arr[i] === target) {
      animations.push([[i], `Target ${target} found at index ${i}!`, 'found', { index: i }]);
      return animations;
    }
    
    // If not found, continue
    if (i < n - 1) {
      animations.push([[], `Element at index ${i} is not the target, continuing...`, 'continue', { i }]);
    }
  }
  
  // Target not found after checking all elements
  animations.push([[], `Target ${target} not found in the array`, 'not-found', {}]);
  return animations;
};

// Binary Search algorithm
export const binarySearch = (arr, target) => {
  const animations = [];
  let low = 0;
  let high = arr.length - 1;
  
  animations.push([[], `Starting binary search with range [${low}...${high}]`, 'start', { low, high }]);
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    
    // Calculate midpoint
    animations.push([[mid], `Calculating midpoint at index ${mid} (value ${arr[mid]})`, 'compare', { low, high, mid }]);
    
    // If found
    if (arr[mid] === target) {
      animations.push([[mid], `Target ${target} found at index ${mid}!`, 'found', { index: mid }]);
      return animations;
    }
    
    // If target is in the left half
    if (arr[mid] > target) {
      animations.push([[], `${arr[mid]} > ${target}, narrowing search to left half [${low}...${mid-1}]`, 'narrowLeft', { low, high: mid - 1, mid }]);
      high = mid - 1;
    } 
    // If target is in the right half
    else {
      animations.push([[], `${arr[mid]} < ${target}, narrowing search to right half [${mid+1}...${high}]`, 'narrowRight', { low: mid + 1, high, mid }]);
      low = mid + 1;
    }
  }
  
  // Target not found
  animations.push([[], `Target ${target} not found in the array`, 'not-found', {}]);
  return animations;
};

// Jump Search algorithm
export const jumpSearch = (arr, target) => {
  const animations = [];
  const n = arr.length;
  
  // Calculate block size
  const blockSize = Math.floor(Math.sqrt(n));
  
  animations.push([[], `Starting jump search with block size ${blockSize}`, 'start', { blockSize }]);
  
  // Find the block where the target may be present
  let prev = 0;
  let step = blockSize;
  
  while (prev < n && arr[Math.min(step, n) - 1] < target) {
    animations.push([[Math.min(step, n) - 1], `Checking if ${arr[Math.min(step, n) - 1]} < ${target} at index ${Math.min(step, n) - 1}`, 'jump', { prev, index: Math.min(step, n) - 1 }]);
    
    prev = step;
    step += blockSize;
    
    if (prev >= n) {
      animations.push([[], `Reached the end of the array, target not found`, 'not-found', {}]);
      return animations;
    }
  }
  
  // Perform linear search within the identified block
  animations.push([[], `Starting linear search from index ${prev} to ${Math.min(step, n) - 1}`, 'linear', { prev, end: Math.min(step, n) - 1 }]);
  
  for (let i = prev; i < Math.min(step, n); i++) {
    animations.push([[i], `Checking element at index ${i} (value ${arr[i]})`, 'checking', { i }]);
    
    // If found
    if (arr[i] === target) {
      animations.push([[i], `Target ${target} found at index ${i}!`, 'found', { index: i }]);
      return animations;
    }
    
    // If not the last element in the block, continue
    if (i < Math.min(step, n) - 1) {
      animations.push([[], `Element at index ${i} is not the target, continuing...`, 'continue', { i }]);
    }
  }
  
  // Target not found
  animations.push([[], `Target ${target} not found in the array`, 'not-found', {}]);
  return animations;
};

// Interpolation Search algorithm
export const interpolationSearch = (arr, target) => {
  const animations = [];
  let low = 0;
  let high = arr.length - 1;
  
  animations.push([[], `Starting interpolation search with range [${low}...${high}]`, 'start', { low, high }]);
  
  while (low <= high && target >= arr[low] && target <= arr[high]) {
    // If there's only one element
    if (low === high) {
      animations.push([[low], `Only one element left at index ${low} (value ${arr[low]})`, 'compare', { low, high, pos: low }]);
      
      if (arr[low] === target) {
        animations.push([[low], `Target ${target} found at index ${low}!`, 'found', { index: low }]);
        return animations;
      }
      
      animations.push([[], `Target ${target} not found in the array`, 'not-found', {}]);
      return animations;
    }
    
    // Calculate position using interpolation formula
    const pos = low + Math.floor(
      ((high - low) / (arr[high] - arr[low])) * (target - arr[low])
    );
    
    // Ensure pos is within bounds
    const validPos = Math.min(Math.max(pos, low), high);
    
    animations.push([[validPos], `Calculating position at index ${validPos} (value ${arr[validPos]})`, 'compare', { low, high, pos: validPos }]);
    
    // If found
    if (arr[validPos] === target) {
      animations.push([[validPos], `Target ${target} found at index ${validPos}!`, 'found', { index: validPos }]);
      return animations;
    }
    
    // If target is in the left half
    if (arr[validPos] > target) {
      animations.push([[], `${arr[validPos]} > ${target}, narrowing search to left half [${low}...${validPos-1}]`, 'narrowLeft', { low, high: validPos - 1, pos: validPos }]);
      high = validPos - 1;
    } 
    // If target is in the right half
    else {
      animations.push([[], `${arr[validPos]} < ${target}, narrowing search to right half [${validPos+1}...${high}]`, 'narrowRight', { low: validPos + 1, high, pos: validPos }]);
      low = validPos + 1;
    }
  }
  
  // Target not found
  animations.push([[], `Target ${target} out of range or not found in the array`, 'not-found', {}]);
  return animations;
}; 