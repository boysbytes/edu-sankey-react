import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

const SankeyDiagram = forwardRef(({ data, colorScheme, fontSize, nodePadding, diagramWidth, diagramHeight, enableGradient }, ref) => {
  const svgRef = useRef();

  useEffect(() => {
    if (data) {
      drawSankey();
    }
  }, [data, colorScheme, fontSize, nodePadding, diagramWidth, diagramHeight, enableGradient]);

  const drawSankey = () => {
    const { nodes, links } = transformData(data);

    const width = diagramWidth;
    const height = diagramHeight;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g");

    const sankeyGenerator = sankey()
      .nodeWidth(15)
      .nodePadding(nodePadding)
      .extent([[1, 1], [width - 1, height - 6]]);

    const { nodes: graphNodes, links: graphLinks } = sankeyGenerator({
      nodes: nodes.map(d => Object.assign({}, d)),
      links: links.map(d => Object.assign({}, d))
    });

    const color = d3.scaleOrdinal(colorScheme);

    const defs = svg.append('defs');

    if (enableGradient) {
      graphLinks.forEach((link, i) => {
        const gradient = defs.append('linearGradient')
          .attr('id', `gradient-${i}`)
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
      .attr("stroke-opacity", 0.5)
      .selectAll("g")
      .data(graphLinks)
      .join("path")
        .attr("d", sankeyLinkHorizontal())
        .attr("stroke", (d, i) => enableGradient ? `url(#gradient-${i})` : color(d.source.name))
        .attr("stroke-width", d => Math.max(1, d.width));

    svg.append("g")
        .style("font", `${fontSize}px sans-serif`)
      .selectAll("text")
      .data(graphNodes)
      .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name);
  };

  const transformData = (csvData) => {
    let nodes = [];
    let links = [];
    let nodeSet = new Set();

    csvData.forEach(row => {
      for (let i = 0; i < row.length - 1; i++) {
        const source = row[i];
        const target = row[i+1];
        const value = 1;

        if (source && target) {
          if (!nodeSet.has(source)) {
            nodeSet.add(source);
            nodes.push({ name: source });
          }
          if (!nodeSet.has(target)) {
            nodeSet.add(target);
            nodes.push({ name: target });
          }

          links.push({
            source: nodes.findIndex(n => n.name === source),
            target: nodes.findIndex(n => n.name === target),
            value: value
          });
        }
      }
    });

    return { nodes, links };
  };

  useImperativeHandle(ref, () => ({
    exportPng: () => {
      const svgElement = svgRef.current;
      if (!svgElement) return;

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = diagramWidth;
      canvas.height = diagramHeight;

      img.onload = () => {
        
        ctx.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'sankey-diagram.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    }
  }));

  return (
    <svg ref={svgRef}></svg>
  );
});

export default SankeyDiagram;