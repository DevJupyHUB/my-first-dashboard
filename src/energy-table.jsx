import { useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useDimensions } from "./use-dimensions";

// Data prep
function buildTableData(rawData, keys) {
  return (rawData || [])
    .filter((d) => d.country !== "World")
    .filter((d) => +d.year === 2024)
    .map((d) => {
      const obj = {
        country: d.country,
        primaryEnergy: Number(d.primary_energy) || 0,
      };

      keys.forEach((key) => {
        obj[key] = Number(d[key]) || 0;
      });

      return obj;
    });
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

// Table
function EnergyTable({ rawData, keys, colors, width, height }) {
  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: "total",
    direction: "desc",
  });

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  // Sort arrow helper
  const getSortArrow = (key) => {
    if (sortConfig.key !== key) return " ↕";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  // Sorted data
  const data = useMemo(() => {
    const baseData = buildTableData(rawData, keys);

    return [...baseData].sort((a, b) => {
      let aValue;
      let bValue;

      // Country sorting
      if (sortConfig.key === "country") {
        aValue = a.country;
        bValue = b.country;

        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Total sorting
      if (sortConfig.key === "total") {
        aValue = d3.sum(keys, (key) => (a[key] / a.primaryEnergy) * 100 || 0);

        bValue = d3.sum(keys, (key) => (b[key] / b.primaryEnergy) * 100 || 0);
      } else {
        // Sort by percentage
        aValue =
          a.primaryEnergy > 0 ? (a[sortConfig.key] / a.primaryEnergy) * 100 : 0;

        bValue =
          b.primaryEnergy > 0 ? (b[sortConfig.key] / b.primaryEnergy) * 100 : 0;
      }

      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [rawData, keys, sortConfig]);

  if (!data.length) return null;

  const formatLabel = (str = "") => str.charAt(0).toUpperCase() + str.slice(1);

  const countryAbbreviations = {
    "United Kingdom": "UK",
    "United Arab Emirates": "UAE",
  };

  return (
    <div
      className="scrollbar-dark"
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
          borderSpacing: "0 10px",
        }}
      >
        <thead>
          <tr
            style={{
              textAlign: "left",
              color: "#AAAAAA",
              fontSize: 12,
            }}
          >
            {/* Country header */}
            <th
              onClick={() => handleSort("country")}
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: "#171717",

                fontWeight: 600,
                paddingRight: 12,
                paddingTop: 12,
                paddingBottom: 12,

                whiteSpace: "nowrap",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              Country
              {getSortArrow("country")}
            </th>

            {/* Energy headers */}
            {keys.map((key) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background: "#171717",

                  fontWeight: 600,
                  textAlign: "center",

                  paddingTop: 12,
                  paddingBottom: 12,

                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {formatLabel(key)}
                {getSortArrow(key)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-neutral-600 transition-colors duration-150"
              style={{
                verticalAlign: "middle",
              }}
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
                {countryAbbreviations[row.country] || row.country}
              </td>

              {/* Progress bars */}
              {keys.map((key) => (
                <td
                  key={key}
                  style={{
                    textAlign: "center",
                  }}
                >
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
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {width > 0 && height > 0 && (
        <EnergyTable {...props} width={width} height={height} />
      )}
    </div>
  );
}
