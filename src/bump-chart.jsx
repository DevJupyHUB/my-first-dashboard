import React, { useState } from "react";
import * as d3 from "d3";

// Props
export default function BumpChart({
  data,
  keys,
  colors,
  years = [2000, 2010, 2018, 2024],
}) {
  const [hovered, setHovered] = useState(null);

  const world = data.filter((d) => d.country === "World");

  // Data prep
  const processed = years.map((year) => {
    const row = world.find((d) => d.year === year) || {};

    const values = {};

    keys.forEach((key) => {
      values[key] = row[key] || 0;
    });

    const sorted = Object.entries(values).sort((a, b) => b[1] - a[1]);

    const rank = {};

    sorted.forEach(([key], i) => {
      rank[key] = i + 1;
    });

    return {
      year,
      ...rank,
    };
  });

  // Layout
  const width = 600;
  const height = 260;

  const margin = {
    top: 10,
    right: 60,
    bottom: 40,
    left: 90,
  };

  const boundsWidth = width - margin.left - margin.right;

  const boundsHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = d3.scalePoint().domain(years).range([0, boundsWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([1, keys.length])
    .range([0, boundsHeight]);

  const line = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.value))
    .curve(d3.curveBumpX);

  // Series
  const series = keys.map((key) => ({
    key,
    values: processed.map((d) => ({
      year: d.year,
      value: d[key],
    })),
  }));

  const formatLabel = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Render
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Rank right labels */}
        {Array.from({ length: keys.length }, (_, i) => {
          const rank = i + 1;

          return (
            <text
              key={rank}
              x={boundsWidth + 20}
              y={yScale(rank)}
              textAnchor="start"
              alignmentBaseline="middle"
              fontSize={14}
              fill="#CCC"
            >
              {rank}.
            </text>
          );
        })}

        {/* X axis */}
        {years.map((year) => (
          <text
            key={year}
            x={xScale(year)}
            y={boundsHeight + 30}
            textAnchor="middle"
            fontSize={16}
            fill="#CCC"
          >
            {year}
          </text>
        ))}

        {/* Series hover */}
        {series.map((s) => {
          const active = !hovered || hovered === s.key;

          return (
            <g
              key={s.key}
              onMouseEnter={() => setHovered(s.key)}
              onMouseLeave={() => setHovered(null)}
              opacity={active ? 1 : 0.15}
            >
              {/* Line */}
              <path
                d={line(s.values)}
                fill="none"
                stroke={colors[s.key]}
                strokeWidth={2.5}
              />

              {/* Circles */}
              {s.values.map((v, i) => (
                <circle
                  key={i}
                  cx={xScale(v.year)}
                  cy={yScale(v.value)}
                  r={10}
                  fill={colors[s.key]}
                />
              ))}

              {/* Left labels */}
              <text
                x={-20}
                y={yScale(s.values[0].value)}
                textAnchor="end"
                alignmentBaseline="middle"
                fontSize={16}
                fontWeight="bold"
                fill={colors[s.key]}
              >
                {formatLabel(s.key)}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
