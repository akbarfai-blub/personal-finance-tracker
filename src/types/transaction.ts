export type Category = 'Food' | 'Transport' | 'Subscription' | 'Utilities' | 'Salary' | 'Skincare' | 'Other';

export interface Transaction {
    id: string;
    user_id?: string;
    date: string;       // Format: YYYY-MM-DD
    amount: number;
    description: string;
    category: Category;
    type: 'income' | 'expense';
}

export const TRANSLASI_TIPE: Record<string, string> = {
    income: 'Pemasukan',
    expense: 'Pengeluaran'
};

export const TRANSLASI_KATEGORI: Record<string, string> = {
    Food: 'Makanan',
    Transport: 'Transportasi',
    Subscription: 'Langganan',
    Utilities: 'Tagihan',
    Salary: 'Gaji',
    Skincare: 'Perawatan',
    Other: 'Lainnya'
};