"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, Database, BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface DataVisualizationProps {
  data: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export default function DataVisualization({ data }: DataVisualizationProps) {
  const { charts, statistics, rawData, insights } = data || {};

  const chartComponents = useMemo(() => {
    if (!charts || charts.length === 0) return null;

    return charts.map((chart: any, index: number) => {
      switch (chart.type) {
        case 'bar':
          return (
            <div key={index} className="bg-[#171717] rounded-xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl md:text-2xl font-display mb-4 text-white flex items-center gap-2 tracking-tight">
                <BarChart3 className="w-6 h-6 text-white" />
                {chart.title || 'Bar Chart'}
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {chart.series?.map((series: any, i: number) => (
                    <Bar key={i} dataKey={series.key} fill={COLORS[i % COLORS.length]} name={series.name} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          );

        case 'line':
          return (
            <div key={index} className="bg-[#171717] rounded-xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl md:text-2xl font-display mb-4 text-white flex items-center gap-2 tracking-tight">
                <TrendingUp className="w-6 h-6 text-white" />
                {chart.title || 'Line Chart'}
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {chart.series?.map((series: any, i: number) => (
                    <Line
                      key={i}
                      type="monotone"
                      dataKey={series.key}
                      stroke={COLORS[i % COLORS.length]}
                      name={series.name}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          );

        case 'pie':
          return (
            <div key={index} className="bg-[#171717] rounded-xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl md:text-2xl font-display mb-4 text-white flex items-center gap-2 tracking-tight">
                <PieChartIcon className="w-6 h-6 text-white" />
                {chart.title || 'Pie Chart'}
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chart.data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chart.data.map((entry: any, i: number) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          );

        case 'area':
          return (
            <div key={index} className="bg-[#171717] rounded-xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl md:text-2xl font-display mb-4 text-white flex items-center gap-2 tracking-tight">
                <TrendingUp className="w-6 h-6 text-white" />
                {chart.title || 'Area Chart'}
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {chart.series?.map((series: any, i: number) => (
                    <Area
                      key={i}
                      type="monotone"
                      dataKey={series.key}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.6}
                      name={series.name}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );

        case 'scatter':
          return (
            <div key={index} className="bg-[#171717] rounded-xl shadow-lg p-6 border border-white/10">
              <h3 className="text-xl md:text-2xl font-display mb-4 text-white flex items-center gap-2 tracking-tight">
                <Database className="w-6 h-6 text-white" />
                {chart.title || 'Scatter Chart'}
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name={chart.xLabel || "X"} />
                  <YAxis dataKey="y" name={chart.yLabel || "Y"} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={chart.data} fill={COLORS[0]} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          );

        default:
          return null;
      }
    });
  }, [charts]);

  if (!data) {
    return (
      <div className="text-center py-12 text-white/60">
        No data to visualize
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Info - Proof it's analyzing YOUR file */}
      {data.fileInfo && (
        <div className="bg-[#252525] rounded-xl shadow-lg p-4 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-2">
            📄 Analyzing Your File:
          </h3>
          <p className="text-sm text-white/80">
            <strong>File:</strong> {data.fileInfo.name} ({data.fileInfo.size} bytes)
          </p>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && Object.keys(statistics).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(statistics).map(([key, value]: [string, any]) => (
            <div
              key={key}
              className="bg-[#171717] rounded-xl shadow-lg p-6 border border-white/10"
            >
              <p className="text-sm text-white/60 mb-1 capitalize font-body">
                {key.replace(/_/g, ' ')}
              </p>
              <p className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-[#252525] rounded-xl shadow-lg p-6 border border-white/10">
          <h3 className="text-xl md:text-2xl font-display mb-4 text-white tracking-tight">
            Key Insights
          </h3>
          <ul className="space-y-2">
            {insights.map((insight: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-white/80 font-body leading-relaxed">
                <span className="text-white mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Charts */}
      {chartComponents && (
        <div className="space-y-6">
          {chartComponents}
        </div>
      )}

      {/* Raw Data Table */}
      {rawData && rawData.length > 0 && (
        <div className="bg-[#171717] rounded-xl shadow-lg p-6 border border-white/10 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl md:text-2xl font-display text-white flex items-center gap-2 tracking-tight">
              <Database className="w-6 h-6 text-white" />
              Raw Data from Your File
            </h3>
            <span className="text-xs text-white/60 bg-[#252525] px-2 py-1 rounded border border-white/10">
              ✓ Real data from your upload
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-[#252525]">
                <tr>
                  {Object.keys(rawData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[#171717] divide-y divide-white/10">
                {rawData.slice(0, 100).map((row: any, index: number) => (
                  <tr key={index} className="hover:bg-[#252525] transition-colors">
                    {Object.values(row).map((value: any, i: number) => (
                      <td
                        key={i}
                        className="px-6 py-4 whitespace-nowrap text-sm text-white/90"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rawData.length > 100 && (
              <p className="mt-4 text-sm text-white/60 text-center">
                Showing first 100 rows of {rawData.length} total rows
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

