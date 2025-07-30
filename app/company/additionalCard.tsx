'use client'


import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { calculateRunway, getMonthlyBurnRate, GLEntry } from "@/utils/glUtils";

interface BurnRateChartProps {
  glEntries: GLEntry[];
}

const BurnRateChart: React.FC<BurnRateChartProps> = ({ glEntries }) => {
  const monthlyBurnData = getMonthlyBurnRate(glEntries);
  const currentCash = 100000; // Replace with actual cash balance query
  const avgBurnRate = monthlyBurnData.reduce((sum, data) => sum + data.netCashFlow, 0) / monthlyBurnData.length;
  const runway = calculateRunway(currentCash, avgBurnRate);

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Cash Flow & Runway Analysis</h2>
        <div className="flex space-x-4">
          <div className="bg-blue-50 px-3 py-1 rounded-lg">
            <p className="text-xs text-gray-500">Avg Burn</p>
            <p className="text-sm font-medium text-blue-600">${Math.abs(avgBurnRate).toLocaleString()}</p>
          </div>
          <div className="bg-green-50 px-3 py-1 rounded-lg">
            <p className="text-xs text-gray-500">Runway</p>
            <p className="text-sm font-medium text-green-600">{runway.toFixed(1)} months</p>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyBurnData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`$${Math.abs(value).toLocaleString()}`, "Net Cash Flow"]}
              labelStyle={{ fontWeight: 500, color: '#374151' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="netCashFlow"
              name="Net Cash Flow"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
              activeDot={{ fill: '#4f46e5', strokeWidth: 0, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Data updated {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default BurnRateChart;