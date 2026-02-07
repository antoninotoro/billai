
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ConsumptionByBand } from '../types';

interface ConsumptionChartProps {
  data: ConsumptionByBand;
}

const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Fascia F1', value: data.f1, color: '#2563eb' },
    { name: 'Fascia F2', value: data.f2, color: '#3b82f6' },
    { name: 'Fascia F3', value: data.f3, color: '#60a5fa' },
  ];

  return (
    <div className="w-full h-64 mt-6">
      <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
        <i className="fas fa-chart-bar mr-2 text-blue-500"></i>
        Ripartizione Consumo Annuo per Fasce (kWh)
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConsumptionChart;
