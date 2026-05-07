const TICK_LENGTH = 4;

export const AxisLeft = ({ yScale, pixelsPerTick, boundsWidth }) => {
  const range = yScale.range();
  const height = range[0] - range[1];
  const numberOfTicksTarget = Math.floor(height / pixelsPerTick);

  return (
    <>
      {yScale.ticks(numberOfTicksTarget).map((value) => (
        <g key={value} transform={`translate(0, ${yScale(value)})`}>
          {/* Grid lines */}
          <line
            x1={0}
            x2={boundsWidth}
            stroke="#CCC"
            opacity={0.5}
            strokeDasharray="2 2"
            strokeLinecap="round"
            shapeRendering="crispEdges"
          />

          {/* Tick mark */}
          <line x2={-TICK_LENGTH} stroke="#CCC" />

          {/* Tick label */}
          <text x={-10} y={4} textAnchor="end" fontSize={10} fill="#CCC">
            {value / 1000}K TWh
          </text>
        </g>
      ))}
    </>
  );
};
