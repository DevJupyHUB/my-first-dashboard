const TICK_LENGTH = 4;

export const AxisBottom = ({ xScale, pixelsPerTick, boundsHeight }) => {
  const range = xScale.range();
  const width = range[1] - range[0];
  const numberOfTicksTarget = Math.floor(width / pixelsPerTick);

  return (
    <>
      {xScale.ticks(numberOfTicksTarget).map((value) => (
        <g key={value} transform={`translate(${xScale(value)}, 0)`}>
          {/* Tick */}
          <line y2={TICK_LENGTH} stroke="#CCC" />
          <text y={20} textAnchor="middle" fontSize={10} fill="#CCC">
            {value}
          </text>
        </g>
      ))}
    </>
  );
};
