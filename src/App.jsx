import "./App.css";
import { data } from "./data";
import StatCard, { getEnergyStats } from "./stat-cards";
import RStackedAreaChart from "./stacked-area-chart";
import RLineChart from "./line-chart";
import BumpChart from "./bump-chart";
import RBarChart from "./bar-chart";
import REnergyTable from "./energy-table";

function App() {
  const stats = getEnergyStats(data || []);

  const fossils = stats.find((s) => s.title === "Fossil Fuels");
  const nuclear = stats.find((s) => s.title === "Nuclear");
  const renewables = stats.find((s) => s.title === "Renewables");

  return (
    <div className="bg-neutral-800 text-white min-h-screen">
      {/* Header */}
      <header className="flex justify-center p-4">
        <h1 className="text-5xl font-bold">Energy dashboard</h1>
      </header>

      {/* Cards */}
      <main className="w-full lg:w-3/4 mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto gap-4">
          {/* Card 01 */}
          <StatCard {...fossils} />

          {/* Card 02 */}
          <StatCard {...nuclear} />

          {/* Card 03 */}
          <StatCard {...renewables} />

          {/* Card 04 */}
          <div className="bg-neutral-900 rounded-2xl p-4">
            <h2 className="font-bold text-lg mb-2 text-gray-400">
              Fossil Fuel Trends
            </h2>

            <div className="h-48">
              <RStackedAreaChart
                rawData={data}
                keys={["coal", "gas", "oil"]}
                colors={{
                  coal: "#4F46E5",
                  gas: "#d92bff",
                  oil: "#EC4899",
                }}
              />
            </div>
          </div>

          {/* Card 05 */}
          <div className="bg-neutral-900 rounded-2xl p-4">
            <h2 className="font-bold text-lg mb-2 text-gray-400">
              Nuclear Trends
            </h2>

            <div className="h-48 w-full">
              <RLineChart
                rawData={data}
                keys={["nuclear"]}
                colors={{
                  nuclear: "#ff5400",
                }}
              />
            </div>
          </div>

          {/* Card 06 */}
          <div className="bg-neutral-900 rounded-2xl p-4">
            <h2 className="font-bold text-lg mb-2 text-gray-400">
              Renewable Energy Trend
            </h2>

            <div className="h-48">
              <RStackedAreaChart
                rawData={data}
                keys={["solar", "wind", "hydro", "biofuel"]}
                colors={{
                  solar: "#f59e0b",
                  wind: "#06b6d4",
                  hydro: "#2563eb",
                  biofuel: "#16a34a",
                }}
              />
            </div>
          </div>

          {/* Card 07 */}
          <div className="bg-neutral-900 rounded-2xl p-4 h-full flex flex-col">
            <h2 className="font-bold text-lg mb-2 text-gray-400">
              Fossil Fuel Energy Leaders{" "}
              <span className="text-sm text-gray-400">(2024)</span>
            </h2>

            <div className="flex-1 w-full min-h-48 max-h-64">
              <REnergyTable
                rawData={data}
                keys={["coal", "gas", "oil"]}
                colors={{
                  coal: "#4F46E5",
                  gas: "#d92bff",
                  oil: "#EC4899",
                }}
              />
            </div>
          </div>

          {/* Card 08 */}
          <div className="bg-neutral-900 rounded-2xl p-4 h-full flex flex-col">
            <h2 className="font-bold text-lg mb-2 text-gray-400">
              Nuclear Ranking{" "}
              <span className="text-sm text-gray-400">(2024)</span>
            </h2>

            <div className="flex-1 w-full min-h-48 max-h-64">
              <RBarChart
                rawData={data}
                keys={["nuclear"]}
                colors={{ nuclear: "#ff5400" }}
              />
            </div>
          </div>

          {/* Card 09 */}
          <div className="bg-neutral-900 rounded-2xl p-4 h-full flex flex-col">
            <h2 className="font-bold text-lg mb-2 text-gray-400">
              Renewable Energy Ranking
            </h2>

            {/* KEY: flex-1 makes chart fill card properly */}
            <div className="flex-1 w-full min-h-48 max-h-64">
              <BumpChart
                data={data}
                keys={["solar", "wind", "hydro", "biofuel"]}
                colors={{
                  solar: "#f59e0b",
                  wind: "#06b6d4",
                  hydro: "#2563eb",
                  biofuel: "#16a34a",
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
