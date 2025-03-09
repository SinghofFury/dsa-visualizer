// Helper function to create animation snapshots
const createSnapshot = (indices, found = false, foundIndex = -1, actionType = null, actionParams = null) => {
  return [indices, found, foundIndex, actionType, actionParams];
};

// Linear Search
export const linearSearch = (array, target) => {
  const animations = [];
  
  // Initial state
  animations.push(createSnapshot([], false, -1, 'start', {
    target: target,
    length: array.length
  }));
  
  // Iterate through the array
  for (let i = 0; i < array.length; i++) {
    // Add animation for current element being checked
    animations.push(createSnapshot([i], false, -1, 'checking', {
      i: i,
      val: array[i],
      target: target
    }));
    
    // If element is found
    if (array[i] === target) {
      animations.push(createSnapshot([i], true, i, 'found', {
        i: i,
        val: array[i],
        target: target
      }));
      
      // Add completion animation
      animations.push(createSnapshot([], true, i, 'complete', {
        i: i,
        val: array[i],
        target: target
      }));
      
      return animations;
    }
    
    // If element is not the target
    if (i < array.length - 1) {
      animations.push(createSnapshot([i], false, -1, 'continue', {
        i: i,
        val: array[i],
        target: target,
        next: i + 1
      }));
    }
  }
  
  // If target is not found
  animations.push(createSnapshot([], false, -1, 'notFound', {
    target: target
  }));
  
  // Add completion animation
  animations.push(createSnapshot([], false, -1, 'complete', {
    target: target
  }));
  
  return animations;
};

// Binary Search
export const binarySearch = (array, target) => {
  const animations = [];
  
  let left = 0;
  let right = array.length - 1;
  
  // Initial state
  animations.push(createSnapshot([], false, -1, 'start', {
    target: target,
    low: left,
    high: right
  }));
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    // Add animation for calculating midpoint
    animations.push(createSnapshot([mid], false, -1, 'midpoint', {
      mid: mid,
      val: array[mid],
      low: left,
      high: right
    }));
    
    // Add animation for comparing with target
    animations.push(createSnapshot([mid], false, -1, 'checking', {
      mid: mid,
      val: array[mid],
      target: target
    }));
    
    // If element is found
    if (array[mid] === target) {
      animations.push(createSnapshot([mid], true, mid, 'found', {
        mid: mid,
        val: array[mid],
        target: target
      }));
      
      // Add completion animation
      animations.push(createSnapshot([], true, mid, 'complete', {
        mid: mid,
        val: array[mid],
        target: target
      }));
      
      return animations;
    }
    
    // If target is less than middle element
    if (target < array[mid]) {
      animations.push(createSnapshot([mid], false, -1, 'narrowLeft', {
        mid: mid,
        val: array[mid],
        target: target,
        low: left,
        high: mid - 1
      }));
      right = mid - 1;
    }
    // If target is greater than middle element
    else {
      animations.push(createSnapshot([mid], false, -1, 'narrowRight', {
        mid: mid,
        val: array[mid],
        target: target,
        low: mid + 1,
        high: right
      }));
      left = mid + 1;
    }
  }
  
  // If target is not found
  animations.push(createSnapshot([], false, -1, 'notFound', {
    target: target
  }));
  
  // Add completion animation
  animations.push(createSnapshot([], false, -1, 'complete', {
    target: target
  }));
  
  return animations;
};

