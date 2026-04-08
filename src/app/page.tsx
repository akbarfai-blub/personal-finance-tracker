"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Trash2 } from 'lucide-react';
import { Transaction, TRANSLASI_TIPE, TRANSLASI_KATEGORI } from '../types/transaction';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { LoginForm } from '@/components/LoginForm';
import { TrendChart } from '@/components/TrendChart';
import { DonutChart } from '@/components/DonutChart';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-brand-dark dark:text-gray-100">{formatCurrency(amount)}</h3>
      </div>
      <div className={`p-3 rounded-full transition-colors ${isIncome ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
        isExpense ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
          'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
        {icon}
      </div>
    </div>
  );
};

// 2. Transaction Table Component
const TransactionTable = ({ transactions, onDelete, isDataLoading }: { transactions: Transaction[], onDelete: (id: string) => void, isDataLoading: boolean }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[600px] transition-colors">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 shrink-0 transition-colors">
        <h2 className="text-lg font-bold text-brand-dark dark:text-gray-100">Transaksi Terbaru</h2>
      </div>
      <div className="overflow-auto flex-1 relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900/50 shadow-sm border-b border-gray-100 dark:border-gray-700 transition-colors">
            <tr className="text-gray-500 dark:text-gray-400 text-sm">
              <th className="px-6 py-3 font-medium">Tanggal</th>
              <th className="px-6 py-3 font-medium">Keterangan</th>
              <th className="px-6 py-3 font-medium">Kategori</th>
              <th className="px-6 py-3 font-medium text-right">Nominal</th>
              <th className="px-6 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isDataLoading ? (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                   Memuat data...
                 </td>
               </tr>
            ) : transactions.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                   Belum ada transaksi.
                 </td>
               </tr>
            ) : transactions.map((trx) => (
              <tr key={trx.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(trx.date))}
                </td>
                <td className="px-6 py-4 font-medium text-brand-dark dark:text-gray-200">{trx.description}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium transition-colors">
                    {TRANSLASI_KATEGORI[trx.category] || trx.category}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${trx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-brand-dark dark:text-gray-200'}`}>
                  {trx.type === 'income' ? '+' : '-'}{formatCurrency(trx.amount)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onDelete(trx.id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Hapus Transaksi"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN APP (PAGES) ---
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeFilter, setTimeFilter] = useState<'7 Hari Terakhir' | 'Bulan Ini' | 'Semua Waktu'>('Semua Waktu');
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
    setIsDataLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setTransactions(data as Transaction[]);
    } else if (error) {
      console.error("Error fetching transactions:", error.message);
    }
    setIsDataLoading(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Apakah yakin ingin menghapus transaksi ini?')) return;
    setIsDataLoading(true);
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (!error) {
      await fetchTransactions();
    } else {
      console.error("Error deleting transaction:", error.message);
      setIsDataLoading(false);
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
      date: new Date(`${formData.date}T12:00:00`).toISOString(),
      description: formData.description,
      category: formData.category,
      amount: Number(formData.amount.replace(/\./g, '')),
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

  // Logic: Filter transaksi global berdasar timeFilter
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(trx => {
      const trxDate = new Date(trx.date);
      if (timeFilter === '7 Hari Terakhir') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return trxDate >= sevenDaysAgo;
      } else if (timeFilter === 'Bulan Ini') {
        return trxDate.getMonth() === now.getMonth() && trxDate.getFullYear() === now.getFullYear();
      }
      return true; // 'Semua Waktu'
    });
  }, [transactions, timeFilter]);

  // Logic: Agregasi Data (Data Analyst approach)
  // Menggunakan useMemo agar kalkulasi hanya berjalan jika data berubah
  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, trx) => {
        if (trx.type === 'income') acc.income += trx.amount;
        if (trx.type === 'expense') acc.expense += trx.amount;
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [filteredTransactions]);

  // Guard: Jika loading
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-brand-light dark:bg-gray-900 flex items-center justify-center font-sans">
        <p className="text-brand-dark dark:text-gray-400 font-medium">Memuat...</p>
      </div>
    );
  }

  // Guard: Jika belum login, tampilkan LoginForm
  if (!session) {
    return <LoginForm />;
  }

  return (
    // Implementasi warna identity: bg-brand-light dan text-brand-dark
    <div className="min-h-screen bg-brand-light dark:bg-gray-900 text-brand-dark dark:text-gray-100 p-8 font-sans transition-colors">
      <div className="max-w-5xl mx-auto">

        {/* Header Section */}
        <header className="sticky top-0 z-40 bg-brand-light/90 dark:bg-gray-900/90 backdrop-blur-md pt-4 pb-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-transparent dark:border-transparent transition-colors">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Keuangan</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Ringkasan pengeluaran dan pemasukan kamu.</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="text-sm font-medium px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 cursor-pointer transition-colors"
            >
              <option value="7 Hari Terakhir">7 Hari Terakhir</option>
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Semua Waktu">Semua Waktu</option>
            </select>
            <ThemeToggle />
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-dark dark:bg-gray-800 text-white dark:text-gray-100 px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-700 border border-transparent dark:border-gray-700 transition-colors"
            >
              Tambah Transaksi
            </button>
            <button
              onClick={handleLogout}
              className="text-brand-dark dark:text-gray-400 text-sm font-medium hover:underline transition-colors"
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

        {/* Trend Chart Section */}
        <TrendChart transactions={filteredTransactions} />

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Transaction List Section */}
          <div className="lg:col-span-2">
            <TransactionTable 
              transactions={filteredTransactions} 
              onDelete={handleDeleteTransaction}
              isDataLoading={isDataLoading}
            />
          </div>

          {/* Expense Chart Section */}
          <div>
            <DonutChart transactions={filteredTransactions} />
          </div>
        </div>

      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-brand-light dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors">
            <h2 className="text-xl font-bold text-brand-dark dark:text-gray-100 mb-4">Tambah Transaksi Baru</h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark dark:text-gray-300 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-brand-dark dark:text-gray-100 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark dark:text-gray-300 mb-1">Keterangan</label>
                <input
                  type="text"
                  placeholder="Masukkan keterangan"
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-brand-dark dark:text-gray-100 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:outline-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark dark:text-gray-300 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-brand-dark dark:text-gray-100 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:outline-none transition-colors"
                  >
                    {Object.entries(TRANSLASI_KATEGORI).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark dark:text-gray-300 mb-1">Tipe</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-brand-dark dark:text-gray-100 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:outline-none transition-colors"
                  >
                    <option value="expense">{TRANSLASI_TIPE.expense}</option>
                    <option value="income">{TRANSLASI_TIPE.income}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark dark:text-gray-300 mb-1">Nominal</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Masukkan nominal"
                  required
                  value={formData.amount}
                  onChange={e => {
                    const rawValue = e.target.value.replace(/\D/g, '');
                    const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                    setFormData({ ...formData, amount: formattedValue });
                  }}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-brand-dark dark:text-gray-100 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-brand-dark dark:text-gray-300 font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-dark dark:bg-gray-100 text-brand-light dark:text-brand-dark font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-white transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}