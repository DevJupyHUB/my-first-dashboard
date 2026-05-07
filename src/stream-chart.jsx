import { useRef } from "react";
import * as d3 from "d3";
import { AxisLeft } from "./axis-left";
import { AxisBottom } from "./axis-bottom";
import { useDimensions } from "./use-dimensions";

// Data prep
const buildStreamData = (data, keys) => {
  return data
    .filter((d) => d.country === "World")
    .map((d) => {
      const obj = { year: d.year };

      keys.forEach((key) => {
        obj[key] = d[key] ?? 0;
      });

      return obj;
    })
    .sort((a, b) => a.year - b.year);
};

// Streamgraph
export function StreamChart({ rawData, width, height, keys, colors }) {
  const data = buildStreamData(rawData, keys);

  const margin = {
    top: 10,
    right: 10,
    bottom: 30,
    left: 60,
  };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  if (boundsWidth <= 0 || boundsHeight <= 0) return null;

  // Scale
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.year))
    .range([0, boundsWidth]);

  // Stacked area for streamgraph
  const stackedSeries = d3
    .stack()
    .keys(keys)
    .offset(d3.stackOffsetSilhouette)
    .order(d3.stackOrderNone)(data);

  // Y scale to extend
  const yMin = d3.min(stackedSeries, (layer) => d3.min(layer, (d) => d[0]));

  const yMax = d3.max(stackedSeries, (layer) => d3.max(layer, (d) => d[1]));

  const yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .nice()
    .range([boundsHeight, 0]);

  // Area generator
  const areaGenerator = d3
    .area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(d3.curveCatmullRom.alpha(0.5));

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
            pixelsPerTick={40}
            boundsHeight={boundsHeight}
          />
        </g>

        {/* Stream area */}
        {stackedSeries.map((layer) => (
          <path
            key={layer.key}
            d={areaGenerator(layer)}
            fill={colors[layer.key]}
            opacity={0.9}
          />
        ))}
      </g>
    </svg>
  );
}

// Responsive wrapper
export default function RStreamChart(props) {
  const chartRef = useRef(null);
  const { width, height } = useDimensions(chartRef);

  return (
    <div ref={chartRef} className="w-full h-full">
      {width > 0 && height > 0 && (
        <StreamChart {...props} width={width} height={height} />
      )}
    </div>
  );
}
