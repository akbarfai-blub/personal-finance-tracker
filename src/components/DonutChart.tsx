import React, { useMemo, useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';

interface DonutChartProps {
  transactions: Transaction[];
}

const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#F43F5E', '#06B6D4'];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const DonutChart = ({ transactions }: DonutChartProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data = useMemo(() => {
    const expenseData = transactions.filter(trx => trx.type === 'expense');
    const aggregated = expenseData.reduce((acc, trx) => {
      acc[trx.category] = (acc[trx.category] || 0) + trx.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(aggregated)
      .map(category => ({
        name: category,
        value: aggregated[category]
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const textColor = resolvedTheme === 'dark' ? '#E5E7EB' : '#374151';
  const labelLineColor = resolvedTheme === 'dark' ? '#4B5563' : '#D1D5DB';
  const tooltipBg = resolvedTheme === 'dark' ? '#1F2937' : '#FFFFFF';
  const tooltipText = resolvedTheme === 'dark' ? '#E5E7EB' : '#374151';
  const gridColor = resolvedTheme === 'dark' ? '#374151' : '#E5E7EB';
  const strokeColor = resolvedTheme === 'dark' ? '#1F2937' : '#FFFFFF';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[400px] transition-colors">
      <h2 className="text-lg font-bold text-brand-dark dark:text-gray-100 mb-6 shrink-0">Pengeluaran per Kategori</h2>
      <div className="w-full flex-1 flex items-center justify-center min-h-0">
        {isMounted ? (
          data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke={strokeColor}
                labelLine={{ stroke: labelLineColor, strokeWidth: 1, strokeOpacity: 0.5 }}
                label={(props: any) => {
                  const RADIAN = Math.PI / 180;
                  const radius = props.outerRadius + 15;
                  const x = props.cx + radius * Math.cos(-props.midAngle * RADIAN);
                  const y = props.cy + radius * Math.sin(-props.midAngle * RADIAN);
                  return (
                    <text
                      x={x}
                      y={y}
                      fill={textColor}
                      textAnchor={x > props.cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="text-xs font-medium"
                    >
                      {props.name}
                    </text>
                  );
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{ backgroundColor: tooltipBg, borderColor: gridColor, color: textColor }}
                itemStyle={{ color: textColor }}
              />
            </PieChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
              Belum ada data pengeluaran
            </div>
          )
        ) : (
          <div className="w-full h-full bg-transparent"></div>
        )}
      </div>
    </div>
  );
};
