import { useRef } from "react";
import * as d3 from "d3";
import { useDimensions } from "./use-dimensions";

// Props
function BarChart({ rawData, keys, colors, width, height }) {
  const margin = {
    top: 10,
    right: 50,
    bottom: 10,
    left: 90,
  };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  if (boundsWidth <= 0 || boundsHeight <= 0) return null;

  const formatLabel = (str = "") => str.charAt(0).toUpperCase() + str.slice(1);

  // Data prep
  const key = keys?.[0];

  const data = (rawData || [])
    .filter((d) => +d.year === 2024)
    .filter((d) => d.country !== "World")
    .map((d) => ({
      country: d.country,
      label: formatLabel(d.country),
      value: d[key] || 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (!data.length) return null;

  // Scales
  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.label))
    .range([0, boundsHeight])
    .padding(0.25);

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value) || 0])
    .range([0, boundsWidth]);

  const formatValue = d3.format(".2s");

  // Render
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Main chart group */}
      <g
        transform={`translate(${margin.left},${margin.top})`}
        className="
          group
        "
      >
        {data.map((d, i) => {
          const y = yScale(d.label);

          return (
            <g
              key={i}
              className="
                transition-opacity
                duration-200
                group-hover:opacity-20
                hover:opacity-100!
              "
            >
              {/* 
                  Invisible layer */}
              <rect
                x={-85}
                y={y}
                width={boundsWidth + 100}
                height={yScale.bandwidth()}
                fill="transparent"
              />

              {/* Visible bar */}
              <rect
                x={0}
                y={y}
                width={xScale(d.value)}
                height={yScale.bandwidth()}
                fill={colors?.[key] || "#888"}
                rx={4}
                pointerEvents="none"
              />

              {/* Country label */}
              <text
                x={-80}
                y={y + yScale.bandwidth() / 2}
                alignmentBaseline="middle"
                fontSize={12}
                fontWeight={500}
                fill="#CCC"
                pointerEvents="none"
              >
                {d.label}
              </text>

              {/* Value label */}
              <text
                x={xScale(d.value) + 8}
                y={y + yScale.bandwidth() / 2}
                alignmentBaseline="middle"
                fontSize={10}
                fontWeight={400}
                fill="#CCC"
                pointerEvents="none"
              >
                {formatValue(d.value)} TWh
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// Responsive wrapper
export default function RBarChart(props) {
  const chartRef = useRef(null);

  const { width, height } = useDimensions(chartRef);

  return (
    <div ref={chartRef} className="w-full h-full flex">
      {width > 0 && height > 0 && (
        <BarChart {...props} width={width} height={height} />
      )}
    </div>
  );
}
