import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, TRANSLASI_TIPE } from '@/types/transaction';
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from 'next-themes';

interface TrendChartProps {
  transactions: Transaction[];
}

export const TrendChart = ({ transactions }: TrendChartProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showIncome, setShowIncome] = useState(true);
  const [showExpense, setShowExpense] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'line'>('line');
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    // Group transactions by date
    const grouped = transactions.reduce((acc, trx) => {
      // Extract YYYY-MM-DD safely
      const dateKey = trx.date.split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, income: 0, expense: 0 };
      }
      if (trx.type === 'income') acc[dateKey].income += trx.amount;
      if (trx.type === 'expense') acc[dateKey].expense += trx.amount;
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>);

    // Convert object to array and sort from oldest to newest
    const sorted = Object.values(grouped).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted;
  }, [transactions]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };


  const textColor = resolvedTheme === 'dark' ? '#E5E7EB' : '#374151';
  const gridColor = resolvedTheme === 'dark' ? '#374151' : '#E5E7EB';
  const cursorColor = resolvedTheme === 'dark' ? '#374151' : '#F9FAFB';
  const tooltipBg = resolvedTheme === 'dark' ? '#1F2937' : '#FFFFFF';
  const strokeColor = resolvedTheme === 'dark' ? '#1F2937' : '#FFFFFF';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col mb-8 transition-colors">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-brand-dark dark:text-gray-100">Trend Keuangan</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Analisis pemasukan dan pengeluaran harian.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Toggles */}
          <div className="flex items-center gap-4 text-sm bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showIncome} 
                onChange={(e) => setShowIncome(e.target.checked)}
                className="accent-green-600 w-4 h-4 cursor-pointer"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Pemasukan</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showExpense} 
                onChange={(e) => setShowExpense(e.target.checked)}
                className="accent-red-600 w-4 h-4 cursor-pointer"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Pengeluaran</span>
            </label>
          </div>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
          
          {/* Chart Type Selector */}
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value as 'bar' | 'line')}
            className="text-sm font-medium px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 transition-colors cursor-pointer"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-[300px]">
        {isMounted ? (
          chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={formatDate}
                    tick={{ fill: textColor, fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={formatYAxis}
                    tick={{ fill: textColor, fontSize: 12 }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: gridColor, color: textColor }} itemStyle={{ color: textColor }} cursor={{ fill: cursorColor }} />
                  {showIncome && (
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      name={TRANSLASI_TIPE.income}
                      stroke="#16A34A" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#16A34A', strokeWidth: 2, stroke: '#FFFFFF' }} 
                      activeDot={{ r: 6, strokeWidth: 0 }} 
                    />
                  )}
                  {showExpense && (
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      name={TRANSLASI_TIPE.expense}
                      stroke="#DC2626" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#DC2626', strokeWidth: 2, stroke: '#FFFFFF' }} 
                      activeDot={{ r: 6, strokeWidth: 0 }} 
                    />
                  )}
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={formatDate}
                    tick={{ fill: textColor, fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={formatYAxis}
                    tick={{ fill: textColor, fontSize: 12 }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: gridColor, color: textColor }} itemStyle={{ color: textColor }} cursor={{ fill: cursorColor }} />
                  {showIncome && <Bar dataKey="income" name={TRANSLASI_TIPE.income} fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={40} />}
                  {showExpense && <Bar dataKey="expense" name={TRANSLASI_TIPE.expense} fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={40} />}
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
              Belum ada data transaksi
            </div>
          )
        ) : (
          <div className="w-full h-full bg-transparent"></div>
        )}
      </div>
    </div>
  );
};
