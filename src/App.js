import React, { useState, useRef } from 'react';
import * as d3 from 'd3';
import Papa from 'papaparse';
import SankeyDiagram from './SankeyDiagram';
import './App.css';

const colorSchemes = {
  "Category10": d3.schemeCategory10,
  "Accent": d3.schemeAccent,
  "Dark2": d3.schemeDark2,
  "Paired": d3.schemePaired,
  "Pastel1": d3.schemePastel1,
  "Set1": d3.schemeSet1,
  "Set2": d3.schemeSet2,
  "Set3": d3.schemeSet3,
  "Tableau10": d3.schemeTableau10,
  "Vibrant Mix (Custom)": [
    '#FF6347', '#4682B4', '#32CD32', '#FFD700', '#9370DB',
    '#FF4500', '#1E90FF', '#20B2AA', '#FFA500', '#8A2BE2',
    '#DC143C', '#6A5ACD', '#00CED1', '#FF8C00', '#BA55D3'
  ],
};

function App() {
  const [csvData, setCsvData] = useState(null);
  const [colorScheme, setColorScheme] = useState("Category10");
  const [fontSize, setFontSize] = useState(10); // New state for font size
  const [nodePadding, setNodePadding] = useState(10); // New state for node padding
  const [diagramWidth, setDiagramWidth] = useState(900); // New state for diagram width
  const [diagramHeight, setDiagramHeight] = useState(600); // New state for diagram height
  const [enableGradient, setEnableGradient] = useState(true); // New state for gradient toggle
  const [autoSort, setAutoSort] = useState(false); // New state for auto-sort toggle

  const sankeyRef = useRef(); // Ref to access SankeyDiagram component methods

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      complete: (result) => {
        setCsvData(result.data);
      }
    });
  };

  const handlePaste = (e) => {
    const text = e.target.value;
    const result = Papa.parse(text, { header: false });
    setCsvData(result.data);
  };

  const downloadPNG = () => {
    if (sankeyRef.current && sankeyRef.current.exportPng) {
      sankeyRef.current.exportPng();
    }
  };

  return (
    <div className="App">
      <h1>Sankey Diagram Generator</h1>
      <div className="main-content-container">
        <div className="input-settings-group">
          <div className="csv-input-container">
            <h3>Data Input</h3>
            <div className="input-section">
              <h4>Upload CSV File</h4>
              <input type="file" accept=".csv" onChange={handleFileUpload} />
            </div>
            <div className="input-section">
              <h4>Or Paste CSV Data</h4>
              <textarea onChange={handlePaste} />
            </div>
          </div>

          <div className="settings-container">
            <h3>Diagram Settings</h3>
            <div className="setting-group">
              <label>Font Size:</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
            <div className="setting-group">
              <label>Node Padding:</label>
              <input
                type="number"
                value={nodePadding}
                onChange={(e) => setNodePadding(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="setting-group">
              <label>Diagram Width:</label>
              <input
                type="number"
                value={diagramWidth}
                onChange={(e) => setDiagramWidth(parseInt(e.target.value) || 0)}
                min="100"
              />
            </div>
            <div className="setting-group">
              <label>Diagram Height:</label>
              <input
                type="number"
                value={diagramHeight}
                onChange={(e) => setDiagramHeight(parseInt(e.target.value) || 0)}
                min="100"
              />
            </div>
            <div className="setting-group">
              <label>Color Scheme:</label>
              <select onChange={(e) => setColorScheme(e.target.value)} value={colorScheme}>
                {Object.keys(colorSchemes).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="setting-group">
              <label>Enable Gradient:</label>
              <input
                type="checkbox"
                checked={enableGradient}
                onChange={(e) => setEnableGradient(e.target.checked)}
              />
            </div>
            <div className="setting-group">
              <label>Auto Sort Nodes:</label>
              <input
                type="checkbox"
                checked={autoSort}
                onChange={(e) => setAutoSort(e.target.checked)}
              />
            </div>
            <button onClick={downloadPNG} disabled={!csvData}>Download PNG</button>
          </div>
        </div>

        {csvData && (
          <div className="sankey-diagram-container">
            <SankeyDiagram
              ref={sankeyRef}
              data={csvData}
              colorScheme={colorSchemes[colorScheme]}
              fontSize={fontSize}
              nodePadding={nodePadding}
              diagramWidth={diagramWidth}
              diagramHeight={diagramHeight}
              enableGradient={enableGradient}
              autoSort={autoSort}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;