"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/AdminUI/ui/Card";

interface ChartData {
  date: string;
  amount: number;
}

// FIXED: Added '| null' to the data prop type
export function RevenueChart({ data }: { data: ChartData[] | null | undefined }) {
  if (!data) return <div className="h-[350px] bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse mb-8" />;

  const formatCurrency = (val: number) => `₹${val}`;
  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <Card title="Revenue Trends" className="mb-8 min-h-[400px]">
      <div className="h-[300px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#71717A' }}
              dy={10}
            />
            <YAxis 
              tickFormatter={formatCurrency} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#71717A' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                borderRadius: '8px', 
                border: '1px solid #E4E4E7',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#18181b', fontSize: '13px', fontWeight: 600 }}
              labelStyle={{ color: '#71717A', fontSize: '11px', marginBottom: '4px' }}
              formatter={(value: number | string | undefined) => [`₹${value}`, 'Revenue']}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#18181b" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}