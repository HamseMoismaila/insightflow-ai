import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon } from "lucide-react";

import type { ChartDatum } from "../types";

interface DashboardChartsProps {
  barChartData: ChartDatum[];
  lineChartData: ChartDatum[];
  pieChartData: ChartDatum[];
}

const PIE_COLORS = ["#4f46e5", "#818cf8", "#34d399", "#f59e0b"];

function EmptyChartMessage() {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-sm text-slate-500">
      Chart data is not available yet for this report.
    </div>
  );
}

export default function DashboardCharts({
  barChartData,
  lineChartData,
  pieChartData,
}: DashboardChartsProps) {
  const [activeTab, setActiveTab] = useState<"bar" | "line" | "pie">("bar");

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-50 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-950">Data Visualizations</h3>
          <p className="mt-0.5 text-xs text-gray-400">Switch between available chart views for the current report.</p>
        </div>

        <div className="flex items-center rounded-lg bg-gray-50 p-1 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab("bar")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "bar" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Bar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("line")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "line" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <LineIcon className="h-3.5 w-3.5" />
            Line
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pie")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "pie" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <PieIcon className="h-3.5 w-3.5" />
            Pie
          </button>
        </div>
      </div>

      <div className="mt-2 h-[310px] w-full">
        {activeTab === "bar" ? (
          barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} />
                <Bar name="Value" dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartMessage />
          )
        ) : null}

        {activeTab === "line" ? (
          lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} />
                <Line
                  name="Value"
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartMessage />
          )
        ) : null}

        {activeTab === "pie" ? (
          pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieChartData} cx="50%" cy="45%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                  {pieChartData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Value"]} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartMessage />
          )
        ) : null}
      </div>
    </div>
  );
}