// Jump Search
export const jumpSearch = (array, target) => {
  const animations = [];
  const n = array.length;
  
  // Initial state
  animations.push(createSnapshot([], false, -1, 'start', {
    target: target,
    length: n
  }));
  
  // Finding block size to be jumped
  const step = Math.floor(Math.sqrt(n));
  
  // Finding the block where element is present (if it is present)
  let prev = 0;
  let blockEnd = Math.min(step, n) - 1;
  
  // Add animation for initial jump
  animations.push(createSnapshot([blockEnd], false, -1, 'jump', {
    index: blockEnd,
    val: array[blockEnd],
    step: step
  }));
  
  // Finding the block where element is present (if it is present)
  while (array[blockEnd] < target) {
    prev = blockEnd + 1;
    blockEnd = Math.min(blockEnd + step, n - 1);
    
    // If we've reached the end of the array
    if (prev >= n) {
      animations.push(createSnapshot([], false, -1, 'notFound', {
        target: target
      }));
      
      // Add completion animation
      animations.push(createSnapshot([], false, -1, 'complete', {
        target: target
      }));
      
      return animations;
    }
    
    // Add animation for jump
    animations.push(createSnapshot([blockEnd], false, -1, 'jump', {
      index: blockEnd,
      val: array[blockEnd],
      step: step,
      prev: prev
    }));
  }
  
  // Doing a linear search for target in block beginning with prev
  animations.push(createSnapshot([prev], false, -1, 'linearSearch', {
    start: prev,
    end: blockEnd,
    target: target
  }));
  
  // Linear search in the identified block
  for (let i = prev; i <= blockEnd; i++) {
    // Add animation for checking current element
    animations.push(createSnapshot([i], false, -1, 'checking', {
      i: i,
      val: array[i],
      target: target
    }));
    
    // If element is found
    if (array[i] === target) {
      animations.push(createSnapshot([i], true, i, 'found', {
        i: i,
        val: array[i],
        target: target
      }));
      
      // Add completion animation
      animations.push(createSnapshot([], true, i, 'complete', {
        i: i,
        val: array[i],
        target: target
      }));
      
      return animations;
    }
    
    // If element is not the target and not the last element in the block
    if (i < blockEnd) {
      animations.push(createSnapshot([i], false, -1, 'continue', {
        i: i,
        val: array[i],
        target: target,
        next: i + 1
      }));
    }
  }
  
  // If target is not found
  animations.push(createSnapshot([], false, -1, 'notFound', {
    target: target
  }));
  
  // Add completion animation
  animations.push(createSnapshot([], false, -1, 'complete', {
    target: target
  }));
  
  return animations;
};

// Interpolation Search
export const interpolationSearch = (array, target) => {
  const animations = [];
  let low = 0;
  let high = array.length - 1;
  
  // Initial state
  animations.push(createSnapshot([], false, -1, 'start', {
    target: target,
    low: low,
    high: high
  }));
  
  // Loop while the target is within the range and we haven't found it yet
  while (low <= high && target >= array[low] && target <= array[high]) {
    // If there is only one element
    if (low === high) {
      // Check if the element is the target
      animations.push(createSnapshot([low], false, -1, 'checking', {
        pos: low,
        val: array[low],
        target: target
      }));
      
      if (array[low] === target) {
        animations.push(createSnapshot([low], true, low, 'found', {
          pos: low,
          val: array[low],
          target: target
        }));
        
        // Add completion animation
        animations.push(createSnapshot([], true, low, 'complete', {
          pos: low,
          val: array[low],
          target: target
        }));
      } else {
        animations.push(createSnapshot([], false, -1, 'notFound', {
          target: target
        }));
        
        // Add completion animation
        animations.push(createSnapshot([], false, -1, 'complete', {
          target: target
        }));
      }
      return animations;
    }
    
    // Calculate the probable position using interpolation formula
    // pos = low + ((target - array[low]) * (high - low)) / (array[high] - array[low])
    const pos = low + Math.floor(
      ((target - array[low]) * (high - low)) / (array[high] - array[low])
    );
    
    // Add animation for calculating position
    animations.push(createSnapshot([pos], false, -1, 'position', {
      pos: pos,
      val: array[pos],
      low: low,
      high: high,
      target: target
    }));
    
    // Add animation for comparing with target
    animations.push(createSnapshot([pos], false, -1, 'checking', {
      pos: pos,
      val: array[pos],
      target: target
    }));
    
    // If element is found
    if (array[pos] === target) {
      animations.push(createSnapshot([pos], true, pos, 'found', {
        pos: pos,
        val: array[pos],
        target: target
      }));
      
      // Add completion animation
      animations.push(createSnapshot([], true, pos, 'complete', {
        pos: pos,
        val: array[pos],
        target: target
      }));
      
      return animations;
    }
    
    // If target is less than the element at pos
    if (array[pos] > target) {
      animations.push(createSnapshot([pos], false, -1, 'narrowLeft', {
        pos: pos,
        val: array[pos],
        target: target,
        low: low,
        high: pos - 1
      }));
      high = pos - 1;
    }
    // If target is greater than the element at pos
    else {
      animations.push(createSnapshot([pos], false, -1, 'narrowRight', {
        pos: pos,
        val: array[pos],
        target: target,
        low: pos + 1,
        high: high
      }));
      low = pos + 1;
    }
  }
  
  // If target is not found
  animations.push(createSnapshot([], false, -1, 'notFound', {
    target: target
  }));
  
  // Add completion animation
  animations.push(createSnapshot([], false, -1, 'complete', {
    target: target
  }));
  
  return animations;
}; 