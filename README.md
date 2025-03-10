# DSA Visualizer

A powerful and interactive Data Structures and Algorithms Visualization tool built with React.js. This application helps users understand various algorithms through dynamic visualizations and includes a unique Algorithm Race Mode for comparing algorithm performance.

## 🚀 Features

- **Interactive Visualizations**: Real-time visualization of various algorithms
- **Multiple Algorithm Categories**:
  - Sorting Algorithms
  - Searching Algorithms
  - Graph Algorithms
- **Algorithm Race Mode**: Compare multiple algorithms' performance in real-time
- **Customizable Input**: Adjust array sizes, graph structures, and other parameters
- **Educational Insights**: Step-by-step visualization with explanations
- **Responsive Design**: Works seamlessly across different screen sizes

## 🛠️ Technologies Used

- **Frontend Framework**: React.js
- **State Management**: React Hooks
- **Styling**: CSS Modules
- **Build Tool**: Create React App
- **Package Manager**: npm
- **Version Control**: Git

## 🎯 Concepts Implemented

1. **Data Structures**:
   - Arrays
   - Graphs
   - Trees
   - Matrices

2. **Algorithms**:
   - **Sorting**:
     - Bubble Sort
     - Quick Sort
     - Merge Sort
     - Selection Sort
   - **Searching**:
     - Linear Search
     - Binary Search
     - Jump Search
     - Exponential Search
     - Interpolation Search
   - **Graph Algorithms**:
     - Dijkstra's Algorithm
     - Depth-First Search
     - Breadth-First Search
     - Minimum Spanning Tree
     - Kruskal's Algorithm
     - Prim's Algorithm

3. **Advanced Features**:
   - Algorithm Race Mode
   - Performance Metrics
   - Custom Input Generation
   - Step-by-step Execution

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/dsa-visualizer.git](https://github.com/SinghofFury/dsa-visualizer)
   ```

2. Navigate to project directory:
   ```bash
   cd dsa-visualizer
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 How to Use

1. **Select Algorithm Category**:
   - Choose from Sorting, Searching, or Graph algorithms
   - Each category has multiple algorithm options

2. **Customize Input**:
   - Adjust array size/graph structure
   - Generate random inputs or create custom ones
   - Set specific parameters for algorithms

3. **Visualization Controls**:
   - Start/Pause visualization
   - Control animation speed
   - Step through algorithm execution
   - Reset visualization

4. **Algorithm Race Mode**:
   - Select multiple algorithms to compare
   - Watch real-time performance comparison
   - View detailed metrics and statistics

## 🎨 Project Structure

```
/dsa-visualizer
├── README.md
├── .gitignore
├── .vercelignore
├── netlify.toml
├── package-lock.json
├── package.json
├── vercel.json
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   └── manifest.json
└── src/
    ├── algorithms/
    │   ├── graph.js
    │   ├── searching.js
    │   ├── sorting.js
    │   ├── searching/
    │   │   └── index.js
    │   └── sorting/
    │       └── index.js
    ├── App.js
    ├── components/
    │   ├── Navbar.js
    │   ├── Sidebar.js
    │   ├── Visualizer.js
    │   └── visualizers/
    │       ├── AlgorithmRaceVisualizer.js
    │       ├── BacktrackingVisualizer.js
    │       ├── DPVisualizer.js
    │       ├── GraphVisualizer.js
    │       ├── GreedyVisualizer.js
    │       ├── MathVisualizer.js
    │       ├── SearchingVisualizer.js
    │       ├── SortingVisualizer.js
    │       └── TreeVisualizer.js
    ├── index.js
    ├── reportWebVitals.js
    └── styles/
        ├── AlgorithmRaceVisualizer.css
        ├── App.css
        ├── BacktrackingVisualizer.css
        ├── DPVisualizer.css
        ├── GraphVisualizer.css
        ├── GreedyVisualizer.css
        ├── index.css
        ├── MathVisualizer.css
        ├── Navbar.css
        ├── SearchingVisualizer.css
        ├── Sidebar.css
        ├── SortingVisualizer.css
        ├── TreeVisualizer.css
        └── Visualizer.css
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped with the project
- Special thanks to the React.js community for excellent documentation
- Inspired by various algorithm visualization projects

## 📞 Contact

For any queries or suggestions, please open an issue in the repository. 
