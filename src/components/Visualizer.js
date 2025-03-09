import React, { useEffect } from 'react';
import '../styles/Visualizer.css';

// Import algorithm visualizers
import SortingVisualizer from './visualizers/SortingVisualizer';
import SearchingVisualizer from './visualizers/SearchingVisualizer';
import GraphVisualizer from './visualizers/GraphVisualizer';
import DPVisualizer from './visualizers/DPVisualizer';
import GreedyVisualizer from './visualizers/GreedyVisualizer';
import BacktrackingVisualizer from './visualizers/BacktrackingVisualizer';
import TreeVisualizer from './visualizers/TreeVisualizer';
import MathVisualizer from './visualizers/MathVisualizer';
import AlgorithmRaceVisualizer from './visualizers/AlgorithmRaceVisualizer';

// Each visualizer has its own dedicated CSS file:
// - GraphVisualizer.css
// - SortingVisualizer.css
// - SearchingVisualizer.css
// - AlgorithmRaceVisualizer.css

const Visualizer = ({ selectedCategory, selectedAlgorithm, onAlgorithmRunningChange }) => {
  // Log when algorithm or category changes
  useEffect(() => {
    console.log(`Category: ${selectedCategory}, Algorithm: ${selectedAlgorithm}`);
  }, [selectedCategory, selectedAlgorithm]);

  const renderVisualizer = () => {
    if (!selectedCategory || !selectedAlgorithm) {
      return (
        <div className="welcome-screen">
          <h2 className="welcome-title">Welcome to DSA Visualizer</h2>
          <p className="welcome-subtitle">
            Explore and understand different algorithms through interactive visualizations.
            Select an algorithm from the sidebar to get started on your journey to mastering
            Data Structures and Algorithms.
          </p>
          
          <div className="welcome-instructions">
            <div className="instruction-step">
              <div className="step-number">1</div>
              <div className="step-text">Choose a category from the sidebar</div>
            </div>
            <div className="instruction-step">
              <div className="step-number">2</div>
              <div className="step-text">Select an algorithm to visualize</div>
            </div>
            <div className="instruction-step">
              <div className="step-number">3</div>
              <div className="step-text">Customize and run the visualization</div>
            </div>
          </div>
          
          <div className="visualizer-animation-placeholder">
            <div className="placeholder-visualization">
              <div className="placeholder-bars">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className="placeholder-bar" 
                    style={{ 
                      height: `${30 + Math.random() * 120}px`,
                      '--i': i 
                    }}
                  ></div>
                ))}
              </div>
            </div>
            <div className="placeholder-text">Your algorithm visualization will appear here</div>
          </div>
        </div>
      );
    }

    try {
      // Handle Algorithm Race Mode
      if (selectedCategory === 'Algorithm Race') {
        let raceCategory;
        if (selectedAlgorithm === 'Searching Algorithms') {
          raceCategory = 'Searching';
        } else if (selectedAlgorithm === 'Sorting Algorithms') {
          raceCategory = 'Sorting';
        } else if (selectedAlgorithm === 'Graph Algorithms') {
          raceCategory = 'Graph';
        } else {
          raceCategory = selectedAlgorithm.split(' ')[0];
        }
        
        console.log(`Starting Race Mode with category: ${raceCategory}`);
        return <AlgorithmRaceVisualizer 
          category={raceCategory} 
          onAlgorithmRunningChange={onAlgorithmRunningChange} 
        />;
      }

      // Handle regular algorithm visualizers
      switch (selectedCategory) {
        case 'Sorting':
          return <SortingVisualizer algorithm={selectedAlgorithm} onAlgorithmRunningChange={onAlgorithmRunningChange} />;
        case 'Searching':
          return <SearchingVisualizer algorithm={selectedAlgorithm} onAlgorithmRunningChange={onAlgorithmRunningChange} />;
        case 'Graph':
          return <GraphVisualizer algorithm={selectedAlgorithm} onAlgorithmRunningChange={onAlgorithmRunningChange} />;
        case 'Dynamic Programming':
          return <DPVisualizer algorithm={selectedAlgorithm} onAlgorithmRunningChange={onAlgorithmRunningChange} />;
        case 'Greedy':
          return <GreedyVisualizer algorithm={selectedAlgorithm} onAlgorithmRunningChange={onAlgorithmRunningChange} />;
        case 'Backtracking':
          return <BacktrackingVisualizer algorithm={selectedAlgorithm} onAlgorithmRunningChange={onAlgorithmRunningChange} />;
        case 'Tree':
          return <TreeVisualizer algorithm={selectedAlgorithm} onAlgorithmRunningChange={onAlgorithmRunningChange} />;
        case 'Mathematical':
          return <MathVisualizer algorithm={selectedAlgorithm} onAlgorithmRunningChange={onAlgorithmRunningChange} />;
        default:
          return <div className="high-contrast">Select an algorithm to visualize</div>;
      }
    } catch (error) {
      console.error('Error rendering visualizer:', error);
      return (
        <div className="error-message">
          <h3>Error Loading Visualizer</h3>
          <p>There was a problem loading the requested algorithm visualizer.</p>
          <p>Error details: {error.message}</p>
        </div>
      );
    }
  };

  return (
    <div className="visualizer high-contrast">
      {renderVisualizer()}
    </div>
  );
};

export default Visualizer; 