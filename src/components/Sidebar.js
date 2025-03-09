import React, { useState, useEffect } from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ onSelectAlgorithm, isAlgorithmRunning }) => {
  const [openCategory, setOpenCategory] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && !event.target.closest('.sidebar') && !event.target.closest('.sidebar-toggle')) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Automatically collapse sidebar when algorithm starts running
  useEffect(() => {
    if (isAlgorithmRunning) {
      setIsCollapsed(true);
    }
  }, [isAlgorithmRunning]);

  const toggleCategory = (category) => {
    if (openCategory === category) {
      setOpenCategory(null);
    } else {
      setOpenCategory(category);
    }
  };

  const handleAlgorithmClick = (category, algorithm) => {
    onSelectAlgorithm(category, algorithm);
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      setIsMobileOpen(false);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const categories = [
    {
      name: 'Algorithm Race',
      icon: 'fas fa-flag-checkered',
      algorithms: [
        'Searching Algorithms',
        'Sorting Algorithms',
        'Graph Algorithms'
      ]
    },
    {
      name: 'Sorting',
      icon: 'fas fa-sort-amount-down',
      algorithms: [
        'Bubble Sort',
        'Selection Sort',
        'Insertion Sort',
        'Merge Sort',
        'Quick Sort'
      ]
    },
    {
      name: 'Searching',
      icon: 'fas fa-search',
      algorithms: [
        'Linear Search',
        'Binary Search',
        'Jump Search',
        'Exponential Search',
        'Interpolation Search'
      ]
    },
    {
      name: 'Graph',
      icon: 'fas fa-project-diagram',
      algorithms: [
        'Breadth First Search',
        'Depth First Search',
        'Dijkstra\'s Algorithm',
        'Kruskal\'s Algorithm',
        'Prim\'s Algorithm'
      ]
    },
    {
      name: 'Tree',
      icon: 'fas fa-tree',
      algorithms: [
        'Binary Search Tree',
        'AVL Tree',
        'Red-Black Tree',
        'B-Tree',
        'Heap'
      ],
      comingSoon: true
    },
    {
      name: 'Dynamic Programming',
      icon: 'fas fa-table',
      algorithms: [
        'Fibonacci Series',
        'Knapsack Problem',
        'Longest Common Subsequence',
        'Matrix Chain Multiplication',
        'Shortest Path'
      ],
      comingSoon: true
    },
    {
      name: 'Greedy',
      icon: 'fas fa-hand-holding-usd',
      algorithms: [
        'Activity Selection',
        'Huffman Coding',
        'Job Sequencing',
        'Fractional Knapsack',
        'Coin Change'
      ],
      comingSoon: true
    },
    {
      name: 'Backtracking',
      icon: 'fas fa-undo',
      algorithms: [
        'N-Queens',
        'Rat in a Maze',
        'Sudoku Solver',
        'Hamiltonian Cycle',
        'Graph Coloring'
      ],
      comingSoon: true
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}></div>
      
      <div className={`sidebar ${isMobileOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {categories.map((category) => (
          <div key={category.name} className="sidebar-section">
            <div 
              className="sidebar-title"
              onClick={() => toggleCategory(category.name)}
              style={{ cursor: 'pointer' }}
            >
              <i className={`${category.icon}`}></i> {!isCollapsed && category.name}
            </div>
            
            {openCategory === category.name && !isCollapsed && (
              <ul className="sidebar-menu">
                {category.algorithms.map((algorithm) => (
                  <li key={algorithm} className="sidebar-item">
                    <div
                      className={`sidebar-link ${category.comingSoon ? 'disabled' : ''}`}
                      onClick={() => !category.comingSoon && handleAlgorithmClick(category.name, algorithm)}
                    >
                      {algorithm}
                      {category.comingSoon && (
                        <span className="coming-soon">Soon</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {category.name !== categories[categories.length - 1].name && !isCollapsed && (
              <div className="sidebar-divider"></div>
            )}
          </div>
        ))}
        
        {/* Toggle button for sidebar collapse */}
        <button className="sidebar-collapse-toggle" onClick={toggleSidebar}>
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>
      
      {/* Mobile toggle button */}
      <button className="sidebar-toggle" onClick={toggleMobileSidebar}>
        <i className={`fas ${isMobileOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>
    </>
  );
};

export default Sidebar; 