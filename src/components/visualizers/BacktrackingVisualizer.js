import React from 'react';
import '../../styles/BacktrackingVisualizer.css';

const BacktrackingVisualizer = ({ algorithm }) => {
  return (
    <div className="backtracking-visualizer">
      <div className="algorithm-info">
        <h2>{algorithm}</h2>
        <p>Backtracking algorithm visualization will be implemented here.</p>
      </div>
      
      <div className="visualization-area">
        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <p>The visualization for {algorithm} is under development.</p>
        </div>
      </div>
    </div>
  );
};

export default BacktrackingVisualizer;

 