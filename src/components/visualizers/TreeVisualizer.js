import React from 'react';
import '../../styles/TreeVisualizer.css';

const TreeVisualizer = ({ algorithm }) => {
  return (
    <div className="tree-visualizer">
      <div className="algorithm-info">
        <h2>{algorithm}</h2>
        <p>Tree algorithm visualization will be implemented here.</p>
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

export default TreeVisualizer; 