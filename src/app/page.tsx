"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { LoginForm } from '@/components/LoginForm';
import type { Session } from '@supabase/supabase-js';

// --- UTILITIES ---
// Helper untuk format mata uang agar rapi
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// --- COMPONENTS ---

// 1. Summary Card Component
interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  type: 'balance' | 'income' | 'expense';
}

const SummaryCard = ({ title, amount, icon, type }: SummaryCardProps) => {
  const isIncome = type === 'income';
  const isExpense = type === 'expense';

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-brand-dark">{formatCurrency(amount)}</h3>
      </div>
      <div className={`p-3 rounded-full ${isIncome ? 'bg-green-100 text-green-600' :
        isExpense ? 'bg-red-100 text-red-600' :
          'bg-blue-100 text-blue-600'
        }`}>
        {icon}
      </div>
    </div>
  );
};

// 2. Transaction Table Component
const TransactionTable = ({ transactions }: { transactions: Transaction[] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-brand-dark">Transaksi Terbaru</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="px-6 py-3 font-medium">Tanggal</th>
              <th className="px-6 py-3 font-medium">Deskripsi</th>
              <th className="px-6 py-3 font-medium">Kategori</th>
              <th className="px-6 py-3 font-medium text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.map((trx) => (
              <tr key={trx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">
                  {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(trx.date))}
                </td>
                <td className="px-6 py-4 font-medium text-brand-dark">{trx.description}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                    {trx.category}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${trx.type === 'income' ? 'text-green-600' : 'text-brand-dark'
                  }`}>
                  {trx.type === 'income' ? '+' : '-'}{formatCurrency(trx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 3. Expense By Category Chart Component
interface ChartData {
  name: string;
  value: number;
}

interface ExpenseByCategoryChartProps {
  data: ChartData[];
}

// Profesional pastel/blue/purple palette
const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#F43F5E', '#06B6D4'];

const ExpenseByCategoryChart = ({ data }: ExpenseByCategoryChartProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h2 className="text-lg font-bold text-brand-dark mb-6">Pengeluaran per Kategori</h2>
      <div className="flex-1 w-full min-h-[300px]">
        {data.length > 0 ? (
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
                stroke="none"
                labelLine={{ stroke: '#1F2937', strokeWidth: 1, strokeOpacity: 0.3 }}
                label={(props: any) => {
                  const RADIAN = Math.PI / 180;
                  const radius = props.outerRadius + 15;
                  const x = props.cx + radius * Math.cos(-props.midAngle * RADIAN);
                  const y = props.cy + radius * Math.sin(-props.midAngle * RADIAN);
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#1F2937"
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
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Belum ada data pengeluaran
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP (PAGES) ---
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    category: 'Food',
    amount: '',
    type: 'expense'
  });

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setTransactions(data as Transaction[]);
    } else if (error) {
      console.error("Error fetching transactions:", error.message);
    }
  };

  useEffect(() => {
    // Mengecek sesi pada awal load
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsSessionLoading(false);
    };
    checkSession();

    // Mendengarkan perubahan status sesi secara live
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    setIsSubmitting(true);

    const newTransaction = {
      date: formData.date,
      description: formData.description,
      category: formData.category,
      amount: Number(formData.amount),
      type: formData.type,
      user_id: session.user.id
    };

    const { error } = await supabase
      .from('transactions')
      .insert([newTransaction]);

    if (!error) {
      await fetchTransactions();
      setIsModalOpen(false);
      setFormData({ date: '', description: '', category: 'Food', amount: '', type: 'expense' });
    } else {
      console.error("Error adding transaction:", error.message);
    }

    setIsSubmitting(false);
  };

  // Logic: Agregasi Data (Data Analyst approach)
  // Menggunakan useMemo agar kalkulasi hanya berjalan jika data berubah
  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, trx) => {
        if (trx.type === 'income') acc.income += trx.amount;
        if (trx.type === 'expense') acc.expense += trx.amount;
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [transactions]);

  // Logic: Agregasi Data Pengeluaran per Kategori
  const expenseByCategoryData = useMemo(() => {
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

  // Guard: Jika loading
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center font-sans">
        <p className="text-brand-dark font-medium">Memuat...</p>
      </div>
    );
  }

  // Guard: Jika belum login, tampilkan LoginForm
  if (!session) {
    return <LoginForm />;
  }

  return (
    // Implementasi warna identity: bg-brand-light dan text-brand-dark
    <div className="min-h-screen bg-brand-light text-brand-dark p-8 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header Section */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Keuangan</h1>
            <p className="text-gray-500 mt-1">Ringkasan pengeluaran dan pemasukan kamu.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-dark text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Tambah Transaksi
            </button>
            <button
              onClick={handleLogout}
              className="text-brand-dark text-sm font-medium hover:underline"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard
            title="Total Saldo"
            amount={summary.balance}
            icon={<Wallet size={24} />}
            type="balance"
          />
          <SummaryCard
            title="Pemasukan"
            amount={summary.income}
            icon={<ArrowUpCircle size={24} />}
            type="income"
          />
          <SummaryCard
            title="Pengeluaran"
            amount={summary.expense}
            icon={<ArrowDownCircle size={24} />}
            type="expense"
          />
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction List Section */}
          <div className="lg:col-span-2">
            <TransactionTable transactions={transactions} />
          </div>

          {/* Expense Chart Section */}
          <div>
            <ExpenseByCategoryChart data={expenseByCategoryData} />
          </div>
        </div>

      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-brand-light rounded-xl shadow-lg p-6 w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Tambah Transaksi Baru</h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-brand-dark focus:ring-2 focus:ring-brand-dark focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-brand-dark focus:ring-2 focus:ring-brand-dark focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white text-brand-dark focus:ring-2 focus:ring-brand-dark focus:outline-none"
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Salary">Salary</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white text-brand-dark focus:ring-2 focus:ring-brand-dark focus:outline-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Amount</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-brand-dark focus:ring-2 focus:ring-brand-dark focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-brand-dark font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-dark text-brand-light font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}