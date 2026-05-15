import { useRef, useState } from "react";
import * as d3 from "d3";
import { AxisLeft } from "./axis-left";
import { AxisBottom } from "./axis-bottom";
import { useDimensions } from "./use-dimensions";

// Data prep
const buildStackedData = (data, keys) => {
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

// Stacked Area Chart
export function StackedAreaChart({ rawData, width, height, keys, colors }) {
  const [cursor, setCursor] = useState(null);

  const data = buildStackedData(rawData, keys);

  const margin = {
    top: 10,
    right: 40,
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

  const stackedSeries = d3.stack().keys(keys)(data);

  const yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(stackedSeries, (layer) => d3.max(layer, (d) => d[1])) || 0,
    ])
    .nice()
    .range([boundsHeight, 0]);

  // Area generator
  const areaGenerator = d3
    .area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]));

  // Mouse tracking
  const handleMouseMove = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - bounds.left;

    // Convert mouse X -> year
    const hoveredYear = Math.round(xScale.invert(x));

    // Find closest data point
    const closestData = data.reduce((prev, curr) => {
      return Math.abs(curr.year - hoveredYear) <
        Math.abs(prev.year - hoveredYear)
        ? curr
        : prev;
    });

    setCursor({
      x: xScale(closestData.year),
      year: closestData.year,
      values: keys.map((key) => ({
        key,
        value: closestData[key],
        color: colors[key],
      })),
    });
  };

  // Tooltip positioning
  const TOOLTIP_WIDTH = 120;
  const TOOLTIP_PADDING = 12;

  const tooltipOnLeft = cursor?.x > boundsWidth * 0.7;

  const tooltipX = cursor
    ? tooltipOnLeft
      ? cursor.x - TOOLTIP_WIDTH - TOOLTIP_PADDING
      : cursor.x + TOOLTIP_PADDING
    : 0;

  // Dynamic tooltip height
  const tooltipHeight = cursor ? 30 + cursor.values.length * 18 : 0;

  // Render
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="overflow-visible"
    >
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Interaction layer */}
        <rect
          width={boundsWidth}
          height={boundsHeight}
          fill="transparent"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setCursor(null)}
        />

        {/* Y axis */}
        <AxisLeft
          yScale={yScale}
          pixelsPerTick={30}
          boundsWidth={boundsWidth}
        />

        {/* X axis */}
        <g transform={`translate(0, ${boundsHeight})`}>
          <AxisBottom
            xScale={xScale}
            pixelsPerTick={60}
            boundsHeight={boundsHeight}
          />
        </g>

        {/* Stacked areas */}
        {stackedSeries.map((layer, i) => (
          <path
            key={i}
            d={areaGenerator(layer)}
            fill={colors[layer.key]}
            opacity={0.9}
          />
        ))}

        {/* Labels */}
        {stackedSeries.map((layer) => {
          const lastPoint = layer[layer.length - 1];

          return (
            <text
              key={layer.key}
              x={xScale(lastPoint.data.year) + 4}
              y={yScale((lastPoint[0] + lastPoint[1]) / 2)}
              fill={colors[layer.key]}
              fontSize={12}
              fontWeight="bold"
              alignmentBaseline="middle"
            >
              {layer.key.charAt(0).toUpperCase() + layer.key.slice(1)}
            </text>
          );
        })}

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

            {/* Tooltip */}
            <g transform={`translate(${tooltipX}, 20)`}>
              <rect
                width={TOOLTIP_WIDTH}
                height={tooltipHeight}
                rx={6}
                fill="white"
                stroke="#CCC"
              />

              {/* Year */}
              <text x={10} y={20} fontSize={13} fontWeight="bold" fill="#111">
                {cursor.year}
              </text>

              {/* Values (reversed stack order) */}
              {[...cursor.values].reverse().map((item, index) => (
                <text
                  key={item.key}
                  x={10}
                  y={42 + index * 18}
                  fontSize={12}
                  fontWeight={900}
                  fill={item.color}
                >
                  {item.key.charAt(0).toUpperCase() + item.key.slice(1)}:{" "}
                  {d3.format(".2s")(item.value)} TWh
                </text>
              ))}
            </g>
          </>
        )}
      </g>
    </svg>
  );
}

// Responsive wrapper
export default function RStackedAreaChart(props) {
  const chartRef = useRef(null);

  const { width, height } = useDimensions(chartRef);

  return (
    <div ref={chartRef} className="w-full h-full">
      {width > 0 && height > 0 && (
        <StackedAreaChart {...props} width={width} height={height} />
      )}
    </div>
  );
}
