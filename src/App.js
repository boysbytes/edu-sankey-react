import React, { useState, useRef, useCallback } from 'react';
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
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnFilters, setColumnFilters] = useState({});
  const [uniqueColumnValues, setUniqueColumnValues] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);

  const [colorScheme, setColorScheme] = useState("Category10");
  const [fontSize, setFontSize] = useState(10);
  const [nodePadding, setNodePadding] = useState(10);
  const [diagramWidth, setDiagramWidth] = useState(900);
  const [diagramHeight, setDiagramHeight] = useState(600);
  const [enableGradient, setEnableGradient] = useState(true);
  const [autoSort, setAutoSort] = useState(false);

  const sankeyRef = useRef();
  const fileInputRef = useRef();

  const handleCsvData = useCallback((data) => {
    if (!data || data.length === 0) return;
    const headers = data[0];
    const body = data.slice(1);

    setCsvHeaders(headers);
    setCsvData(body);

    const uniqueValues = {};
    headers.forEach((header, index) => {
      const values = new Set(body.map(row => row[index]));
      uniqueValues[header] = ['All', ...Array.from(values)];
    });
    setUniqueColumnValues(uniqueValues);

    const initialFilters = {};
    headers.forEach(header => {
      initialFilters[header] = 'All';
    });
    setColumnFilters(initialFilters);
  }, []);

  const parseCsv = useCallback((file) => {
    Papa.parse(file, {
      complete: (result) => handleCsvData(result.data),
      error: (err) => console.error("CSV parsing error:", err)
    });
  }, [handleCsvData]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      parseCsv(file);
    }
  }, [parseCsv]);

  const handlePaste = useCallback((e) => {
    const text = e.target.value;
    if (text) {
      Papa.parse(text, {
        complete: (result) => handleCsvData(result.data),
        error: (err) => console.error("Pasting error:", err)
      });
    } else {
      setCsvData([]);
      setCsvHeaders([]);
      setUniqueColumnValues({});
      setColumnFilters({});
    }
  }, [handleCsvData]);

  const handleFilterChange = (header, value) => {
    setColumnFilters(prev => ({ ...prev, [header]: value }));
  };

  const downloadPNG = () => {
    if (sankeyRef.current?.exportPng) {
      sankeyRef.current.exportPng();
    }
  };

  const downloadHTML = () => {
    if (!sankeyRef.current?.getChartData) return;

    const chartData = sankeyRef.current.getChartData();
    const settings = {
      colorScheme: colorSchemes[colorScheme],
      fontSize,
      nodePadding,
      diagramWidth,
      diagramHeight,
      enableGradient,
      autoSort,
    };

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sankey Diagram</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5; }
    svg { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div id="sankey-container"></div>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <script src="https://unpkg.com/d3-sankey@0.12.3/dist/d3-sankey.min.js"></script>
  <script>
    const data = ${JSON.stringify(chartData)};
    const settings = ${JSON.stringify(settings)};

    const { nodes, links } = data;
    const { diagramWidth, diagramHeight, nodePadding, autoSort, colorScheme, enableGradient, fontSize } = settings;

    const svg = d3.select("#sankey-container").append("svg")
      .attr("width", diagramWidth)
      .attr("height", diagramHeight)
      .append("g");

    const sankeyGenerator = d3.sankey()
      .nodeWidth(15)
      .nodePadding(nodePadding)
      .extent([[1, 1], [diagramWidth - 1, diagramHeight - 6]]);

    if (!autoSort) {
      sankeyGenerator.nodeSort(null);
    }

    const { nodes: graphNodes, links: graphLinks } = sankeyGenerator({
      nodes: nodes.map(d => Object.assign({}, d)),
      links: links.map(d => Object.assign({}, d))
    });

    const color = d3.scaleOrdinal(colorScheme);
    const defs = svg.append('defs');

    if (enableGradient) {
      graphLinks.forEach((link, i) => {
        const gradient = defs.append('linearGradient')
          .attr('id', 'gradient-' + i)
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', link.source.x1)
          .attr('x2', link.target.x0);
        gradient.append('stop').attr('offset', '0%').attr('stop-color', color(link.source.name));
        gradient.append('stop').attr('offset', '100%').attr('stop-color', color(link.target.name));
      });
    }

    svg.append("g")
      .selectAll("rect")
      .data(graphNodes)
      .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => color(d.name))
        .attr("stroke", "#000");

    svg.append("g")
      .attr("fill", "none")
      .selectAll("g")
      .data(graphLinks)
      .join("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", (d, i) => enableGradient ? 'url(#gradient-' + i + ')' : color(d.source.name))
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", d => Math.max(1, d.width));

    svg.append("g")
        .style("font", fontSize + 'px sans-serif')
      .selectAll("text")
      .data(graphNodes)
      .join("text")
        .attr("x", d => d.x0 < diagramWidth / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < diagramWidth / 2 ? "start" : "end")
        .text(d => d.name);
  </script>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sankey-diagram.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      parseCsv(file);
    }
  }, [parseCsv]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="App">
      <header>
        <h1>Sankey Diagram Generator</h1>
      </header>
      <div className="main-content-container">
        <div className="sidebar">
          <div className="csv-input-container">
            <h3>Data Input</h3>
            <div
              className={`file-drop-area ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFilePicker}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
              />
              <p>Drag & drop a .csv file here, or click to select a file</p>
            </div>
            <textarea
              placeholder="Or paste your CSV data here"
              onChange={handlePaste}
            />
          </div>

          <div className="settings-container">
            <h3>Diagram Settings</h3>
            <div className="setting-group">
              <label>Font Size:</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 0)}
                min="1"
              />
            </div>
            <div className="setting-group">
              <label>Node Padding:</label>
              <input
                type="number"
                value={nodePadding}
                onChange={(e) => setNodePadding(parseInt(e.target.value, 10) || 0)}
                min="0"
              />
            </div>
            <div className="setting-group">
              <label>Diagram Width:</label>
              <input
                type="number"
                value={diagramWidth}
                onChange={(e) => setDiagramWidth(parseInt(e.target.value, 10) || 0)}
                min="100"
              />
            </div>
            <div className="setting-group">
              <label>Diagram Height:</label>
              <input
                type="number"
                value={diagramHeight}
                onChange={(e) => setDiagramHeight(parseInt(e.target.value, 10) || 0)}
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
          </div>

          {csvHeaders.length > 0 && (
            <div className="filters-container">
              <h3>Filters</h3>
              {csvHeaders.map(header => (
                <div key={header} className="filter-group">
                  <label>{header}:</label>
                  <select onChange={(e) => handleFilterChange(header, e.target.value)} value={columnFilters[header] || 'All'}>
                    {uniqueColumnValues[header]?.map(value => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="button-group">
             <button onClick={downloadPNG} disabled={!csvData.length}>Download PNG</button>
             <button onClick={downloadHTML} disabled={!csvData.length}>Download HTML</button>
          </div>
        </div>

        <div className="content-area">
          {csvData.length > 0 ? (
            <div className="sankey-diagram-container">
              <SankeyDiagram
                ref={sankeyRef}
                data={csvData}
                headers={csvHeaders}
                filters={columnFilters}
                colorScheme={colorSchemes[colorScheme]}
                fontSize={fontSize}
                nodePadding={nodePadding}
                diagramWidth={diagramWidth}
                diagramHeight={diagramHeight}
                enableGradient={enableGradient}
                autoSort={autoSort}
              />
            </div>
          ) : (
            <div className="placeholder">
              <p>Your Sankey diagram will appear here once data is loaded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;