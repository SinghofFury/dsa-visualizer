import React from 'react';
import '../../styles/DPVisualizer.css';

const DPVisualizer = ({ algorithm }) => {
  return (
    <div className="dp-visualizer">
      <div className="algorithm-info">
        <h2>{algorithm}</h2>
        <p>Dynamic Programming algorithm visualization will be implemented here.</p>
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

export default DPVisualizer; 