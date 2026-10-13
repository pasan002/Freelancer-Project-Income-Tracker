import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const STATUS_COLORS = {
  'In Progress': '#4f46e5', // indigo
  'Completed': '#10b981',   // emerald
  'Pending': '#f59e0b',     // amber
  'On Hold': '#8b5cf6',     // purple
  'Cancelled': '#ef4444'    // rose
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-semibold text-slate-200">{data.name}</p>
        <p className="text-white font-bold">{data.value} Projects</p>
      </div>
    );
  }
  return null;
};

const ProjectStatusPieChart = ({ data = [] }) => {
  // Filter out statuses with 0 projects to keep chart clean
  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.status,
      value: item.count
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No projects recorded yet
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={STATUS_COLORS[entry.name] || '#94a3b8'}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectStatusPieChart;
