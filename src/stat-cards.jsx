import React from "react";

// Data prep
export function getEnergyStats(data) {
  const worldData = data.filter((d) => d.country === "World");

  const y2024 = worldData.find((d) => d.year === 2024);
  const y2023 = worldData.find((d) => d.year === 2023);

  if (!y2024 || !y2023) return [];

  const calc = (row) => ({
    fossils: (row.coal || 0) + (row.oil || 0) + (row.gas || 0),
    nuclear: row.nuclear || 0,
    renewables:
      (row.hydro || 0) +
      (row.solar || 0) +
      (row.wind || 0) +
      (row.biofuel || 0) +
      (row.other_renewable || 0),
  });

  const v2024 = calc(y2024);
  const v2023 = calc(y2023);

  const getChange = (newVal, oldVal) => {
    if (!oldVal) return "→ 0%";

    const diff = newVal - oldVal;
    const pct = ((diff / oldVal) * 100).toFixed(1);

    const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";

    return `${arrow} ${Math.abs(pct)}%`;
  };

  return [
    {
      title: "Fossil Fuels",
      value: v2024.fossils,
      change: getChange(v2024.fossils, v2023.fossils),
    },
    {
      title: "Nuclear",
      value: v2024.nuclear,
      change: getChange(v2024.nuclear, v2023.nuclear),
    },
    {
      title: "Renewables",
      value: v2024.renewables,
      change: getChange(v2024.renewables, v2023.renewables),
    },
  ];
}

export default function StatCard({ title, value, change }) {
  const getChangeColor = () => {
    if (!change) return "text-gray-500";
    if (change.includes("↑")) return "text-green-500";
    if (change.includes("↓")) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <div className="bg-neutral-900 rounded-2xl h-40 p-6 flex flex-col justify-center">
      <h2 className="text-sm font-semibold text-gray-400">{title}</h2>

      <p className="mt-2">
        <span className="text-3xl font-bold">
          {value?.toLocaleString?.() ?? 0}
        </span>{" "}
        <span className="text-sm text-gray-400">TWh (2024)</span>
      </p>

      <p className="mt-2">
        <span className={`text-sm font-bold ${getChangeColor()}`}>
          {change}
        </span>{" "}
        <span className="text-sm text-gray-400">vs 2023</span>
      </p>
    </div>
  );
}
