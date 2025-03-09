import React from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <div className="navbar">
      <a href="/" className="navbar-brand">
        <i className="fas fa-code-branch"></i>
        <span>DSA Visualizer</span>
      </a>
      <div className="navbar-links">
        <a href="https://github.com/yourusername/dsa-visualizer" className="navbar-github" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-github"></i>
          <span>Star on GitHub</span>
        </a>
      </div>
    </div>
  );
};

export default Navbar; 