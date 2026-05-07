import { useRef } from "react";
import * as d3 from "d3";
import { useDimensions } from "./use-dimensions";

// Data prep
function buildTableData(rawData, keys) {
  return (rawData || [])
    .filter((d) => d.country !== "World")
    .filter((d) => +d.year === 2024) // only 2024 data
    .map((d) => {
      const obj = {
        country: d.country,
        primaryEnergy: Number(d.primary_energy) || 0,
      };
      keys.forEach((key) => {
        obj[key] = Number(d[key]) || 0;
      });
      return obj;
    })
    .sort((a, b) => {
      const totalA = d3.sum(keys, (key) => a[key]);
      const totalB = d3.sum(keys, (key) => b[key]);
      return totalB - totalA;
    })
    .slice(0, 5); // top 3
}

// Progress bar with percentage
function LinearProgress({ value, primaryEnergy, color = "#888", height = 14 }) {
  const percentage =
    primaryEnergy > 0
      ? Math.min(Math.max((value / primaryEnergy) * 100, 0), 100)
      : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      {/* Percentage label */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#CCC",
          minWidth: 35,
          textAlign: "right",
        }}
      >
        {percentage.toFixed(1)}%
      </span>

      {/* Progress bar */}
      <div
        style={{
          backgroundColor: "#2A2A2A",
          borderRadius: height / 4,
          height,
          width: 60,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: color,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

// Props
function EnergyTable({ rawData, keys, colors, width, height }) {
  const data = buildTableData(rawData, keys);
  if (!data.length) return null;

  const formatLabel = (str = "") => str.charAt(0).toUpperCase() + str.slice(1);

  // Render
  return (
    <div
      style={{
        width,
        height,
        overflow: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "0 12px", // vertical spacing between rows
        }}
      >
        <thead>
          <tr style={{ textAlign: "left", color: "#AAAAAA", fontSize: 12 }}>
            <th style={{ fontWeight: 600, paddingRight: 12 }}>Country</th>

            {keys.map((key) => (
              <th key={key} style={{ fontWeight: 600, textAlign: "center" }}>
                {formatLabel(key)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              className="hover:bg-neutral-600 transition-colors duration-150"
              key={rowIndex}
              style={{ verticalAlign: "middle" }}
            >
              {/* Country */}
              <td
                style={{
                  color: "#CCC",
                  fontSize: 12,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  paddingRight: 12,
                }}
              >
                {row.country}
              </td>

              {/* Progress bar */}
              {keys.map((key) => (
                <td key={key} style={{ textAlign: "center" }}>
                  <LinearProgress
                    value={row[key]}
                    primaryEnergy={row.primaryEnergy}
                    color={colors?.[key] || "#888"}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Responsive wrapper
export default function REnergyTable(props) {
  const ref = useRef(null);
  const { width, height } = useDimensions(ref);

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      {width > 0 && height > 0 && (
        <EnergyTable {...props} width={width} height={height} />
      )}
    </div>
  );
}
