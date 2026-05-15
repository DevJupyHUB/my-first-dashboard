import { useRef, useState } from "react";
import * as d3 from "d3";
import { useDimensions } from "./use-dimensions";
import { AxisLeft } from "./axis-left";
import { AxisBottom } from "./axis-bottom";

// Data prep
const buildLineData = (data, keys) => {
  return data
    .filter((d) => d.country === "World")
    .map((d) => {
      const obj = {
        year: d.year,
      };

      keys.forEach((key) => {
        obj[key] = d[key] ?? 0;
      });

      return obj;
    })
    .sort((a, b) => a.year - b.year);
};

// LineChart
export function LineChart({
  rawData,
  width,
  height,
  keys = ["nuclear"],
  colors = {},
}) {
  const [cursor, setCursor] = useState(null);

  const data = buildLineData(rawData, keys);

  const margin = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 60,
  };

  const boundsWidth = width - margin.left - margin.right;

  const boundsHeight = height - margin.top - margin.bottom;

  if (boundsWidth <= 0 || boundsHeight <= 0) {
    return null;
  }

  // Scales
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.year))
    .range([0, boundsWidth]);

  const yMax = d3.max(data, (d) => d3.max(keys, (key) => d[key]));

  const yScale = d3
    .scaleLinear()
    .domain([0, yMax])
    .nice()
    .range([boundsHeight, 0]);

  // Line generator
  const lineGenerator = (key) =>
    d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d[key]))
      .curve(d3.curveMonotoneX);

  // Mouse tracking
  const handleMouseMove = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();

    // Mouse position inside chart area
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    // Convert pixels -> data space
    const year = xScale.invert(x);
    const value = yScale.invert(y);

    setCursor({
      x,
      y,
      year,
      value,
    });
  };

  // Tooltip positioning
  const TOOLTIP_WIDTH = 90;
  const TOOLTIP_HEIGHT = 44;
  const TOOLTIP_OFFSET = 12;

  const tooltipOnLeft = cursor?.year >= 2013;

  const tooltipX = cursor
    ? tooltipOnLeft
      ? cursor.x - TOOLTIP_WIDTH - TOOLTIP_OFFSET
      : cursor.x + TOOLTIP_OFFSET
    : 0;

  const tooltipY = cursor ? cursor.y - TOOLTIP_HEIGHT / 2 : 0;

  // Render
  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Interaction layer */}
        <rect
          width={boundsWidth}
          height={boundsHeight}
          fill="transparent"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setCursor(null)}
        />

        {/* Axes */}
        <AxisLeft
          yScale={yScale}
          pixelsPerTick={40}
          boundsWidth={boundsWidth}
        />

        <g transform={`translate(0, ${boundsHeight})`}>
          <AxisBottom
            xScale={xScale}
            pixelsPerTick={40}
            boundsHeight={boundsHeight}
          />
        </g>

        {/* Lines */}
        {keys.map((key) => (
          <path
            key={key}
            d={lineGenerator(key)(data)}
            fill="none"
            stroke={colors[key] || "#CCC"}
            strokeWidth={3}
          />
        ))}

        {/* Cursor */}
        {cursor && (
          <>
            {/* Vertical line */}
            <line
              x1={cursor.x}
              y1={0}
              x2={cursor.x}
              y2={boundsHeight}
              stroke="#CCC"
              strokeWidth={1}
              strokeDasharray="4 4"
            />

            {/* Horizontal line */}
            <line
              x1={0}
              y1={cursor.y}
              x2={boundsWidth}
              y2={cursor.y}
              stroke="#CCC"
              strokeWidth={1}
              strokeDasharray="4 4"
            />

            {/* Cursor point */}
            <circle cx={cursor.x} cy={cursor.y} r={4} fill="#111" />

            {/* Tooltip */}
            <g transform={`translate(${tooltipX}, ${tooltipY})`}>
              <rect
                width={TOOLTIP_WIDTH}
                height={TOOLTIP_HEIGHT}
                rx={6}
                fill="white"
                stroke="#ccc"
              />

              <text x={10} y={18} fontSize={12} fill="#111">
                Year: {cursor.year.toFixed(0)}
              </text>

              <text x={10} y={34} fontSize={12} fill="#111">
                TWh: {cursor.value.toFixed(0)}
              </text>
            </g>
          </>
        )}
      </g>
    </svg>
  );
}

// Responsive wrapper
export default function RLineChart({
  rawData,
  keys = ["nuclear"],
  colors = {},
}) {
  const chartRef = useRef(null);

  const { width, height } = useDimensions(chartRef);

  return (
    <div ref={chartRef} className="w-full h-full">
      {width > 0 && height > 0 && (
        <LineChart
          rawData={rawData}
          width={width}
          height={height}
          keys={keys}
          colors={colors}
        />
      )}
    </div>
  );
}
