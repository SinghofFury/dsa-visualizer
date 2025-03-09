import React from 'react';
import '../../styles/MathVisualizer.css';

const MathVisualizer = ({ algorithm }) => {
  return (
    <div className="math-visualizer">
      <div className="algorithm-info">
        <h2>{algorithm}</h2>
        <p>Mathematical algorithm visualization will be implemented here.</p>
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

export default MathVisualizer; 