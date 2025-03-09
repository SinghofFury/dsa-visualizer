import React, { useState } from 'react';
import './styles/App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Visualizer from './components/Visualizer';

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);

  const handleAlgorithmSelect = (category, algorithm) => {
    setSelectedCategory(category);
    setSelectedAlgorithm(algorithm);
  };

  const handleAlgorithmRunningChange = (isRunning) => {
    setIsAlgorithmRunning(isRunning);
  };

  return (
    <div className="app">
      <Navbar />
      <div className="main-container">
        <Sidebar 
          onSelectAlgorithm={handleAlgorithmSelect} 
          isAlgorithmRunning={isAlgorithmRunning}
        />
        <Visualizer
          selectedCategory={selectedCategory}
          selectedAlgorithm={selectedAlgorithm}
          onAlgorithmRunningChange={handleAlgorithmRunningChange}
        />
      </div>
    </div>
  );
}

export default App; 