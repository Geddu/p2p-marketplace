"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ReputationData {
  name: string;
  value: number;
  color: string;
}

interface ReputationChartProps {
  data: ReputationData[];
}

export default function ReputationChart({ data }: ReputationChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={60}
          fill="#8884d8"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
